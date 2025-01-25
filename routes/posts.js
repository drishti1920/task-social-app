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

router.get('/', auth, getPosts);

router.post('/', auth, upload.single('image'), createPost);

router.delete('/:id', auth, deletePost);

router.get('/user/:userId', auth, getUserPosts);

module.exports = router; 