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
const generateUsername = require('../utils/generate_username_util');


/**
 * Render the register page.
 *
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */
const renderRegister = (req, res) => {

  const { userAuthenticated } = req.session.user || {};

  // Handle case where user already logged in
  if (userAuthenticated) {
    return res.redirect('/');
  }

  res.render('./pages/register');

}


/**
 * Handles the register process for a new user.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @returns {Promise<void>} - A Promise that resolves after register process is completed.
 * @throws {Error} - If an error occurs during register process.
 */
const postRegister = async (req, res) => {
  try {

    // Extract user data form request body
    const { name, email, password } = req.body;

    // Create username'
    const username = generateUsername(name);

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with provided data
    await User.create({ name, email, password: hashedPassword, username });

    // Redirect user to login page upon successful signup
    res.redirect('/login');

  } catch (error) {

    if (error.code === 11000) {

      if (error.keyPattern.email) {
        return res.status(400).send({ message: 'This email is already associated with an account.' });
      }

      if (error.keyPattern.username) {
        return res.status(400).send({ message: 'This username is already in use.' });
      }

    } else {

      return res.status(400).send({ message: `Failed to register user.<br>${error.message}` });

    }

    // Log and throw error if any occurs during register process
    console.log('postRegister: ', error.message);
    throw error;

  }
}


module.exports = {
  renderRegister,
  postRegister
}