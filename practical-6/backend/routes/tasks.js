const express = require('express');
const requireJson = require('../middleware/requireJson');
const validateId = require('../middleware/validateId');
const {
  getAllTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
} = require('../controllers/taskController');

const router = express.Router();

router.get('/', getAllTasks);
router.get('/:id', validateId, getTask);
// Route-specific middleware runs only for these routes, in the order listed
router.post('/', requireJson, createTask);
router.put('/:id', validateId, requireJson, updateTask);
router.delete('/:id', validateId, deleteTask);

module.exports = router;
