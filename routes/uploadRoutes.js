const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

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
    // Sanitize and timestamp filename
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
router.post('/', upload.single('image'), (req, res) => {
  const category = req.query.category;
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  res.json({
    message: 'Image uploaded successfully',
    imageUrl: `https://gainwissdom.onrender.com/uploads/${category}/${req.file.filename}`
,
  });
});


// ========== List Images ==========
router.get('/list', (req, res) => {
  const baseDir = path.join(__dirname, '../uploads');
  const socialDir = path.join(baseDir, 'social');
  const institutionDir = path.join(baseDir, 'institution');

  const readFiles = (dir) => {
    return fs.existsSync(dir)
      ? fs.readdirSync(dir).filter(file => /\.(jpg|jpeg|png)$/i.test(file))
      : [];
  };

  const social = readFiles(socialDir);
  const institution = readFiles(institutionDir);

  res.json({
    social,
    institution,
  });
});


// ========== Delete Image ==========
router.delete('/delete', (req, res) => {
  const { category, filename } = req.query;

  if (!category || !filename) {
    return res.status(400).json({ error: 'Category and filename are required' });
  }

  const decodedFilename = decodeURIComponent(filename); // Important!
  const filePath = path.join(__dirname, `../uploads/${category}/${decodedFilename}`);

  console.log('🗑️ Deletion request for:', filePath);

  fs.access(filePath, fs.constants.F_OK, (accessErr) => {
    if (accessErr) {
      console.log('⚠️ File not found:', filePath);
      return res.status(404).json({ error: 'File not found' });
    }

    fs.unlink(filePath, (err) => {
      if (err) {
        console.error('❌ Error deleting file:', err); // This is where your error is
        return res.status(500).json({ error: 'Error deleting file' });
      }

      console.log('✅ File deleted:', filePath);
      res.json({ message: 'File deleted successfully' });
    });
  });
});


module.exports = router;
