// One shared base URL for every request (override with VITE_API_URL in .env)
export const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Small wrapper: parses JSON and turns non-2xx responses into thrown errors,
// so callers can rely on .catch() for both network and server failures.
async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options.headers },
    });
  } catch {
    throw new Error('Cannot reach the server. Is the backend running on port 5000?');
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const details = data.details ? ` (${Object.values(data.details).join(', ')})` : '';
    throw new Error((data.error || `Request failed with ${res.status}`) + details);
  }
  return data;
}

export const getTasks = () => request('/tasks');

export const createTask = (task) =>
  request('/tasks', { method: 'POST', body: JSON.stringify(task) });

export const updateTask = (id, changes) =>
  request(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(changes) });

export const deleteTask = (id) => request(`/tasks/${id}`, { method: 'DELETE' });
