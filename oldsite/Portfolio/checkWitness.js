#!/usr/bin/env node

/*********************************************************************************************************************************************************************
*
*	Programmed by James Shewey
*	(C) F5 Networks 2014, all rights reserved
*
*	This program extracts an engineer's schedule from Witness then parses and loads it into a MySQL database. It should be run on an hourly basis to check for 
*	updates to engineer's schedules by the Workforce Management team. This program then takes the database data and looks up the Siebel account name from Active
*	Directory and then, if the engineer is off shift subscribes a distro list that will be sent to all Queue leads case updates. Engineers who come back on shift
*	will be unsubscribed.
*
*	Likewise, this database could also be used to create a report of headcount and average case per on-shift engineer utilizing the data from the Employee Service
*	Request tab in Siebel.
*
*	To do:
*	
*	DB Pruning for engineers with terminated employment
*	Unscribe in watchmysrs
*	Some better error handling
*
**********************************************************************************************************************************************************************/ 

var http = require('http');
var https = require('https');
var querystring = require('querystring');
var events = require('events');
var signal = new events.EventEmitter();
var string = require('string'); //Needs to be installed via NPM
var mysql = require('mysql'); //Needs to be installed via NPM
var ldap = require('ldapjs'); //Needs to be installed via NPM
var math = require('math'); //Needs to be installed via NPM
var moment = require('moment'); //Needs to be installed via NPM
moment().format();

//----------Environment Vars----------

var wfmHost = 'witness.domain.com';
var wfmPort = 7001;
var wfmServiceAccount = 'service_account';
var wfmPassword = 'Password#1';
var wfmFilter = 'NAPODS';		//NAPODS should be defined in witness by logging in and manually creating a veiw

var dbHostname = 'localhost';		//All or north America should be selected and Is Supervisor should be set to false to exclude managers
var dbUser = 'service_account2';		//This should be updated if this is to be used to EMEA and/or APAC
var dbPassword = 'Password#1';
var dbName = 'shift';
var dbSocket = '/var/run/mysqld/mysqld.sock'; //Not sure why, but on ubuntu/debian we have to give the socket to make this work. http://stackoverflow.com/questions/15117005/nodejs-node-mysql-module-not-connecting-to-database


var bind_DN = 'CN=Service Account,OU=Users,OU=Podunk,OU=North America,DC=domain,DC=com';
var LDAPpassword = 'Password#1';
var search_DN = 'OU=North America,DC=domain,DC=com';
var LDAPHost = 'ldaps://dc01.domain.com';

var watchSRsHost = 'watchmysrs.domain.com';
//var watchSRsURL = 'https://' + watchSRsHost + '/';
var domainServiceAccount = 'SERVICE'; 
var domainPassword = 'Password#1';
var watchSRsPort = 443;

var cookie;		//Used to hold session ID
var asyncOpCount;	//Used to count running aynchronous threads during database commit
var IDList2point0 = []  //Holds Name, E-mail and UID from witness 


process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"  //This allows self-signed certificate used by watchMySRs and LDAP

//-------Functions--------

