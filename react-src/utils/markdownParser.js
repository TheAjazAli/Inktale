/**
 * Simple, robust client-side markdown renderer for real-time live preview.
 */
export function renderMarkdown(md) {
  if (!md) return '';

  let html = md;

  // Escape HTML tags to prevent XSS
  html = html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Fenced code blocks with language
  html = html.replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g, (match, lang, code) => {
    return `<pre class="code-block"><code class="language-${lang || 'plaintext'}">${code.trim()}</code></pre>`;
  });

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

  // Headings (#, ##, ###, ####)
  html = html.replace(/^#### (.*$)/gim, '<h4 class="headline-h4">$1</h4>');
  html = html.replace(/^### (.*$)/gim, '<h3 class="headline-h3">$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2 class="headline-h2">$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1 class="headline-h1">$1</h1>');

  // Blockquotes
  html = html.replace(/^\> (.*$)/gim, '<blockquote class="quote-block"><p>$1</p></blockquote>');

  // Horizontal rules
  html = html.replace(/^---$/gim, '<hr class="divider-line" />');

  // Bold & Italic
  html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  html = html.replace(/~~(.*?)~~/g, '<del>$1</del>');

  // Images ![alt](url)
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="preview-img" loading="lazy" />');

  // Links [text](url)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="preview-link">$1</a>');

  // Unordered lists
  html = html.replace(/^\s*[\-\*]\s+(.*)$/gim, '<li class="list-item-bullet">$1</li>');
  html = html.replace(/(<li class="list-item-bullet">[\s\S]*?<\/li>)/gim, '<ul class="preview-ul">$1</ul>');

  // Paragraphs (double newlines)
  const paragraphs = html.split(/\n\s*\n/);
  html = paragraphs
    .map(p => {
      const trimmed = p.trim();
      if (!trimmed) return '';
      // Don't wrap if already a block element
      if (/^<(h[1-6]|ul|pre|blockquote|hr|li|table)/i.test(trimmed)) {
        return trimmed;
      }
      return `<p class="preview-p">${trimmed.replace(/\n/g, '<br />')}</p>`;
    })
    .filter(Boolean)
    .join('\n');

  return html;
}

export function calculateReadingTime(text) {
  if (!text) return 1;
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}
