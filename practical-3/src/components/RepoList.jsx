export default function RepoList({ data }) {
  if (data.length === 0) return <p className="muted">No repositories match.</p>;

  return (
    <ul className="cards">
      {data.map((repo) => (
        <li key={repo.id}>
          <a className="card repo" href={repo.html_url} target="_blank" rel="noreferrer">
            <h3>{repo.name}</h3>
            {repo.description && <p>{repo.description}</p>}
            <span className="url">{repo.html_url}</span>
            <span className="meta">
              <span>★ {repo.stargazers_count}</span>
              {repo.language && <span>{repo.language}</span>}
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}