function login()		//Obtains session ID/session cookie and authenticates user
{
	var post_data = querystring.stringify(		//Stringify converts from JSON objects to the URL format used by a GET request
	{
		'pageAction': 'Login',
		'browserCheckEnabled': 'true',
		'screenHeight': '718',
		'screenWidth': '1326',
		'pageModelType': '0',
		'pageDirty': 'false',
	});

	var post_data = 'username=' + wfmServiceAccount + '&password=' + wfmPassword + '&' + post_data;	//stringify will URL encode some characters (Eg the @ symbol) which is not to spec. This is needed to hack arround that for the password field.

	var options = {
		hostname: wfmHost,
		port: wfmPort,
		path: '/wfo/control/signin',
 		method: 'POST',
		headers: {
			'Content-type': 'application/x-www-form-urlencoded',
			'Content-Length': post_data.length,
			'Cookie': cookie,
			'User-Agent' : 'Mozilla/5.0 (Windows; U; WinNT4.0; fr-FR; rv:0.9.2) Gecko/20010726 Netscape6/6.1',	//We have to spoof a user agent, otherwise page Won't load. The message says to use Netscape or IE5. Spoofing a Netscape user agent is my lame attempt at humor.
		},
	};

	var post = http.request(options, function(response)
	{
		cookie = querystring.parse(response.headers['set-cookie'][0], ';');
		cookie = 'USER_ID=' + wfmServiceAccount + '; LANGUAGE_ID=en_US; BP_SUITE_JSESSIONID=' + cookie['BP_SUITE_JSESSIONID'];

		if (response.statusCode == 200)
		{
			signal.emit('loggedIn')		//use of signals allow us to avoid callback hell, make code readable, and trigger events sequentially in QT style
		}					//this will trigger the SelectNAPods function
		else if (response.statusCode == 403)
		{
			console.log('Error: Login - 403 - Forbidden')
		}
	});
	post.on('error', function(error)
	{
		console.log('Error: Problem logging in: ' + error.message);
	});

	// post the data
	post.write(post_data);
	post.write('data\n');		//Close connection to watchmysrs. See note for witness above in getSchedules()
	post.write('data\n');
	post.end();
}

signal.on('loggedIn', function selectNAPods()		//Function selects view and get's each enginer's UID
{
	var page;
	var post_data = querystring.stringify(
	{
		'peopleFilter_listbox': wfmFilter,
		'peopleFilter': wfmFilter,
		'selectedID': 'null',
		'sortOrder': 'ascending',
		'isMultiSelectEnabled': 'true',
		'pageModelType': '1',
		'pageDirty': 'false',
		'pageAction': 'FILTER_CHANGE_ACTION',
		'refreshWorkpane': 'false',
	});
	var options = {
		hostname: wfmHost,
		port: wfmPort,
		path: '/wfo/control/people_selection',
 		method: 'POST',
		headers: {
			'Content-type': 'application/x-www-form-urlencoded',
			'Content-Length': post_data.length,
			'Cookie': cookie,
			'User-Agent' : 'Mozilla/5.0 (Windows; U; WinNT4.0; fr-FR; rv:0.9.2) Gecko/20010726 Netscape6/6.1',
		},
	};

	var post = http.request(options, function(response)
	{
		response.setEncoding('utf8');

		response.on('data', function (chunk)		//responses are chunked. We need to recombine (rechunk) them after transmission
		{				
			page = page+chunk;
		});
		response.on('end', function ()
		{
			search(page, 'uid="', '</span>', getSchedules)	//Parse out a list of IDs returned by the view/filter in Witness
		});
	});
	post.on('error', function(error)
	{
		console.log('Error: Could not get ID' + error.message);
	});

	// post the data
	post.write(post_data);
});

