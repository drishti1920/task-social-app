const Post = require('../models/Post');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Helper function to delete file from local storage
const deleteLocalFile = (filePath) => {
  fs.unlink(filePath, (err) => {
    if (err) console.error('Error deleting local file:', err);
  });
};

// @desc    Get all posts
// @route   GET /api/posts
exports.getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate('user', 'name'); // Include user's name in the response
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a new post
// @route   POST /api/posts
exports.createPost = async (req, res) => {
  try {
    const { caption } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'Please provide an image' });
    }

    if (!caption) {
      return res.status(400).json({ message: 'Please provide a caption' });
    }

    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'task-social-app',
      use_filename: true,
      resource_type: 'auto'
    });

    // Create new post
    const post = new Post({
      caption,
      imageUrl: result.secure_url,
      user: req.user.id,
      cloudinaryId: result.public_id // Store Cloudinary public_id for later deletion
    });

    await post.save();
    await post.populate('user', 'name');

    // Delete local file after upload
    deleteLocalFile(req.file.path);

    res.status(201).json(post);
  } catch (err) {
    // Delete local file if upload fails
    if (req.file) {
      deleteLocalFile(req.file.path);
    }
    console.error(err);
    res.status(500).json({ message: 'Error creating post' });
  }
};

// @desc    Delete post
// @route   DELETE /api/posts/:id
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Make sure user owns post
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Delete image from Cloudinary using stored public_id
    if (post.cloudinaryId) {
      await cloudinary.uploader.destroy(post.cloudinaryId);
    }

    await post.deleteOne();
    res.json({ message: 'Post removed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting post' });
  }
};

// @desc    Get user posts
// @route   GET /api/posts/user/:userId
exports.getUserPosts = async (req, res) => {
  try {
    const posts = await Post.find({ user: req.params.userId })
      .sort({ createdAt: -1 })
      .populate('user', 'name');
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}; 