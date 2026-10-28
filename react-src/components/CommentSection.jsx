import React, { useState, useEffect } from 'react';

function formatRelativeTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays}d ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export default function CommentSection({ blogId: propBlogId, currentUser = null }) {
  const getBlogId = () => {
    if (propBlogId) return propBlogId;
    if (typeof window !== 'undefined') {
      const match = window.location.pathname.match(/\/blogs\/([a-zA-Z0-9_-]+)/);
      return match ? match[1] : '';
    }
    return '';
  };

  const blogId = getBlogId();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [guestName, setGuestName] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch comments
  const loadComments = () => {
    if (!blogId) {
      setLoading(false);
      return;
    }

    setRefreshing(true);
    fetch(`${window.location.origin}/blogs/${blogId}/comments`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load comments');
        return res.json();
      })
      .then((data) => {
        if (data && Array.isArray(data.comments)) {
          setComments(data.comments);
        }
      })
      .catch((err) => {
        console.error('Error fetching comments:', err);
      })
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  };

  useEffect(() => {
    loadComments();
  }, [blogId]);

  // Submit comment
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || submitting || !blogId) return;

    setError('');
    setSuccessMsg('');
    setSubmitting(true);

    try {
      const res = await fetch(`${window.location.origin}/blogs/${blogId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newComment.trim(),
          guestName: guestName.trim() || 'Community Reader'
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.comment) {
          setComments((prev) => [data.comment, ...prev]);
          setNewComment('');
          setSuccessMsg('Comment posted successfully!');
          setTimeout(() => setSuccessMsg(''), 3000);
        }
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.message || 'Failed to post comment. Please try again.');
      }
    } catch (err) {
      setError('Network connection error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete comment
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      const res = await fetch(`${window.location.origin}/blogs/${blogId}/comments/${commentId}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        setComments((prev) => prev.filter((c) => c._id !== commentId));
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.message || 'Could not delete comment.');
      }
    } catch (err) {
      console.error('Error deleting comment:', err);
    }
  };

  return (
    <section class="react-comments-wrapper" id="comments-section">
      <div class="comments-header">
        <h3 class="comments-title">
          <span class="material-symbols-rounded" style={{ color: 'var(--primary)', fontSize: '2.4rem' }}>
            forum
          </span>
          <span>Discussion & Comments</span>
          <span class="comments-badge">{comments.length}</span>
        </h3>

        <button
          type="button"
          class="icon-btn filled-tonal"
          onClick={loadComments}
          title="Refresh discussion"
          disabled={refreshing}
          style={{ width: '36px', height: '36px' }}
        >
          <span
            class="material-symbols-rounded"
            style={{ fontSize: '1.8rem', animation: refreshing ? 'spin 1s linear infinite' : 'none' }}
          >
            refresh
          </span>
          <div class="state-layer" />
        </button>
      </div>

      {/* Comment Input Box - Always available to both logged-in and guest users */}
      <form class="comment-input-box" onSubmit={handleSubmitComment}>
        {currentUser ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            {currentUser.profilePhoto ? (
              <img
                src={currentUser.profilePhoto}
                alt={currentUser.name}
                style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary)',
                color: 'var(--on-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '1.2rem'
              }}>
                {(currentUser.name || 'U').charAt(0).toUpperCase()}
              </div>
            )}
            <span style={{ fontSize: '1.35rem', color: 'var(--on-surface-variant)' }}>
              Commenting as <strong style={{ color: 'var(--on-surface)' }}>{currentUser.name}</strong> (@{currentUser.username})
            </span>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px',
            marginBottom: '6px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span class="material-symbols-rounded" style={{ color: 'var(--outline)', fontSize: '2rem' }}>
                account_circle
              </span>
              <input
                type="text"
                placeholder="Your Name (e.g. Alex or Guest)"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                style={{
                  background: 'var(--surface-container-highest)',
                  border: '1px solid var(--outline-variant)',
                  borderRadius: 'var(--shape-small)',
                  padding: '6px 12px',
                  color: 'var(--on-surface)',
                  fontSize: '1.3rem',
                  outline: 'none',
                  minWidth: '220px'
                }}
              />
            </div>
            <span style={{ fontSize: '1.25rem', color: 'var(--outline)' }}>
              Have an account? <a href="/login" class="text-link" style={{ fontWeight: 600 }}>Log in</a>
            </span>
          </div>
        )}

        <textarea
          class="comment-textarea"
          placeholder="What are your thoughts on this article? Join the discussion..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          maxLength={1000}
          required
        />

        {error && (
          <p style={{ color: 'var(--error)', fontSize: '1.3rem' }}>{error}</p>
        )}

        {successMsg && (
          <p style={{ color: '#10b981', fontSize: '1.3rem', fontWeight: 600 }}>{successMsg}</p>
        )}

        <div class="comment-input-footer">
          <span style={{ fontSize: '1.2rem', color: 'var(--outline)' }}>
            {newComment.length} / 1000
          </span>

          <button
            type="submit"
            class="btn btn-fill"
            disabled={submitting || !newComment.trim()}
            style={{ minWidth: '120px' }}
          >
            <span class="material-symbols-rounded leading-icon">send</span>
            <p class="label-large">{submitting ? 'Posting...' : 'Post Comment'}</p>
            <div class="state-layer" />
          </button>
        </div>
      </form>

      {/* Comments List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '30px', color: 'var(--outline)' }}>
          Loading discussion...
        </div>
      ) : comments.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '36px 20px',
          color: 'var(--on-surface-variant)',
          backgroundColor: 'var(--surface-container)',
          borderRadius: 'var(--shape-medium)',
          border: '1px solid var(--outline-variant)'
        }}>
          <span class="material-symbols-rounded" style={{ fontSize: '3.6rem', color: 'var(--outline)' }}>
            chat_bubble_outline
          </span>
          <p style={{ marginTop: '8px', fontSize: '1.5rem', fontWeight: 600, color: 'var(--on-surface)' }}>
            No comments yet
          </p>
          <p style={{ fontSize: '1.3rem', color: 'var(--outline)', marginTop: '4px' }}>
            Be the first to share your perspective on this story above!
          </p>
        </div>
      ) : (
        <div class="comments-list">
          {comments.map((comment) => {
            const author = comment.user;
            const isGuest = !author;
            const displayName = isGuest ? (comment.guestName || 'Community Reader') : author.name;
            const isOwner = currentUser && author && (currentUser.username === author.username);
            
            const rawAvatar = author && (
              typeof author.profilePhoto === 'string'
                ? author.profilePhoto
                : author.profilePhoto?.url
            );
            const avatarUrl = rawAvatar?.replace('upload/', 'upload/w_80,h_80,c_auto/q_auto/f_auto/');

            return (
              <div key={comment._id} class="comment-card">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={displayName} class="comment-avatar" />
                ) : (
                  <div class="comment-avatar" style={{
                    backgroundColor: isGuest ? 'var(--secondary-container)' : 'var(--primary)',
                    color: isGuest ? 'var(--on-secondary-container)' : 'var(--on-primary)'
                  }}>
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}

                <div class="comment-body">
                  <div class="comment-meta">
                    <div class="comment-author-info">
                      {isGuest ? (
                        <span class="comment-author-name" style={{ fontWeight: 600 }}>
                          {displayName}
                        </span>
                      ) : (
                        <a href={`/profile/${author.username}`} class="comment-author-name text-link">
                          {displayName}
                        </a>
                      )}

                      {author?.username ? (
                        <span class="comment-author-username">@{author.username}</span>
                      ) : (
                        <span style={{
                          fontSize: '1.1rem',
                          backgroundColor: 'var(--surface-container-highest)',
                          color: 'var(--outline)',
                          padding: '1px 6px',
                          borderRadius: '4px'
                        }}>
                          Guest
                        </span>
                      )}

                      <span class="comment-date">
                        • {formatRelativeTime(comment.createdAt)}
                      </span>
                    </div>

                    {isOwner && (
                      <button
                        type="button"
                        class="comment-delete-btn"
                        title="Delete comment"
                        onClick={() => handleDeleteComment(comment._id)}
                      >
                        <span class="material-symbols-rounded" style={{ fontSize: '1.8rem' }}>
                          delete
                        </span>
                      </button>
                    )}
                  </div>

                  <p class="comment-text">{comment.content}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
