const Task = require('../models/Task');

const notFound = (res, id) => res.status(404).json({ error: `Task with id ${id} not found` });

// Every handler is wrapped in try/catch and forwards errors to the global
// error handler with next(err), so a failed query never crashes the server.

exports.getAllTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (err) {
    next(err);
  }
};

exports.getTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return notFound(res, req.params.id);
    res.status(200).json(task);
  } catch (err) {
    next(err);
  }
};

exports.createTask = async (req, res, next) => {
  try {
    const { title, description, completed, priority } = req.body;
    const task = await Task.create({ title, description, completed, priority });
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
};

exports.updateTask = async (req, res, next) => {
  try {
    const { title, description, completed, priority } = req.body;
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { title, description, completed, priority },
      { new: true, runValidators: true } // return the updated doc and re-check the schema
    );
    if (!task) return notFound(res, req.params.id);
    res.status(200).json(task);
  } catch (err) {
    next(err);
  }
};

exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return notFound(res, req.params.id);
    res.status(200).json({ message: 'Task deleted', task });
  } catch (err) {
    next(err);
  }
};
