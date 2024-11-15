const Edition = require('../models/Edition');
const Brand = require('../models/Brand');
const { createNotification } = require('../utils/notificationUtils');

const editionController = {
  createEdition: async (req, res) => {
    try {
      const { brandId, name, releaseDate, deadline } = req.body;

      const brand = await Brand.findById(brandId);
      if (!brand) {
        return res.status(404).json({ message: 'Brand not found' });
      }

      const edition = new Edition({
        brand: brandId,
        name,
        releaseDate,
        deadline,
        createdBy: req.user.id
      });

      await edition.save();

      await createNotification({
        type: 'EDITION_CREATED',
        title: 'New Edition Created',
        message: `New edition "${name}" created for ${brand.name}`,
        recipients: ['manager', 'sales', 'editorial', 'design'],
        data: { brandName: brand.name, editionName: name }
      });

      res.status(201).json(edition);
    } catch (error) {
      res.status(500).json({ message: 'Error creating edition' });
    }
  },

  getEditions: async (req, res) => {
    try {
      const editions = await Edition.find()
        .populate('brand', 'name')
        .populate('createdBy', 'name')
        .sort({ releaseDate: -1 });
      res.json(editions);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching editions' });
    }
  },

  getEdition: async (req, res) => {
    try {
      const edition = await Edition.findById(req.params.id)
        .populate('brand', 'name')
        .populate('createdBy', 'name')
        .populate('tasks');
      
      if (!edition) {
        return res.status(404).json({ message: 'Edition not found' });
      }

      res.json(edition);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching edition' });
    }
  },

  updateEdition: async (req, res) => {
    try {
      const { name, releaseDate, deadline, status } = req.body;
      
      const edition = await Edition.findById(req.params.id)
        .populate('brand', 'name');

      if (!edition) {
        return res.status(404).json({ message: 'Edition not found' });
      }

      edition.name = name || edition.name;
      edition.releaseDate = releaseDate || edition.releaseDate;
      edition.deadline = deadline || edition.deadline;
      edition.status = status || edition.status;
      edition.updatedAt = Date.now();

      await edition.save();

      await createNotification({
        type: 'EDITION_UPDATED',
        title: 'Edition Updated',
        message: `Edition "${edition.name}" has been updated`,
        recipients: ['manager', 'sales', 'editorial', 'design'],
        data: { 
          brandName: edition.brand.name, 
          editionName: edition.name 
        }
      });

      res.json(edition);
    } catch (error) {
      res.status(500).json({ message: 'Error updating edition' });
    }
  },

  deleteEdition: async (req, res) => {
    try {
      const edition = await Edition.findById(req.params.id)
        .populate('brand', 'name');

      if (!edition) {
        return res.status(404).json({ message: 'Edition not found' });
      }

      if (edition.tasks && edition.tasks.length > 0) {
        return res.status(400).json({ 
          message: 'Cannot delete edition with existing tasks' 
        });
      }

      await edition.remove();

      await createNotification({
        type: 'EDITION_DELETED',
        title: 'Edition Deleted',
        message: `Edition "${edition.name}" has been deleted`,
        recipients: ['manager', 'sales'],
        data: { 
          brandName: edition.brand.name, 
          editionName: edition.name 
        }
      });

      res.json({ message: 'Edition deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting edition' });
    }
  }
};

module.exports = editionController; 