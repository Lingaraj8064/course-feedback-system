import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Rating,
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Alert
} from '@mui/material';
import { ArrowBack, Star, StarBorder } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { courseAPI, feedbackAPI } from '../../services/api';

const FeedbackForm = () => {
  const [formData, setFormData] = useState({
    course: '',
    rating: 0,
    message: ''
  });
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isEdit, setIsEdit] = useState(false);
  
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    loadCourses();
    if (id) {
      setIsEdit(true);
      loadFeedback();
    }
  }, [id]);

  const loadCourses = async () => {
    try {
      const response = await courseAPI.getCourses({ limit: 100 });
      setCourses(response.data.courses);
    } catch (error) {
      console.error('Load courses error:', error);
      toast.error('Failed to load courses');
    }
  };

  const loadFeedback = async () => {
    try {
      const response = await feedbackAPI.getMyFeedback();
      const feedback = response.data.feedback.find(f => f._id === id);
      
      if (feedback) {
        setFormData({
          course: feedback.course._id,
          rating: feedback.rating,
          message: feedback.message
        });
      } else {
        toast.error('Feedback not found');
        navigate('/my-feedback');
      }
    } catch (error) {
      console.error('Load feedback error:', error);
      toast.error('Failed to load feedback');
      navigate('/my-feedback');
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.course) {
      newErrors.course = 'Please select a course';
    }

    if (formData.rating === 0) {
      newErrors.rating = 'Please provide a rating';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Please provide feedback message';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Feedback message must be at least 10 characters';
    } else if (formData.message.trim().length > 1000) {
      newErrors.message = 'Feedback message cannot exceed 1000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleRatingChange = (event, newValue) => {
    setFormData({ ...formData, rating: newValue });
    if (errors.rating) {
      setErrors({ ...errors, rating: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      if (isEdit) {
        await feedbackAPI.updateFeedback(id, {
          rating: formData.rating,
          message: formData.message.trim()
        });
        toast.success('Feedback updated successfully!');
      } else {
        await feedbackAPI.createFeedback({
          course: formData.course,
          rating: formData.rating,
          message: formData.message.trim()
        });
        toast.success('Feedback submitted successfully!');
      }
      
      navigate('/my-feedback');
    } catch (error) {
      console.error('Submit feedback error:', error);
      const errorMessage = error.response?.data?.message || 
        (isEdit ? 'Failed to update feedback' : 'Failed to submit feedback');
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const selectedCourse = courses.find(course => course._id === formData.course);

  return (
    <>
      <AppBar position="sticky">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate(-1)}
            sx={{ mr: 2 }}
          >
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" component="div">
            {isEdit ? 'Edit Feedback' : 'Submit Feedback'}
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            {isEdit ? 'Edit Your Feedback' : 'Submit Course Feedback'}
          </Typography>
          
          <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
            {isEdit 
              ? 'Update your feedback to help improve the course'
              : 'Share your experience to help improve our courses'
            }
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            {/* Course Selection */}
            <FormControl fullWidth margin="normal" error={!!errors.course} disabled={isEdit}>
              <InputLabel id="course-label">Course *</InputLabel>
              <Select
                labelId="course-label"
                id="course"
                name="course"
                value={formData.course}
                label="Course *"
                onChange={handleChange}
              >
                {courses.map((course) => (
                  <MenuItem key={course._id} value={course._id}>
                    <Box>
                      <Typography variant="body1">
                        {course.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {course.code} {course.instructor && `• ${course.instructor}`}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
              {errors.course && (
                <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                  {errors.course}
                </Typography>
              )}
            </FormControl>

            {/* Selected Course Info */}
            {selectedCourse && (
              <Alert severity="info" sx={{ mt: 2, mb: 2 }}>
                <Typography variant="body2">
                  <strong>{selectedCourse.name}</strong> ({selectedCourse.code})
                  {selectedCourse.instructor && ` • Instructor: ${selectedCourse.instructor}`}
                  {selectedCourse.credits && ` • ${selectedCourse.credits} credits`}
                </Typography>
                {selectedCourse.description && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {selectedCourse.description}
                  </Typography>
                )}
              </Alert>
            )}

            {/* Rating */}
            <Box sx={{ mt: 3, mb: 2 }}>
              <Typography component="legend" gutterBottom>
                Rating *
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Rating
                  name="rating"
                  value={formData.rating}
                  onChange={handleRatingChange}
                  size="large"
                  emptyIcon={<StarBorder fontSize="inherit" />}
                />
                <Typography variant="body1" color="text.secondary">
                  {formData.rating > 0 && (
                    <>
                      {formData.rating} star{formData.rating !== 1 ? 's' : ''} 
                      {formData.rating >= 4 && ' - Excellent!'}
                      {formData.rating === 3 && ' - Good'}
                      {formData.rating <= 2 && ' - Needs Improvement'}
                    </>
                  )}
                </Typography>
              </Box>
              {errors.rating && (
                <Typography variant="caption" color="error">
                  {errors.rating}
                </Typography>
              )}
            </Box>

            {/* Feedback Message */}
            <TextField
              margin="normal"
              required
              fullWidth
              id="message"
              label="Your Feedback"
              name="message"
              multiline
              rows={6}
              value={formData.message}
              onChange={handleChange}
              error={!!errors.message}
              helperText={
                errors.message || 
                `${formData.message.length}/1000 characters`
              }
              placeholder="Share your thoughts about the course content, teaching methods, assignments, or any other aspects..."
            />

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, mt: 4, justifyContent: 'center' }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/my-feedback')}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                startIcon={loading ? null : <Star />}
              >
                {loading 
                  ? (isEdit ? 'Updating...' : 'Submitting...') 
                  : (isEdit ? 'Update Feedback' : 'Submit Feedback')
                }
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    </>
  );
};

export default FeedbackForm;