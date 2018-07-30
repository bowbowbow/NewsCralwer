const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const post = new Schema({
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  author: { type: String, default: '' },
  pubDate: { type: String, default: '' },
  category: { type: String, default: '' },
  keywords: { type: String, default: '' },
  contentHtml: { type: String, default: '' },
  contentText: { type: String, default: '' },
  
  status: {
    type: String,
    default: 'wait',
    enum: ['wait', 'locked', 'completed'],
    index: true,
  },
  siteName: { type: String, default: '', index: true },
  link: { type: String, default: '', index: true },
}, {
  versionKey: false,
  timestamps: true,
});

const cursor = new Schema({
  siteName: { type: String, default: 'CNN' },
  after: { type: String, default: '' },
}, {
  versionKey: false,
  timestamps: true,
});

module.exports = {
  post: mongoose.model(`article.posts`, post),
  cursor: mongoose.model(`article.cursors`, cursor),
};