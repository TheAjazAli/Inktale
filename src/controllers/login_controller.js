/**
 * @license Apache-2.0
 * @copyright 2024 codewithsadee
 */

'use strict';


/**
 * node modules
 */
const bcrypt = require('bcrypt');


/**
 * custom modules
 */
const User = require('../models/user_model');


/**
 * Render the login page.
 * 
 * @param {object} req - The HTTP request object.
 * @param {object} res - The HTTP response object.
 */
const renderLogin = (req, res) => {

  const { userAuthenticated } = req.session.user || {};

  // Handle case where user already logged in
  if (userAuthenticated) {
    return res.redirect('/');
  }

  res.render('./pages/login');

}


/**
 * Handles the login process for a user.
 * 
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @returns {Promise<void>} A Promise representing the asynchronous operation.
 */
const postLogin = async (req, res) => {
  try {

    // Extract email and password from request body
    const { email, password } = req.body;

    // Find user from database by email
    const currentUser = await User.findOne({ email });

    // Handle case where no user found with the email
    if (!currentUser) {
      return res.status(400).json({ message: 'No user found with this email address.' });
    }

    // Check if password is valid
    const passwordIsValid = await bcrypt.compare(password, currentUser.password);

    // Handle case where password is invalid
    if (!passwordIsValid) {
      return res.status(400).json({ message: 'Invalid password. Please ensure you\'ve entered the correct password and try again.' });
    }

    // Set session userAuthenticated to true and redirect to homepage
    req.session.user = {
      userAuthenticated: true,
      name: currentUser.name,
      username: currentUser.username,
      profilePhoto: currentUser.profilePhoto?.url
    }

    return res.redirect('/');

  } catch (error) {

    console.log('postLogin: ', error.message);
    throw error;

  }
}


module.exports = {
  renderLogin,
  postLogin
}