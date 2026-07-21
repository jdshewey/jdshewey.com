<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="content-type" content="text/html; charset=utf-8" />
<title>James Shewey's Resumé</title>
<meta name="keywords" content="" />
<meta name="description" content="" />
<link href="styles.css" rel="stylesheet" type="text/css" />
</head>
<body>

<div id="main_bg">
<div id="main">
<!-- header begins -->
<div id="header">
	<div id="logo"><h2>James Shewey</h2>Networking and Systems Administrator</div>
    <div id="buttons">
        <ul>
          <li class="first"><a href="index.html"  title="">Home</a></li>
		  <li><a href="resume.php" title="">Resumé</a></li>
          <li><a href="portfolio.html" title="">Portfolio</a></li>
          <li><a href="about.html" title="">About</a></li>
          <li><a href="http://jdshewey.blogspot.com" class="last_b" title="">Blog</a></li>
          <li ><a href="contact.html" title="" class="last_b">Contact</a></li>
        </ul>
    </div>
</div>
<!-- header ends -->
    <!-- content begins -->
    	<div id="content">
<div class="left_r">
<br>
<center>
<h2>Degree & Current Certifications</h2>
<br>
<a href="http://apu.edu"><img width="75px"src="./images/APU_Seal.png"><br>
BS in Computer Science from Azusa Pacific University</a><br>
<br>
<br>
<img width="230px" src="./images/comptia_logo.png"><br>
<br>
<img width="175px" src="./images/vmware.gif"><br>
VMWare Technical Sales Professional (VTSP)
<br>
<br>
<h3><b>Previous Certifications</b></h3>
<br>
<br>
<img width="150px" src="./images/Sonicwall_logo.gif"><br>
Certified Sonicwall Security Administrator (CSSA)<br>
<br>

<img width="50px" src="./images/apple.png"><br>
AppleCare Certified<br>
<br>
<br>
<h2>Windows</h2>
Core Operating System, Active Directory, Exchange, DNS, DHCP, Microsoft Office, SNMP, WMI<br>
<br>
<h2>Linux</h2>
Core Operating System, Apache, (S)FTP, iptables, MySQL, DHCPD, Samba, VPN, rsync, DNS/BIND, SNMP, Sendmail, Postfix, CentOS, Red Hat, Debian, systemd, firewalld, Katello, The Foreman, Puppet<br>
<br>
<h2>Networking</h2>
TCP/IP, IPv6, UDP, ARP, Cisco, SonicWALL, Switches (HP, Dell, Netgear, Cisco), HTTP, HTTPS, SSL, SIP, FTP, SNMP, SMTP, IMAP, POP3, MAPI, RIPv2 routing, IPSEC, DNS, DHCP, Multicast, LACP, 802.11 a/b/g/n/ac, 802.1Q VLAN tagging, DSCP and 802.1p QOS, Kerberos, LDAP, RADIUS, TACACS+<br>
<br>
<h2>Programming</h2>
C/C++, HTML, PHP, JavaScript, jQuery, CSS, XML, node.js, SQL, Perl, NSIS, AutoIT, BASH Scripting, Batch Scripting<Br>
</center>
</div>

            <div id="right">
            	<div class="right_top"></div>
              	<div class="right_s">
<table width=100%><tr><td></td><td align="right"><i>Available immediately</i></td></tr></table>


<h1><center>Experience</center></h1>
<br>
<table width=100%><tr><td>
<h2>NOC Systems Administrator II - 
<?php
$year = date("Y", time()) - date("Y", 1406876400);
$month = date("m", time()) + 4;
$month = ltrim($month, '0');
if ($month < 12)
{
	$year--;
}
if ($year > 1)
{
	echo "$year Years, $month Months";
}
else if ($year < 1)
{
	echo "$month Months";
}
else
{
	echo "$year Year, $month Months";
}
?>
</h2></td><td align="right">Aug 2014 to Present</td></tr></table>
<a href="http://panasonic.aero/"><i>Panasonic Avionics</i></a><br>
<br>
<ul>
<li>HA & Scalability analysis, planning and deployment</li>
<li>Upgrading from Red Hat Enterprise Linux 4 and migrating applications to CentOS 6.5 & 7 servers</li>
<li>Deployment of Puppet, Katello and Foreman (Red Hat Satellite 6) infrastructure used for managing application and configuration of servers from a centralized console</li>
<li>Authoring of Puppet modules (see portfolio for samples)</li>
<li>Application bug fixes/upgrades and core file analysis in C++</li>
<li>Manage storage and backups using our NetApp system </li>
<li>Troubleshoot application issues for 700 Linux server environment</li>
<li>Configure monitoring via Nimsoft and respond to alerts</li>
<li>Deployment of new applications</li>
<li>Experiment with AWS and explore fit for our environment</li>
<li>SQL Database performance analysis (MySQL, MariaDB &  database load balancing/HA)</li>
</ul>
<br>

