import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  TextField,
  Chip
} from '@mui/material';
import { useSelector } from 'react-redux';

const ContentReview = () => {
  const [selectedContent, setSelectedContent] = useState(null);
  const pendingReviews = useSelector(state => 
    state.tasks.items.filter(task => 
      task.department === 'Editorial' && 
      task.status === 'awaiting-approval'
    )
  );

  const ContentCard = ({ content }) => (
    <Card className="mb-4">
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {content.name}
        </Typography>
        <Box className="mb-2">
          <Chip
            label={content.type}
            size="small"
            className="mr-2"
          />
          <Chip
            label={`Due: ${new Date(content.deadline).toLocaleDateString()}`}
            size="small"
            color="warning"
          />
        </Box>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          Submitted by: {content.assignedTo?.name}
        </Typography>
        <Box className="mt-3">
          <Button
            variant="outlined"
            size="small"
            className="mr-2"
            onClick={() => setSelectedContent(content)}
          >
            Review
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <Typography variant="h6" gutterBottom>
          Pending Reviews ({pendingReviews.length})
        </Typography>
        <Box className="overflow-auto" style={{ maxHeight: '600px' }}>
          {pendingReviews.map(content => (
            <ContentCard key={content._id} content={content} />
          ))}
        </Box>
      </Grid>

      <Grid item xs={12} md={8}>
        {selectedContent ? (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Review: {selectedContent.name}
              </Typography>
              <Box className="space-y-4">
                <TextField
                  fullWidth
                  multiline
                  rows={6}
                  label="Feedback"
                  variant="outlined"
                />
                <Box className="flex justify-end space-x-2">
                  <Button
                    variant="outlined"
                    color="error"
                  >
                    Request Revisions
                  </Button>
                  <Button
                    variant="contained"
                    color="success"
                  >
                    Approve Content
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ) : (
          <Box className="h-full flex items-center justify-center">
            <Typography color="textSecondary">
              Select content to review
            </Typography>
          </Box>
        )}
      </Grid>
    </Grid>
  );
};

export default ContentReview; 