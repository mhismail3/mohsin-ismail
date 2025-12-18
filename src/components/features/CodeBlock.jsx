import React, { useState, useMemo, useRef } from 'react';
import Prism from 'prismjs';

// Import additional languages
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-scss';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-shell-session';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-toml';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-graphql';
import 'prismjs/components/prism-diff';
import 'prismjs/components/prism-docker';
import 'prismjs/components/prism-git';

// Language alias mapping
const languageAliases = {
  js: 'javascript',
  ts: 'typescript',
  py: 'python',
  rb: 'ruby',
  sh: 'bash',
  shell: 'bash',
  zsh: 'bash',
  yml: 'yaml',
  dockerfile: 'docker',
  md: 'markdown',
};

const CodeBlock = ({ code, language = 'javascript', maxLines = 10 }) => {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const copyTimeoutRef = useRef(null);

  // Normalize language name
  const normalizedLanguage = useMemo(() => {
    const lang = (language || 'text').toLowerCase();
    return languageAliases[lang] || lang;
  }, [language]);

  const lines = useMemo(() => code.split('\n'), [code]);
  const totalLines = lines.length;
  const needsExpand = totalLines > maxLines;
  const lineLabel = totalLines === 1 ? 'line' : 'lines';

  const displayedCode = useMemo(() => {
    if (!needsExpand || expanded) return code;
    return lines.slice(0, maxLines).join('\n');
  }, [code, lines, maxLines, needsExpand, expanded]);

  // Apply syntax highlighting
  const highlightedCode = useMemo(() => {
    const grammar = Prism.languages[normalizedLanguage];
    if (grammar) {
      return Prism.highlight(displayedCode, grammar, normalizedLanguage);
    }
    // Fallback: escape HTML and return as-is for unknown languages
    return displayedCode
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }, [displayedCode, normalizedLanguage]);

  const handleCopy = async (e) => {
    e.stopPropagation();
    if (isAnimating) return;
    
    try {
      await navigator.clipboard.writeText(code);
      
      // Clear any existing timeout
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
      
      setIsAnimating(true);
      setCopied(true);
      
      copyTimeoutRef.current = setTimeout(() => {
        setCopied(false);
        setTimeout(() => setIsAnimating(false), 200);
      }, 1800);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  return (
    <div className="code-block">
      <div className="code-block-header">
        <span className="code-block-lang">{language.toUpperCase()}</span>
        <div className="code-block-actions">
          <span className="code-block-lines">
            {totalLines} {lineLabel}
          </span>
          <button
            type="button"
            className={`code-block-copy ${copied ? 'copied' : ''}`}
            onClick={handleCopy}
            aria-label="Copy code to clipboard"
          >
            <span className="copy-icon">
              {copied ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              )}
            </span>
            <span className="copy-text">{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>
      
      <div className={`code-block-content ${!expanded && needsExpand ? 'truncated' : ''}`}>
        <pre>
          <code
            className={`language-${normalizedLanguage}`}
            dangerouslySetInnerHTML={{ __html: highlightedCode }}
          />
        </pre>
        {!expanded && needsExpand && (
          <div className="code-block-fade" />
        )}
      </div>

      {needsExpand && (
        <button
          type="button"
          className="code-block-expand"
          onClick={() => setExpanded((prev) => !prev)}
        >
          {expanded ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="18 15 12 9 6 15" />
              </svg>
              Collapse
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
              Show all
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default CodeBlock;
