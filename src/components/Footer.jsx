import resume from "../data/resume.json";

export default function Footer() {
  return (
    <footer className="mt-8 pt-4 border-t text-xs text-gray-600">
      <p>
        © {new Date().getFullYear()} {resume.name}. All rights reserved.
      </p>
    </footer>
  );
}
