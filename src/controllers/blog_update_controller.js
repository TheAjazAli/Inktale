/**
 * @license Apache-2.0
 * @copyright 2024 codewithsadee
 */

'use strict';


/**
 * custom modules
 */
const Blog = require('../models/blog_model');
const uploadToCloudinary = require('../config/cloudinary_config');


/**
 * Retrieves a blog from the database and renders a page for updating it.
 * 
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @throws {Error} If an error occurs during database operations.
 */
const renderBlogEdit = async (req, res) => {
  try {

    // Get blogId from request parameter
    const { blogId } = req.params;

    // Retrieve logged client username from session
    const { username } = req.session.user;

    // Find the blog user want to edit by it's id
    const currentBlog = await Blog.findById(blogId)
      .select('banner title content owner')
      .populate({
        path: 'owner',
        select: 'username'
      });

    // Handle case where current user try to edit other users blog
    if (currentBlog.owner.username !== username) {
      return res.status(403).send('<h2>Sorry, you don\'t have permission to edit this article as you\'re not the author.</h2>');
    }

    res.render('./pages/blog_update', {
      sessionUser: req.session.user,
      currentBlog
    });

  } catch (error) {

    // Log error
    console.error('Error rendering blog edit page: ', error.message);
    throw error;

  }
}


const updateBlog = async (req, res) => {
  try {

    /**
     * Retrieve blog id from request param
     * And blog title, content, banner from request body
     */
    const { blogId } = req.params;
    const { title, content, banner } = req.body;

    // Find the blog user want to update
    const updatedBlog = await Blog.findById(blogId)
      .select('banner title content');

    // Handle case where banner is exists
    if (banner) {
      // Upload new banner in cloudinary
      const bannerURL = await uploadToCloudinary(banner, updatedBlog.banner.public_id);
      updatedBlog.banner.url = bannerURL;
    }

    // Update blog title and content and save to database
    updatedBlog.title = title;
    updatedBlog.content = content;

    await updatedBlog.save();

    res.sendStatus(200);

  } catch (error) {

    // Log error
    console.error('Error updating blog: ', error.message);
    throw error;

  }
}


module.exports = {
  renderBlogEdit,
  updateBlog
}