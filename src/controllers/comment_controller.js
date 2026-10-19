/**
 * @license Apache-2.0
 * @copyright 2025 codewithajazali
 */

'use strict';

const mongoose = require('mongoose');
const Comment = require('../models/comment_model');
const User = require('../models/user_model');
const Blog = require('../models/blog_model');

/**
 * Get all comments for a specific blog
 */
const getComments = async (req, res) => {
  try {
    const { blogId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(blogId)) {
      return res.status(400).json({ comments: [] });
    }

    const comments = await Comment.find({ blog: blogId })
      .populate({
        path: 'user',
        select: 'name username profilePhoto'
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({ comments });
  } catch (error) {
    console.error('Error fetching comments:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Post a new comment to a blog (supports both logged-in users and guests)
 */
const postComment = async (req, res) => {
  try {
    const { blogId } = req.params;
    const { content, guestName } = req.body;

    if (!mongoose.Types.ObjectId.isValid(blogId)) {
      return res.status(400).json({ message: 'Invalid blog ID' });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Comment cannot be empty.' });
    }

    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found.' });
    }

    let commentData = {
      blog: blogId,
      content: content.trim()
    };

    // If user is logged in, attach their account
    if (req.session?.user?.username) {
      const currentUser = await User.findOne({ username: req.session.user.username })
        .select('_id name username profilePhoto');

      if (currentUser) {
        commentData.user = currentUser._id;
      } else {
        commentData.guestName = guestName?.trim() || 'Community Guest';
      }
    } else {
      // Guest comment
      commentData.guestName = guestName?.trim() || 'Community Guest';
    }

    const newComment = await Comment.create(commentData);

    const populatedComment = await Comment.findById(newComment._id).populate({
      path: 'user',
      select: 'name username profilePhoto'
    });

    return res.status(201).json({ comment: populatedComment });
  } catch (error) {
    console.error('Error posting comment:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Delete a comment by ID
 */
const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({ message: 'Invalid comment ID' });
    }

    const comment = await Comment.findById(commentId).populate('user', 'username');

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found.' });
    }

    // If comment has a registered user, only that user or an admin can delete
    if (comment.user) {
      if (!req.session?.user || comment.user.username !== req.session.user.username) {
        return res.status(403).json({ message: 'You can only delete your own comments.' });
      }
    }

    await Comment.findByIdAndDelete(commentId);
    return res.sendStatus(200);
  } catch (error) {
    console.error('Error deleting comment:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Get recent community activity/comments across all blogs (for Home Page Community Section)
 */
const getRecentCommunityComments = async (req, res) => {
  try {
    const comments = await Comment.find()
      .populate({
        path: 'user',
        select: 'name username profilePhoto'
      })
      .populate({
        path: 'blog',
        select: 'title banner readingTime'
      })
      .sort({ createdAt: -1 })
      .limit(8);

    const validComments = comments.filter((c) => c.blog);

    return res.status(200).json({ comments: validComments });
  } catch (error) {
    console.error('Error fetching recent community comments:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getComments,
  postComment,
  deleteComment,
  getRecentCommunityComments
};
