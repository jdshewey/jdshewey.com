import resume from "../data/resume.json";

export default function Skills() {
  const { skills } = resume;
  return (
    <section className="mb-6">
      <h2 className="text-xl font-semibold mb-2">Skills</h2>
      <div className="grid md:grid-cols-2 gap-4 text-sm">
        {Object.entries(skills).map(([category, items]) => (
          <div key={category}>
            <h3 className="font-semibold capitalize mb-1">{category}</h3>
            <ul className="list-disc list-inside">
              {items.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
