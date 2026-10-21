// In-memory storage: resets every time the server restarts (replaced by MongoDB in Practical 5)
let tasks = [
  { id: 1, title: 'Set up Express server', description: 'Install express and create server.js', completed: true, createdAt: new Date().toISOString() },
  { id: 2, title: 'Write CRUD routes', description: 'GET, POST, PUT and DELETE for /tasks', completed: false, createdAt: new Date().toISOString() },
];
let nextId = 3;

const findTask = (id) => tasks.find((t) => t.id === id);

const notFound = (res, id) => res.status(404).json({ error: `Task with id ${id} not found` });

exports.getAllTasks = (req, res) => {
  res.status(200).json(tasks);
};

exports.getTask = (req, res) => {
  const task = findTask(req.taskId);
  if (!task) return notFound(res, req.taskId);
  res.status(200).json(task);
};

exports.createTask = (req, res) => {
  const { title, description = '' } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'title is required' });
  }
  const task = {
    id: nextId++,
    title: title.trim(),
    description,
    completed: false,
    createdAt: new Date().toISOString(),
  };
  tasks.push(task);
  res.status(201).json(task);
};

exports.updateTask = (req, res) => {
  const task = findTask(req.taskId);
  if (!task) return notFound(res, req.taskId);

  const { title, description, completed } = req.body;
  if (title !== undefined) task.title = title;
  if (description !== undefined) task.description = description;
  if (completed !== undefined) task.completed = Boolean(completed);
  res.status(200).json(task);
};

exports.deleteTask = (req, res) => {
  const task = findTask(req.taskId);
  if (!task) return notFound(res, req.taskId);

  tasks = tasks.filter((t) => t.id !== req.taskId);
  res.status(200).json({ message: 'Task deleted', task });
};
