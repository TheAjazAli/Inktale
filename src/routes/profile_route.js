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
const renderProfile = require('../controllers/profile_controller');


// GET route: Render the profile page.
router.get(['/:username', '/:username/page/:pageNumber'], renderProfile);


module.exports = router;