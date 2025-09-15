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
  IconButton,
  AppBar,
  Toolbar,
  Box,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Avatar,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  ArrowBack,
  Search,
  Block,
  Delete,
  CheckCircle,
  Person,
  Email,
  Feedback
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { adminAPI } from '../../services/api';
import { formatDateTime } from '../../utils/validation';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBlocked, setFilterBlocked] = useState('all');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0
  });
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    action: '',
    userId: null,
    userName: ''
  });

  const navigate = useNavigate();

  useEffect(() => {
    loadUsers(1);
  }, [searchTerm, filterBlocked]);

  const loadUsers = async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
        ...(searchTerm && { search: searchTerm }),
        ...(filterBlocked !== 'all' && { blocked: filterBlocked })
      };

      const response = await adminAPI.getUsers(params);
      setUsers(response.data.users);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Load users error:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    setFilterBlocked(e.target.value);
  };

  const handlePageChange = (event, page) => {
    loadUsers(page);
  };

  const handleToggleBlock = (user) => {
    setConfirmDialog({
      open: true,
      action: user.isBlocked ? 'unblock' : 'block',
      userId: user._id,
      userName: user.name
    });
  };

  const handleDelete = (user) => {
    setConfirmDialog({
      open: true,
      action: 'delete',
      userId: user._id,
      userName: user.name
    });
  };

  const handleConfirmAction = async () => {
    try {
      const { action, userId } = confirmDialog;

      if (action === 'delete') {
        await adminAPI.deleteUser(userId);
        toast.success('User deleted successfully');
      } else {
        await adminAPI.toggleBlockUser(userId);
        toast.success(`User ${action}ed successfully`);
      }

      loadUsers(pagination.currentPage);
      setConfirmDialog({ open: false, action: '', userId: null, userName: '' });
    } catch (error) {
      console.error('Action error:', error);
      toast.error(error.response?.data?.message || 'Action failed');
    }
  };

  const handleCancelAction = () => {
    setConfirmDialog({ open: false, action: '', userId: null, userName: '' });
  };

  const getStatusColor = (isBlocked) => {
    return isBlocked ? 'error' : 'success';
  };

  const getStatusText = (isBlocked) => {
    return isBlocked ? 'Blocked' : 'Active';
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
            User Management
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Header */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            User Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage student accounts and monitor activity
          </Typography>
        </Paper>

        {/* Filters */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 300 }}
            />

            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Status Filter</InputLabel>
              <Select
                value={filterBlocked}
                onChange={handleFilterChange}
                label="Status Filter"
              >
                <MenuItem value="all">All Users</MenuItem>
                <MenuItem value="false">Active Only</MenuItem>
                <MenuItem value="true">Blocked Only</MenuItem>
              </Select>
            </FormControl>

            {pagination.totalItems > 0 && (
              <Typography variant="body2" color="text.secondary">
                {pagination.totalItems} user{pagination.totalItems !== 1 ? 's' : ''} found
              </Typography>
            )}
          </Box>
        </Paper>

        {/* Users Table */}
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Feedback</TableCell>
                  <TableCell>Joined</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Box sx={{ py: 4 }}>
                        <Person sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary">
                          No users found
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user._id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar
                            src={user.profilePicture}
                            sx={{ mr: 2, width: 40, height: 40 }}
                          >
                            {user.name.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {user.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              ID: {user._id.slice(-6)}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Box>
                          <Typography variant="body2">
                            {user.email}
                          </Typography>
                          {user.phone && (
                            <Typography variant="caption" color="text.secondary">
                              {user.phone}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={getStatusText(user.isBlocked)}
                          color={getStatusColor(user.isBlocked)}
                          size="small"
                        />
                      </TableCell>

                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Feedback sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2">
                            {user.feedbackCount || 0}
                          </Typography>
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2">
                          {formatDateTime(user.createdAt)}
                        </Typography>
                      </TableCell>

                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          <IconButton
                            color={user.isBlocked ? "success" : "warning"}
                            onClick={() => handleToggleBlock(user)}
                            title={user.isBlocked ? "Unblock User" : "Block User"}
                          >
                            {user.isBlocked ? <CheckCircle /> : <Block />}
                          </IconButton>
                          
                          <IconButton
                            color="error"
                            onClick={() => handleDelete(user)}
                            title="Delete User"
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

        {/* Confirmation Dialog */}
        <Dialog
          open={confirmDialog.open}
          onClose={handleCancelAction}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            Confirm {confirmDialog.action === 'delete' ? 'Delete' : 
                    confirmDialog.action === 'block' ? 'Block' : 'Unblock'} User
          </DialogTitle>
          
          <DialogContent>
            {confirmDialog.action === 'delete' && (
              <Alert severity="error" sx={{ mb: 2 }}>
                This action will permanently delete the user and all their feedback. This cannot be undone.
              </Alert>
            )}
            
            <Typography>
              Are you sure you want to {confirmDialog.action}{' '}
              <strong>{confirmDialog.userName}</strong>?
            </Typography>
            
            {confirmDialog.action === 'block' && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Blocked users will not be able to log in or submit feedback.
              </Typography>
            )}
          </DialogContent>
          
          <DialogActions>
            <Button onClick={handleCancelAction}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmAction}
              color={confirmDialog.action === 'delete' ? 'error' : 'primary'}
              variant="contained"
            >
              {confirmDialog.action === 'delete' ? 'Delete' : 
               confirmDialog.action === 'block' ? 'Block' : 'Unblock'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
};

export default UserManagement;