var getSchedules = function(IDList)		//Function uses UIDs to get 
{
	var page;
	var buildingDate = new Date();
	if (buildingDate.getHours() > 18)
	{
		buildingDate.setDate(buildingDate.getDate() + 1); 	//Javascript date function does month from 0-11 for reasons unknown. Add 1 to fix this.
	}

	var date = (buildingDate.getMonth() + 1) + '/' + buildingDate.getDate() + '/' + buildingDate.getFullYear(); 	//Javascript date function does month from 0-11 for reasons unknown. Add 1 to fix this.
	console.log(date);
	var selectedIDs = "";
	
	for ( var index = 1; index < IDList.length; index++ )		//Each engineer in Witness has a unique ID. At this point our filter and abvove functions given us 
	{								//the list, but we must format it in the format expected by Witness
		var name = string(IDList[index]).substr(string(IDList[index]).indexOf('<span>') + 6);
		IDList2point0[name] = string(IDList[index]).substr(0, string(IDList[index]).indexOf('" '));
		selectedIDs = selectedIDs + "," + IDList2point0[name];
	}
	
	selectedIDs = selectedIDs.substr(1)		//trim leading comma from string

	var post_data = querystring.stringify(
	{
		'peopleFilter_listbox': wfmFilter,
		'sortBy': 'lname',
		'viewType': 'peoplescheduletext',
		'isSortRecord': 'true',
		'orgID': '554',
		'pageModelType': '1',
		'pageDirty': 'false',
		'pageAction': 'REFRESH_ACTION',
		'pageIDSize': selectedIDs.length,
		'dateRange_START': date,
		'dateRange_END' : date,
		'selectedID': selectedIDs
	});
	var options = {
		hostname: wfmHost,
		port: wfmPort,
		path: '/wfo/control/peoplescheduletext',
 		method: 'POST',
		headers: {
			'Content-type': 'application/x-www-form-urlencoded',
			'Content-Length': post_data.length,
			'Cookie': cookie,
			'User-Agent' : 'Mozilla/5.0 (Windows; U; WinNT4.0; fr-FR; rv:0.9.2) Gecko/20010726 Netscape6/6.1',
		},
	};

	var post = http.request(options, function(response) 
	{
		response.setEncoding('utf8');

		response.on('data', function (chunk) 
		{
			page = page+chunk;
		});
		response.on('end', function () 
		{
			search(page, '<th class="tblItem" scope="row" style="font-weight:normal; text-align:left;" id="workpaneList', '<th class="tblItem" scope="row" style="font-weight:normal; text-align:left;" id="workpaneList', checkDatabase)	//Recycle this function to parse each engineer and their schedule into an array
		});


	});
	post.on('error', function(error)
	{
		console.log('Error: Could not get ID' + error.message);
	});

	// post the data
	post.write(post_data);
	post.write('data\n');		//The node.js documentation uses this ending sequence. Previously, we did not close the connection because we were still communicating
	post.write('data\n');		//with witness. We will close it because we are (probably) done now. Not sure what the 'data\n' sequence is all about. I suspect that it is
	post.end();			//because the http RFC says requests should end with \r\n, but 'data\n' != \r\n. I'll follow the example here regardless.
}

var checkDatabase = function (nse)	//Function opens database conn and formats engineer's name and schedule and preps data for DB update
{
	/*

	Rough DB schema:  <-- Disclaimer, this might change over time and become out of date, but at least you have a rough idea of what the DB looks like.

	create database shift;
	use shift;

	create table NSEs ( id int not null auto_increment, update_needed bit(1), firstName varchar(256), lastName varchar(256), domainName varchar(256), shiftStart varchar(256), shiftEnd varchar(256), primary key(id));

	create user 'service_account'@'localhost' identified by 'abc123!@';
	set password for 'service_account'@'localhost' = password('abc123!@');
	grant all on shift.NSEs to 'service_account'@'localhost';

	*/

	connection = mysql.createPool(		//Open a dabase pool. Default database connections is 10
	{					//The mysql module will queue requests until a connection is released back to the pool
		host: dbHostname,
		user: dbUser,
		password: dbPassword,
		database: dbName,
		socketPath: dbSocket
	});

	asyncOpCount = nse.length - 2;

	for ( var index = 1; index < nse.length - 1; index++ ) //Start at 1 instead of 0 because 0th item is junk.
	{
/*		if( nse[index].indexOf('Other Duties') > 0 || nse[index].indexOf('Pre-Bootcamp') > 0 )		//Skip engineers who are special cases, or net yet spooled up
		{
			index++;
			asyncOpCount--;
		}

		//further parse each engineer and their schedule into managable variables
		if (index == 1)
		{
			console.log(nse[index]);
			console.log("index#: " + index);
		}
*/
		engineer = nse[index].substr(nse[index].indexOf('">') + 2, nse[index].indexOf('</th>') - nse[index].indexOf('">') - 2);
		schedule = string(string(nse[index].substr(nse[index].indexOf('<td class="tblItem" id="workpaneListr'), nse[index].indexOf('</td>') - nse[index].indexOf('<td class="tblItem" id="workpaneListr'))).stripTags()).trim();
		name = engineer.split(", ");
		shiftChange = schedule.split(" - ");
		
		if (nse[index].indexOf('Training') > 0)		//We will want to watch any engineer who is "Off". Engineers at training aren't off shift, but need their
		{						//tickets watched, so we will mark them as off anyway
			shiftChange[0] = 'Off';
		}

		if (shiftChange[0] == 'Off')
		{
			shiftChange[1] = '';		//If we do not set this var, the DB insert will fail
		}

		DBUpdate(name[1], name[0], shiftChange[0], shiftChange[1], connection);
	}
}

