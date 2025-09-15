import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  AppBar,
  Toolbar,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress
} from '@mui/material';
import {
  ArrowBack,
  TrendingUp,
  People,
  School,
  Star,
  Assessment,
  DateRange
} from '@mui/icons-material';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { toast } from 'react-toastify';
import { adminAPI, feedbackAPI } from '../../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Analytics = () => {
  const [analytics, setAnalytics] = useState({
    userTrends: [],
    feedbackTrends: [],
    coursePopularity: [],
    ratingDistribution: []
  });
  const [feedbackStats, setFeedbackStats] = useState({
    totalFeedback: 0,
    avgRating: 0,
    feedbackByRating: [],
    feedbackByCourse: [],
    recentTrends: []
  });
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30');

  const navigate = useNavigate();

  useEffect(() => {
    loadAnalytics();
    loadFeedbackStats();
  }, [period]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAnalytics({ period });
      setAnalytics(response.data);
    } catch (error) {
      console.error('Load analytics error:', error);
      toast.error('Failed to load analytics data');
    }
  };

  const loadFeedbackStats = async () => {
    try {
      const response = await feedbackAPI.getFeedbackStats();
      setFeedbackStats(response.data);
    } catch (error) {
      console.error('Load feedback stats error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePeriodChange = (event) => {
    setPeriod(event.target.value);
  };

  // Chart configurations
  const feedbackTrendsData = {
    labels: analytics.feedbackTrends.map(item => 
      new Date(item._id).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    ),
    datasets: [
      {
        label: 'Feedback Count',
        data: analytics.feedbackTrends.map(item => item.count),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1,
        fill: true
      },
      {
        label: 'Average Rating',
        data: analytics.feedbackTrends.map(item => item.avgRating || 0),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        tension: 0.1,
        yAxisID: 'y1'
      }
    ]
  };

  const userTrendsData = {
    labels: analytics.userTrends.map(item => 
      new Date(item._id).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    ),
    datasets: [
      {
        label: 'New Registrations',
        data: analytics.userTrends.map(item => item.count),
        backgroundColor: 'rgba(54, 162, 235, 0.8)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }
    ]
  };

  const ratingDistributionData = {
    labels: ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars'],
    datasets: [
      {
        data: [1, 2, 3, 4, 5].map(rating => {
          const found = feedbackStats.feedbackByRating.find(item => item._id === rating);
          return found ? found.count : 0;
        }),
        backgroundColor: [
          '#f44336', // Red for 1 star
          '#ff9800', // Orange for 2 stars
          '#ffeb3b', // Yellow for 3 stars
          '#4caf50', // Green for 4 stars
          '#2196f3'  // Blue for 5 stars
        ],
        borderWidth: 2,
        borderColor: '#fff'
      }
    ]
  };

  const coursePopularityData = {
    labels: analytics.coursePopularity.slice(0, 10).map(item => item.courseName),
    datasets: [
      {
        label: 'Feedback Count',
        data: analytics.coursePopularity.slice(0, 10).map(item => item.feedbackCount),
        backgroundColor: 'rgba(153, 102, 255, 0.8)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        position: 'left',
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        beginAtZero: true,
        max: 5,
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
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
              Analytics
            </Typography>
          </Toolbar>
        </AppBar>
        <Box sx={{ width: '100%', mt: 2 }}>
          <LinearProgress />
        </Box>
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
            onClick={() => navigate('/admin/dashboard')}
            sx={{ mr: 2 }}
          >
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Analytics Dashboard
          </Typography>
          
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel sx={{ color: 'white' }}>Period</InputLabel>
            <Select
              value={period}
              onChange={handlePeriodChange}
              label="Period"
              sx={{ color: 'white', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'white' } }}
            >
              <MenuItem value="7">Last 7 days</MenuItem>
              <MenuItem value="30">Last 30 days</MenuItem>
              <MenuItem value="90">Last 90 days</MenuItem>
            </Select>
          </FormControl>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Header */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            System Analytics
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Comprehensive insights into user activity and feedback trends
          </Typography>
        </Paper>

        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Assessment sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                  <Box>
                    <Typography variant="h4" component="div">
                      {feedbackStats.totalFeedback}
                    </Typography>
                    <Typography color="text.secondary">
                      Total Feedback
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Star sx={{ fontSize: 40, color: 'warning.main', mr: 2 }} />
                  <Box>
                    <Typography variant="h4" component="div">
                      {feedbackStats.avgRating}
                    </Typography>
                    <Typography color="text.secondary">
                      Average Rating
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <School sx={{ fontSize: 40, color: 'secondary.main', mr: 2 }} />
                  <Box>
                    <Typography variant="h4" component="div">
                      {feedbackStats.feedbackByCourse.length}
                    </Typography>
                    <Typography color="text.secondary">
                      Courses Reviewed
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TrendingUp sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                  <Box>
                    <Typography variant="h4" component="div">
                      {analytics.feedbackTrends.reduce((sum, item) => sum + item.count, 0)}
                    </Typography>
                    <Typography color="text.secondary">
                      Recent Activity
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {/* Feedback Trends Chart */}
          <Grid item xs={12} lg={8}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Feedback Trends ({period} days)
              </Typography>
              {analytics.feedbackTrends.length > 0 ? (
                <Box sx={{ height: 400 }}>
                  <Line data={feedbackTrendsData} options={chartOptions} />
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    No feedback data available for this period
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Rating Distribution */}
          <Grid item xs={12} lg={4}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Rating Distribution
              </Typography>
              {feedbackStats.feedbackByRating.length > 0 ? (
                <Box sx={{ height: 400, display: 'flex', justifyContent: 'center' }}>
                  <Doughnut data={ratingDistributionData} />
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    No rating data available
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* User Registration Trends */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                User Registration Trends
              </Typography>
              {analytics.userTrends.length > 0 ? (
                <Box sx={{ height: 300 }}>
                  <Bar data={userTrendsData} options={barChartOptions} />
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    No registration data available
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Course Popularity */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Most Popular Courses
              </Typography>
              {analytics.coursePopularity.length > 0 ? (
                <Box sx={{ height: 300 }}>
                  <Bar data={coursePopularityData} options={barChartOptions} />
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    No course popularity data available
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Top Rated Courses Table */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Top Rated Courses
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Course Name</TableCell>
                      <TableCell>Feedback Count</TableCell>
                      <TableCell>Average Rating</TableCell>
                      <TableCell>Rating Badge</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {feedbackStats.feedbackByCourse.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          <Typography variant="body2" color="text.secondary">
                            No course data available
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      feedbackStats.feedbackByCourse.slice(0, 10).map((course, index) => (
                        <TableRow key={course._id} hover>
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                              {course.courseName}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Assessment sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                              {course.count}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Star sx={{ mr: 1, fontSize: 16, color: 'warning.main' }} />
                              {course.avgRating.toFixed(1)}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={
                                course.avgRating >= 4.5 ? 'Excellent' :
                                course.avgRating >= 4.0 ? 'Very Good' :
                                course.avgRating >= 3.5 ? 'Good' :
                                course.avgRating >= 3.0 ? 'Average' : 'Needs Improvement'
                              }
                              color={
                                course.avgRating >= 4.0 ? 'success' :
                                course.avgRating >= 3.0 ? 'warning' : 'error'
                              }
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default Analytics;