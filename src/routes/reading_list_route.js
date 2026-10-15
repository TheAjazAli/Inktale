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
const { renderReadingList } = require('../controllers/reading_list_controller');


// GET route: Render the reading list page.
router.get(['/', '/page/:pageNumber'], renderReadingList);


module.exports = router;