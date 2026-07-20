import Header from "./components/Header";
import Summary from "./components/Summary";
import Experience from "./components/Experience";
import Skills from "./components/Skills";
import Education from "./components/Education";
import Certifications from "./components/Certifications";
import Footer from "./components/Footer";

function App() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <main className="max-w-4xl mx-auto px-4 py-8">
        <Header />
        <Summary />
        <Experience />
        <Skills />
        <Education />
        <Certifications />
        <Footer />
      </main>
    </div>
  );
}

export default App;
