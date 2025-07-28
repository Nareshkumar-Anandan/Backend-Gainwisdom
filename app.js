const express = require('express');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const uploadRoutes = require('./routes/uploadRoutes');
const videoRoutes = require('./routes/videoRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ MongoDB Connection
const mongoURI = 'mongodb+srv://LogInUser:Database123@gainwissdom.ah2kcxy.mongodb.net/?retryWrites=true&w=majority&appName=Gainwissdom';

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB Atlas'))
.catch((err) => console.error('❌ MongoDB connection error:', err));

// ✅ Enable CORS for frontend domain and local dev
app.use(cors({
  origin: ['http://localhost:3000', 'https://gainwissdom.in'],
  methods: ['GET', 'POST', 'DELETE'],
  credentials: true,
}));

// ✅ Parse JSON bodies (for video upload)
app.use(express.json());

// ✅ Parse form-data (for image upload)
app.use(bodyParser.urlencoded({ extended: true }));

// ✅ Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ API Routes
app.use('/api/upload', uploadRoutes);     // handles image uploads
app.use('/api/videos', videoRoutes);      // handles video link CRUD

// ✅ Health check route
app.get('/', (req, res) => {
  res.send('GainWisdom API is running ✅');
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
