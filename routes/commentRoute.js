const express = require('express');
const Comment = require('../model/Comment');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../upload/comments')); // Ensure this path exists
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage: storage });

// Route to fetch comments
router.get('/', async (req, res) => {
  try {
    const { sortBy } = req.query;
    let sortOptions;
    if (sortBy === 'latest') {
      sortOptions = { createdAt: -1 };
    } else if (sortBy === 'popular') {
      sortOptions = { reactionsCount: -1 };
    } else {
      sortOptions = { createdAt: -1 };
    }

    const comments = await Comment.find().sort(sortOptions);
    res.status(200).json(comments);
  } catch (err) {
    console.error('Error fetching comments:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Route to create a new comment with image upload
router.post('/comments', upload.single('image'), async (req, res) => {
  try {
    const { userId, content } = req.body;
    const image = req.file ? `/uploads/comments/${req.file.filename}` : null; // Correct path for frontend

    const newComment = new Comment({ userId, content, image });
    await newComment.save();
    res.status(201).json(newComment);
  } catch (err) {
    console.error('Error creating comment:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/comments/:id/reactions', async (req, res) => {
  const { id } = req.params;
  const { reactionType } = req.body;

  try {
    const comment = await Comment.findById(id);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });

    comment.reactionsCount += reactionType === 'like' ? 1 : -1;
    await comment.save();

    res.status(200).json({ message: 'Reaction updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update reaction' });
  }
});


module.exports = router;
