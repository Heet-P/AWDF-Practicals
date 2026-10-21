// Checks that :id is a positive integer before the controller runs
module.exports = (req, res, next) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: `Invalid task id "${req.params.id}"` });
  }
  req.taskId = id;
  next();
};
