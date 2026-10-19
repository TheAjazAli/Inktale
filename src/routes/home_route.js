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
const renderHome = require('../controllers/home_controller');


// GET route: Render the home page.
router.get(['/', '/page/:pageNumber'], renderHome);


module.exports = router;