/**
 * @license Apache-2.0
 * @copyright 2024 codewithsadee
 */

'use strict';


/**
 * custom modules
 */
const Blog = require('../models/blog_model');
const getPagination = require('../utils/get_pagination_util');


/**
 * Controller function to render the home page with blog data.
 * 
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @throws {Error} - Throws an error if there's an issue rendering the home page.
 */
const renderHome = async (req, res) => {
  try {

    // Retrieve total amount of created bogs
    const totalBlogs = await Blog.countDocuments();

    // Get pagination object
    const pagination = getPagination('/', req.params, 18, totalBlogs);

    // Retrieve blogs from the database, selecting specified fields and populating 'owner' field
    const latestBlogs = await Blog.find()
      .select('banner author createdAt readingTime title reaction totalBookmark')
      .populate({
        path: 'owner',
        select: 'name username profilePhoto'
      })
      .sort({ createdAt: 'desc' })
      .limit(pagination.limit)
      .skip(pagination.skip);


    res.render('./pages/home', {
      sessionUser: req.session.user,
      latestBlogs,
      pagination
    });

  } catch (error) {

    // Log and throw error if there's an issue rendering the home page
    console.error('Error rendering home page: ', error.message);
    throw error;

  }
}


module.exports = renderHome;