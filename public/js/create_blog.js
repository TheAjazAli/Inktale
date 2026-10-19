/**
 * @license Apache-2.0
 * @copyright 2024 codewithsadee
 */

'use strict';


/**
 * import module
 */
import imagePreview from './utils/imagePreview.js';
import Snackbar from './snackbar.js';
import config from './config.js';
import imageAsDataURL from './utils/imageAsDataUrl.js';


// Selectors for image field, image preview, and clear preview button
const $imageField = document.querySelector('[data-image-field]');
const $imagePreview = document.querySelector('[data-image-preview]');
const $imagePreviewClear = document.querySelector('[data-image-preview-clear]');

// Event listener for image field change to trigger image preview
$imageField.addEventListener('change', () => {
  imagePreview($imageField, $imagePreview);
});

/**
 * Clears the image preview by removing the 'show' class from the preview container.
 * @function clearImagePreview
 */
const clearImagePreview = function () {
  $imagePreview.classList.remove('show');
  $imagePreview.innerHTML = '';
}

$imagePreviewClear.addEventListener('click', clearImagePreview);


/**
 * Handle blog publish
 */
const $form = document.querySelector('[data-form]');
const $publishBtn = document.querySelector('[data-publish-btn]');
const $progressBar = document.querySelector('[data-progress-bar]');

const handlePublishBlog = async function (event) {

  // Preventing default form submission behavior.
  event.preventDefault();

  // Disabling publish button to prevent multiple submissions.
  $publishBtn.setAttribute('disabled', '');

  // Creating FormData object to capture form data.
  const formData = new FormData($form);

  // Handle case where user not selected any image for banner when creating blog.
  if (!formData.get('banner').size) {
    // Enable publish button and show error message
    $publishBtn.removeAttribute('disabled');
    Snackbar({ type: 'error', message: 'You didn\'t select any image for blog banner.' });
    return;
  }

  // Handle case where selected image size larger than 5MB.
  if (formData.get('banner').size > config.blogBanner.maxByteSize) {
    // Enable publish button and show error message
    $publishBtn.removeAttribute('disabled');
    Snackbar({ type: 'error', message: 'Image should be less than 5MB.' });
    return;
  }

  // Overwrite banner value (which is type of 'File') to base64
  formData.set('banner', await imageAsDataURL(formData.get('banner')));

  // Create request body from formData
  const body = Object.fromEntries(formData.entries());

  // Show progress bar
  $progressBar.classList.add('loading');

  // Sending form data to the server for create blog.
  const response = await fetch(`${window.location.origin}/createblog`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  // Handle case where response is success.
  if (response.ok) {
    Snackbar({ message: 'Your blog has been created.' });
    $progressBar.classList.add('loading-end');
    // Redirect to create blog page
    return window.location = response.url;
  }

  // Handle case where response is 400 (Bad Request).
  if (response.status === 400) {
    // Enable publish button and show error message
    $publishBtn.removeAttribute('disabled');
    $progressBar.classList.add('loading-end');
    const { message } = await response.json();
    Snackbar({ type: 'error', message });
  }

}

$form.addEventListener('submit', handlePublishBlog);