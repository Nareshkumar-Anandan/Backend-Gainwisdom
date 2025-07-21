const express = require('express');
const cors = require('cors');
const path = require('path');

const uploadRoutes = require('./routes/uploadRoutes');
const videoRoutes = require('./routes/videoRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Enable CORS for frontend domain and local dev
app.use(cors({
  origin: ['http://localhost:3000', 'https://gainwisdom.in'],
  methods: ['GET', 'POST', 'DELETE'],
  credentials: true,
}));

// ✅ Body parser
app.use(express.json());

// ✅ Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Routes
app.use('/api/upload', uploadRoutes);
app.use('/api/upload', videoRoutes);

// ✅ Health check route (optional for Render)
app.get('/', (req, res) => {
  res.send('GainWisdom API is running ✅');
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
