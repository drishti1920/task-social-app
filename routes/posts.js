const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  getPosts,
  createPost,
  deletePost,
  getUserPosts
} = require('../controllers/postController');

// @route   GET api/posts
// @desc    Get all posts
// @access  Private
router.get('/', auth, getPosts);

// @route   POST api/posts
// @desc    Create a new post
// @access  Private
router.post('/', auth, upload.single('image'), createPost);

// @route   DELETE api/posts/:id
// @desc    Delete a post
// @access  Private
router.delete('/:id', auth, deletePost);

// @route   GET api/posts/user/:userId
// @desc    Get user's posts
// @access  Private
router.get('/user/:userId', auth, getUserPosts);

module.exports = router; 