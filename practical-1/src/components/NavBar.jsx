import { useEffect, useState } from 'react';

// Highlights whichever section is currently in view.
export default function NavBar({ sections }) {
  const [active, setActive] = useState(sections[0]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: '-40% 0px -55% 0px' }
    );
    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [sections]);

  return (
    <nav className="nav">
      <ul>
        {sections.map((id) => (
          <li key={id}>
            <a href={`#${id}`} className={active === id ? 'active' : ''}>
              {id[0].toUpperCase() + id.slice(1)}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
