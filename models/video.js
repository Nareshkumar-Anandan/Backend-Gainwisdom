const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  link: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Video', videoSchema);
