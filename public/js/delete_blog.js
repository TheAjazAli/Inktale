/**
 * @license Apache-2.0
 * @copyright 2024 codewithsadee
 */

'use strict';


/**
 * import module
 */
import Snackbar from './snackbar.js';


const $blogDeleteBtnAll = document.querySelectorAll('[data-blog-delete-btn]');


/**
 * DELETE request to the server to delete a specified blog.
 * @async
 * @param {string} blogId - The unique identifier of the blog to be deleted.
 * @returns {Promise<void>} - Promise resolving when the deletion operation is complete.
 */
const handleBlogDelete = async (blogId) => {

  const confirmDelete = confirm('Are you sure you want to delete this blog?');

  // Handle case where user close the delete confirmation
  if (!confirmDelete) return;

  const response = await fetch(`${window.location.origin}/blogs/${blogId}/delete`, {
    method: 'DELETE'
  });

  // Handle case where response is success
  if (response.ok) {
    Snackbar({
      message: 'Blog has been deleted.'
    });

    window.location.reload();
  }

}


// Attaches click event listeners to all delete buttons to trigger the handleBlogDelete function.
$blogDeleteBtnAll.forEach($deleteBtn => {
  const blogId = $deleteBtn.dataset.blogDeleteBtn;
  $deleteBtn.addEventListener('click', handleBlogDelete.bind(null, blogId));
});