function DBUpdate(firstName, lastName, shiftStart, shiftEnd, connection)	//Function check DB to see if engineer exists and adds them. If schedule is out of date,
{										//we update it.
	connection.getConnection(function (error, socket)	//Obtain a connection from the pool
	{
		if (error)
		{
			console.log('Error: Error connecting to database - ' + error);
		}
						//There is no good way to trigger function every time a query completes. 'result' event does not always trigger
		var dbAlreadyUpdated = 0;	//and 'end' event does not pass the results of the query to the callback function, so we have to hack around this
		
		var query = socket.query('SELECT shiftStart FROM NSEs where firstName = ' + connection.escape(firstName) + ' AND lastName = ' + connection.escape(lastName)); 
		query.on('result', function(results)
		{
			selectError = 0;
			dbAlreadyUpdated = 1;		//This engineer already exists in the database, do not add them.

			if (results['shiftStart'] != shiftStart)	//If engineer's schedule has changed, update their schedule
			{
				var update = socket.query('UPDATE NSEs SET shiftStart = ' + connection.escape(shiftStart) + ', shiftEnd = ' + connection.escape(shiftEnd) +', update_needed=1 WHERE firstName = ' + connection.escape(firstName) + ' AND lastName = ' + connection.escape(lastName));
									//the update_needed DB key flags helper program if schedule is updated. Indicates if an distro
									//needs to be subscribed or unsubscribed to an engineer's cases
			}

		});
		query.on('end', function()
		{
			if(dbAlreadyUpdated != true)	//If engineer is not already in DB, add them
			{
				if (shiftStart != 'Not Published')	//those with unpublished schedules are probably a manager or ENE
				{
					if (typeof firstName != 'undefined')
					{
						getDomainUser(lastName + ', ' + firstName ).on('end', function(domainName)
						{
							socket.query('INSERT INTO NSEs (firstName, lastName, domainName, shiftStart, shiftEnd, update_needed) VALUES (' + connection.escape(firstName) + ', ' + connection.escape(lastName) + ', ' + connection.escape(domainName) + ', ' + connection.escape(shiftStart) + ', ' + connection.escape(shiftEnd) + ', 1)');
							socket.release();
							closeWait(connection);
						}).on('error', function(error)
						{
							console.log(error);
							socket.release();
							closeWait(connection);
						});
					}
					else
					{
						socket.release();
						closeWait(connection);
					}
				}
				else
				{
					socket.release();
					closeWait(connection);
				}
			}
			else
			{
				socket.release();		//release connection back to the connection pool to be used by other requests
				closeWait(connection);		//Handeler to ensure all database updates have completed
			}
		});		
	});
}

function search(string, searchString, delimiter, callback)	//Function searches for searchString and begins placing string in an array element. String spans from
{								//searchString to delimiter. Then function will search for next occurance of searchString and repeat
	var results =[];					//Finally, function passes resulting array to callback function.
	var index = 0;
	
	while (index >= 0)
	{
		tmpIndex = index + searchString.length;
		index = string.indexOf(searchString, tmpIndex);
		results.push(string.substr(tmpIndex, string.indexOf(delimiter, tmpIndex) - tmpIndex));
	}
	
	callback(results);
}

function closeWait(connection)		//This function decrements a count of the number of asyncronous operations (in DBUpdate) and triggers database connection pool closure
{					//when counter reaches 0
	asyncOpCount--;
//	console.log(asyncOpCount);
	if (!asyncOpCount)
	{
		connection.end();
		checkUpdateNeeded();
	}
}

