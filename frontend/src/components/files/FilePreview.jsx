import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  IconButton,
  Typography,
  Button,
  CircularProgress,
  Paper
} from '@mui/material';
import {
  Close as CloseIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  GetApp as DownloadIcon,
  RotateLeft as RotateLeftIcon,
  RotateRight as RotateRightIcon
} from '@mui/icons-material';
import { Document, Page, pdfjs } from 'react-pdf';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

// Set PDF worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const FilePreview = ({ open, onClose, file }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [loading, setLoading] = useState(true);

  const isImage = file?.type?.startsWith('image/');
  const isPDF = file?.type === 'application/pdf';
  const isAudio = file?.type?.startsWith('audio/');

  const handleDownload = async () => {
    try {
      const response = await axios.get(`/api/files/${file._id}/download`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', file.fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const handleRotate = (direction) => {
    setRotation(prev => (direction === 'left' ? prev - 90 : prev + 90));
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setLoading(false);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            {file?.fileName}
          </Typography>
          <Box>
            <IconButton onClick={handleDownload} title="Download">
              <DownloadIcon />
            </IconButton>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        )}

        {isImage && (
          <Box sx={{ position: 'relative' }}>
            <TransformWrapper>
              {({ zoomIn, zoomOut }) => (
                <>
                  <Box sx={{ position: 'absolute', top: 10, right: 10, zIndex: 1 }}>
                    <IconButton onClick={() => zoomIn()}>
                      <ZoomInIcon />
                    </IconButton>
                    <IconButton onClick={() => zoomOut()}>
                      <ZoomOutIcon />
                    </IconButton>
                    <IconButton onClick={() => handleRotate('left')}>
                      <RotateLeftIcon />
                    </IconButton>
                    <IconButton onClick={() => handleRotate('right')}>
                      <RotateRightIcon />
                    </IconButton>
                  </Box>
                  <TransformComponent>
                    <img
                      src={file.url}
                      alt={file.fileName}
                      style={{
                        maxWidth: '100%',
                        transform: `rotate(${rotation}deg)`,
                        transition: 'transform 0.3s ease'
                      }}
                      onLoad={() => setLoading(false)}
                    />
                  </TransformComponent>
                </>
              )}
            </TransformWrapper>
          </Box>
        )}

        {isPDF && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box sx={{ mb: 2 }}>
              <Button
                disabled={pageNumber <= 1}
                onClick={() => setPageNumber(prev => prev - 1)}
              >
                Previous
              </Button>
              <Typography component="span" sx={{ mx: 2 }}>
                Page {pageNumber} of {numPages}
              </Typography>
              <Button
                disabled={pageNumber >= numPages}
                onClick={() => setPageNumber(prev => prev + 1)}
              >
                Next
              </Button>
            </Box>
            <Paper elevation={3}>
              <Document
                file={file.url}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={<CircularProgress />}
              >
                <Page 
                  pageNumber={pageNumber}
                  rotate={rotation}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                />
              </Document>
            </Paper>
          </Box>
        )}

        {isAudio && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <audio
              controls
              src={file.url}
              onCanPlay={() => setLoading(false)}
              style={{ width: '100%', maxWidth: 500 }}
            >
              Your browser does not support the audio element.
            </audio>
          </Box>
        )}

        {!isImage && !isPDF && !isAudio && (
          <Box sx={{ textAlign: 'center', p: 3 }}>
            <Typography color="textSecondary">
              Preview not available for this file type.
              Please download to view.
            </Typography>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={handleDownload}
              sx={{ mt: 2 }}
            >
              Download File
            </Button>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default FilePreview; 