import React, { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import ReactMarkdown from "react-markdown";
import { useChat } from "../hooks/useChat";
import { setCurrentChatId,  setSuggestions, } from "../chat.slice";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import "./Dashboard.scss";
import axios from "axios";
import { getImages, uploadImage } from "../service/chat.api.js";
const CodeBlock = ({ language, value }) => {
  const [copied, setCopied] = useState(false);
 
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <div className="custom-code-block">
      <div className="code-block-header">
        <div className="header-left">
          <svg className="code-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="16 18 22 12 16 6"></polyline>
            <polyline points="8 6 2 12 8 18"></polyline>
          </svg>
          <span className="lang-name">{language ? language.toUpperCase() : "CODE"}</span>
        </div>
        <div className="header-right">
          <button className="code-btn" title="View Source">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="16 18 22 12 16 6"></polyline>
              <polyline points="8 6 2 12 8 18"></polyline>
            </svg>
          </button>
          <button className="run-btn" title="Run Code">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
          </button>
          <button className="copy-btn" onClick={handleCopy} title="Copy Code">
            {copied ? (
              <span className="copied-text">Copied!</span>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
            )}
          </button>
        </div>
      </div>
      <div className="code-block-body">
        <SyntaxHighlighter
          language={language || "javascript"}
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            padding: 0,
            background: "transparent",
            fontSize: "14px",
            lineHeight: "1.5",
          }}
          wrapLongLines={true}
        >
          {value}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

const InteractiveImage = ({ src, alt, onZoom }) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setImgSrc(src);
    setFailed(false);
  }, [src]);

  const handleError = () => {
    if (!failed) {
      setFailed(true);
      const stopWords = new Set(["generate", "image", "draw", "create", "of", "a", "an", "the", "and", "in", "on", "with", "for", "at", "by", "to", "show", "me", "photo", "picture", "artwork", "painting", "realistic", "detailed"]);
      const words = (alt || "artwork")
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .split(/\s+/)
        .filter(w => w && !stopWords.has(w));
      const keywords = words.slice(0, 3).join(",");
      setImgSrc(`https://loremflickr.com/800/800/${encodeURIComponent(keywords || "artwork")}/all`);
    }
  };

  if (!src) return null;

  return (
    <div className="premium-image-wrapper">
      <div className="premium-image-card">
        <img 
          src={imgSrc} 
          alt={alt || "Generated Image"} 
          onError={handleError}
          loading="lazy"
        />
        <div className="premium-image-overlay">
          <div className="overlay-actions">
            <button 
              type="button"
              className="img-action-btn zoom-btn" 
              title="Zoom Image"
              onClick={() => onZoom({ src: imgSrc, alt })}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                <line x1="11" y1="8" x2="11" y2="14"></line>
                <line x1="8" y1="11" x2="14" y2="11"></line>
              </svg>
            </button>
            <button 
              type="button"
              className="img-action-btn download-btn" 
              title="Download Image"
              onClick={() => {
                const link = document.createElement("a");
                link.href = imgSrc;
                link.download = `generated_image_${Date.now()}.jpg`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
            </button>
          </div>
        </div>
      </div>
      {alt && <p className="premium-image-caption">✨ {alt}</p>}
    </div>
  );
};

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [inputText, setInputText] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] =
  useState(false);
   const [showSuggestions, setShowSuggestions] = useState(false);
  const [isImageMode, setIsImageMode] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [attachedImage, setAttachedImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = React.useRef(null);
  const chats = useSelector((state) => state.chat.chats);
  const isLoading = useSelector((state) => state.chat.isLoading);
  const { user } = useSelector((state) => state.auth) || { user: null };
  const dispatch = useDispatch();
const suggestions = useSelector(
  (state) => state.chat.suggestions
);
  const {
    handleGetChat,
    handleGetMessages,
    initializeSocketConnection,
    handleSendMessage,
  } = useChat();
  const currentChatId = useSelector((state) => state.chat.currentChatId);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }
    try {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = reader.result;
        try {
          const res = await uploadImage(base64Data);
          setAttachedImage(res.url);
        } catch (uploadErr) {
          console.error("Image upload failed:", uploadErr);
          alert("Image upload failed. Please try again.");
        } finally {
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("File reading failed:", err);
      setIsUploading(false);
    }
  };

  const renderImagePreview = () => {
    if (!attachedImage && !isUploading) return null;
    return (
      <div className="attached-image-preview-container">
        {isUploading ? (
          <div className="attached-image-spinner">
            <div className="spinner-dot"></div>
            <span>Uploading...</span>
          </div>
        ) : (
          <div className="attached-image-card">
            <img src={attachedImage} alt="Uploaded attachment" />
            <button 
              type="button" 
              className="remove-attached-btn" 
              onClick={() => {
                setAttachedImage(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                }
              }}
              title="Remove image"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        )}
      </div>
    );
  };
  const [activeTab, setActiveTab] = useState("answer");
  const [allGeneratedImages, setAllGeneratedImages] = useState([]);
  const [loadingImages, setLoadingImages] = useState(false);

  const currentChat = chats[currentChatId];


 

