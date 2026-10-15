/**
 * @license Apache-2.0
 * @copyright 2024 codewithsadee
 */

'use strict';


/**
 * custom modules
 */
const Blog = require('../models/blog_model');


const updateVisit = async (req, res) => {
  try {

    // Destructure blogId from request params
    const { blogId } = req.params;

    // Find the blog and update its totalVisit count
    const visitedBlog = await Blog.findById(blogId)
      .select('totalVisit owner')
      .populate({
        path: 'owner',
        select: 'totalVisits'
      });
    visitedBlog.totalVisit++;
    await visitedBlog.save();

    // Update visited blog owner totalVisit count
    visitedBlog.owner.totalVisits++;
    await visitedBlog.owner.save();

    res.sendStatus(200);

  } catch (error) {

    // Log error
    console.error('Error updating totalVisit: ', error.message);
    throw error;

  }
}


module.exports = updateVisit;