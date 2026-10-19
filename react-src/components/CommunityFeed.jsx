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
    day: 'numeric'
  });
}

export default function CommunityFeed() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRecentCommunity = () => {
    setRefreshing(true);
    fetch(`${window.location.origin}/api/community/recent`)
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.comments)) {
          setComments(data.comments);
        }
      })
      .catch((err) => console.error('Error fetching community activity:', err))
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  };

  useEffect(() => {
    fetchRecentCommunity();
  }, []);

  return (
    <section class="community-feed-section" style={{ marginTop: '48px', marginBottom: '32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h2 class="headline-small text-on-surface" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span class="material-symbols-rounded" style={{ color: 'var(--primary)', fontSize: '2.8rem' }}>
              forum
            </span>
            <span>Community Discussions</span>
          </h2>
          <p class="body-medium text-on-surface-variant" style={{ marginTop: '4px' }}>
            Live perspectives, ideas, and reactions from writers & readers across Inktale
          </p>
        </div>

        <button
          type="button"
          class="icon-btn filled-tonal"
          onClick={fetchRecentCommunity}
          title="Refresh discussions"
          disabled={refreshing}
          style={{ width: '40px', height: '40px' }}
        >
          <span
            class="material-symbols-rounded"
            style={{ fontSize: '2rem', animation: refreshing ? 'spin 1s linear infinite' : 'none' }}
          >
            refresh
          </span>
          <div class="state-layer" />
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '36px', color: 'var(--outline)' }}>
          Loading community activity...
        </div>
      ) : comments.length === 0 ? (
        <div style={{
          backgroundColor: 'var(--surface-container)',
          padding: '40px 24px',
          borderRadius: 'var(--shape-large)',
          textAlign: 'center',
          border: '1px solid var(--outline-variant)'
        }}>
          <span class="material-symbols-rounded" style={{ fontSize: '4rem', color: 'var(--primary)' }}>
            chat
          </span>
          <p style={{ fontSize: '1.7rem', fontWeight: 600, color: 'var(--on-surface)', marginTop: '8px' }}>
            The conversation is waiting for you
          </p>
          <p style={{ fontSize: '1.4rem', color: 'var(--on-surface-variant)', marginTop: '6px', maxWidth: '480px', marginInline: 'auto' }}>
            Read any of our latest blogs above and leave a comment to have your voice featured here in the community!
          </p>
        </div>
      ) : (
        <div class="community-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '20px'
        }}>
          {comments.map((item) => {
            const author = item.user;
            const isGuest = !author;
            const displayName = isGuest ? (item.guestName || 'Community Reader') : (author.name || 'Anonymous');
            const blog = item.blog || {};
            
            const rawAvatar = author && (
              typeof author.profilePhoto === 'string'
                ? author.profilePhoto
                : author.profilePhoto?.url
            );
            const avatarUrl = rawAvatar?.replace('upload/', 'upload/w_80,h_80,c_auto/q_auto/f_auto/');
            const blogThumb = blog.banner?.url?.replace('upload/', 'upload/w_120,h_80,c_auto/q_auto/f_auto/');

            return (
              <div
                key={item._id}
                class="community-card"
                style={{
                  backgroundColor: 'var(--surface-container)',
                  borderRadius: 'var(--shape-medium)',
                  border: '1px solid var(--outline-variant)',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '16px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
                }}
              >
                {/* Author Info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={displayName}
                      style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: isGuest ? 'var(--secondary-container)' : 'var(--primary)',
                      color: isGuest ? 'var(--on-secondary-container)' : 'var(--on-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '1.6rem'
                    }}>
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div style={{ minWidth: 0, flex: 1 }}>
                    {isGuest ? (
                      <span class="title-small text-on-surface" style={{ fontWeight: 600, display: 'block' }}>
                        {displayName}
                      </span>
                    ) : (
                      <a
                        href={`/profile/${author.username}`}
                        class="title-small text-on-surface text-link"
                        style={{ fontWeight: 600, display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}
                      >
                        {displayName}
                      </a>
                    )}
                    <span style={{ fontSize: '1.2rem', color: 'var(--outline)' }}>
                      {author?.username ? `@${author.username}` : 'Guest'} • {formatRelativeTime(item.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Comment Quote */}
                <p style={{
                  fontSize: '1.45rem',
                  lineHeight: '1.6',
                  color: 'var(--on-surface)',
                  fontStyle: 'italic',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  "{item.content}"
                </p>

                {/* Referenced Blog Link */}
                <a
                  href={`/blogs/${blog._id}#comments-section`}
                  class="community-blog-ref"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 14px',
                    backgroundColor: 'var(--surface-container-highest)',
                    borderRadius: 'var(--shape-small)',
                    textDecoration: 'none',
                    color: 'var(--on-surface-variant)',
                    border: '1px solid var(--outline-variant)',
                    transition: 'border-color 0.15s, background-color 0.15s'
                  }}
                >
                  {blogThumb && (
                    <img
                      src={blogThumb}
                      alt={blog.title}
                      style={{ width: '48px', height: '36px', borderRadius: '4px', objectFit: 'cover', flexShrink: 0 }}
                    />
                  )}
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <span style={{
                      fontSize: '1.3rem',
                      fontWeight: 600,
                      color: 'var(--primary)',
                      display: 'block',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {blog.title || 'Untitled Blog'}
                    </span>
                    <span style={{ fontSize: '1.15rem', color: 'var(--outline)' }}>
                      Click to read story & reply →
                    </span>
                  </div>
                </a>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
