/**
 * @license Apache-2.0
 * @copyright 2024 codewithsadee
 */

'use strict';


/**
 * node modules
 */
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');


/**
 * custom modules
 */
const User = require('../models/user_model');
const Blog = require('../models/blog_model');
const uploadToCloudinary = require('../config/cloudinary_config');


/**
 * Retrieves settings for the current user and renders the settings page.
 * 
 * @async
 * @function renderSettings
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @throws {Error} - Throws an error if there's an issue during the process.
 */
const renderSettings = async (req, res) => {
  try {

    // Retrieve logged client username
    const { username } = req.session.user;

    // Retrieve current user
    const currentUser = await User.findOne({ username });

    // Render the settings page
    res.render('./pages/settings', {
      sessionUser: req.session.user,
      currentUser
    });

  } catch (error) {

    // Log error
    console.error('Error rendering settings page: ', error.message);
    throw error;

  }
}


/**
 * Updates basic information of the logged-in user such as name, username, email, bio, and profile photo.
 * 
 * @async
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @throws {Error} - Throws an error if there's an issue during the process.
 */
const updateBasicInfo = async (req, res) => {
  try {

    // Retrieve logged client username from session
    const { username: sessionUsername } = req.session.user;

    // Retrieve current user based on session username
    const currentUser = await User.findOne({ username: sessionUsername })
      .select('profilePhoto name username email bio');

    // Destructure properties from request body
    const {
      profilePhoto,
      name,
      username,
      email,
      bio
    } = req.body;

    // Handle case where new email is already associated with an account
    if (email) {
      if (await User.exists({ email })) {
        return res.status(400).json({ message: 'Sorry, an account is already associated with this email address.' });
      }

      // Update email of the current user
      currentUser.email = email;
    }

    // Handle case where new username is already in use
    if (username) {
      if (await User.exists({ username })) {
        return res.status(400).json({ message: 'Sorry, that username is already taken. Please choose a different one.' });
      }

      // Update username of the current user and session user
      currentUser.username = username;
      req.session.user.username = username;
    }

    // If profile photo is provided, upload it to cloudinary and update user's profile photo
    if (profilePhoto) {
      const public_id = currentUser.username;
      const imageURL = await uploadToCloudinary(profilePhoto, public_id);

      currentUser.profilePhoto = {
        url: imageURL,
        public_id
      }
      req.session.user.profilePhoto = imageURL;
    }

    // Update name and bio of the current user and session user
    currentUser.name = name;
    req.session.user.name = name;
    currentUser.bio = bio;

    // Save updated user information to the database
    await currentUser.save();

    // Send success status
    res.sendStatus(200);

  } catch (error) {

    // Log error
    console.error('Error updating basic info: ', error.message);
    throw error;

  }
}


/**
 * Updates the password for the logged-in user.
 * 
 * @async
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @throws {Error} - Throws an error if there's an issue during the process.
 */
const updatePassword = async (req, res) => {
  try {

    // Retrieve logged client username from session
    const { username: sessionUsername } = req.session.user;

    // Retrieve current user based on session username
    const currentUser = await User.findOne({ username: sessionUsername })
      .select('password');

    // Destructure properties from request body
    const {
      old_password,
      password
    } = req.body;

    // Validate old password
    const oldPasswordIsValid = await bcrypt.compare(old_password, currentUser.password);

    // Handle case where old password is not valid
    if (!oldPasswordIsValid) {
      return res.status(400).json({ message: 'Your old password is not valid.' });
    }

    // Hash the new password and assign to current user password
    const newPassword = await bcrypt.hash(password, 10);
    currentUser.password = newPassword;

    // Save the updated password
    await currentUser.save();

    // Send success status
    res.sendStatus(200);

  } catch (error) {

    // Log error
    console.error('Error updating password: ', error.message);
    throw error;

  }
}


/**
 * Delete the current user account.
 * 
 * @async
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @throws {Error} - Throws an error if there's an issue during the process.
 */
const deleteAccount = async (req, res) => {
  try {

    // Retrieve logged client username from session
    const { username } = req.session.user;

    // Retrieve current user based on session username
    const currentUser = await User.findOne({ username })
      .select('blogs');

    // Delete all blog that current user published
    await Blog.deleteMany({ _id: { $in: currentUser.blogs } });

    // Delete current user account
    await User.deleteOne({ username });

    // Destroy current user session from all devices
    const Session = mongoose.connection.db.collection('sessions');
    // destroy session from database
    await Session.deleteMany({ session: { $regex: username, $options: 'i' } });
    // destroy session from client device
    req.session.destroy();

    res.sendStatus(200);

  } catch (error) {

    // Log error
    console.error('Error deleting account: ', error.message);
    throw error;

  }
}


module.exports = {
  renderSettings,
  updateBasicInfo,
  updatePassword,
  deleteAccount
}