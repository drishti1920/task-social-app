const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { 
  register, 
  login, 
  getCurrentUser, 
  forgotPassword,
  resetPassword
} = require('../controllers/authController');

// @route   POST api/auth/register
// @desc    Register a user
// @access  Public
router.post('/register', register);

// @route   POST api/auth/login
// @desc    Login user & get token
// @access  Public
router.post('/login', login);

// @route   POST api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post('/forgot-password', forgotPassword);

// @route   POST api/auth/reset-password
// @desc    Reset password using token
// @access  Public
router.post('/reset-password', resetPassword);

// @route   GET api/auth/me
// @desc    Get logged in user
// @access  Private
router.get('/me', auth, getCurrentUser);

module.exports = router; 