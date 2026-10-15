/**
 * @license Apache-2.0
 * @copyright 2024 codewithsadee
 */

'use strict';


/**
 * node modules
 */
const mongoose = require('mongoose');


/**
 * Client options object containing server API configuration.
 * @type {ClientOptions}
 */
const clientOptions = {
  serverApi: {
    version: '1',
    strict: true,
    deprecationErrors: true
  },
  dbName: 'inktale'
}


/**
 * Connects to the MongoDB database using the provided connection string.
 * 
 * @param {string} connectionURI - The MongoDB connection string.
 * @returns {Promise<void>} - A promise that resolves when the connection is successfully established.
 * @throws {Error} - If there's an error during the connection process.
 */
const connectDB = async (connectionURI) => {
  try {

    await mongoose.connect(connectionURI, clientOptions);
    console.log('Connected to mongodb');

  } catch (error) {

    console.error('Error connecting to mongodb ', error.message);
    throw error;

  }
}


/**
 * Disconnects from the MongoDB database using Mongoose.
 * @async
 * @function disconnectDB
 * @throws {Error} If an error occurs during disconnection.
 * @returns {Promise<void>} A promise that resolves once disconnection is complete.
 */
const disconnectDB = async () => {
  try {

    await mongoose.disconnect();
    console.log('Disconnected from mongodb');

  } catch (error) {

    console.error('Error disconnecting from mongodb ', error.message);
    throw error;

  }
}


module.exports = {
  connectDB,
  disconnectDB
}