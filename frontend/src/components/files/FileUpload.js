import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  LinearProgress,
  IconButton
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import FileService from '../../services/FileService';

const FileUpload = ({ taskId, onUploadComplete }) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleFileSelect = (event) => {
    setSelectedFiles(Array.from(event.target.files));
  };

  const handleUpload = async () => {
    if (!selectedFiles.length) return;

    setUploading(true);
    try {
      const uploadQueue = selectedFiles.map(file => {
        return FileService.addToQueue(file, (progress) => {
          setProgress(progress);
        });
      });

      await Promise.all(uploadQueue);
      
      setSelectedFiles([]);
      onUploadComplete?.();
    } catch (error) {
      console.error('Error uploading files:', error);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <Box>
      <input
        type="file"
        multiple
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        id="file-input"
      />
      <label htmlFor="file-input">
        <Button
          variant="outlined"
          component="span"
          startIcon={<UploadIcon />}
          disabled={uploading}
        >
          Select Files
        </Button>
      </label>

      {selectedFiles.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Selected Files:
          </Typography>
          {selectedFiles.map((file, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 1
              }}
            >
              <Typography variant="body2">{file.name}</Typography>
              <IconButton
                size="small"
                onClick={() => setSelectedFiles(files => files.filter((_, i) => i !== index))}
                disabled={uploading}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          ))}
          <Button
            variant="contained"
            onClick={handleUpload}
            disabled={uploading}
            sx={{ mt: 1 }}
          >
            Upload
          </Button>
        </Box>
      )}

      {uploading && (
        <Box sx={{ mt: 2 }}>
          <LinearProgress variant="determinate" value={progress} />
        </Box>
      )}
    </Box>
  );
};

export default FileUpload; 