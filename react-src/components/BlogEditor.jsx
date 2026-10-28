import React, { useState, useEffect, useRef } from 'react';
import { renderMarkdown, calculateReadingTime } from '../utils/markdownParser';

export default function BlogEditor({ mode = 'create', initialData = {} }) {
  const [title, setTitle] = useState(initialData.title || '');
  const [content, setContent] = useState(initialData.content || '');
  const [bannerBase64, setBannerBase64] = useState('');
  const [bannerPreview, setBannerPreview] = useState(initialData.bannerUrl || '');
  const [viewMode, setViewMode] = useState('split'); // 'split', 'write', 'preview'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [draftStatus, setDraftStatus] = useState('');
  
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  // Restore draft if in create mode
  useEffect(() => {
    if (mode === 'create' && !initialData.title && !initialData.content) {
      try {
        const savedDraft = localStorage.getItem('inktale_blog_draft');
        if (savedDraft) {
          const parsed = JSON.parse(savedDraft);
          if (parsed.title || parsed.content) {
            setTitle(parsed.title || '');
            setContent(parsed.content || '');
            setDraftStatus('Restored draft from storage');
          }
        }
      } catch (e) {
        // ignore parse error
      }
    }
  }, [mode]);

  // Auto-save draft on changes (create mode only)
  useEffect(() => {
    if (mode !== 'create') return;
    const timeout = setTimeout(() => {
      if (title || content) {
        localStorage.setItem(
          'inktale_blog_draft',
          JSON.stringify({ title, content, updatedAt: new Date().toISOString() })
        );
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setDraftStatus(`Draft saved at ${time}`);
      }
    }, 1000);
    return () => clearTimeout(timeout);
  }, [title, content, mode]);

  // Handle banner selection
  const handleBannerSelect = (file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Image should be less than 5MB.');
      return;
    }
    setErrorMessage('');
    const reader = new FileReader();
    reader.onload = () => {
      setBannerBase64(reader.result);
      setBannerPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleClearBanner = (e) => {
    e.stopPropagation();
    setBannerBase64('');
    setBannerPreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Helper to insert markdown tokens at cursor
  const insertFormatting = (prefix, suffix = '', defaultText = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end) || defaultText;

    const replacement = `${prefix}${selectedText}${suffix}`;
    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + selectedText.length
      );
    }, 10);
  };

  // Submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!title.trim()) {
      setErrorMessage('Please enter an article title.');
      return;
    }

    if (!content.trim()) {
      setErrorMessage('Please write some content for your post.');
      return;
    }

    if (mode === 'create' && !bannerBase64 && !bannerPreview) {
      setErrorMessage('Please select a cover image for the blog banner.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === 'create') {
        const res = await fetch(`${window.location.origin}/createblog`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: title.trim(),
            content: content.trim(),
            banner: bannerBase64
          })
        });

        if (res.ok) {
          localStorage.removeItem('inktale_blog_draft');
          window.location = res.url;
        } else {
          const data = await res.json().catch(() => ({}));
          setErrorMessage(data.message || 'Failed to create blog. Please try again.');
          setIsSubmitting(false);
        }
      } else {
        // Edit mode
        const res = await fetch(`${window.location.origin}/blogs/${initialData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: title.trim(),
            content: content.trim(),
            ...(bannerBase64 ? { banner: bannerBase64 } : {})
          })
        });

        if (res.ok) {
          window.location = `/blogs/${initialData.id}`;
        } else {
          const data = await res.json().catch(() => ({}));
          setErrorMessage(data.message || 'Failed to update blog. Please try again.');
          setIsSubmitting(false);
        }
      }
    } catch (err) {
      setErrorMessage(err.message || 'A network error occurred.');
      setIsSubmitting(false);
    }
  };

  const words = content.trim().split(/\s+/).filter(Boolean).length;
  const readingTime = calculateReadingTime(content);

  return (
    <div class="react-editor-container">
      {errorMessage && (
        <div style={{
          backgroundColor: 'var(--error-container, #fed7d7)',
          color: 'var(--on-error-container, #9b2c2c)',
          padding: '12px 18px',
          borderRadius: 'var(--shape-medium)',
          fontSize: '1.4rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span class="material-symbols-rounded">error</span>
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Banner Upload Zone */}
      <div
        class="editor-banner-zone"
        onClick={() => fileInputRef.current && fileInputRef.current.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files?.[0]) handleBannerSelect(e.dataTransfer.files[0]);
        }}
      >
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={(e) => handleBannerSelect(e.target.files?.[0])}
        />

        {bannerPreview ? (
          <div style={{ position: 'relative' }}>
            <img src={bannerPreview} alt="Blog Banner" class="editor-banner-preview" />
            <button
              type="button"
              class="editor-banner-clear-btn"
              onClick={handleClearBanner}
              title="Remove banner"
            >
              <span class="material-symbols-rounded">close</span>
            </button>
          </div>
        ) : (
          <div>
            <span class="material-symbols-rounded" style={{ fontSize: '4rem', color: 'var(--primary)' }}>
              cloud_upload
            </span>
            <p style={{ fontSize: '1.6rem', fontWeight: 600, marginTop: '8px', color: 'var(--on-surface)' }}>
              Click or drag & drop to upload banner image
            </p>
            <p style={{ fontSize: '1.3rem', color: 'var(--on-surface-variant)', marginTop: '4px' }}>
              Recommended ratio 21:9. Max 5MB (JPEG, PNG, WebP)
            </p>
          </div>
        )}
      </div>

      {/* Title Input */}
      <input
        type="text"
        placeholder="Article Title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        class="editor-title-input"
        required
      />

      {/* Formatting Toolbar */}
      <div class="editor-toolbar">
        <div class="toolbar-group">
          <button
            type="button"
            class="toolbar-btn"
            title="Heading 2"
            onClick={() => insertFormatting('## ', '\n', 'Heading')}
          >
            H2
          </button>
          <button
            type="button"
            class="toolbar-btn"
            title="Heading 3"
            onClick={() => insertFormatting('### ', '\n', 'Subheading')}
          >
            H3
          </button>
        </div>

        <div class="toolbar-divider" />

        <div class="toolbar-group">
          <button
            type="button"
            class="toolbar-btn"
            title="Bold"
            onClick={() => insertFormatting('**', '**', 'bold text')}
          >
            <span class="material-symbols-rounded" style={{ fontSize: '2rem' }}>format_bold</span>
          </button>
          <button
            type="button"
            class="toolbar-btn"
            title="Italic"
            onClick={() => insertFormatting('*', '*', 'italic text')}
          >
            <span class="material-symbols-rounded" style={{ fontSize: '2rem' }}>format_italic</span>
          </button>
          <button
            type="button"
            class="toolbar-btn"
            title="Strikethrough"
            onClick={() => insertFormatting('~~', '~~', 'strikethrough')}
          >
            <span class="material-symbols-rounded" style={{ fontSize: '2rem' }}>strikethrough_s</span>
          </button>
        </div>

        <div class="toolbar-divider" />

        <div class="toolbar-group">
          <button
            type="button"
            class="toolbar-btn"
            title="Link"
            onClick={() => insertFormatting('[', '](https://example.com)', 'link title')}
          >
            <span class="material-symbols-rounded" style={{ fontSize: '2rem' }}>link</span>
          </button>
          <button
            type="button"
            class="toolbar-btn"
            title="Quote"
            onClick={() => insertFormatting('> ', '\n', 'Quote text')}
          >
            <span class="material-symbols-rounded" style={{ fontSize: '2rem' }}>format_quote</span>
          </button>
          <button
            type="button"
            class="toolbar-btn"
            title="Inline Code"
            onClick={() => insertFormatting('`', '`', 'code')}
          >
            <span class="material-symbols-rounded" style={{ fontSize: '2rem' }}>code</span>
          </button>
          <button
            type="button"
            class="toolbar-btn"
            title="Code Block"
            onClick={() => insertFormatting('```javascript\n', '\n```\n', '// your code here')}
          >
            <span class="material-symbols-rounded" style={{ fontSize: '2rem' }}>terminal</span>
          </button>
          <button
            type="button"
            class="toolbar-btn"
            title="Bullet List"
            onClick={() => insertFormatting('- ', '\n', 'Item')}
          >
            <span class="material-symbols-rounded" style={{ fontSize: '2rem' }}>format_list_bulleted</span>
          </button>
        </div>

        {/* View Mode Switcher */}
        <div class="editor-view-tabs">
          <button
            type="button"
            class={`view-tab-btn ${viewMode === 'write' ? 'active' : ''}`}
            onClick={() => setViewMode('write')}
          >
            Write
          </button>
          <button
            type="button"
            class={`view-tab-btn ${viewMode === 'preview' ? 'active' : ''}`}
            onClick={() => setViewMode('preview')}
          >
            Preview
          </button>
          <button
            type="button"
            class={`view-tab-btn ${viewMode === 'split' ? 'active' : ''}`}
            onClick={() => setViewMode('split')}
          >
            Split View
          </button>
        </div>
      </div>

      {/* Editor Content Area */}
      <div class={`editor-panes-grid ${
        viewMode === 'split' ? 'split' : viewMode === 'write' ? 'write-only' : 'preview-only'
      }`}>
        {(viewMode === 'write' || viewMode === 'split') && (
          <textarea
            ref={textareaRef}
            class="editor-textarea"
            placeholder="Write your article in markdown here... Try **bold**, ## Headings, `code`, and > quotes!"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        )}

        {(viewMode === 'preview' || viewMode === 'split') && (
          <div class="editor-preview-box">
            {content.trim() ? (
              <div dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }} />
            ) : (
              <div style={{ color: 'var(--outline)', fontStyle: 'italic', textAlign: 'center', marginTop: '40px' }}>
                Your live markdown preview will appear here as you type...
              </div>
            )}
          </div>
        )}
      </div>

      {/* Status Bar & Actions */}
      <div class="editor-status-bar">
        <div class="editor-metrics">
          <div class="metric-item">
            <span class="material-symbols-rounded" style={{ fontSize: '1.8rem' }}>article</span>
            <span>{words} {words === 1 ? 'word' : 'words'}</span>
          </div>
          <div class="metric-item">
            <span class="material-symbols-rounded" style={{ fontSize: '1.8rem' }}>schedule</span>
            <span>{readingTime} min read</span>
          </div>
          {draftStatus && (
            <div class="draft-status saved">
              <span class="material-symbols-rounded" style={{ fontSize: '1.6rem' }}>check_circle</span>
              <span>{draftStatus}</span>
            </div>
          )}
        </div>

        <button
          type="button"
          class="btn btn-fill"
          disabled={isSubmitting}
          onClick={handleSubmit}
          style={{ minWidth: '130px' }}
        >
          <span class="material-symbols-rounded leading-icon">
            {mode === 'create' ? 'send' : 'save'}
          </span>
          <p class="label-large">
            {isSubmitting
              ? (mode === 'create' ? 'Publishing...' : 'Saving...')
              : (mode === 'create' ? 'Publish' : 'Save Changes')}
          </p>
          <div class="state-layer" />
        </button>
      </div>
    </div>
  );
}
