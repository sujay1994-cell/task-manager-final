const File = require('../models/File');
const Task = require('../models/Task');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = 'uploads/';
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error, null);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'audio/mpeg',
      'audio/wav'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
}).array('files', 10); // Allow up to 10 files

exports.uploadFiles = async (req, res) => {
  try {
    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      const { taskId, versionNote } = req.body;
      const uploadedBy = req.user.id;

      // Get current version number
      const latestFile = await File.findOne({ taskId })
        .sort({ versionNumber: -1 });
      const versionNumber = latestFile ? latestFile.versionNumber + 1 : 1;

      const filePromises = req.files.map(async file => {
        const newFile = new File({
          taskId,
          fileName: file.originalname,
          filePath: file.path,
          fileType: file.mimetype,
          fileSize: file.size,
          uploadedBy,
          versionNumber,
          versionNote
        });
        return newFile.save();
      });

      const savedFiles = await Promise.all(filePromises);

      // Update task with new files
      await Task.findByIdAndUpdate(taskId, {
        $push: { files: { $each: savedFiles.map(file => file._id) } }
      });

      res.json(savedFiles);
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getFileVersions = async (req, res) => {
  try {
    const { taskId } = req.params;
    const files = await File.find({ taskId })
      .sort({ versionNumber: -1 })
      .populate('uploadedBy', 'name');
    res.json(files);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.downloadFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.fileId);
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.download(file.filePath, file.fileName);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.fileId);
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Delete file from storage
    await fs.unlink(file.filePath);

    // Remove file reference from task
    await Task.findByIdAndUpdate(file.taskId, {
      $pull: { files: file._id }
    });

    // Delete file document
    await file.remove();

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}; 