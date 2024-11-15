import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  Chip,
  Box,
  Button
} from '@mui/material';
import {
  Download,
  Preview,
  History
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';

const FileVersionHistory = ({ versions }) => {
  const getFileIcon = (filename) => {
    const extension = filename.split('.').pop().toLowerCase();
    switch (extension) {
      case 'pdf':
        return '📄';
      case 'doc':
      case 'docx':
        return '📝';
      case 'jpg':
      case 'jpeg':
      case 'png':
        return '🖼️';
      case 'mp3':
        return '🎵';
      case 'mp4':
        return '🎥';
      default:
        return '📁';
    }
  };

  return (
    <Paper className="p-4">
      <Box className="flex justify-between items-center mb-4">
        <Typography variant="h6" className="flex items-center">
          <History className="mr-2" />
          File Version History
        </Typography>
      </Box>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>File</TableCell>
              <TableCell>Version</TableCell>
              <TableCell>Uploaded By</TableCell>
              <TableCell>Upload Date</TableCell>
              <TableCell>Comments</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {versions.map((version) => (
              <TableRow key={version._id}>
                <TableCell>
                  <div className="flex items-center">
                    <span className="mr-2 text-xl">
                      {getFileIcon(version.filename)}
                    </span>
                    <div>
                      <Typography variant="body2">
                        {version.filename}
                      </Typography>
                      {version.version === Math.max(...versions.map(v => v.version)) && (
                        <Chip
                          label="Latest"
                          size="small"
                          color="primary"
                          className="mt-1"
                        />
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Chip
                    label={`v${version.version}`}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {version.uploadedBy.name}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {version.uploadedBy.department}
                  </Typography>
                </TableCell>
                <TableCell>
                  {formatDistanceToNow(new Date(version.createdAt), { addSuffix: true })}
                </TableCell>
                <TableCell>
                  {version.comments?.length > 0 ? (
                    <div className="max-h-20 overflow-y-auto">
                      {version.comments.map((comment, index) => (
                        <Typography key={index} variant="caption" display="block">
                          {comment.text}
                        </Typography>
                      ))}
                    </div>
                  ) : (
                    <Typography variant="caption" color="textSecondary">
                      No comments
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => window.open(version.path, '_blank')}
                    title="Preview"
                  >
                    <Preview />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = version.path;
                      link.download = version.filename;
                      link.click();
                    }}
                    title="Download"
                  >
                    <Download />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default FileVersionHistory; 