/**
 * @license Apache-2.0
 * @copyright 2024 codewithsadee
 */

'use strict';


/**
 * custom module
 */
const User = require('../models/user_model');
const Blog = require('../models/blog_model');


/**
 * Update the reaction count for a blog and associate the user's reaction.
 * 
 * @param {Object} req - Request object.
 * @param {Object} res - Response object.
 * @throws {Error} - Throws an error if there is any issue during the process.
 */
const updateReaction = async (req, res) => {
  try {

    // Handle case where user is not authenticated
    if (!req.session.user) return res.sendStatus(401);

    // Destructure username from session
    const { username } = req.session.user;

    // Destructure blogId from request params
    const { blogId } = req.params;

    // Handle case where user already reacted to this blog
    const currentUser = await User.findOne({ username }).select('reactedBlogs');
    if (currentUser.reactedBlogs.includes(blogId)) {
      return res.sendStatus(400);
    }

    // Find the blog and update its reaction count
    const reactedBlog = await Blog.findById(blogId)
      .select('reaction owner')
      .populate({
        path: 'owner',
        select: 'totalReactions'
      });
    reactedBlog.reaction++;
    await reactedBlog.save();

    // Update current user's reactedBlogs list and save
    currentUser.reactedBlogs.push(reactedBlog._id);
    await currentUser.save();

    // Update blog author's total reaction list and save
    reactedBlog.owner.totalReactions++;
    await reactedBlog.owner.save();

    res.sendStatus(200);

  } catch (error) {

    // Log and throw error
    console.error('Error updating reaction: ', error.message);
    throw error;

  }
}


/**
 * Delete the reaction for a blog and associate the user's reaction.
 * 
 * @param {Object} req - Request object.
 * @param {Object} res - Response object.
 * @throws {Error} - Throws an error if there is any issue during the process.
 */
const deleteReaction = async (req, res) => {
  try {

    // Handle case where user is not authenticated
    if (!req.session.user) return res.sendStatus(401);

    // Destructure username from session
    const { username } = req.session.user;

    // Destructure blogId from request params
    const { blogId } = req.params;

    // Handle case where user not reacted to this blog
    const currentUser = await User.findOne({ username }).select('reactedBlogs');
    if (!currentUser.reactedBlogs.includes(blogId)) {
      return res.sendStatus(400);
    }

    // Find the blog and update its reaction count
    const reactedBlog = await Blog.findById(blogId)
      .select('reaction owner')
      .populate({
        path: 'owner',
        select: 'totalReactions'
      });
    reactedBlog.reaction--;
    await reactedBlog.save();

    // Update current user's reactedBlogs list and save
    currentUser.reactedBlogs.splice(currentUser.reactedBlogs.indexOf(blogId), 1);
    await currentUser.save();

    // Update blog author's total reaction list and save
    reactedBlog.owner.totalReactions--;
    await reactedBlog.owner.save();

    res.sendStatus(200);

  } catch (error) {

    // Log and throw error
    console.error('Error deleting reaction: ', error.message);
    throw error;

  }
}


module.exports = {
  updateReaction,
  deleteReaction
}