<table width=100%><tr><td><h2>Network Support Engineer II - 1 Year, 7 Months</h2></td><td align="right">Jan 2013 to Jul 2014</td></tr></table>
<a href="http://www.f5.com"><i>F5 Networks</i></a><br>
<br>
<ul>
<li>Troubleshoot and resolve hardware and software issues on F5's Linux based BIG-IP Local Traffic Manager</li>
<li>Troubleshoot and resolve software issues in F5's Access Policy Manager module (APM) and Local Traffic Manager (LTM)</li>
<li>Advanced networking & troubleshooting (Wireshark, 802.1Q issues, STP loops, LACP issues, asymmetric or n-path routing issues, etc)</li>
<li>Provide F5 customers and partners with a consistently high-quality support experience</li>
<li>Greater than 9 out of 10 customer satisfaction rate ever quarter</li>
<li>Highest case closure rate on my team</li>
<li>Support for Exchange, Lync, Sharepoint, Citrix and VMWare load balancing</li>
<li>Reproduction of customer issues in VMWare lab</li>
<li>Stack trace analysis, core file escalation and management of Product Development case escalations</li>
<li>Product vulnerability assessments and escalation for identified vulnerabilities</li>
</ul>
<br>
<table width=100%><tr><td><h2>NOC Engineer II - 4 Years, 6 Months</h2></td><td align="right">July 2008 to Dec 2012</td></tr></table>
<a href="http://thrivenetworks.com"><i>Thrive Networks</i></a><br>
<br>
<ul>
<li>Network/Server health monitoring (SNMP and WMI) for hundreds of clients via      N-Able  and Kaseya management software</li>
<li>Support for Windows, Linux and Mac servers</li>
<li>SonicWALL subject matter expert, deployment and support</li>
<li>Installation of all services for new clients</li>
<li>Configuration and installation of backup appliance by Axcient</li>
<li>E-Mail flow (Exchange) Troubleshooting for McAfeeSaas spam filtering solution</li>
<li>Provisioning of Thrive s managed services for new clients</li>
<li>Custom programming solutions (php and perl) such as web forms/programs and custom monitoring</li>
<li>BASH scripting</li>
</ul>
<br>
<table width=100%><tr><td><h2>Regional Support Technician . 1 Year, 5 Months</h2></td><td align="right">Jan 2007 to July 2008</td></tr></table>
<a href="http://apu.edu"><i>Azusa Pacific University</i></a><br>
<br>
<ul>
<li>End User Support</li>
<li>Client workstation diagnostics and repair</li>
<li>Printer troubleshooting</li>
<li>Workstation refreshes and imaging using Ghost</li>
<li>Troubleshooting A/V systems and smart classrooms</li>
<li>Provided full Independent and self-directed service at seven sites located 30 to 130 miles from main campus to clients ranging from directors to faculty and students</li>
<li>Provided service for donor events and other important visitors such as accreditation board representatives and deans</li>
</ul>
<br>
<table width=100%><tr><td><h2>Training & Documentation Manager - 1 Year, 5 Months</h2></td><td align="right">Aug 2005 to Dec 2006</td></tr></table>
<a href="http://apu.edu"><i>Azusa Pacific University</i></a><br>
<br>
<ul>
<li>Trained all new hires </li>
<li>Coached and guided career development of employees</li>
<li>Enforced HR policies and procedures and related personnel related management tasks</li>
<li>Deployed and maintained a centralized document management system and ensured the continuing quality and consistency of documentation</li>
<li>Technical escalation point for employees struggling with PC troubleshooting and virus/adware removals</li>
<li>Planning and execution of yearly summer training summit</li>
<li>Budgeting</li>
</ul>
<br>
<br>
<table width=100%><tr><td></td><td align="right"><i>*Refrences available upon request</i></td></tr></table>

              </div>
            </div> 
            <div style="clear: both"><img src="images/spaser.gif" alt="" width="1" height="1" /></div>
     		</div>
    <!-- content ends -->
    <!-- footer begins -->
    <div id="footer">
  <center>© 2009, 2012<br>
  Original design by <a href="http://www.metamorphozis.com/">Metamorphosis Design</a><br />
  Derivitave work by James Shewey</center>
<!-- footer ends -->
</div>
</div>
</body>
</html>
