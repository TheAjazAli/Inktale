import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles/islands.css';

import BlogEditor from './components/BlogEditor';
import CommentSection from './components/CommentSection';
import SearchModal from './components/SearchModal';
import BlogActionBar from './components/BlogActionBar';
import TableOfContents from './components/TableOfContents';
import CommunityFeed from './components/CommunityFeed';

function initIslands() {
  // 1. Mount Blog Editor (Create & Edit page)
  const editorContainer = document.getElementById('react-blog-editor');
  if (editorContainer && !editorContainer.dataset.mounted) {
    editorContainer.dataset.mounted = 'true';
    const mode = editorContainer.dataset.mode || 'create';
    let initialData = {};
    if (editorContainer.dataset.blog) {
      try {
        initialData = JSON.parse(editorContainer.dataset.blog);
      } catch (e) {
        console.error('Failed to parse blog initial data:', e);
      }
    }
    const root = createRoot(editorContainer);
    root.render(<BlogEditor mode={mode} initialData={initialData} />);
  }

  // 2. Mount Comments Section (Blog Detail page)
  const commentsContainer = document.getElementById('react-comments');
  if (commentsContainer && !commentsContainer.dataset.mounted) {
    commentsContainer.dataset.mounted = 'true';
    let blogId = commentsContainer.dataset.blogId;
    if (!blogId) {
      // Fallback: extract blog ID from current URL /blogs/:blogId
      const parts = window.location.pathname.split('/');
      const idx = parts.indexOf('blogs');
      if (idx !== -1 && parts[idx + 1]) {
        blogId = parts[idx + 1].split('?')[0].split('#')[0];
      }
    }

    let currentUser = null;
    if (commentsContainer.dataset.sessionUser) {
      try {
        currentUser = JSON.parse(commentsContainer.dataset.sessionUser);
      } catch (e) {
        console.error('Failed to parse session user:', e);
      }
    }
    const root = createRoot(commentsContainer);
    root.render(<CommentSection blogId={blogId} currentUser={currentUser} />);
  }

  // 3. Mount Blog Action Bar (Blog Detail page)
  const actionsContainer = document.getElementById('react-blog-actions');
  if (actionsContainer && !actionsContainer.dataset.mounted) {
    actionsContainer.dataset.mounted = 'true';
    const blogId = actionsContainer.dataset.blogId;
    const initialReactions = parseInt(actionsContainer.dataset.reaction || '0', 10);
    const initialBookmarks = parseInt(actionsContainer.dataset.bookmarks || '0', 10);
    const initialUserReacted = actionsContainer.dataset.userReacted === 'true';
    const initialUserBookmarked = actionsContainer.dataset.userBookmarked === 'true';
    const isLoggedIn = actionsContainer.dataset.loggedIn === 'true';

    const root = createRoot(actionsContainer);
    root.render(
      <BlogActionBar
        blogId={blogId}
        initialReactions={initialReactions}
        initialBookmarks={initialBookmarks}
        initialUserReacted={initialUserReacted}
        initialUserBookmarked={initialUserBookmarked}
        isLoggedIn={isLoggedIn}
      />
    );
  }

  // 4. Mount Table of Contents (Blog Detail page)
  const tocContainer = document.getElementById('react-toc');
  if (tocContainer && !tocContainer.dataset.mounted) {
    tocContainer.dataset.mounted = 'true';
    const root = createRoot(tocContainer);
    root.render(<TableOfContents />);
  }

  // 5. Mount Community Feed (Home page)
  const communityContainer = document.getElementById('react-community-feed');
  if (communityContainer && !communityContainer.dataset.mounted) {
    communityContainer.dataset.mounted = 'true';
    const root = createRoot(communityContainer);
    root.render(<CommunityFeed />);
  }

  // 6. Mount Global Search Modal (on all pages)
  let searchContainer = document.getElementById('react-search-modal');
  if (!searchContainer) {
    searchContainer = document.createElement('div');
    searchContainer.id = 'react-search-modal';
    document.body.appendChild(searchContainer);
  }
  if (!searchContainer.dataset.mounted) {
    searchContainer.dataset.mounted = 'true';
    const searchRoot = createRoot(searchContainer);
    searchRoot.render(<SearchModal />);
  }
}

// Ensure execution whether DOM is loading or already ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initIslands);
} else {
  initIslands();
}
