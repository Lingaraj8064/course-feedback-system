const User = require('../models/User');
const { generateToken } = require('../middleware/auth');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    console.log('Registration attempt:', { name, email });

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      console.log('User already exists:', email);
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
    });

    console.log('User created successfully:', user.email);

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('Login attempt:', email);

    // Check for user email (explicitly select password)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('User found:', user.email, 'Role:', user.role);

    // Check if user is blocked
    if (user.isBlocked) {
      console.log('User is blocked:', email);
      return res.status(403).json({ message: 'Your account has been blocked' });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    console.log('Password match:', isMatch);

    if (!isMatch) {
      console.log('Invalid password for:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('Login successful:', email);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
};

// @desc    Admin login
// @route   POST /api/auth/admin-login
// @access  Public
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('Admin login attempt:', email);

    // Check for admin user (explicitly select password)
    const user = await User.findOne({ email, role: 'admin' }).select('+password');

    if (!user) {
      console.log('Admin user not found:', email);
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    console.log('Admin user found:', user.email);

    // Check if user is blocked
    if (user.isBlocked) {
      console.log('Admin user is blocked:', email);
      return res.status(403).json({ message: 'Admin account has been blocked' });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    console.log('Admin password match:', isMatch);

    if (!isMatch) {
      console.log('Invalid admin password for:', email);
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    console.log('Admin login successful:', email);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Server error during admin login', error: error.message });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user.getPublicProfile());
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ message: 'Server error getting user data' });
  }
};

module.exports = {
  register,
  login,
  adminLogin,
  getMe,
};