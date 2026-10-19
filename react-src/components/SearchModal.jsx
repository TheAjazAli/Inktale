import React, { useState, useEffect, useRef } from 'react';

export default function SearchModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ blogs: [], users: [] });
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef(null);

  // Global keyboard shortcuts (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    const handleCustomOpen = () => setIsOpen(true);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('inktale:open-search', handleCustomOpen);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('inktale:open-search', handleCustomOpen);
    };
  }, [isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults({ blogs: [], users: [] });
    }
  }, [isOpen]);

  // Debounced search query
  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setResults({ blogs: [], users: [] });
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(() => {
      fetch(`${window.location.origin}/api/search?q=${encodeURIComponent(query.trim())}`)
        .then((res) => res.json())
        .then((data) => {
          setResults(data);
        })
        .catch((err) => console.error('Search error:', err))
        .finally(() => setIsLoading(false));
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div
      class="search-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsOpen(false);
      }}
    >
      <div class="search-modal-window">
        {/* Search Input Bar */}
        <div class="search-input-header">
          <span class="material-symbols-rounded" style={{ color: 'var(--primary)', fontSize: '2.4rem' }}>
            search
          </span>
          <input
            ref={inputRef}
            type="text"
            class="search-input-field"
            placeholder="Search stories, topics, authors..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {isLoading && (
            <span class="material-symbols-rounded" style={{ animation: 'spin 1s linear infinite', color: 'var(--outline)' }}>
              progress_activity
            </span>
          )}
          <span class="search-kbd-badge">ESC</span>
        </div>

        {/* Search Results */}
        <div class="search-results-container">
          {query.trim().length < 2 ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--outline)' }}>
              Type at least 2 characters to search...
            </div>
          ) : results.blogs.length === 0 && results.users.length === 0 && !isLoading ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--outline)' }}>
              <span class="material-symbols-rounded" style={{ fontSize: '3.6rem' }}>search_off</span>
              <p style={{ marginTop: '8px', fontSize: '1.4rem' }}>No results found for "{query}"</p>
            </div>
          ) : (
            <>
              {/* Blog Results */}
              {results.blogs.length > 0 && (
                <div>
                  <h4 class="search-group-title">Articles ({results.blogs.length})</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {results.blogs.map((blog) => {
                      const thumb = blog.banner?.url?.replace('upload/', 'upload/w_120,h_80,c_auto/q_auto/f_auto/');
                      return (
                        <a
                          key={blog._id}
                          href={`/blogs/${blog._id}`}
                          class="search-blog-item"
                          onClick={() => setIsOpen(false)}
                        >
                          {thumb && (
                            <img src={thumb} alt={blog.title} class="search-blog-thumb" />
                          )}
                          <div class="search-blog-info">
                            <p class="search-blog-title">{blog.title}</p>
                            <p class="search-blog-author">
                              By {blog.owner?.name || 'Author'} • {blog.readingTime} min read
                            </p>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Author Results */}
              {results.users.length > 0 && (
                <div>
                  <h4 class="search-group-title">Authors ({results.users.length})</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {results.users.map((user) => {
                      const avatar = user.profilePhoto?.url?.replace('upload/', 'upload/w_80,h_80,c_auto/q_auto/f_auto/');
                      return (
                        <a
                          key={user._id}
                          href={`/profile/${user.username}`}
                          class="search-blog-item"
                          onClick={() => setIsOpen(false)}
                        >
                          {avatar ? (
                            <img
                              src={avatar}
                              alt={user.name}
                              style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                            />
                          ) : (
                            <div style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '50%',
                              backgroundColor: 'var(--primary)',
                              color: 'var(--on-primary)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700
                            }}>
                              {user.name?.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div class="search-blog-info">
                            <p class="search-blog-title">{user.name}</p>
                            <p class="search-blog-author">@{user.username} {user.bio ? `• ${user.bio}` : ''}</p>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
