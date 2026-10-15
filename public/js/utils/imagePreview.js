/**
 * @license Apache-2.0
 * @copyright 2024 codewithsadee
 */

'use strict';


/**
 * Generate an image preview from the selected file and display it in a specified container.
 * @param {HTMLInputElement} $imageField - The input field that contains the selected image file.
 * @param {HTMLElement} $imagePreview - The container element where the image preview will be displayed.
 * @returns {Promise<string>} - A promise that resolves with the object URL of the generated image.
 */
const imagePreview = async function ($imageField, $imagePreview) {
  const imageObjectUrl = URL.createObjectURL($imageField.files[0]);

  const $image = document.createElement('img');
  $image.classList.add('img-cover');
  $image.src = imageObjectUrl;

  $imagePreview.append($image);
  $imagePreview.classList.add('show');

  return imageObjectUrl;
}


export default imagePreview;