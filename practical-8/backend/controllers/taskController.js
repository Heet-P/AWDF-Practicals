const Task = require('../models/Task');

const notFound = (res, id) => res.status(404).json({ error: `Task with id ${id} not found` });

// Every query is scoped to req.user.id (set by the auth middleware),
// so users can only ever see and change their own tasks.
// req.body has already been validated and sanitised by middleware/validate.js.

exports.getAllTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (err) {
    next(err);
  }
};

exports.getTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user.id });
    if (!task) return notFound(res, req.params.id);
    res.status(200).json(task);
  } catch (err) {
    next(err);
  }
};

exports.createTask = async (req, res, next) => {
  try {
    const task = await Task.create({ ...req.body, user: req.user.id });
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
};

exports.updateTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndUpdate({ _id: req.params.id, user: req.user.id }, req.body, {
      new: true,
      runValidators: true,
    });
    if (!task) return notFound(res, req.params.id);
    res.status(200).json(task);
  } catch (err) {
    next(err);
  }
};

exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!task) return notFound(res, req.params.id);
    res.status(200).json({ message: 'Task deleted', task });
  } catch (err) {
    next(err);
  }
};
