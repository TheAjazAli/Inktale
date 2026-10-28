/**
 * @license Apache-2.0
 * @copyright 2025 codewithajazali
 */

'use strict';

const Blog = require('../models/blog_model');
const User = require('../models/user_model');

/**
 * Live search for blogs and authors
 */
const searchItems = async (req, res) => {
  try {
    const query = req.query.q?.trim();

    if (!query || query.length < 2) {
      return res.status(200).json({ blogs: [], users: [] });
    }

    // Escape regex characters to prevent regex injection
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedQuery, 'i');

    const [blogs, users] = await Promise.all([
      Blog.find({ title: regex })
        .select('title banner readingTime createdAt reaction totalBookmark')
        .populate({
          path: 'owner',
          select: 'name username profilePhoto'
        })
        .sort({ createdAt: -1 })
        .limit(6),

      User.find({
        $or: [
          { name: regex },
          { username: regex }
        ]
      })
        .select('name username profilePhoto bio')
        .limit(4)
    ]);

    return res.status(200).json({ blogs, users });
  } catch (error) {
    console.error('Error during search:', error.message);
    return res.status(500).json({ message: 'Search failed' });
  }
};

module.exports = {
  searchItems
};
