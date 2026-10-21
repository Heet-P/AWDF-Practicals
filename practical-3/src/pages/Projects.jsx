import { useEffect, useState } from 'react';
import Spinner from '../components/Spinner.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import RepoList from '../components/RepoList.jsx';
import { githubUser } from '../data.js';

export default function Projects() {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  // Bumping this number re-runs the effect, which is how "Retry" works.
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let ignore = false; // avoids setting state after unmount / on a stale request
    setLoading(true);
    setError(null);

    fetch(`https://api.github.com/users/${githubUser}/repos?sort=updated&per_page=30`)
      .then((res) => {
        if (!res.ok) throw new Error(`GitHub responded with ${res.status}`);
        return res.json();
      })
      .then((data) => !ignore && setRepos(data))
      .catch((err) => !ignore && setError(err.message))
      .finally(() => !ignore && setLoading(false));

    return () => {
      ignore = true;
    };
  }, [attempt]); // [] on first mount, then only when Retry is pressed

  if (loading) return <Spinner label={`Fetching ${githubUser}'s repositories`} />;
  if (error) return <ErrorMessage message={error} onRetry={() => setAttempt((n) => n + 1)} />;

  const visible = repos.filter((r) => r.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <section>
      <div className="toolbar">
        <h2>Repositories · {githubUser}</h2>
        <input
          type="search"
          placeholder="Filter by name"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <RepoList data={visible} />
    </section>
  );
}
