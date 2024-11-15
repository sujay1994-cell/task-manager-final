const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// @route   GET api/projects
// @desc    Get all projects
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    res.json({ message: "Projects route working" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router; 