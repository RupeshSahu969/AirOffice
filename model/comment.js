const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
  },
  content: {
    type: String,
    maxlength: 250,
  },
  image: {
    type: String,
    required: false,
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  reactionsCount: { 
    type: Number, 
    default: 0 
  },
  replies: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Comment' 
  }],
});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
