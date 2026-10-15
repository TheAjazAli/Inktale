/**
 * @license Apache-2.0
 * @copyright 2024 codewithsadee
 */

'use strict';


/**
 * Calculates the reading time for a given text.
 * @param {string} text - The text for which reading time is to be calculated.
 * @returns {number} - Estimated reading time in minutes.
 */
const AVG_READ_WPM = 200;
const getReadingTime = (text) => Math.ceil(text.split(' ').length / AVG_READ_WPM);


module.exports = getReadingTime;