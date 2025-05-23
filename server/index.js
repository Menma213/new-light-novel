require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Novel = require('./models/Novel');
const Chapter = require('./models/Chapter');
const { crawlNovelUpdates } = require('./scraper');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// API Routes
app.get('/api/novels', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;

    const novels = await Novel.find()
      .sort({ lastUpdated: -1 })
      .skip(skip)
      .limit(limit);

    res.json(novels);
  } catch (error) {
    console.error('Error fetching novels:', error);
    res.status(500).json({ error: 'Failed to fetch novels' });
  }
});

app.get('/api/novels/:slug', async (req, res) => {
  try {
    const novel = await Novel.findOne({ slug: req.params.slug });
    if (!novel) {
      return res.status(404).json({ error: 'Novel not found' });
    }
    res.json(novel);
  } catch (error) {
    console.error('Error fetching novel:', error);
    res.status(500).json({ error: 'Failed to fetch novel' });
  }
});

app.get('/api/novels/:slug/chapters', async (req, res) => {
  try {
    const novel = await Novel.findOne({ slug: req.params.slug });
    if (!novel) {
      return res.status(404).json({ error: 'Novel not found' });
    }

    const chapters = await Chapter.find({ novelId: novel._id })
      .sort({ number: 1 });

    res.json(chapters);
  } catch (error) {
    console.error('Error fetching chapters:', error);
    res.status(500).json({ error: 'Failed to fetch chapters' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Start crawler
if (process.env.RUN_SCRAPER === 'true') {
  // Initial crawl
  crawlNovelUpdates();
  
  // Schedule regular crawls (every 6 hours)
  setInterval(crawlNovelUpdates, 6 * 60 * 60 * 1000);
}
