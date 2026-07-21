import resume from "../data/resume.json";

export default function Certifications() {
  return (
    <section className="mb-6">
      <h2 className="text-xl font-semibold mb-2">Certifications</h2>
      <ul className="list-disc list-inside text-sm">
        {resume.certifications.current.map((c) => (
          <li key={c}>{c}</li>
        ))}
      </ul>
    </section>
  );
}
