import { useEffect, useState } from 'react';
import * as api from '../api.js';
import Spinner from '../components/Spinner.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import TaskForm from '../components/TaskForm.jsx';
import TaskItem from '../components/TaskItem.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import { useToast } from '../components/Toast.jsx';

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attempt, setAttempt] = useState(0);
  const [busyId, setBusyId] = useState(null); // task currently being updated/deleted
  const [toDelete, setToDelete] = useState(null); // task awaiting delete confirmation
  const notify = useToast();

  // READ: load tasks from the backend on mount (and on Retry)
  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError(null);
    api
      .getTasks()
      .then((data) => !ignore && setTasks(data))
      .catch((err) => !ignore && setError(err.message))
      .finally(() => !ignore && setLoading(false));
    return () => {
      ignore = true;
    };
  }, [attempt]);

  // CREATE (optimistic): show the task immediately, then swap in the server's copy.
  // If the server rejects it, remove the placeholder again.
  const handleCreate = async (newTask) => {
    const tempId = `temp-${Date.now()}`;
    setTasks((list) => [{ ...newTask, _id: tempId, completed: false, pending: true }, ...list]);
    try {
      const saved = await api.createTask(newTask);
      setTasks((list) => list.map((t) => (t._id === tempId ? saved : t)));
      notify('Task created');
    } catch (err) {
      setTasks((list) => list.filter((t) => t._id !== tempId));
      notify(err.message, 'error');
    }
  };

  // UPDATE: wait for the server, then replace the task with its response
  const handleUpdate = async (task, changes, successMessage) => {
    setBusyId(task._id);
    try {
      const updated = await api.updateTask(task._id, changes);
      setTasks((list) => list.map((t) => (t._id === updated._id ? updated : t)));
      notify(successMessage);
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setBusyId(null);
    }
  };

  // DELETE: only removed from the UI after the server confirms
  const handleDelete = async () => {
    const task = toDelete;
    setToDelete(null);
    setBusyId(task._id);
    try {
      await api.deleteTask(task._id);
      setTasks((list) => list.filter((t) => t._id !== task._id));
      notify('Task deleted');
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <Spinner label="Loading tasks" />;
  if (error) return <ErrorMessage title="Could not load tasks" message={error} onRetry={() => setAttempt((n) => n + 1)} />;

  const remaining = tasks.filter((t) => !t.completed).length;

  return (
    <section>
      <div className="toolbar">
        <h2>Tasks</h2>
        <span className="muted">
          {remaining} open · {tasks.length} total
        </span>
      </div>

      <TaskForm onCreate={handleCreate} />

      {tasks.length === 0 ? (
        <p className="muted empty">No tasks yet. Add your first one above.</p>
      ) : (
        <ul className="task-list">
          {tasks.map((task) => (
            <TaskItem
              key={task._id}
              task={task}
              busy={busyId === task._id}
              onToggle={() =>
                handleUpdate(task, { completed: !task.completed }, task.completed ? 'Marked as open' : 'Marked as done')
              }
              onRename={(title) => handleUpdate(task, { title }, 'Task renamed')}
              onDelete={() => setToDelete(task)}
            />
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete this task?"
        message={toDelete ? `"${toDelete.title}" will be removed permanently.` : ''}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
    </section>
  );
}
