const express = require('express');
const router = express.Router();
const Video = require('../models/video'); // ✅ Import Mongoose model

// GET all videos
router.get('/videos', async (req, res) => {
  try {
    const videos = await Video.find().sort({ createdAt: -1 });
    res.json(videos);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch videos' });
  }
});

// POST a new video
router.post('/videos', async (req, res) => {
  const { link, description } = req.body;

  if (!link?.trim() || !description?.trim()) {
    return res.status(400).json({ error: 'Link and description are required' });
  }

  try {
    const newVideo = new Video({ link: link.trim(), description: description.trim() });
    await newVideo.save();
    res.status(201).json({ message: 'Video added successfully', video: newVideo });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save video' });
  }
});

// DELETE a video by ID
router.delete('/videos/:id', async (req, res) => {
  try {
    const deleted = await Video.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Video not found' });
    }
    res.json({ message: 'Video deleted', deleted });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete video' });
  }
});

module.exports = router;
