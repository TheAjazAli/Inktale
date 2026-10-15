/**
 * @license Apache-2.0
 * @copyright 2024 codewithsadee
 */

'use strict';


/**
 * import module
 */
import Snackbar from "./snackbar.js";


const $form = document.querySelector('[data-form]');
const $submitBtn = document.querySelector('[data-submit-btn]');


// Handling sign-up form submission
$form.addEventListener('submit', async (event) => {

  // Preventing default form submission behavior.
  event.preventDefault();

  // Disabling submit button to prevent multiple submissions.
  $submitBtn.setAttribute('disabled', '');

  // Creating FormData object to capture form data.
  const formData = new FormData($form);

  // Send account create request to server
  const response = await fetch(`${window.location.origin}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams(Object.fromEntries(formData.entries())).toString()
  });

  // Handle case where response status success
  if (response.ok) {
    // Redirect user to login page
    return window.location = response.url;
  }

  // Handle case where response status is 400 (Bad request)
  if (response.status === 400) {

    // Enable submit button and show error message
    $submitBtn.removeAttribute('disabled');
    const { message } = await response.json();
    Snackbar({
      type: 'error',
      message
    });

  }


});