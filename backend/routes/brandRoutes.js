const express = require('express');
const router = express.Router();
const Brand = require('../models/Brand');
const auth = require('../middleware/auth');
const { checkRole } = require('../middleware/roleCheck');

// Get all brands
router.get('/', auth, async (req, res) => {
  try {
    const brands = await Brand.find()
      .populate('createdBy', 'name')
      .sort('-createdAt');
    res.json(brands);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new brand
router.post('/', auth, checkRole(['sales_manager']), async (req, res) => {
  try {
    const brand = new Brand({
      ...req.body,
      createdBy: req.user.id
    });
    await brand.save();
    res.status(201).json(brand);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get single brand
router.get('/:id', auth, async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id)
      .populate('createdBy', 'name');
    if (!brand) {
      return res.status(404).json({ message: 'Brand not found' });
    }
    res.json(brand);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update brand
router.put('/:id', auth, checkRole(['sales_manager']), async (req, res) => {
  try {
    const brand = await Brand.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    if (!brand) {
      return res.status(404).json({ message: 'Brand not found' });
    }
    res.json(brand);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete brand
router.delete('/:id', auth, checkRole(['sales_manager']), async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) {
      return res.status(404).json({ message: 'Brand not found' });
    }
    if (brand.editionCount > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete brand with existing editions' 
      });
    }
    await brand.remove();
    res.json({ message: 'Brand deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 