const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getTasks,
  createTask,
  updateTaskStatus,
  deleteTask
} = require('../controllers/taskController');

router.get('/', auth, getTasks);

router.post('/', auth, createTask);

router.put('/:id', auth, updateTaskStatus);

router.delete('/:id', auth, deleteTask);

module.exports = router; 