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

const deleteLocalFile = (filePath) => {
  fs.unlink(filePath, (err) => {
    if (err) console.error('Error deleting local file:', err);
  });
};

const validateImage = (file) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(file.mimetype)) {
    throw new Error('Invalid file type. Only JPEG, PNG, JPG and GIF are allowed');
  }

  if (file.size > maxSize) {
    throw new Error('File too large. Maximum size is 5MB');
  }
};

const uploadToCloudinary = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'task-social-app',
      use_filename: true,
      resource_type: 'auto',
      quality: 'auto', // Automatic quality optimization
      fetch_format: 'auto', // Automatic format optimization
      transformation: [
        { width: 1200, crop: 'limit' }, // Limit max width while maintaining aspect ratio
      ]
    });
    return result;
  } catch (error) {
    throw new Error(`Cloudinary Upload Failed: ${error.message}`);
  }
};

exports.getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate('user', 'name');
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};




exports.createPost = async (req, res) => {
  let uploadedImage = null;
  
  try {
    const { caption } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'Please provide an image' });
    }

    if (!caption) {
      return res.status(400).json({ message: 'Please provide a caption' });
    }

    const filePath = path.resolve(req.file.path);

    validateImage(req.file);

    uploadedImage = await uploadToCloudinary(filePath);

    const post = new Post({
      caption,
      imageUrl: uploadedImage.secure_url,
      user: req.user.id,
      cloudinaryId: uploadedImage.public_id,
      imageMetadata: {
        width: uploadedImage.width,
        height: uploadedImage.height,
        format: uploadedImage.format,
        size: uploadedImage.bytes
      }
    });

    await post.save();
    await post.populate('user', 'name');

    fs.unlink(filePath, (err) => {
      if (err) console.error('Error deleting local file:', err);
    });

    res.status(201).json(post);
  } catch (err) {
    if (uploadedImage && uploadedImage.public_id) {
      try {
        await cloudinary.uploader.destroy(uploadedImage.public_id);
      } catch (cloudinaryError) {
        console.error('Error deleting failed upload from Cloudinary:', cloudinaryError);
      }
    }

    if (req.file) {
      const filePath = path.resolve(req.file.path);
      fs.unlink(filePath, (err) => {
        if (err) console.error('Error deleting local file:', err);
      });
    }

    console.error('Post creation error:', err);
    res.status(500).json({ 
      message: err.message || 'Error creating post',
      error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

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

exports.updatePost = async (req, res) => {
  try {
    const { caption } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    post.caption = caption;
    await post.save();
    await post.populate('user', 'name');

    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating post' });
  }
};

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