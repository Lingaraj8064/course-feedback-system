import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  Box,
  Grid,
  AppBar,
  Toolbar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Card,
  CardContent
} from '@mui/material';
import { 
  ArrowBack, 
  PhotoCamera, 
  Lock, 
  Save, 
  Person,
  Email,
  Phone,
  Home,
  Cake
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { userAPI } from '../../services/api';

const Profile = () => {
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    profilePicture: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordDialog, setPasswordDialog] = useState(false);
  const [errors, setErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});

  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await userAPI.getProfile();
      const userData = response.data;
      
      setProfileData({
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        dateOfBirth: userData.dateOfBirth ? userData.dateOfBirth.split('T')[0] : '',
        address: userData.address || '',
        profilePicture: userData.profilePicture || ''
      });
    } catch (error) {
      console.error('Load profile error:', error);
      toast.error('Failed to load profile');
    }
  };

  const validateProfile = () => {
    const newErrors = {};

    if (!profileData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (profileData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (profileData.phone && !/^\d{10}$/.test(profileData.phone)) {
      newErrors.phone = 'Phone number must be 10 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePassword = () => {
    const newErrors = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    } else if (!passwordRegex.test(passwordData.newPassword)) {
      newErrors.newPassword = 'Password must contain uppercase, lowercase, number, and special character';
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setPasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
    
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
    
    if (passwordErrors[e.target.name]) {
      setPasswordErrors({ ...passwordErrors, [e.target.name]: '' });
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateProfile()) {
      return;
    }

    setLoading(true);

    try {
      const response = await userAPI.updateProfile(profileData);
      updateUser(response.data.user);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Update profile error:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePassword()) {
      return;
    }

    setPasswordLoading(true);

    try {
      await userAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      toast.success('Password changed successfully!');
      setPasswordDialog(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Change password error:', error);
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      setLoading(true);
      const response = await userAPI.uploadAvatar(formData);
      
      setProfileData({
        ...profileData,
        profilePicture: response.data.profilePicture
      });
      
      updateUser({
        ...user,
        profilePicture: response.data.profilePicture
      });
      
      toast.success('Profile picture updated successfully!');
    } catch (error) {
      console.error('Upload avatar error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload profile picture');
    } finally {
      setLoading(false);
    }
  };

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
            My Profile
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          {/* Profile Picture Section */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <Box sx={{ position: 'relative', display: 'inline-block' }}>
                  <Avatar
                    src={profileData.profilePicture}
                    sx={{
                      width: 120,
                      height: 120,
                      mb: 2,
                      mx: 'auto'
                    }}
                  >
                    {profileData.name.charAt(0).toUpperCase()}
                  </Avatar>
                  
                  <IconButton
                    color="primary"
                    component="label"
                    sx={{
                      position: 'absolute',
                      bottom: 16,
                      right: -8,
                      backgroundColor: 'white',
                      '&:hover': {
                        backgroundColor: 'grey.100'
                      }
                    }}
                  >
                    <PhotoCamera />
                    <input
                      hidden
                      accept="image/*"
                      type="file"
                      onChange={handleAvatarChange}
                    />
                  </IconButton>
                </Box>
                
                <Typography variant="h5" gutterBottom>
                  {profileData.name}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {profileData.email}
                </Typography>
                
                <Typography variant="caption" color="text.secondary">
                  Student Role
                </Typography>
                
                <Button
                  variant="outlined"
                  startIcon={<Lock />}
                  onClick={() => setPasswordDialog(true)}
                  sx={{ mt: 2 }}
                  fullWidth
                >
                  Change Password
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Profile Form Section */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 4 }}>
              <Typography variant="h6" gutterBottom>
                Personal Information
              </Typography>
              
              <Divider sx={{ mb: 3 }} />
              
              <Box component="form" onSubmit={handleProfileSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      label="Full Name"
                      name="name"
                      value={profileData.name}
                      onChange={handleProfileChange}
                      error={!!errors.name}
                      helperText={errors.name}
                      InputProps={{
                        startAdornment: <Person sx={{ mr: 1, color: 'action.active' }} />
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      name="email"
                      value={profileData.email}
                      disabled
                      InputProps={{
                        startAdornment: <Email sx={{ mr: 1, color: 'action.active' }} />
                      }}
                      helperText="Email cannot be changed"
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleProfileChange}
                      error={!!errors.phone}
                      helperText={errors.phone}
                      placeholder="1234567890"
                      InputProps={{
                        startAdornment: <Phone sx={{ mr: 1, color: 'action.active' }} />
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Date of Birth"
                      name="dateOfBirth"
                      type="date"
                      value={profileData.dateOfBirth}
                      onChange={handleProfileChange}
                      InputLabelProps={{ shrink: true }}
                      InputProps={{
                        startAdornment: <Cake sx={{ mr: 1, color: 'action.active' }} />
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Address"
                      name="address"
                      multiline
                      rows={3}
                      value={profileData.address}
                      onChange={handleProfileChange}
                      placeholder="Enter your full address"
                      InputProps={{
                        startAdornment: <Home sx={{ mr: 1, color: 'action.active', alignSelf: 'flex-start', mt: 1 }} />
                      }}
                    />
                  </Grid>
                </Grid>
                
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<Save />}
                  disabled={loading}
                  sx={{ mt: 3 }}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Change Password Dialog */}
        <Dialog 
          open={passwordDialog} 
          onClose={() => setPasswordDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Change Password</DialogTitle>
          
          <DialogContent>
            <Box component="form" onSubmit={handlePasswordSubmit} sx={{ pt: 1 }}>
              <TextField
                autoFocus
                margin="normal"
                required
                fullWidth
                name="currentPassword"
                label="Current Password"
                type="password"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                error={!!passwordErrors.currentPassword}
                helperText={passwordErrors.currentPassword}
              />
              
              <TextField
                margin="normal"
                required
                fullWidth
                name="newPassword"
                label="New Password"
                type="password"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                error={!!passwordErrors.newPassword}
                helperText={passwordErrors.newPassword || 'Must contain uppercase, lowercase, number, and special character'}
              />
              
              <TextField
                margin="normal"
                required
                fullWidth
                name="confirmPassword"
                label="Confirm New Password"
                type="password"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                error={!!passwordErrors.confirmPassword}
                helperText={passwordErrors.confirmPassword}
              />
            </Box>
          </DialogContent>
          
          <DialogActions>
            <Button onClick={() => setPasswordDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handlePasswordSubmit}
              variant="contained"
              disabled={passwordLoading}
            >
              {passwordLoading ? 'Changing...' : 'Change Password'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
};

export default Profile;