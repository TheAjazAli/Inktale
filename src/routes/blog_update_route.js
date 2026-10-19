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
const { renderBlogEdit, updateBlog } = require('../controllers/blog_update_controller');


// GET route: render blog edit page
router.get('/:blogId/edit', renderBlogEdit);

// PUT route: update blog
router.put('/:blogId/edit', updateBlog);


module.exports = router;