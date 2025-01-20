const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getTasks,
  createTask,
  updateTaskStatus,
  deleteTask
} = require('../controllers/taskController');

// @route   GET api/tasks
// @desc    Get all tasks for a user
// @access  Private
router.get('/', auth, getTasks);

// @route   POST api/tasks
// @desc    Create a new task
// @access  Private
router.post('/', auth, createTask);

// @route   PUT api/tasks/:id
// @desc    Update task status
// @access  Private
router.put('/:id', auth, updateTaskStatus);

// @route   DELETE api/tasks/:id
// @desc    Delete a task
// @access  Private
router.delete('/:id', auth, deleteTask);

module.exports = router; 