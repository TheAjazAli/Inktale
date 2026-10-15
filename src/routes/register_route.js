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
const { renderRegister, postRegister } = require('../controllers/register_controller');


// GET route: Render the registration form.
router.get('/', renderRegister);

// POST route: Handles form submission for user registration.
router.post('/', postRegister);


module.exports = router;