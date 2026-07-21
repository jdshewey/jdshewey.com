import Header from "./components/Header";
import Summary from "./components/Summary";
import Education from "./components/Education";
import Certifications from "./components/Certifications";
import Experience from "./components/Experience";
import Skills from "./components/Skills";
import Footer from "./components/Footer";

function App() {
  return (
    <div className="App">
      <main className="max-w-4xl mx-auto px-4 py-8">
        <Header />
	<Summary />
	<Education />
	<Certifications />
	<Experience />
        <Skills />
      </main>
    </div>
  );
}

export default App;
