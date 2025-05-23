const mongoose = require('mongoose');

const chapterSchema = new mongoose.Schema({
  novelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Novel', required: true },
  title: { type: String, required: true },
  number: { type: Number, required: true },
  url: { type: String, required: true },
  content: String,
  date: Date,
  prevChapter: { type: mongoose.Schema.Types.ObjectId, ref: 'Chapter' },
  nextChapter: { type: mongoose.Schema.Types.ObjectId, ref: 'Chapter' },
}, {
  timestamps: true
});

// Add index for faster queries
chapterSchema.index({ novelId: 1, number: 1 });

module.exports = mongoose.model('Chapter', chapterSchema);
