/**
 * @license Apache-2.0
 * @copyright 2024 codewithsadee
 */

'use strict';


/**
 * node modules
 */
const mongoose = require('mongoose');


/**
 * Mongoose schema for user data.
 */
const UserSchema = new mongoose.Schema({
  profilePhoto: {
    url: String,
    public_id: String
  },
  name: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  bio: String,
  email: {
    type: String,
    required: true,
    lowercase: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  blogs: {
    type: [mongoose.SchemaTypes.ObjectId],
    ref: 'Blog'
  },
  blogPublished: {
    type: Number,
    default: 0
  },
  reactedBlogs: {
    type: [mongoose.SchemaTypes.ObjectId],
    ref: 'Blog'
  },
  totalVisits: {
    type: Number,
    default: 0
  },
  totalReactions: {
    type: Number,
    default: 0
  },
  readingList: {
    type: [mongoose.SchemaTypes.ObjectId],
    ref: 'Blog'
  }
}, {
  timestamps: true
});


module.exports = mongoose.model('User', UserSchema);