const handleDownloadChat = () => {
  if (!currentChat?.messages?.length) return;

  const content = currentChat.messages
    .map((msg) => {
      const role = msg.role === "user" ? "USER" : "NEXORA";

      return `${role}:\n${msg.content || "[Image Message]"}`;
    })
    .join("\n\n-----------------------------------\n\n");

  const blob = new Blob([content], {
    type: "text/plain;charset=utf-8",
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `${currentChat.title || "nexora-chat"}.txt`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};
  const generatedImages = useMemo(() => {
    if (!currentChat || !Array.isArray(currentChat.messages)) return [];
    return currentChat.messages.filter(msg => msg.role === "ai" && msg.isImage && msg.imageUrl);
  }, [currentChat]);

  useEffect(() => {
    setActiveTab("answer");
  }, [currentChatId]);

  useEffect(() => {
    if (activeTab === "images") {
      const fetchImages = async () => {
        try {
          setLoadingImages(true);
          const data = await getImages();
          setAllGeneratedImages(data.images || []);
        } catch (err) {
          console.error("Failed to fetch image library:", err);
        } finally {
          setLoadingImages(false);
        }
      };
      fetchImages();
    }
  }, [activeTab]);

  const markdownComponents = useMemo(() => ({
    pre({ children }) {
      const codeElement = React.Children.toArray(children)[0];
      if (codeElement && codeElement.type === "code") {
        const { className, children: codeText } = codeElement.props;
        const match = /language-(\w+)/.exec(className || "");
        const language = match ? match[1] : "";
        return (
          <CodeBlock
            language={language}
            value={String(codeText).replace(/\n$/, "")}
          />
        );
      }
      return <pre>{children}</pre>;
    },
    p({ children, ...props }) {
      const hasBlock = React.Children.toArray(children).some(
        (child) =>
          React.isValidElement(child) &&
          (child.type === "img" ||
            child.props?.src !== undefined ||
            typeof child.type === "function" ||
            child.type === "div" ||
            child.type === "p")
      );
      if (hasBlock) {
        return <div {...props}>{children}</div>;
      }
      return <p {...props}>{children}</p>;
    },
    img({ node, src, alt, ...props }) {
      return (
        <InteractiveImage 
          src={src} 
          alt={alt} 
          onZoom={(imgData) => setSelectedImage(imgData)} 
        />
      );
    }
  }), [setSelectedImage]);

  useEffect(() => {
    handleGetChat();
  }, []);

  useEffect(() => {
    initializeSocketConnection?.();
  }, []);
  const handleSend = (e) => {
    if (e) e.preventDefault();
    if (isLoading) return;

    const trimmedMessage = inputText.trim();

    if (!trimmedMessage && !attachedImage) return;

    setHasSearched(true);
    setInputText("");

    const wasImageMode = isImageMode;
    setIsImageMode(false);

    const imageToSend = attachedImage;
    setAttachedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    handleSendMessage({
      message: trimmedMessage || (wasImageMode ? "Generate image" : "Analyze this image"),
      chatId: currentChatId,
      isImage: wasImageMode,
      attachedImageUrl: imageToSend,
    });
  };
 const fetchSuggestions = async () => {
  try {
    setLoadingSuggestions(true);

    const res = await axios.get(
      "http://localhost:3000/api/chats/suggestions"
    );

  dispatch(
  setSuggestions(res.data.suggestions)
);

 setShowSuggestions(true);
  } catch (err) {
    console.log(err);
  } finally {
    setLoadingSuggestions(false);
  }
};
  return (
    <div className="dashboard">
      <input 
        type="file" 
        accept="image/*" 
        ref={fileInputRef} 
        style={{ display: "none" }} 
        onChange={handleFileChange} 
      />
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      <aside className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
        <div className="sidebar-top">
          <div className="logo-container">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            <button
              className="sidebar-toggle"
              onClick={() => setIsSidebarOpen(false)}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <line x1="9" y1="3" x2="9" y2="21" />
              </svg>
            </button>
          </div>

          <div className="new-thread-btn-wrapper">
            <button
              className="new-thread-btn"
              onClick={() => {
                setHasSearched(false);
                setInputText("");

              
                dispatch(setCurrentChatId(null));
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>New</span>
            </button>
          </div>
          <div className="history-section">
            <div className="history-list">
              {Object.values(chats)
                .sort((a, b) => new Date(b.lastUpdated || 0) - new Date(a.lastUpdated || 0))
                .map((chat) => (
                <div
                  key={chat.id}
                  className={`history-item ${
                    currentChatId === chat.id ? "active" : ""
                  }`}
                  onClick={async () => {
                    setHasSearched(true);

                    await handleGetMessages(chat.id);
                  }}
                >
                  <span>{chat.title}</span>
                  <button
                    className="more-btn"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <circle cx="12" cy="12" r="1" />
                      <circle cx="19" cy="12" r="1" />
                      <circle cx="5" cy="12" r="1" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="sidebar-bottom">
          <div className="user-profile">
            <div className="user-info">
              <div className="avatar">
                <div className="status-dot"></div>
              </div>
              <span className="username">darjinisar49428</span>
            </div>
          </div>
        </div>
      </aside>

      <main
        className={`main-content ${!hasSearched ? "landing-page" : "chat-page"}`}
      >
        {!hasSearched ? (
          <header className="top-bar landing-top-bar">
            <div className="mobile-header-left">
              <button
                className="hamburger-btn"
                onClick={() => setIsSidebarOpen(true)}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>
            </div>

            <div className="top-nav-links">
              <button className="nav-link">Discover</button>
              <button className="nav-link">Finance</button>
              <button className="nav-link">Health</button>
              <button className="nav-link">Academic</button>
              <button className="nav-link">Patents</button>
            </div>
            <div className="header-actions">
              <button className="scheduled-btn">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                Scheduled
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              <button className="icon-btn">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="11" width="18" height="10" rx="2" />
                  <circle cx="12" cy="5" r="2" />
                  <path d="M12 7v4" />
                  <line x1="8" y1="16" x2="8" y2="16" />
                  <line x1="16" y1="16" x2="16" y2="16" />
                </svg>
              </button>
            </div>
          </header>
        ) : (
          <header className="top-bar chat-top-bar">
            <div className="mobile-header-left">
              <button
                className="hamburger-btn"
                onClick={() => setIsSidebarOpen(true)}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>
            </div>
            <div className="tabs">
              <button 
                className={`tab ${activeTab === "answer" ? "active" : ""}`}
                onClick={() => setActiveTab("answer")}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                  <line x1="12" y1="22.08" x2="12" y2="12" />
                </svg>
                Answer
              </button>
              <button 
                className={`tab ${activeTab === "images" ? "active" : ""}`}
                onClick={() => setActiveTab("images")}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                Images
              </button>
            </div>
            <div className="header-actions">
              <button className="action-btn">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="1" />
                  <circle cx="19" cy="12" r="1" />
                  <circle cx="5" cy="12" r="1" />
                </svg>
              </button>
              <button className="action-btn share-btn">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
                Share
              </button>
              <button className="action-btn download-btn"
               onClick={handleDownloadChat}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Download Comet
              </button>
            </div>
          </header>
        )}

        {!hasSearched ? (
          <div className="hero-section">
            <h1 className="main-logo">Nexora</h1>

            <div className="search-box-container">
              {renderImagePreview()}
              <textarea
                placeholder={isImageMode ? "Describe the image you want to generate..." : "Type @ for connectors and sources"}
                rows="1"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(e);
                  }
                }}
              ></textarea>
              <div className="search-controls">
                <div className="left-controls">
                  <button type="button" className="add-btn" onClick={() => fileInputRef.current?.click()}>
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </button>
                  <button type="button" className="computer-btn">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                      <line x1="8" y1="21" x2="16" y2="21" />
                      <line x1="12" y1="17" x2="12" y2="21" />
                    </svg>
                    Computer
                    <span className="plus-small">+</span>
                  </button>
                  <button 
                    type="button" 
                    className={`image-mode-btn ${isImageMode ? "active" : ""}`}
                    onClick={() => setIsImageMode(!isImageMode)}
                    title="Toggle Image Generation Mode"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                    <span>Generate Image</span>
                  </button>
                </div>
                <div className="right-controls">
                  <button className="model-selector">
                    Model
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                  <button className="mic-btn">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                      <line x1="12" y1="19" x2="12" y2="23" />
                      <line x1="8" y1="23" x2="16" y2="23" />
                    </svg>
                  </button>
                  <button
                    className={`submit-btn ${inputText.trim() && !isLoading ? "active" : "disabled"}`}
                    disabled={!inputText.trim() || isLoading}
                    onClick={handleSend}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="22" y1="2" x2="11" y2="13"></line>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
 <button
  className="show-suggestions"
  onClick={() => {
    if (showSuggestions) {
      setShowSuggestions(false);
    } else {
      fetchSuggestions();
    }
  }}
  disabled={loadingSuggestions}
>
  {loadingSuggestions
    ? "Loading..."
    : showSuggestions
    ? "Close suggestions"
    : "Show suggestions"}
</button>

{
  loadingSuggestions && (
    <div className="skeleton-container">
      <div className="skeleton-card"></div>
      <div className="skeleton-card"></div>
      <div className="skeleton-card"></div>
      <div className="skeleton-card"></div>
      <div className="skeleton-card"></div>
    </div>
  )
}

{
  showSuggestions &&
  !loadingSuggestions &&
  suggestions.length > 0 && (
    <div className="suggestions-container">
      {suggestions.map((item, index) => (
        <div
          key={index}
          className="suggestion-card"
          onClick={() => setInputText(item)}
        >
          {item}
        </div>
      ))}
    </div>
  )
}
          </div>
             
        ) : (
          <>
            {activeTab === "answer" ? (
              <div className="chat-container">
                {chats[currentChatId]?.messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`message ${
                      msg.role === "user" ? "user-message" : "bot-message"
                    }`}
                  >
                    <div className={msg.role === "user" ? "bubble" : "content"}>
                      {msg.role === "user" ? (
                        <div className="user-message-content">
                          {msg.attachedImageUrl && (
                            <div className="user-attached-image">
                              <img 
                                src={msg.attachedImageUrl} 
                                alt="User attachment" 
                                onClick={() => setSelectedImage({ src: msg.attachedImageUrl, alt: "User attachment" })}
                                style={{ cursor: "pointer", maxWidth: "200px", borderRadius: "8px", marginBottom: "8px", display: "block" }}
                              />
                            </div>
                          )}
                          {msg.content && <p>{msg.content}</p>}
                        </div>
                      ) : msg.isImage ? (
                        <InteractiveImage
                          src={msg.imageUrl}
                          alt={msg.prompt}
                          onZoom={(imgData) => setSelectedImage(imgData)}
                        />
                      ) : (
                        <ReactMarkdown components={markdownComponents}>
                          {msg.content}
                        </ReactMarkdown>
                      )}
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="message bot-message">
                    <div className="content thinking">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="images-gallery-container">
                <div className="gallery-header">
                  <h2>Generated Images</h2>
                  <span className="image-count">
                    {loadingImages 
                      ? "Loading..." 
                      : `${allGeneratedImages.length} ${allGeneratedImages.length === 1 ? "image" : "images"}`}
                  </span>
                </div>
                {loadingImages ? (
                  <div className="premium-gallery-grid">
                    <div className="premium-image-card skeleton-card" style={{ height: "240px" }}></div>
                    <div className="premium-image-card skeleton-card" style={{ height: "240px" }}></div>
                    <div className="premium-image-card skeleton-card" style={{ height: "240px" }}></div>
                  </div>
                ) : allGeneratedImages.length > 0 ? (
                  <div className="premium-gallery-grid">
                    {allGeneratedImages.map((img, idx) => (
                      <InteractiveImage
                        key={idx}
                        src={img.imageUrl}
                        alt={img.prompt}
                        onZoom={(imgData) => setSelectedImage(imgData)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="empty-gallery">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="empty-icon">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                    <p>No images generated in your account yet.</p>
                    <span>Use the "Generate Image" toggle below to create artworks!</span>
                  </div>
                )}
              </div>
            )}

            <div className="input-area">
              {renderImagePreview()}
              <div className="input-wrapper">
                <button type="button" className="add-btn" onClick={() => fileInputRef.current?.click()}>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </button>
                <input
                  type="text"
                  placeholder={isImageMode ? "Describe the image you want to generate..." : "Ask a follow-up"}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                />
                <div className="input-controls">
                  <button 
                    type="button" 
                    className={`image-mode-btn ${isImageMode ? "active" : ""}`}
                    onClick={() => setIsImageMode(!isImageMode)}
                    title="Toggle Image Generation Mode"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                    <span>Generate Image</span>
                  </button>
                  <button type="button" className="model-selector">
                    Model
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                  <button className="mic-btn">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                      <line x1="12" y1="19" x2="12" y2="23" />
                      <line x1="8" y1="23" x2="16" y2="23" />
                    </svg>
                  </button>
                  <button
                    className={`submit-btn ${inputText.trim() && !isLoading ? "active" : "disabled"}`}
                    disabled={!inputText.trim() || isLoading}
                    onClick={handleSend}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="22" y1="2" x2="11" y2="13"></line>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div className="image-lightbox-modal" onClick={() => setSelectedImage(null)}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img src={selectedImage.src} alt={selectedImage.alt} />
            <button type="button" className="close-lightbox" onClick={() => setSelectedImage(null)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            <div className="lightbox-caption">
              <span>{selectedImage.alt || "Generated Image"}</span>
              <button 
                type="button"
                className="lightbox-download-btn"
                onClick={() => {
                  const link = document.createElement("a");
                  link.href = selectedImage.src;
                  link.download = `generated_image_${Date.now()}.jpg`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
