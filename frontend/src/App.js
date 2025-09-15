import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';

// Auth Components
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import AdminLogin from './components/Auth/AdminLogin';

// Dashboard Components
import StudentDashboard from './components/Dashboard/StudentDashboard';
import AdminDashboard from './components/Dashboard/AdminDashboard';

// Feedback Components
import FeedbackForm from './components/Feedback/FeedbackForm';
import MyFeedback from './components/Feedback/MyFeedback';
import AllFeedback from './components/Feedback/AllFeedback';

// Profile Components
import Profile from './components/Profile/Profile';

// Admin Components
import UserManagement from './components/Admin/UserManagement';
import CourseManagement from './components/Admin/CourseManagement';
import Analytics from './components/Admin/Analytics';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/admin-login" element={<AdminLogin />} />
              
              {/* Student Routes */}
              <Route path="/dashboard" element={
                <PrivateRoute>
                  <StudentDashboard />
                </PrivateRoute>
              } />
              
              <Route path="/feedback/new" element={
                <PrivateRoute>
                  <FeedbackForm />
                </PrivateRoute>
              } />
              
              <Route path="/feedback/edit/:id" element={
                <PrivateRoute>
                  <FeedbackForm />
                </PrivateRoute>
              } />
              
              <Route path="/my-feedback" element={
                <PrivateRoute>
                  <MyFeedback />
                </PrivateRoute>
              } />
              
              <Route path="/profile" element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              } />
              
              {/* Admin Routes */}
              <Route path="/admin/dashboard" element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              } />
              
              <Route path="/admin/feedback" element={
                <AdminRoute>
                  <AllFeedback />
                </AdminRoute>
              } />
              
              <Route path="/admin/users" element={
                <AdminRoute>
                  <UserManagement />
                </AdminRoute>
              } />
              
              <Route path="/admin/courses" element={
                <AdminRoute>
                  <CourseManagement />
                </AdminRoute>
              } />
              
              <Route path="/admin/analytics" element={
                <AdminRoute>
                  <Analytics />
                </AdminRoute>
              } />
              
              {/* Default Redirect */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </div>
        </Router>
        
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;