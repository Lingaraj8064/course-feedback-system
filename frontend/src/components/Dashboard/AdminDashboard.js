import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Box,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  AppBar,
  Toolbar,
  Button,
  List,
  ListItem,
  ListItemText,
  Chip,
  LinearProgress
} from '@mui/material';
import {
  Dashboard,
  People,
  School,
  Feedback,
  Analytics,
  ExitToApp,
  Star,
  TrendingUp,
  Block,
  Assessment
} from '@mui/icons-material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { adminAPI } from '../../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    totalStudents: 0,
    totalCourses: 0,
    totalFeedback: 0,
    blockedUsers: 0,
    recentFeedback: 0,
    recentRegistrations: 0,
    avgRating: 0,
    topCourses: []
  });
  const [analytics, setAnalytics] = useState({
    feedbackTrends: [],
    userTrends: []
  });
  const [anchorEl, setAnchorEl] = useState(null);
  const [loading, setLoading] = useState(true);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
    loadAnalytics();
  }, []);

  const loadDashboardData = async () => {
    try {
      const response = await adminAPI.getDashboard();
      setDashboardData(response.data);
    } catch (error) {
      console.error('Load dashboard error:', error);
      toast.error('Failed to load dashboard data');
    }
  };

  const loadAnalytics = async () => {
    try {
      const response = await adminAPI.getAnalytics({ period: '7' });
      setAnalytics(response.data);
    } catch (error) {
      console.error('Load analytics error:', error);
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
    navigate('/admin-login');
  };

  // Chart configuration
  const chartData = {
    labels: analytics.feedbackTrends.map(item => 
      new Date(item._id).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    ),
    datasets: [
      {
        label: 'Feedback Submissions',
        data: analytics.feedbackTrends.map(item => item.count),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Feedback Trends (Last 7 Days)',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 2 }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <>
      {/* App Bar */}
      <AppBar position="sticky">
        <Toolbar>
          <Dashboard sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Admin Dashboard
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
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                {user?.name?.charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>
            
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
              keepMounted
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={() => { handleLogout(); handleMenuClose(); }}>
                <ExitToApp sx={{ mr: 1 }} /> Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Welcome Section */}
        <Paper sx={{ p: 3, mb: 4, background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)' }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ color: 'white' }}>
            Admin Dashboard
          </Typography>
          <Typography variant="h6" sx={{ color: 'white', opacity: 0.9 }}>
            Manage courses, users, and monitor feedback analytics
          </Typography>
        </Paper>

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: '#e3f2fd' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <People sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                  <Box>
                    <Typography variant="h4" component="div">
                      {dashboardData.totalStudents}
                    </Typography>
                    <Typography color="text.secondary">
                      Total Students
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                  +{dashboardData.recentRegistrations} this week
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: '#f3e5f5' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <School sx={{ fontSize: 40, color: 'secondary.main', mr: 2 }} />
                  <Box>
                    <Typography variant="h4" component="div">
                      {dashboardData.totalCourses}
                    </Typography>
                    <Typography color="text.secondary">
                      Total Courses
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: '#e8f5e8' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Feedback sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                  <Box>
                    <Typography variant="h4" component="div">
                      {dashboardData.totalFeedback}
                    </Typography>
                    <Typography color="text.secondary">
                      Total Feedback
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                  +{dashboardData.recentFeedback} this week
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: '#fff3e0' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Star sx={{ fontSize: 40, color: 'warning.main', mr: 2 }} />
                  <Box>
                    <Typography variant="h4" component="div">
                      {dashboardData.avgRating}
                    </Typography>
                    <Typography color="text.secondary">
                      Average Rating
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {/* Quick Actions */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<People />}
                  onClick={() => navigate('/admin/users')}
                  fullWidth
                >
                  Manage Users
                </Button>
                
                <Button
                  variant="contained"
                  startIcon={<School />}
                  onClick={() => navigate('/admin/courses')}
                  fullWidth
                >
                  Manage Courses
                </Button>
                
                <Button
                  variant="contained"
                  startIcon={<Feedback />}
                  onClick={() => navigate('/admin/feedback')}
                  fullWidth
                >
                  View All Feedback
                </Button>
                
                <Button
                  variant="contained"
                  startIcon={<Analytics />}
                  onClick={() => navigate('/admin/analytics')}
                  fullWidth
                >
                  View Analytics
                </Button>
              </Box>

              {/* Alert for blocked users */}
              {dashboardData.blockedUsers > 0 && (
                <Box sx={{ mt: 3, p: 2, bgcolor: 'error.light', borderRadius: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Block sx={{ mr: 1, color: 'error.main' }} />
                    <Typography variant="body2" color="error.main">
                      {dashboardData.blockedUsers} blocked user{dashboardData.blockedUsers > 1 ? 's' : ''}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Top Rated Courses */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Top Rated Courses
              </Typography>
              
              {dashboardData.topCourses.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No course ratings yet
                </Typography>
              ) : (
                <List>
                    {dashboardData.topCourses.map((course, index) => (
                    <ListItem key={course._id}>
                      <ListItemText
                        primary={`${index + 1}. ${course.name}`}
                        secondary={`Avg Rating: ${course.avgRating.toFixed(1)} ⭐`}
                      />
                      <Chip
                        label={`${course.feedbackCount} feedback`}
                        color="primary"
                        size="small"
                        sx={{ ml: 2 }}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Paper>
          </Grid>

          {/* Feedback Trends Chart */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Feedback Trends
              </Typography>
              <Line data={chartData} options={chartOptions} />
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default AdminDashboard;
