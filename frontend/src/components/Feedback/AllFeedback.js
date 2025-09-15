import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  AppBar,
  Toolbar,
  IconButton,
  Box,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent
} from '@mui/material';
import {
  ArrowBack,
  Search,
  Download,
  Star,
  Person,
  School,
  Feedback as FeedbackIcon,
  FilterList,
  Close
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { feedbackAPI, courseAPI } from '../../services/api';
import { formatDateTime, getRatingColor, truncateText } from '../../utils/validation';

const AllFeedback = () => {
  const [feedback, setFeedback] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    course: '',
    rating: '',
    student: ''
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0
  });
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [detailsDialog, setDetailsDialog] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    loadCourses();
    loadFeedback(1);
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadFeedback(1);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [filters.search, filters.course, filters.rating, filters.student]);

  const loadCourses = async () => {
    try {
      const response = await courseAPI.getCourses({ limit: 100 });
      setCourses(response.data.courses);
    } catch (error) {
      console.error('Load courses error:', error);
    }
  };

  const loadFeedback = async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
        ...(filters.search && { search: filters.search }),
        ...(filters.course && { course: filters.course }),
        ...(filters.rating && { rating: filters.rating }),
        ...(filters.student && { student: filters.student })
      };

      const response = await feedbackAPI.getAllFeedback(params);
      setFeedback(response.data.feedback);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Load feedback error:', error);
      toast.error('Failed to load feedback');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field) => (event) => {
    setFilters({
      ...filters,
      [field]: event.target.value
    });
  };

  const handlePageChange = (event, page) => {
    loadFeedback(page);
  };

  const handleExportCSV = async () => {
    try {
      setExporting(true);
      const params = {
        ...(filters.course && { course: filters.course }),
        ...(filters.rating && { rating: filters.rating }),
        ...(filters.student && { student: filters.student })
      };

      const response = await feedbackAPI.exportFeedback(params);
      
      // Create blob and download
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `feedback-export-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Feedback data exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export feedback data');
    } finally {
      setExporting(false);
    }
  };

  const handleViewDetails = (feedbackItem) => {
    setSelectedFeedback(feedbackItem);
    setDetailsDialog(true);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      course: '',
      rating: '',
      student: ''
    });
  };

  const getRatingStars = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
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
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            All Feedback
          </Typography>
          <Button
            color="inherit"
            startIcon={<Download />}
            onClick={handleExportCSV}
            disabled={exporting}
          >
            {exporting ? 'Exporting...' : 'Export CSV'}
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Header */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            All Feedback Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            View, filter, and export all student feedback submissions
          </Typography>
          
          {pagination.totalItems > 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {pagination.totalItems} feedback submission{pagination.totalItems !== 1 ? 's' : ''} found
            </Typography>
          )}
        </Paper>

        {/* Filters */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <FilterList sx={{ mr: 1 }} />
            <Typography variant="h6">Filters</Typography>
            <Button
              size="small"
              onClick={clearFilters}
              sx={{ ml: 'auto' }}
              startIcon={<Close />}
            >
              Clear All
            </Button>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              placeholder="Search by student name or feedback content..."
              value={filters.search}
              onChange={handleFilterChange('search')}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 300 }}
            />

            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Course</InputLabel>
              <Select
                value={filters.course}
                onChange={handleFilterChange('course')}
                label="Course"
              >
                <MenuItem value="">All Courses</MenuItem>
                {courses.map((course) => (
                  <MenuItem key={course._id} value={course._id}>
                    {course.name} ({course.code})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Rating</InputLabel>
              <Select
                value={filters.rating}
                onChange={handleFilterChange('rating')}
                label="Rating"
              >
                <MenuItem value="">All Ratings</MenuItem>
                <MenuItem value="5">5 Stars</MenuItem>
                <MenuItem value="4">4 Stars</MenuItem>
                <MenuItem value="3">3 Stars</MenuItem>
                <MenuItem value="2">2 Stars</MenuItem>
                <MenuItem value="1">1 Star</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Paper>

        {/* Feedback Table */}
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Student</TableCell>
                  <TableCell>Course</TableCell>
                  <TableCell>Rating</TableCell>
                  <TableCell>Feedback</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      Loading feedback...
                    </TableCell>
                  </TableRow>
                ) : feedback.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Box sx={{ py: 4 }}>
                        <FeedbackIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary">
                          No feedback found
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Try adjusting your filters or check back later
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  feedback.map((item) => (
                    <TableRow key={item._id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ mr: 2, width: 32, height: 32 }}>
                            {item.student.name.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {item.student.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {item.student.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {item.course.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {item.course.code}
                          </Typography>
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Chip
                            label={`${item.rating}/5`}
                            color={getRatingColor(item.rating)}
                            size="small"
                            icon={<Star />}
                          />
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2">
                          {truncateText(item.message, 100)}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2">
                          {formatDateTime(item.createdAt)}
                        </Typography>
                      </TableCell>

                      <TableCell align="center">
                        <Button
                          size="small"
                          onClick={() => handleViewDetails(item)}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <Pagination
                count={pagination.totalPages}
                page={pagination.currentPage}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}
        </Paper>

        {/* Feedback Details Dialog */}
        <Dialog
          open={detailsDialog}
          onClose={() => setDetailsDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Feedback Details
          </DialogTitle>
          
          <DialogContent>
            {selectedFeedback && (
              <Box>
                <Card sx={{ mb: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box>
                        <Typography variant="h6">
                          {selectedFeedback.course?.name || 'Unknown Course'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {selectedFeedback.course?.code || 'N/A'}
                          {selectedFeedback.course?.instructor && ` • ${selectedFeedback.course.instructor}`}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Chip
                          label={`${selectedFeedback.rating}/5 Stars`}
                          color={getRatingColor(selectedFeedback.rating)}
                          icon={<Star />}
                        />
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                          {getRatingStars(selectedFeedback.rating)}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Person sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        <strong>{selectedFeedback.student?.name || 'Unknown Student'}</strong> ({selectedFeedback.student?.email || 'N/A'})
                      </Typography>
                    </Box>
                    
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {selectedFeedback.message}
                    </Typography>
                    
                    <Typography variant="caption" color="text.secondary">
                      Submitted on {formatDateTime(selectedFeedback.createdAt)}
                      {selectedFeedback.updatedAt !== selectedFeedback.createdAt && (
                        <span> • Last updated {formatDateTime(selectedFeedback.updatedAt)}</span>
                      )}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            )}
          </DialogContent>
          
          <DialogActions>
            <Button onClick={() => setDetailsDialog(false)}>
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
};

export default AllFeedback;