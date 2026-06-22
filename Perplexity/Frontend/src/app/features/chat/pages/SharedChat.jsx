import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { getSharedChat } from '../service/sharedChat.api.js';
import './SharedChat.scss';

const CodeBlock = ({ language, value }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="sc-code-block">
      <div className="sc-code-header">
        <span className="sc-lang">{language ? language.toUpperCase() : 'CODE'}</span>
        <button className="sc-copy-btn" onClick={handleCopy}>
          {copied ? 'Copied!' : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          )}
        </button>
      </div>
      <SyntaxHighlighter
        language={language || 'javascript'}
        style={vscDarkPlus}
        customStyle={{ margin: 0, padding: '16px', background: 'transparent', fontSize: '14px', lineHeight: '1.5' }}
        wrapLongLines={true}
      >
        {value}
      </SyntaxHighlighter>
    </div>
  );
};

const markdownComponents = {
  pre({ children }) {
    const codeEl = React.Children.toArray(children)[0];
    if (codeEl && codeEl.type === 'code') {
      const { className, children: codeText } = codeEl.props;
      const match = /language-(\w+)/.exec(className || '');
      return <CodeBlock language={match ? match[1] : ''} value={String(codeText).replace(/\n$/, '')} />;
    }
    return <pre>{children}</pre>;
  },
  img({ src, alt }) {
    if (!src) return null;
    return (
      <img
        src={src}
        alt={alt || ''}
        className="sc-md-img"
        loading="lazy"
        onError={(e) => { e.currentTarget.style.display = 'none'; }}
      />
    );
  },
};

const SharedChat = () => {
  const { sharedChatId } = useParams();
  const [sharedChat, setSharedChat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSharedChat = async () => {
      try {
        setLoading(true);
        const data = await getSharedChat(sharedChatId);
        setSharedChat(data.sharedChat);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load shared chat.');
      } finally {
        setLoading(false);
      }
    };

    fetchSharedChat();
  }, [sharedChatId]);

  if (loading) {
    return (
      <div className="sc-root">
        <div className="sc-state-wrapper">
          <div className="sc-spinner">
            <div className="sc-spinner-ring"></div>
          </div>
          <p className="sc-state-text">Loading shared conversation…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="sc-root">
        <div className="sc-state-wrapper">
          <div className="sc-error-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h2 className="sc-error-title">Chat not found</h2>
          <p className="sc-state-text">{error}</p>
          <Link to="/" className="sc-home-btn">Go to Nexora</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="sc-root">
      {/* Top bar */}
      <header className="sc-header">
        <div className="sc-header-inner">
          <div className="sc-brand">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            <span className="sc-brand-name">Nexora</span>
          </div>
          <div className="sc-header-right">
            <span className="sc-shared-badge">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
              Shared conversation
            </span>
            <Link to="/" className="sc-open-btn">Open Nexora</Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="sc-main">
        <div className="sc-chat-wrapper">
          {/* Title */}
          <div className="sc-chat-title-block">
            <h1 className="sc-chat-title">{sharedChat.title || 'Shared Conversation'}</h1>
            <p className="sc-chat-meta">
              Shared on {new Date(sharedChat.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* Messages */}
          <div className="sc-messages">
            {sharedChat.conversation.map((msg, idx) => (
              <div key={idx} className={`sc-message sc-message--${msg.role}`}>
                {msg.role === 'user' ? (
                  <div className="sc-user-bubble">
                    {msg.attachedImageUrl && (
                      <img className="sc-attached-img" src={msg.attachedImageUrl} alt="Attached" />
                    )}
                    <p className="sc-user-text">{msg.content}</p>
                  </div>
                ) : (
                  <div className="sc-ai-block">
                    <div className="sc-ai-avatar">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                      </svg>
                    </div>
                    <div className="sc-ai-content">
                      {msg.isImage && msg.imageUrl ? (
                        <div className="sc-gen-image-wrapper">
                          <img src={msg.imageUrl} alt={msg.prompt || 'Generated image'} className="sc-gen-image" />
                          {msg.prompt && <p className="sc-gen-image-caption">✨ {msg.prompt}</p>}
                        </div>
                      ) : (
                        <ReactMarkdown components={markdownComponents}>{msg.content}</ReactMarkdown>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Footer CTA */}
          <div className="sc-footer-cta">
            <p>Continue this conversation or start a new one</p>
            <Link to="/" className="sc-cta-btn">Start chatting on Nexora</Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SharedChat;
