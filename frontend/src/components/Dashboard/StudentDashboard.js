import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Box,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  AppBar,
  Toolbar,
  Chip
} from '@mui/material';
import {
  Add,
  Feedback,
  Person,
  ExitToApp,
  MoreVert,
  Star,
  School,
  Assessment
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { feedbackAPI } from '../../services/api';

const StudentDashboard = () => {
  const [recentFeedback, setRecentFeedback] = useState([]);
  const [stats, setStats] = useState({
    totalFeedback: 0,
    avgRating: 0
  });
  const [anchorEl, setAnchorEl] = useState(null);
  const [loading, setLoading] = useState(true);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await feedbackAPI.getMyFeedback({ limit: 5 });
      const feedback = response.data.feedback;
      
      setRecentFeedback(feedback);
      
      // Calculate stats
      if (feedback.length > 0) {
        const totalRating = feedback.reduce((sum, item) => sum + item.rating, 0);
        setStats({
          totalFeedback: response.data.pagination.totalItems,
          avgRating: Math.round((totalRating / feedback.length) * 10) / 10
        });
      }
    } catch (error) {
      console.error('Load dashboard error:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const getRatingColor = (rating) => {
    if (rating >= 4) return 'success';
    if (rating >= 3) return 'warning';
    return 'error';
  };

  return (
    <>
      {/* App Bar */}
      <AppBar position="sticky">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Course Feedback System
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ mr: 2 }}>
              Welcome, {user?.name}
            </Typography>
            
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenuClick}
              color="inherit"
            >
              <Avatar sx={{ width: 32, height: 32 }}>
                {user?.name?.charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>
            
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={() => { navigate('/profile'); handleMenuClose(); }}>
                <Person sx={{ mr: 1 }} /> Profile
              </MenuItem>
              <MenuItem onClick={() => { handleLogout(); handleMenuClose(); }}>
                <ExitToApp sx={{ mr: 1 }} /> Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Welcome Section */}
        <Paper sx={{ p: 3, mb: 4, background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)' }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ color: 'white' }}>
            Welcome back, {user?.name}!
          </Typography>
          <Typography variant="h6" sx={{ color: 'white', opacity: 0.9 }}>
            Share your thoughts and help improve our courses
          </Typography>
        </Paper>

        {/* Quick Actions */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                <Add sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Submit New Feedback
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Share your experience about a course
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => navigate('/feedback/new')}
                >
                  New Feedback
                </Button>
              </CardActions>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                <Feedback sx={{ fontSize: 48, color: 'secondary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  My Feedback
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  View and manage your submissions
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<Feedback />}
                  onClick={() => navigate('/my-feedback')}
                >
                  View All
                </Button>
              </CardActions>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                <Person sx={{ fontSize: 48, color: 'info.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  My Profile
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Update your personal information
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<Person />}
                  onClick={() => navigate('/profile')}
                >
                  Edit Profile
                </Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {/* Statistics */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                My Statistics
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Assessment sx={{ mr: 2, color: 'primary.main' }} />
                <Box>
                  <Typography variant="h4" component="div">
                    {stats.totalFeedback}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Feedback
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Star sx={{ mr: 2, color: 'warning.main' }} />
                <Box>
                  <Typography variant="h4" component="div">
                    {stats.avgRating || 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Average Rating
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Recent Feedback */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Recent Feedback
              </Typography>

              {loading ? (
                <Typography>Loading...</Typography>
              ) : recentFeedback.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <School sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No feedback submitted yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Start by submitting feedback for a course
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => navigate('/feedback/new')}
                  >
                    Submit First Feedback
                  </Button>
                </Box>
              ) : (
                <Box>
                  {recentFeedback.map((feedback) => (
                    <Card key={feedback._id} sx={{ mb: 2 }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          <Typography variant="h6" component="div">
                            {feedback.course.name}
                          </Typography>
                          <Chip
                            label={`${feedback.rating} ★`}
                            color={getRatingColor(feedback.rating)}
                            size="small"
                          />
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {feedback.course.code} • {feedback.course.instructor || 'No instructor assigned'}
                        </Typography>
                        
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          {feedback.message.length > 150
                            ? `${feedback.message.substring(0, 150)}...`
                            : feedback.message}
                        </Typography>
                        
                        <Typography variant="caption" color="text.secondary">
                          Submitted on {new Date(feedback.createdAt).toLocaleDateString()}
                        </Typography>
                      </CardContent>
                    </Card>
                  ))}

                  {stats.totalFeedback > 5 && (
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={() => navigate('/my-feedback')}
                      sx={{ mt: 2 }}
                    >
                      View All Feedback ({stats.totalFeedback})
                    </Button>
                  )}
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default StudentDashboard;