const FileVersion = require('../models/FileVersion');
const Task = require('../models/Task');
const { sendNotification } = require('../services/notificationService');
const path = require('path');
const fs = require('fs').promises;

const fileVersionController = {
  // Upload new file version
  uploadVersion: async (req, res) => {
    try {
      const taskId = req.params.taskId;
      const task = await Task.findById(taskId);
      
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }

      const files = Array.isArray(req.files) ? req.files : [req.files];
      const uploadedFiles = [];

      for (const file of files) {
        // Get latest version number
        const latestVersion = await FileVersion.getLatestVersion(taskId);
        
        // Create new file version
        const fileVersion = new FileVersion({
          task: taskId,
          filename: file.filename,
          originalName: file.originalname,
          path: file.path,
          mimeType: file.mimetype,
          size: file.size,
          version: latestVersion + 1,
          uploadedBy: req.user.id,
          metadata: await getFileMetadata(file)
        });

        await fileVersion.save();
        uploadedFiles.push(fileVersion);

        // Add to task history
        task.history.push({
          action: 'file_uploaded',
          user: req.user.id,
          details: `New version uploaded: ${file.originalname}`
        });

        // Notify relevant users
        const notifyUsers = [task.createdBy];
        if (task.assignedTo && task.assignedTo.toString() !== req.user.id) {
          notifyUsers.push(task.assignedTo);
        }

        await Promise.all(notifyUsers.map(userId =>
          sendNotification(userId, {
            type: 'file_uploaded',
            message: `New file version uploaded for task "${task.name}"`,
            taskId: task._id
          })
        ));
      }

      await task.save();
      res.json(uploadedFiles);
    } catch (error) {
      res.status(500).json({ message: 'Error uploading file version' });
    }
  },

  // Get file versions
  getVersions: async (req, res) => {
    try {
      const versions = await FileVersion.find({ task: req.params.taskId })
        .populate('uploadedBy', 'name email')
        .populate('comments.user', 'name email')
        .sort('-version');
      res.json(versions);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching file versions' });
    }
  },

  // Add comment to version
  addComment: async (req, res) => {
    try {
      const { text } = req.body;
      const fileVersion = await FileVersion.findById(req.params.versionId);

      if (!fileVersion) {
        return res.status(404).json({ message: 'File version not found' });
      }

      await fileVersion.addComment(req.user.id, text);

      // Notify file uploader
      if (fileVersion.uploadedBy.toString() !== req.user.id) {
        await sendNotification(fileVersion.uploadedBy, {
          type: 'file_comment',
          message: `New comment on your file in task "${fileVersion.task.name}"`,
          taskId: fileVersion.task
        });
      }

      res.json(fileVersion);
    } catch (error) {
      res.status(500).json({ message: 'Error adding comment' });
    }
  },

  // Download file version
  downloadVersion: async (req, res) => {
    try {
      const fileVersion = await FileVersion.findById(req.params.versionId);

      if (!fileVersion) {
        return res.status(404).json({ message: 'File version not found' });
      }

      res.download(fileVersion.path, fileVersion.originalName);
    } catch (error) {
      res.status(500).json({ message: 'Error downloading file' });
    }
  },

  // Archive file version
  archiveVersion: async (req, res) => {
    try {
      const fileVersion = await FileVersion.findById(req.params.versionId);

      if (!fileVersion) {
        return res.status(404).json({ message: 'File version not found' });
      }

      fileVersion.status = 'archived';
      await fileVersion.save();

      res.json({ message: 'File version archived' });
    } catch (error) {
      res.status(500).json({ message: 'Error archiving file version' });
    }
  }
};

// Helper function to get file metadata
async function getFileMetadata(file) {
  // Add image dimension extraction for image files
  // Add other metadata extraction based on file type
  return {};
}

module.exports = fileVersionController; 