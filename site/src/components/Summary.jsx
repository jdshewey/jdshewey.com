import resume from "../data/resume.json";

export default function Summary() {
  return (
    <section className="mb-6">
      <h2 className="text-xl font-semibold mb-2">Professional Summary</h2>
      <p className="text-sm leading-relaxed">{resume.summary}</p>
    </section>
  );
}
