import resume from "../data/resume.json";

export default function Experience() {
  return (
    <section>
      <h2>Experience</h2>
      {resume.experience.map((job) => (
        <div key={job.company} className="job">
          <h3>{job.company} — {job.title}</h3>
          <p>{job.dates}</p>
          <ul>
            {job.bullets.map((b, i) => <li key={i}>{b}</li>)}
          </ul>
        </div>
      ))}
    </section>
  );
}
