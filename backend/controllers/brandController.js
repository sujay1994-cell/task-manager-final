const Brand = require('../models/Brand');
const Edition = require('../models/Edition');
const { createNotification } = require('../utils/notificationUtils');

const brandController = {
  // Create new brand
  createBrand: async (req, res) => {
    try {
      const { name, description, frequency } = req.body;
      
      // Check if brand already exists
      const existingBrand = await Brand.findOne({ name });
      if (existingBrand) {
        return res.status(400).json({ message: 'Brand already exists' });
      }

      const brand = new Brand({
        name,
        description,
        frequency,
        createdBy: req.user.id
      });

      await brand.save();

      // Create notification
      await createNotification({
        type: 'BRAND_CREATED',
        title: 'New Brand Created',
        message: `Brand "${name}" has been created`,
        recipients: ['manager', 'sales'],
        data: { brandName: name }
      });

      res.status(201).json(brand);
    } catch (error) {
      res.status(500).json({ message: 'Error creating brand' });
    }
  },

  // Get all brands
  getBrands: async (req, res) => {
    try {
      const brands = await Brand.find()
        .populate('createdBy', 'name')
        .sort({ createdAt: -1 });
      res.json(brands);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching brands' });
    }
  },

  // Get single brand
  getBrand: async (req, res) => {
    try {
      const brand = await Brand.findById(req.params.id)
        .populate('createdBy', 'name');
      
      if (!brand) {
        return res.status(404).json({ message: 'Brand not found' });
      }

      res.json(brand);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching brand' });
    }
  },

  // Update brand
  updateBrand: async (req, res) => {
    try {
      const { name, description, frequency, status } = req.body;
      
      const brand = await Brand.findById(req.params.id);
      if (!brand) {
        return res.status(404).json({ message: 'Brand not found' });
      }

      // Update fields
      brand.name = name || brand.name;
      brand.description = description || brand.description;
      brand.frequency = frequency || brand.frequency;
      brand.status = status || brand.status;
      brand.updatedAt = Date.now();

      await brand.save();

      // Create notification
      await createNotification({
        type: 'BRAND_UPDATED',
        title: 'Brand Updated',
        message: `Brand "${brand.name}" has been updated`,
        recipients: ['manager', 'sales'],
        data: { brandName: brand.name }
      });

      res.json(brand);
    } catch (error) {
      res.status(500).json({ message: 'Error updating brand' });
    }
  },

  // Delete brand
  deleteBrand: async (req, res) => {
    try {
      const brand = await Brand.findById(req.params.id);
      if (!brand) {
        return res.status(404).json({ message: 'Brand not found' });
      }

      // Check for existing editions
      const editionCount = await Edition.countDocuments({ brand: brand._id });
      if (editionCount > 0) {
        return res.status(400).json({ 
          message: 'Cannot delete brand with existing editions' 
        });
      }

      await brand.remove();

      // Create notification
      await createNotification({
        type: 'BRAND_DELETED',
        title: 'Brand Deleted',
        message: `Brand "${brand.name}" has been deleted`,
        recipients: ['manager', 'sales'],
        data: { brandName: brand.name }
      });

      res.json({ message: 'Brand deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting brand' });
    }
  },

  // Get brand editions
  getBrandEditions: async (req, res) => {
    try {
      const editions = await Edition.find({ brand: req.params.id })
        .populate('createdBy', 'name')
        .sort({ releaseDate: -1 });
      res.json(editions);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching brand editions' });
    }
  }
};

module.exports = brandController; 