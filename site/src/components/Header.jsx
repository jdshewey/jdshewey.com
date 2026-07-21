import resume from "../data/resume.json";

export default function Header() {
  return (
    <header className="border-b pb-4 mb-6">
      <h1 className="text-3xl font-bold">{resume.name}</h1>
      <p className="text-sm mt-1">
        {resume.location} • {resume.email} • {resume.phonePreferred} (preferred) •{" "}
        {resume.phoneAlt}
      </p>
      <p className="text-sm mt-2">
	  Seeking / Experienced In
	  {resume.roles.join(" | ")}<br></br>
	  {resume.sme.join(" | ")}
      </p>
    </header>
  );
}

