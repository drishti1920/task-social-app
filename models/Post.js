const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  caption: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  cloudinaryId: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  imageMetadata: {
    width: Number,
    height: Number,
    format: String,
    size: Number
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Post', postSchema); 