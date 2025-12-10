import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { usePageTitle, useTouchHover, useTapFeedback } from '../hooks';
import { posts } from '../data';
import { formatDateParts } from '../utils/formatDate';
import { Header } from '../components/layout';
import { AboutPanel, CodeBlock, InlineFootnote, Lightbox, PostImage } from '../components/features';
import { Pill } from '../components/ui';

/**
 * Component that renders post content with CodeBlock and PostImage components
 * replacing the placeholder divs
 */
const PostContent = ({ html, codeBlocks, images, footnotes = [], onImageClick }) => {
  const { containerRef } = useTouchHover({
    selector: '.post-image img',
    hoverClass: 'touch-hover',
  });

  // Parse HTML and find code block / image placeholders
  const contentParts = useMemo(() => {
    if (!html) return [];
    
    const parts = [];
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const body = doc.body;
    
    // Process all child nodes
    const processNode = (node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node;
        
        // Handle code block placeholders
        if (el.hasAttribute('data-codeblock')) {
          const index = parseInt(el.getAttribute('data-codeblock'), 10);
          const codeBlock = codeBlocks[index];
          if (codeBlock) {
            parts.push({
              type: 'codeblock',
              language: codeBlock.language,
              code: codeBlock.code,
              key: `code-${index}`,
            });
          }
          return;
        }
        
        // Handle image placeholders
        if (el.hasAttribute('data-postimage')) {
          const index = parseInt(el.getAttribute('data-postimage'), 10);
          const image = images?.[index];
          if (image) {
            parts.push({
              type: 'postimage',
              src: image.src,
              caption: image.caption,
              key: `image-${index}`,
            });
          }
          return;
        }

        // Handle footnote placeholders
        if (el.hasAttribute('data-footnote')) {
          const index = parseInt(el.getAttribute('data-footnote'), 10);
          const footnote = footnotes?.[index];
          if (footnote) {
            parts.push({
              type: 'footnote',
              content: footnote.html,
              index,
              key: `footnote-${index}`,
            });
          }
          return;
        }
      }
      
      // For other nodes, get the outer HTML
      if (node.nodeType === Node.ELEMENT_NODE) {
        parts.push({
          type: 'html',
          content: node.outerHTML,
          key: `html-${parts.length}`,
        });
      } else if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
        parts.push({
          type: 'html',
          content: node.textContent,
          key: `text-${parts.length}`,
        });
      }
    };
    
    body.childNodes.forEach(processNode);
    return parts;
  }, [html, codeBlocks, images]);

  return (
    <div ref={containerRef} className="post-body full-content">
      {contentParts.map((part) => {
        if (part.type === 'codeblock') {
          return (
            <CodeBlock
              key={part.key}
              code={part.code}
              language={part.language}
              maxLines={12}
            />
          );
        }
        if (part.type === 'postimage') {
          return (
            <PostImage
              key={part.key}
              src={part.src}
              caption={part.caption}
              onClick={onImageClick}
            />
          );
        }
        if (part.type === 'footnote') {
          return (
            <InlineFootnote
              key={part.key}
              index={part.index}
              content={part.content}
            />
          );
        }
        return (
          <div
            key={part.key}
            dangerouslySetInnerHTML={{ __html: part.content }}
          />
        );
      })}
    </div>
  );
};

const PostPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const postIndex = posts.findIndex((p) => p.slug === slug);
  const post = postIndex !== -1 ? posts[postIndex] : null;
  const [selectedImage, setSelectedImage] = useState(null);
  const { getTapProps } = useTapFeedback();

  // Posts are sorted newest first, so:
  // - "Previous" (older) = index + 1
  // - "Next" (newer) = index - 1
  const prevPost = postIndex !== -1 && postIndex < posts.length - 1 ? posts[postIndex + 1] : null;
  const nextPost = postIndex !== -1 && postIndex > 0 ? posts[postIndex - 1] : null;

  usePageTitle(
    post ? `${post.title} - Mohsin Ismail` : 'Post Not Found - Mohsin Ismail',
    { scrollToTop: true, scrollBehavior: 'auto' }
  );

  if (!post) {
    return (
      <div className="frame">
        <Header label="Mohsin Ismail" onLogoClick={() => navigate('/')} />
        <section className="panel">
          <div className="eyebrow">404</div>
          <h2>Post not found</h2>
          <Link to="/" className="btn outline">
            Return Home
          </Link>
        </section>
      </div>
    );
  }

  return (
    <div className="frame">
      <Header label="Mohsin Ismail" onLogoClick={() => navigate('/')} />

      <article className="panel post-page">
        <div className="post-page-head">
          <Link to="/" className="back-link" {...getTapProps()}>
            ← All Posts
          </Link>
          <div className="eyebrow">
            {(() => {
              const { datePart, timePart } = formatDateParts(post.date);
              return <>{datePart}<span className="eyebrow-dot">•</span>{timePart}</>;
            })()}
          </div>
          <h1 className="post-title">{post.title}</h1>
        </div>

        <PostContent
          html={post.content}
          codeBlocks={post.codeBlocks}
          images={post.images}
          footnotes={post.footnotes}
          onImageClick={setSelectedImage}
        />

        <div className="tag-row post-tags">
          {post.tags.map((tag) => (
            <Pill
              key={tag}
              size="small"
              onClick={() => navigate(`/blog?tag=${encodeURIComponent(tag)}`)}
            >
              #{tag}
            </Pill>
          ))}
        </div>

        <div className="post-footer">
          <nav className="post-nav">
            {prevPost ? (
              <Link to={`/posts/${prevPost.slug}`} className="post-nav-link post-nav-prev" {...getTapProps()}>
                <span className="post-nav-label">← Previous Post</span>
                <span className="post-nav-title">{prevPost.title}</span>
              </Link>
            ) : (
              <div className="post-nav-spacer" />
            )}
            {nextPost ? (
              <Link to={`/posts/${nextPost.slug}`} className="post-nav-link post-nav-next" {...getTapProps()}>
                <span className="post-nav-label">Next Post →</span>
                <span className="post-nav-title">{nextPost.title}</span>
              </Link>
            ) : (
              <div className="post-nav-spacer" />
            )}
          </nav>
        </div>
      </article>

      {/* Lightbox Modal */}
      <Lightbox
        src={selectedImage}
        alt="Full size view"
        onClose={() => setSelectedImage(null)}
      />

      <AboutPanel />
    </div>
  );
};

export default PostPage;



