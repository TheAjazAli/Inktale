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
const {
  renderSettings,
  updateBasicInfo,
  updatePassword,
  deleteAccount
} = require('../controllers/settings_controller');


// GET route: Render the settings page.
router.get('/', renderSettings);

// PUT route: Update user basic info.
router.put('/basic_info', updateBasicInfo);

// PUT route: Update user password.
router.put('/password', updatePassword);

// DELETE route: Delete user account.
router.delete('/account', deleteAccount);


module.exports = router;