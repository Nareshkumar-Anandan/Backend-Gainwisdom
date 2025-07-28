const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const UploadedImage = require('../models/uploads'); // ✅ Import Mongoose model

// ========== Create upload folder dynamically based on category ==========
const getUploadPath = (category) => {
  const baseDir = path.join(__dirname, `../uploads/${category}`);
  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
  }
  return baseDir;
};

// ========== Multer Storage Config ==========
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const category = req.query.category;
    const uploadPath = getUploadPath(category);
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const sanitizedName = file.originalname
      .replace(/\s+/g, '-')
      .replace(/[^\w.-]/g, '');
    const finalName = `${Date.now()}-${sanitizedName}`;
    cb(null, finalName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png/;
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedTypes.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only .jpg, .jpeg, .png files are allowed'));
  }
};

const upload = multer({ storage, fileFilter });

// ========== Upload Image ==========
router.post('/', upload.single('image'), async (req, res) => {
  const category = req.query.category;

  // ✅ Validate required fields
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  if (!category || !['social', 'institution'].includes(category)) {
    return res.status(400).json({ error: 'Invalid or missing category' });
  }

  const imageUrl = `https://gainwissdom.onrender.com/uploads/${category}/${req.file.filename}`;

  try {
    const newImage = new UploadedImage({
      filename: req.file.filename,
      url: imageUrl,
      category,
    });

    await newImage.save(); // ✅ Save to MongoDB

    res.json({
      message: 'Image uploaded and saved to DB successfully',
      imageUrl,
    });
  } catch (error) {
    console.error('❌ DB Save Error:', error); // ✅ Show full error
    res.status(500).json({ error: 'Failed to save image in DB', details: error.message });
  }
});

// ========== Get All Uploaded Images from MongoDB ==========
router.get('/list', async (req, res) => {
  try {
    const images = await UploadedImage.find({});
    const social = images.filter(img => img.category === 'social');
    const institution = images.filter(img => img.category === 'institution');

    res.json({ social, institution });
  } catch (err) {
    console.error('❌ Fetch Error:', err);
    res.status(500).json({ error: 'Failed to fetch images from DB' });
  }
});

// ========== Delete Image ==========
router.delete('/delete', async (req, res) => {
  const { category, filename } = req.query;

  if (!category || !filename) {
    return res.status(400).json({ error: 'Category and filename are required' });
  }

  const decodedFilename = decodeURIComponent(filename);
  const filePath = path.join(__dirname, `../uploads/${category}/${decodedFilename}`);

  try {
    // Delete file from disk
    fs.unlinkSync(filePath);

    // Delete from DB
    await UploadedImage.deleteOne({ filename: decodedFilename });

    res.json({ message: 'Image deleted from disk and DB successfully' });
  } catch (err) {
    console.error('❌ Delete Error:', err);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

module.exports = router;
