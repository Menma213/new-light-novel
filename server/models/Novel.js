const mongoose = require('mongoose');

const novelSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: String,
  description: String,
  cover: String,
  genres: [String],
  status: String,
  rating: String,
  chapterCount: Number,
  slug: { type: String, required: true, unique: true },
  source: String,
  sourceUrl: { type: String, required: true },
  lastUpdated: { type: Date, default: Date.now },
}, {
  timestamps: true
});

module.exports = mongoose.model('Novel', novelSchema);
