import resume from "../data/resume.json";

export default function Education() {
  const { education } = resume;
  return (
    <section className="mb-6">
      <h2 className="text-xl font-semibold mb-2">Education</h2>
      <p className="text-sm">
        {education.degree}, {education.institution} ({education.year})
      </p>
    </section>
  );
}
