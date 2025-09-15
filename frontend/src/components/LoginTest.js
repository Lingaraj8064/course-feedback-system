import React, { useState } from 'react';
import { Container, Paper, Button, Typography, Box, TextField } from '@mui/material';
import { api } from '../services/api';

const LoginTest = () => {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testAdminLogin = async () => {
    setLoading(true);
    setResult('Testing admin login...');
    
    try {
      const response = await api.post('/auth/login', {
        email: 'admin@example.com',
        password: 'Admin123!'
      });
      
      console.log('Admin Login Response:', response.data);
      setResult(`✅ Admin Login Success! 
      Name: ${response.data.name}
      Role: ${response.data.role}
      Token: ${response.data.token.substring(0, 20)}...`);
    } catch (error) {
      console.error('Admin Login Error:', error);
      setResult(`❌ Admin Login Failed: ${error.response?.data?.message || error.message}`);
    }
    setLoading(false);
  };

  const testStudentLogin = async () => {
    setLoading(true);
    setResult('Testing student login...');
    
    try {
      const response = await api.post('/auth/login', {
        email: 'student@example.com',
        password: 'Student123!'
      });
      
      console.log('Student Login Response:', response.data);
      setResult(`✅ Student Login Success! 
      Name: ${response.data.name}
      Role: ${response.data.role}
      Token: ${response.data.token.substring(0, 20)}...`);
    } catch (error) {
      console.error('Student Login Error:', error);
      setResult(`❌ Student Login Failed: ${error.response?.data?.message || error.message}`);
    }
    setLoading(false);
  };

  const testHealthCheck = async () => {
    setLoading(true);
    setResult('Testing server health...');
    
    try {
      const response = await fetch('http://localhost:5000/health');
      const data = await response.json();
      console.log('Health Check:', data);
      setResult(`✅ Server Health: ${data.message}`);
    } catch (error) {
      console.error('Health Check Error:', error);
      setResult(`❌ Server Health Failed: ${error.message}`);
    }
    setLoading(false);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          🧪 Login Test Component
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <Button 
            variant="contained" 
            onClick={testHealthCheck}
            disabled={loading}
          >
            Test Server Health
          </Button>
          
          <Button 
            variant="contained" 
            color="secondary"
            onClick={testAdminLogin}
            disabled={loading}
          >
            Test Admin Login
          </Button>
          
          <Button 
            variant="contained" 
            color="success"
            onClick={testStudentLogin}
            disabled={loading}
          >
            Test Student Login
          </Button>
        </Box>

        <TextField
          multiline
          fullWidth
          rows={10}
          value={result}
          variant="outlined"
          label="Test Results"
          InputProps={{
            readOnly: true,
          }}
          sx={{ 
            '& .MuiInputBase-input': { 
              fontFamily: 'monospace',
              fontSize: '0.875rem'
            }
          }}
        />

        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Open browser console (F12) to see detailed logs
        </Typography>
      </Paper>
    </Container>
  );
};

export default LoginTest;