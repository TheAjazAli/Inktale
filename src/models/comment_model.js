/**
 * @license Apache-2.0
 * @copyright 2025 codewithajazali
 */

'use strict';

const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  blog: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Blog',
    required: true,
    index: true
  },
  user: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'User',
    required: false
  },
  guestName: {
    type: String,
    trim: true,
    default: 'Community Guest'
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxLength: 1000
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Comment', commentSchema);
