import { projects } from '../data.js';

export default function Projects() {
  return (
    <section>
      <h2>Projects</h2>
      <ul className="cards">
        {projects.map((p) => (
          <li className="card" key={p.title}>
            <h3>{p.title}</h3>
            <p>{p.description}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
