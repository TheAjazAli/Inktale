/**
 * @license Apache-2.0
 * @copyright 2025 codewithajazali
 */

'use strict';

const router = require('express').Router();
const { searchItems } = require('../controllers/search_controller');

router.get('/', searchItems);

module.exports = router;
