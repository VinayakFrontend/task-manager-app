const express = require('express');
const auth = require('../middleware/auth');
const Task = require('../models/Task');
const router = express.Router();

// Create a task (Admin only)
router.post('/', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Access denied' });

  const { title, description, assignedTo } = req.body;
  if (!title || !assignedTo) return res.status(400).json({ msg: 'Please include title & assignedTo' });

  const newTask = new Task({ title, description, assignedTo });
  await newTask.save();
  res.json(newTask);
});

// Get tasks (Admin sees all, User sees own)
router.get('/', auth, async (req, res) => {
  const user = req.user;
  let tasks;

  if (user.role === 'admin') {
    tasks = await Task.find().populate('assignedTo', 'name email');
  } else {
    tasks = await Task.find({ assignedTo: user.id }).populate('assignedTo', 'name email');
  }

  res.json(tasks);
});

// Mark task as complete
router.put('/:id/complete', auth, async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) return res.status(404).json({ msg: 'Task not found' });

  if (task.assignedTo.toString() !== req.user.id)
    return res.status(403).json({ msg: 'Not authorized' });

  task.status = 'completed';
  await task.save();
  res.json(task);
});

// Add comment to task
router.put('/:id/comment', auth, async (req, res) => {
  const { comment } = req.body;
  const task = await Task.findById(req.params.id);
  if (!task) return res.status(404).json({ msg: 'Task not found' });

  // if (task.assignedTo.toString() !== req.user.id)
  //   return res.status(403).json({ msg: 'Not authorized' });

  task.comments.push(comment);
  await task.save();
  res.json(task);
});

// Edit task (Admin only)
router.put('/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Access denied' });

  const { title, description, assignedTo } = req.body;
  const updated = await Task.findByIdAndUpdate(
    req.params.id,
    { title, description, assignedTo },
    { new: true }
  ).populate('assignedTo', 'name email');

  if (!updated) return res.status(404).json({ msg: 'Task not found' });

  res.json(updated);
});

// Delete task (Admin only)
router.delete('/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Access denied' });

  const task = await Task.findByIdAndDelete(req.params.id);
  if (!task) return res.status(404).json({ msg: 'Task not found' });

  res.json({ msg: 'Task deleted' });
});

module.exports = router;
