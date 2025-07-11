const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// Helper: check admin
const isAdmin = (req, res) => {
  if (req.user.role !== 'admin') {
    res.status(403).json({ msg: 'Access denied' });
    return false;
  }
  return true;
};

// Signup
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) return res.status(400).json({ msg: 'Please include all fields' });

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User already exists' });

    const hashed = await bcrypt.hash(password, 10);
    user = new User({ name, email, password: hashed, role });
    await user.save();

    const token = jwt.sign({ user: { id: user.id, role: user.role } }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ msg: 'Please include all fields' });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    const token = jwt.sign({ user: { id: user.id, role: user.role } }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// GET all users (Admin only)
router.get('/users', auth, async (req, res) => {
  try {
    if (!isAdmin(req, res)) return;

    const users = await User.find({}, 'name email role');
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// POST create user (Admin only)
router.post('/users', auth, async (req, res) => {
  try {
    if (!isAdmin(req, res)) return;

    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) return res.status(400).json({ msg: 'All fields are required' });

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User already exists' });

    const hashed = await bcrypt.hash(password, 10);
    user = new User({ name, email, password: hashed, role });
    await user.save();

    res.status(201).json({ msg: 'User created' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// PUT update user (Admin only)
router.put('/users/:id', auth, async (req, res) => {
  try {
    if (!isAdmin(req, res)) return;

    const { name, email, role } = req.body;
    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role },
      { new: true }
    ).select('name email role');

    if (!updated) return res.status(404).json({ msg: 'User not found' });

    res.json(updated);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// DELETE user (Admin only)
router.delete('/users/:id', auth, async (req, res) => {
  try {
    if (!isAdmin(req, res)) return;

    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ msg: 'User not found' });

    res.json({ msg: 'User deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
