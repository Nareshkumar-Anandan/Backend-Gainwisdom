const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const videoPath = path.join(__dirname, '../data/videoLinks.json');

// Helper to safely read JSON
const readVideoData = (callback) => {
  fs.readFile(videoPath, 'utf8', (err, data) => {
    if (err) return callback(err);
    try {
      const parsed = JSON.parse(data || '[]');
      callback(null, parsed);
    } catch (parseErr) {
      callback(parseErr);
    }
  });
};

// GET all videos
router.get('/videos', (req, res) => {
  readVideoData((err, videos) => {
    if (err) return res.status(500).json({ error: 'Failed to load videos' });
    res.json(videos);
  });
});

// POST a new video with description
router.post('/videos', (req, res) => {
  const { link, description } = req.body;

  if (!link?.trim() || !description?.trim()) {
    return res.status(400).json({ error: 'Link and description are required' });
  }

  readVideoData((err, videos) => {
    if (err) return res.status(500).json({ error: 'Read failed' });

    const newVideo = {
      link: link.trim(),
      description: description.trim(),
    };

    videos.push(newVideo);

    fs.writeFile(videoPath, JSON.stringify(videos, null, 2), (err) => {
      if (err) return res.status(500).json({ error: 'Write failed' });
      res.status(201).json({ message: 'Video added successfully', video: newVideo });
    });
  });
});

// DELETE a video by index
router.delete('/videos/:index', (req, res) => {
  const index = parseInt(req.params.index);

  readVideoData((err, videos) => {
    if (err) return res.status(500).json({ error: 'Read failed' });

    if (index < 0 || index >= videos.length) {
      return res.status(404).json({ error: 'Invalid index' });
    }

    const removed = videos.splice(index, 1);

    fs.writeFile(videoPath, JSON.stringify(videos, null, 2), (err) => {
      if (err) return res.status(500).json({ error: 'Write failed' });
      res.json({ message: 'Video deleted', removed });
    });
  });
});

module.exports = router;
