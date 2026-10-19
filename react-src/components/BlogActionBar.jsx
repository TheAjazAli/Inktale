import React, { useState } from 'react';

export default function BlogActionBar({
  blogId,
  initialReactions = 0,
  initialBookmarks = 0,
  initialUserReacted = false,
  initialUserBookmarked = false,
  isLoggedIn = false
}) {
  const [reactions, setReactions] = useState(Number(initialReactions));
  const [hasReacted, setHasReacted] = useState(Boolean(initialUserReacted));
  const [isHeartPopping, setIsHeartPopping] = useState(false);

  const [bookmarks, setBookmarks] = useState(Number(initialBookmarks));
  const [hasBookmarked, setHasBookmarked] = useState(Boolean(initialUserBookmarked));

  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  // Handle Reaction
  const handleToggleReaction = async () => {
    if (!isLoggedIn) {
      window.location = '/login';
      return;
    }

    const previousReacted = hasReacted;
    const previousCount = reactions;

    // Optimistic UI update
    if (previousReacted) {
      setHasReacted(false);
      setReactions((prev) => Math.max(0, prev - 1));
    } else {
      setHasReacted(true);
      setReactions((prev) => prev + 1);
      setIsHeartPopping(true);
      setTimeout(() => setIsHeartPopping(false), 400);
    }

    try {
      const res = await fetch(`${window.location.origin}/blogs/${blogId}/reactions`, {
        method: previousReacted ? 'DELETE' : 'PUT'
      });

      if (!res.ok) {
        // Rollback on error
        setHasReacted(previousReacted);
        setReactions(previousCount);
      }
    } catch (err) {
      setHasReacted(previousReacted);
      setReactions(previousCount);
    }
  };

  // Handle Bookmark
  const handleToggleBookmark = async () => {
    if (!isLoggedIn) {
      window.location = '/login';
      return;
    }

    const previousBookmarked = hasBookmarked;
    const previousCount = bookmarks;

    if (previousBookmarked) {
      setHasBookmarked(false);
      setBookmarks((prev) => Math.max(0, prev - 1));
    } else {
      setHasBookmarked(true);
      setBookmarks((prev) => prev + 1);
    }

    try {
      const res = await fetch(`${window.location.origin}/blogs/${blogId}/readingList`, {
        method: previousBookmarked ? 'DELETE' : 'PUT'
      });

      if (!res.ok) {
        setHasBookmarked(previousBookmarked);
        setBookmarks(previousCount);
      }
    } catch (err) {
      setHasBookmarked(previousBookmarked);
      setBookmarks(previousCount);
    }
  };

  // Copy link
  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    });
  };

  // Scroll to comments
  const handleScrollToComments = () => {
    const el = document.getElementById('comments-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <div class="react-action-bar-container">
        <div class="action-bar-left">
          {/* Reaction Button */}
          <button
            type="button"
            class={`interactive-action-btn heart ${hasReacted ? 'active' : ''} ${isHeartPopping ? 'heart-pop' : ''}`}
            onClick={handleToggleReaction}
            title={hasReacted ? 'Unlike' : 'Like this story'}
          >
            <span class="material-symbols-rounded" style={{
              fontVariationSettings: hasReacted ? "'FILL' 1" : "'FILL' 0",
              color: hasReacted ? '#e11d48' : 'inherit'
            }}>
              favorite
            </span>
            <span>{reactions}</span>
          </button>

          {/* Bookmark Button */}
          <button
            type="button"
            class={`interactive-action-btn bookmark ${hasBookmarked ? 'active' : ''}`}
            onClick={handleToggleBookmark}
            title={hasBookmarked ? 'Remove bookmark' : 'Save to reading list'}
          >
            <span class="material-symbols-rounded" style={{
              fontVariationSettings: hasBookmarked ? "'FILL' 1" : "'FILL' 0",
              color: hasBookmarked ? 'var(--primary)' : 'inherit'
            }}>
              bookmark
            </span>
            <span>{bookmarks}</span>
          </button>
        </div>

        <div class="action-bar-right">
          {/* Jump to comments button */}
          <button
            type="button"
            class="interactive-action-btn"
            onClick={handleScrollToComments}
            title="Jump to discussion"
          >
            <span class="material-symbols-rounded">chat_bubble</span>
            <span>Comments</span>
          </button>

          {/* Share Button */}
          <button
            type="button"
            class="interactive-action-btn"
            onClick={() => setShowShareModal(true)}
            title="Share this story"
          >
            <span class="material-symbols-rounded">share</span>
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* Share Modal Dialog */}
      {showShareModal && (
        <div
          class="share-dialog-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowShareModal(false);
          }}
        >
          <div class="share-dialog-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--on-surface)' }}>
                Share this article
              </h3>
              <button
                type="button"
                onClick={() => setShowShareModal(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--outline)' }}
              >
                <span class="material-symbols-rounded">close</span>
              </button>
            </div>

            {/* Social Links */}
            <div class="share-social-grid">
              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                class="share-social-btn"
              >
                <span class="material-symbols-rounded">public</span>
                <span>Twitter / X</span>
              </a>

              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                class="share-social-btn"
              >
                <span class="material-symbols-rounded">work</span>
                <span>LinkedIn</span>
              </a>

              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(currentUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                class="share-social-btn"
              >
                <span class="material-symbols-rounded">chat</span>
                <span>WhatsApp</span>
              </a>
            </div>

            {/* Copy Link Field */}
            <div class="copy-link-box">
              <input type="text" readOnly value={currentUrl} class="copy-link-input" />
              <button
                type="button"
                class="btn btn-fill"
                onClick={handleCopyLink}
                style={{ padding: '6px 14px', fontSize: '1.2rem' }}
              >
                <span class="material-symbols-rounded" style={{ fontSize: '1.6rem' }}>
                  {copiedLink ? 'done' : 'content_copy'}
                </span>
                <span>{copiedLink ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
