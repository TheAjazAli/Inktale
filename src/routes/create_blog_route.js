/**
 * @license Apache-2.0
 * @copyright 2024 codewithsadee
 */

'use strict';


/**
 * node modules
 */
const router = require('express').Router();


/**
 * custom modules
 */
const { renderCreateBlog, postCreateBlog } = require('../controllers/create_blog_controller');


// GET route: Render the blog create page.
router.get('/', renderCreateBlog);

// POST route: create new blog post.
router.post('/', postCreateBlog);


module.exports = router;