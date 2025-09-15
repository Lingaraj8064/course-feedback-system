import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  AppBar,
  Toolbar,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  Alert,
  Fab
} from '@mui/material';
import {
  ArrowBack,
  Add,
  Edit,
  Delete,
  School,
  Star,
  Feedback,
  Save,
  Cancel
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { courseAPI } from '../../services/api';
import { validateCourseForm } from '../../utils/validation';

const CourseManagement = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState({
    open: false,
    type: '', // 'create', 'edit', 'delete'
    course: null
  });
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    instructor: '',
    credits: '',
    isActive: true
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const response = await courseAPI.getCoursesWithStats();
      setCourses(response.data);
    } catch (error) {
      console.error('Load courses error:', error);
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      description: '',
      instructor: '',
      credits: '',
      isActive: true
    });
    setErrors({});
  };

  const openCreateDialog = () => {
    resetForm();
    setDialog({ open: true, type: 'create', course: null });
  };

  const openEditDialog = (course) => {
    setFormData({
      name: course.name,
      code: course.code,
      description: course.description || '',
      instructor: course.instructor || '',
      credits: course.credits || '',
      isActive: course.isActive
    });
    setErrors({});
    setDialog({ open: true, type: 'edit', course });
  };

  const openDeleteDialog = (course) => {
    setDialog({ open: true, type: 'delete', course });
  };

  const closeDialog = () => {
    setDialog({ open: false, type: '', course: null });
    resetForm();
  };

  const handleFormChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'isActive' ? checked : value
    });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleSubmit = async () => {
    const validation = validateCourseForm(
      formData.name,
      formData.code,
      formData.description,
      formData.instructor,
      formData.credits
    );

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setSubmitting(true);

    try {
      const courseData = {
        ...formData,
        code: formData.code.toUpperCase(),
        credits: formData.credits ? parseInt(formData.credits) : undefined
      };

      if (dialog.type === 'create') {
        await courseAPI.createCourse(courseData);
        toast.success('Course created successfully');
      } else {
        await courseAPI.updateCourse(dialog.course._id, courseData);
        toast.success('Course updated successfully');
      }

      loadCourses();
      closeDialog();
    } catch (error) {
      console.error('Submit course error:', error);
      toast.error(error.response?.data?.message || 'Failed to save course');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await courseAPI.deleteCourse(dialog.course._id);
      toast.success('Course deleted successfully');
      loadCourses();
      closeDialog();
    } catch (error) {
      console.error('Delete course error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete course');
    }
  };

  const getStatusColor = (isActive) => {
    return isActive ? 'success' : 'default';
  };

  const getStatusText = (isActive) => {
    return isActive ? 'Active' : 'Inactive';
  };

  return (
    <>
      <AppBar position="sticky">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate('/admin/dashboard')}
            sx={{ mr: 2 }}
          >
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" component="div">
            Course Management
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Header */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography variant="h4" component="h1" gutterBottom>
                Course Management
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Manage courses and view feedback statistics
              </Typography>
            </Box>
            
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={openCreateDialog}
            >
              Add Course
            </Button>
          </Box>
        </Paper>

        {/* Courses Table */}
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Course</TableCell>
                  <TableCell>Instructor</TableCell>
                  <TableCell>Credits</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Feedback</TableCell>
                  <TableCell>Rating</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : courses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Box sx={{ py: 4 }}>
                        <School sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary">
                          No courses found
                        </Typography>
                        <Button
                          variant="contained"
                          startIcon={<Add />}
                          onClick={openCreateDialog}
                          sx={{ mt: 2 }}
                        >
                          Add First Course
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  courses.map((course) => (
                    <TableRow key={course._id} hover>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {course.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {course.code}
                          </Typography>
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2">
                          {course.instructor || 'Not assigned'}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2">
                          {course.credits || 'N/A'}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={getStatusText(course.isActive)}
                          color={getStatusColor(course.isActive)}
                          size="small"
                        />
                      </TableCell>

                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Feedback sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2">
                            {course.feedbackCount || 0}
                          </Typography>
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Star sx={{ mr: 1, fontSize: 16, color: 'warning.main' }} />
                          <Typography variant="body2">
                            {course.avgRating ? course.avgRating.toFixed(1) : 'N/A'}
                          </Typography>
                        </Box>
                      </TableCell>

                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          <IconButton
                            color="primary"
                            onClick={() => openEditDialog(course)}
                            title="Edit Course"
                          >
                            <Edit />
                          </IconButton>
                          
                          <IconButton
                            color="error"
                            onClick={() => openDeleteDialog(course)}
                            title="Delete Course"
                          >
                            <Delete />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Course Form Dialog */}
        <Dialog
          open={dialog.open && (dialog.type === 'create' || dialog.type === 'edit')}
          onClose={closeDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {dialog.type === 'create' ? 'Add New Course' : 'Edit Course'}
          </DialogTitle>
          
          <DialogContent>
            <Box component="form" sx={{ pt: 1 }}>
              <TextField
                autoFocus
                margin="normal"
                required
                fullWidth
                name="name"
                label="Course Name"
                value={formData.name}
                onChange={handleFormChange}
                error={!!errors.name}
                helperText={errors.name}
              />
              
              <TextField
                margin="normal"
                required
                fullWidth
                name="code"
                label="Course Code"
                value={formData.code}
                onChange={handleFormChange}
                error={!!errors.code}
                helperText={errors.code || 'e.g., CS101, MATH201'}
                disabled={dialog.type === 'edit'} // Prevent editing code
              />
              
              <TextField
                margin="normal"
                fullWidth
                name="description"
                label="Description"
                multiline
                rows={3}
                value={formData.description}
                onChange={handleFormChange}
                error={!!errors.description}
                helperText={errors.description}
              />
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  margin="normal"
                  fullWidth
                  name="instructor"
                  label="Instructor"
                  value={formData.instructor}
                  onChange={handleFormChange}
                  error={!!errors.instructor}
                  helperText={errors.instructor}
                />
                
                <TextField
                  margin="normal"
                  name="credits"
                  label="Credits"
                  type="number"
                  value={formData.credits}
                  onChange={handleFormChange}
                  error={!!errors.credits}
                  helperText={errors.credits}
                  inputProps={{ min: 1, max: 10 }}
                  sx={{ minWidth: 120 }}
                />
              </Box>
              
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={handleFormChange}
                    name="isActive"
                  />
                }
                label="Active Course"
                sx={{ mt: 2 }}
              />
            </Box>
          </DialogContent>
          
          <DialogActions>
            <Button onClick={closeDialog} startIcon={<Cancel />}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={submitting}
              startIcon={<Save />}
            >
              {submitting ? 'Saving...' : 'Save Course'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={dialog.open && dialog.type === 'delete'}
          onClose={closeDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Confirm Delete Course</DialogTitle>
          
          <DialogContent>
            <Alert severity="warning" sx={{ mb: 2 }}>
              This action cannot be undone if the course has feedback submissions.
            </Alert>
            
            <Typography>
              Are you sure you want to delete <strong>{dialog.course?.name}</strong>?
            </Typography>
            
            {dialog.course?.feedbackCount > 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                This course has {dialog.course.feedbackCount} feedback submission{dialog.course.feedbackCount !== 1 ? 's' : ''}.
                Consider deactivating instead of deleting.
              </Typography>
            )}
          </DialogContent>
          
          <DialogActions>
            <Button onClick={closeDialog}>
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              color="error"
              variant="contained"
              startIcon={<Delete />}
            >
              Delete Course
            </Button>
          </DialogActions>
        </Dialog>

        {/* Floating Action Button for Mobile */}
        <Fab
          color="primary"
          aria-label="add course"
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            display: { xs: 'flex', sm: 'none' }
          }}
          onClick={openCreateDialog}
        >
          <Add />
        </Fab>
      </Container>
    </>
  );
};

export default CourseManagement;