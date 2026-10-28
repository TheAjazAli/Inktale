import React, { useState, useEffect } from 'react';

export default function TableOfContents() {
  const [headings, setHeadings] = useState([]);
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    // Look for headings in markdown content container
    const contentEl = document.querySelector('.content-markdown');
    if (!contentEl) return;

    const elements = contentEl.querySelectorAll('h2, h3');
    if (elements.length < 2) return; // Don't show for very short articles

    const items = [];
    elements.forEach((el, index) => {
      let id = el.id;
      if (!id) {
        id = `heading-section-${index}`;
        el.id = id;
      }
      items.push({
        id,
        text: el.innerText.trim(),
        level: el.tagName.toLowerCase() === 'h2' ? 2 : 3
      });
    });

    setHeadings(items);

    // Scroll spy observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '0px 0px -60% 0px'
      }
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  if (headings.length < 2) return null;

  const handleScrollTo = (e, id) => {
    e.preventDefault();
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveId(id);
    }
  };

  return (
    <nav class="react-toc-card" aria-label="Table of Contents">
      <div class="toc-header">
        <span class="material-symbols-rounded" style={{ fontSize: '2rem', color: 'var(--primary)' }}>
          menu_book
        </span>
        <span>Table of Contents</span>
      </div>

      <ul class="toc-list">
        {headings.map((item) => (
          <li key={item.id} class={`toc-item level-${item.level}`}>
            <a
              href={`#${item.id}`}
              class={`toc-link ${activeId === item.id ? 'active' : ''}`}
              onClick={(e) => handleScrollTo(e, item.id)}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
