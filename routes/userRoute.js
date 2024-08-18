const express = require("express");
const User = require("../model/User");
const multer = require("multer");
const path = require("path");

const router = express.Router();

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'upload/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); 
  }
});

const upload = multer({ storage: storage });

router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


router.post('/', upload.single('photo'), async (req, res) => {
  try {
    const { name, email } = req.body;
    const photo = req.file ? req.file.path : null; // Get file path

    const newUser = new User({ name, email, photo });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (err) {
    console.error('Error uploading file:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
