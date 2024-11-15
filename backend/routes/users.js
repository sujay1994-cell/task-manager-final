const express = require('express');
const router = express.Router();

// Get all users
router.get('/', async (req, res) => {
  try {
    // Mock data
    const users = [
      {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        role: 'editor',
        department: 'Editorial'
      },
      // Add more mock users
    ];
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new user
router.post('/', async (req, res) => {
  try {
    const user = {
      id: Date.now(),
      ...req.body,
      createdAt: new Date()
    };
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 