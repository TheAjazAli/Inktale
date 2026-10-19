/**
 * @license Apache-2.0
 * @copyright 2024 codewithsadee
 */

'use strict';


/**
 * Converts a given image blob into a data URL.
 *
 * @param {Blob} imageBlob - The Blob object representing the image.
 * @returns {Promise<string>} - A promise that resolves with the data URL representing the image, or rejects with an error if conversion fails.
 */
const imageAsDataURL = (imageBlob) => {
  const fileReader = new FileReader();

  fileReader.readAsDataURL(imageBlob);

  return new Promise((resolve, reject) => {

    fileReader.addEventListener('load', () => {
      resolve(fileReader.result)
    });

    fileReader.addEventListener('error', () => {
      reject(fileReader.error);
    });

  });
}


export default imageAsDataURL;