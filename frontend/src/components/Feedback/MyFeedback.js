import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Chip,
  Grid,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert
} from '@mui/material';
import {
  ArrowBack,
  Add,
  Edit,
  Delete,
  Star,
  School
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { feedbackAPI } from '../../services/api';
import { formatDateTime, getRatingColor, truncateText } from '../../utils/validation';

const MyFeedback = () => {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0
  });
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    feedbackId: null,
    feedbackCourse: ''
  });

  const navigate = useNavigate();

  useEffect(() => {
    loadFeedback(1);
  }, []);

  const loadFeedback = async (page = 1) => {
    try {
      setLoading(true);
      const response = await feedbackAPI.getMyFeedback({ page, limit: 10 });
      setFeedback(response.data.feedback);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Load feedback error:', error);
      toast.error('Failed to load feedback');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (event, page) => {
    loadFeedback(page);
  };

  const handleDeleteClick = (feedbackItem) => {
    setDeleteDialog({
      open: true,
      feedbackId: feedbackItem._id,
      feedbackCourse: feedbackItem.course.name
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      await feedbackAPI.deleteFeedback(deleteDialog.feedbackId);
      toast.success('Feedback deleted successfully');
      loadFeedback(pagination.currentPage);
      setDeleteDialog({ open: false, feedbackId: null, feedbackCourse: '' });
    } catch (error) {
      console.error('Delete feedback error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete feedback');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, feedbackId: null, feedbackCourse: '' });
  };

  if (loading && feedback.length === 0) {
    return (
      <>
        <AppBar position="sticky">
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={() => navigate('/dashboard')}
              sx={{ mr: 2 }}
            >
              <ArrowBack />
            </IconButton>
            <Typography variant="h6" component="div">
              My Feedback
            </Typography>
          </Toolbar>
        </AppBar>
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Typography>Loading...</Typography>
        </Container>
      </>
    );
  }

  return (
    <>
      <AppBar position="sticky">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate('/dashboard')}
            sx={{ mr: 2 }}
          >
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            My Feedback
          </Typography>
          <Button
            color="inherit"
            startIcon={<Add />}
            onClick={() => navigate('/feedback/new')}
          >
            New Feedback
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Header */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            My Course Feedback
          </Typography>
          <Typography variant="body1" color="text.secondary">
            View and manage all your submitted feedback
          </Typography>
          {pagination.totalItems > 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Total feedback: {pagination.totalItems}
            </Typography>
          )}
        </Paper>

        {/* Feedback List */}
        {feedback.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: 'center' }}>
            <School sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h5" color="text.secondary" gutterBottom>
              No feedback submitted yet
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Start by sharing your thoughts about the courses you've taken
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<Add />}
              onClick={() => navigate('/feedback/new')}
            >
              Submit Your First Feedback
            </Button>
          </Paper>
        ) : (
          <>
            <Grid container spacing={3}>
              {feedback.map((item) => (
                <Grid item xs={12} md={6} key={item._id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ flexGrow: 1 }}>
                      {/* Course Info */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="h6" component="h2" gutterBottom>
                            {item.course.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {item.course.code}
                            {item.course.instructor && ` • ${item.course.instructor}`}
                          </Typography>
                        </Box>
                        <Chip
                          icon={<Star />}
                          label={`${item.rating} / 5`}
                          color={getRatingColor(item.rating)}
                          size="small"
                        />
                      </Box>

                      {/* Feedback Message */}
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        {truncateText(item.message, 200)}
                      </Typography>

                      {/* Submission Date */}
                      <Typography variant="caption" color="text.secondary">
                        Submitted on {formatDateTime(item.createdAt)}
                        {item.updatedAt !== item.createdAt && (
                          <span> • Updated {formatDateTime(item.updatedAt)}</span>
                        )}
                      </Typography>
                    </CardContent>

                    <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                      <Button
                        size="small"
                        startIcon={<Edit />}
                        onClick={() => navigate(`/feedback/edit/${item._id}`)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        startIcon={<Delete />}
                        onClick={() => handleDeleteClick(item)}
                      >
                        Delete
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination
                  count={pagination.totalPages}
                  page={pagination.currentPage}
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                />
              </Box>
            )}
          </>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialog.open}
          onClose={handleDeleteCancel}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <Alert severity="warning" sx={{ mb: 2 }}>
              This action cannot be undone.
            </Alert>
            <Typography>
              Are you sure you want to delete your feedback for{' '}
              <strong>{deleteDialog.feedbackCourse}</strong>?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteCancel}>Cancel</Button>
            <Button
              onClick={handleDeleteConfirm}
              color="error"
              variant="contained"
              startIcon={<Delete />}
            >
              Delete Feedback
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
};

export default MyFeedback;
