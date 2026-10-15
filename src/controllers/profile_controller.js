/**
 * @license Apache-2.0
 * @copyright 2024 codewithsadee
 */

'use strict';


/**
 * custom modules
 */
const User = require('../models/user_model');
const Blog = require('../models/blog_model');
const getPagination = require('../utils/get_pagination_util');


/**
 * Retrieves profile information of a user and renders the profile page.
 * @async
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @throws {Error} - If there is an error during the process.
 */
const renderProfile = async (req, res) => {
  try {

    // Extract username from request params
    const { username } = req.params;

    // Handle case where user not exists
    const userExists = await User.exists({ username });
    if (!userExists) {
      return res.render('./pages/404');
    }

    // Find user profile based on username
    const profile = await User.findOne({ username })
      .select('profilePhoto username name bio blogs blogPublished createdAt');

    // Generate pagination data
    const pagination = getPagination(`/profile/${username}`, req.params, 20, profile.blogs.length);

    // Retrieve profile blogs based on pagination and other criteria
    const profileBlogs = await Blog.find({ _id: { $in: profile.blogs } })
      .select('title createdAt reaction totalBookmark readingTime')
      .populate({
        path: 'owner',
        select: 'name username profilePhoto'
      })
      .sort({ createdAt: 'desc' })
      .limit(pagination.limit)
      .skip(pagination.skip);

    // Render profile page with retrieved data
    res.render('./pages/profile', {
      sessionUser: req.session.user,
      profile,
      profileBlogs,
      pagination
    });

  } catch (error) {

    // Log error
    console.error('Error rendering profile: ', error.message);
    throw error;

  }
}


module.exports = renderProfile;