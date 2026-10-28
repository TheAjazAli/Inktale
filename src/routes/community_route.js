/**
 * @license Apache-2.0
 * @copyright 2025 codewithajazali
 */

'use strict';

const router = require('express').Router();
const { getRecentCommunityComments } = require('../controllers/comment_controller');

// GET /api/community/recent - returns recent comments across all blogs
router.get('/recent', getRecentCommunityComments);

module.exports = router;
