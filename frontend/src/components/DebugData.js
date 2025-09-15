import React, { useState, useEffect } from 'react';
import { Container, Paper, Typography, Button, Box } from '@mui/material';
import { feedbackAPI, courseAPI, adminAPI } from '../services/api';

const DebugData = () => {
  const [debugInfo, setDebugInfo] = useState({
    courses: [],
    feedback: [],
    users: []
  });

  const checkData = async () => {
    try {
      console.log('🔍 Checking database data...');
      
      // Check courses
      try {
        const coursesResponse = await courseAPI.getCourses();
        console.log('📚 Courses:', coursesResponse.data);
        setDebugInfo(prev => ({ ...prev, courses: coursesResponse.data.courses }));
      } catch (error) {
        console.error('❌ Courses error:', error);
      }

      // Check feedback
      try {
        const feedbackResponse = await feedbackAPI.getAllFeedback({ limit: 5 });
        console.log('💭 Feedback:', feedbackResponse.data);
        setDebugInfo(prev => ({ ...prev, feedback: feedbackResponse.data.feedback }));
      } catch (error) {
        console.error('❌ Feedback error:', error);
      }

      // Check users
      try {
        const usersResponse = await adminAPI.getUsers({ limit: 5 });
        console.log('👥 Users:', usersResponse.data);
        setDebugInfo(prev => ({ ...prev, users: usersResponse.data.users }));
      } catch (error) {
        console.error('❌ Users error:', error);
      }

    } catch (error) {
      console.error('❌ Debug check failed:', error);
    }
  };

  useEffect(() => {
    checkData();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          🐛 Debug Data Check
        </Typography>
        
        <Button onClick={checkData} variant="contained" sx={{ mb: 3 }}>
          Refresh Data Check
        </Button>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6">📚 Courses ({debugInfo.courses.length})</Typography>
          <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto' }}>
            {JSON.stringify(debugInfo.courses, null, 2)}
          </pre>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6">💭 Feedback ({debugInfo.feedback.length})</Typography>
          <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto' }}>
            {JSON.stringify(debugInfo.feedback, null, 2)}
          </pre>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6">👥 Users ({debugInfo.users.length})</Typography>
          <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto' }}>
            {JSON.stringify(debugInfo.users, null, 2)}
          </pre>
        </Box>
      </Paper>
    </Container>
  );
};

export default DebugData;