function getDomainUser(name)		//Searches AD for an Domain username when given a users "last, first" name (from witness)
{
	var LDAPSignal = new events.EventEmitter();
	var contactInfo
	var email;
	var post_data = '';

	if (typeof IDList2point0[name] != 'undefined')
	{ 
		post_data = querystring.stringify(
		{
			'pageAction': 'NEW_ID_ACTION',
			'selectedID': IDList2point0[name].s,
		});
	}
        
	var options = {
		hostname: wfmHost,
		port: wfmPort,
		path: '/wfo/control/people_profile',
 		method: 'POST',
		headers: {
			'Content-type': 'application/x-www-form-urlencoded',
			'Content-Length': post_data.length,
			'Cookie': cookie,
			'User-Agent' : 'Mozilla/5.0 (Windows; U; WinNT4.0; fr-FR; rv:0.9.2) Gecko/20010726 Netscape6/6.1',
		},
	};
	
	post = http.request(options, function(response)
	{

		response.setEncoding('utf8');

		response.on('data', function (chunk)		//responses are chunked. We need to recombine (rechunk) them after transmission
		{				
			contactInfo = contactInfo+chunk;
		});
		response.on('end', function ()
		{
			var index = string(contactInfo).indexOf('Email_0" value="')+16;
			email = string(contactInfo).substr(index, string(contactInfo).indexOf('"', index) - index);
	
			var activeDirectory = ldap.createClient(
			{
				url: LDAPHost,
			});
                
			activeDirectory.bind(bind_DN, LDAPpassword, function(error){});		//We aren't going to bother using connection pooling. New employees aren't going to
												//be added in large numbers daily, so connection pooling would be pointless and this is simpler.
			options = {								//Since we have a max of 10 concurrent DB updates and returning a connection to the pool
				filter: '(&(sAMAccountName=*)(mail=' + email + '))',		//is dependant on the results of this function, we shouldn't need to worry about overloading
				scope: 'sub'							//the LDAP server.
			};
               
			if (typeof IDList2point0[name] != 'undefined')
			{ 
			activeDirectory.search(search_DN, options, function(error, results)
			{
				var numResults=0;
				if (!error)
				{
					results.on('searchEntry', function(queryResult)
					{
						var result = queryResult.object['sAMAccountName']
						LDAPSignal.emit('end', result);
						numResults++;
					});
					results.on('error', function(error)
					{
						LDAPSignal.emit('error', 'Error: ' + error);
						
					});
					results.on('end', function(result) {
						activeDirectory.unbind(function(error)
						{
							if(error)
							{
								console.log('Error disconnecting from LDAP server: ' + error);
							}
							if (!numResults)
							{
								LDAPSignal.emit('error', 'Error: No sAMAccountName found for (&(sAMAccountName=*)(mail=' + email + '))');
							}
						});
					});
				}
				else
				{
					LDAPSignal.emit('error', 'Error: ' + error);
				}                        
			});
			}
			else
			{
				LDAPSignal.emit('error', 'Error: No user in array IDList2point0 for ' + name);
			}
		});
	});
	post.on('error', function(error)
	{
		console.log('Error: Could not get user\'s E-mail from witness - ' + error.message);
	});

	post.write(post_data);
	post.write('data\n');		//J\k - we had to lookup a user, so we had to re-connect. Close again. See notes above in getSchedules() 
	post.write('data\n');
	post.end();

	return LDAPSignal
}

