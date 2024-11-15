const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');

// Configure storage
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniquePrefix = uuidv4();
    cb(null, `${uniquePrefix}-${file.originalname}`);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'video/mp4',
    'audio/mpeg'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

// File utilities
const fileUtils = {
  // Upload file to storage
  uploadToStorage: async (file) => {
    try {
      const filePath = path.join('uploads', file.filename);
      return {
        filename: file.filename,
        path: filePath,
        size: file.size
      };
    } catch (error) {
      throw new Error('Error uploading file to storage');
    }
  },

  // Delete file from storage
  deleteFromStorage: async (filename) => {
    try {
      const filePath = path.join(__dirname, '../uploads', filename);
      await fs.unlink(filePath);
    } catch (error) {
      throw new Error('Error deleting file from storage');
    }
  },

  // Get file stream
  getFileStream: async (filename) => {
    const filePath = path.join(__dirname, '../uploads', filename);
    return fs.createReadStream(filePath);
  },

  // Create temporary download URL
  createTempDownloadUrl: (filename) => {
    return `/api/files/download/${filename}`;
  },

  // Check if file exists
  fileExists: async (filename) => {
    try {
      const filePath = path.join(__dirname, '../uploads', filename);
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  },

  // Get file metadata
  getFileMetadata: async (filename) => {
    try {
      const filePath = path.join(__dirname, '../uploads', filename);
      const stats = await fs.stat(filePath);
      return {
        size: stats.size,
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime
      };
    } catch (error) {
      throw new Error('Error getting file metadata');
    }
  },

  // Clean up old temporary files
  cleanupTempFiles: async () => {
    try {
      const uploadDir = path.join(__dirname, '../uploads');
      const files = await fs.readdir(uploadDir);
      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000;

      for (const file of files) {
        const filePath = path.join(uploadDir, file);
        const stats = await fs.stat(filePath);
        if (now - stats.mtime.getTime() > oneDay) {
          await fs.unlink(filePath);
        }
      }
    } catch (error) {
      console.error('Error cleaning up temp files:', error);
    }
  }
};

module.exports = {
  upload,
  fileUtils
}; 