function checkUpdateNeeded()
{
	var post;
	var get;
	var taskCount = 0;

	function quit()
	{
	}

	connection = mysql.createConnection(
	{
		host: dbHostname,
		user: dbUser,
		password: dbPassword,
		database: dbName,
		socketPath: dbSocket
	});

	connection.connect()

	var query = connection.query('SELECT domainName, shiftStart FROM NSEs where update_needed = 1');
	query.on('result', function(results)
	{
		taskCount++;
		if (results['shiftStart'] == 'Off')
		{
			// Build the post string as JSON object
			var post_data = querystring.stringify({
				'POST_To_Do': 'New_Follow_User',
				'Settings_For': domainServiceAccount,	       //Settings_For = logged in account
				'Leader_Alias': results['domainName'],		//Who you want the above account to follow
				'Sev1': 'Yes',			  //What Severitys to follow for this owner
				'Sev2': 'Yes',
				'Sev3': 'Yes',
				'Sev4': 'Yes',
				'Until_Time': (math.floor(moment().unix() / 86400) * 86400) + 86400 + 25200,		  //Empty = no limit; This should be a unix timestamp (Seconds since epoch)
				'If_Owner': 'Yes',
				'If_Contact' : 'Yes',
				'Note_To_Self' : '',
			});

			var options = {
				host: watchSRsHost,
				port: watchSRsPort,
				path: '/',
				method: 'POST',
				auth: domainServiceAccount + ':' + domainPassword,
				headers: {
						'Content-type': 'application/x-www-form-urlencoded',
						'Content-Length': post_data.length,
					},
			};

			post = https.request(options, function(header) {
				header.setEncoding('utf8');
				header.on('data', function()
				{
					console.log("Got Data");
				});
				header.on('end', function()
				{
					taskCount--;
					console.log(taskCount);
					console.log("ended");
					if (!taskCount)
					{
						//process.exit();
					}
				});
			});
			
			
			// post the data
			post.write(post_data);

		}
		else
		{
			var webpage;

			var options = {
				host: watchSRsHost,
				port: watchSRsPort,
				path: '/',
				method: 'GET',
				auth: domainServiceAccount + ':' + domainPassword,
			};

			get = https.get(options, function(response) {
				response.setEncoding('utf8');

				response.on('data', function(chunk)
				{
						webpage = webpage+chunk;
				});
				response.on('end', function()
				{
					rowid = string(webpage).substr(string(webpage).indexOf('Leader_Alias VALUE="' + string(results['domainName']).toUpperCase()));
					rowid = string(rowid).substr(0, string(rowid).indexOf('_T">'));
					rowid = string(rowid).substr(string(rowid).indexOf('Employee_Time_')+14); 
					
					// Build the post string as JSON object
					var post_data = querystring.stringify({
						'POST_To_Do': 'Update_Follow_User',
						'Update_To_Do': 'Delete',
						'Settings_For': domainServiceAccount,	       //Settings_For = logged in account
						'Leader_Alias': results['domainName'],		//Who you want the above account to follow
						'rowid': rowid,		//Not sure why this doesn't work
					});
					post_data = post_data + rowid;  //but, hey - this does, so no big deal.
                	
					var options = {
						host: watchSRsHost,
						port: watchSRsPort,
						path: '/',
						method: 'POST',
						auth: domainServiceAccount + ':' + domainPassword,
						headers: {
								'Content-type': 'application/x-www-form-urlencoded',
								'Content-Length': post_data.length,
							},
					};
                
					post = https.request(options, function(header) {
						header.setEncoding('utf8');
						header.on('data', function()
						{
							console.log("Got data");
						});
						header.on('end', function()
						{
							console.log("ended");
							taskCount--;
							console.log(taskCount);
							if (!taskCount)
							{
								process.exit();
							}
						});
					});
					
					// post the data
					post.write(post_data);
				});
			});
		
		}
	});
	query.on('end', function()
	{
		var date = new Date()
		if (date.getHours() ==  19)
		{
			var update = connection.query('UPDATE NSEs SET update_needed = 1 where shiftStart = "Off"');
		}
		else
		{
			var update = connection.query('UPDATE NSEs SET update_needed = 0');
		}
		update.on('end', function()
		{
			connection.end();
			if (!taskCount)
			{
				process.exit();
			}
		});
	});
}

login()					//trigger login. This is the main entry point. Without this, none of the above functions will run.
