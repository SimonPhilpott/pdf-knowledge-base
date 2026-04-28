import React, { useState, useEffect } from 'react';
import { Library, User, Settings, Menu, Compass, X } from 'lucide-react';
import Sidebar from './Sidebar';
import ChatInterface from './ChatInterface';
import TopicDiscovery from './TopicDiscovery';
import ModelSwitcher from './ModelSwitcher';
import TokenUsageMeter from './TokenUsageMeter';
import SyncStatus from './SyncStatus';
import PDFWorkspace from './PDFWorkspace';
import Canvas from './Canvas';
import ToneSwitcher from './ToneSwitcher';
import ThemeToggle from './ThemeToggle';
import GemSelector from './GemSelector';

export default function Layout({
  messages, isTyping, onSendMessage,
  sessions, activeSessionId, onLoadSession, onDeleteSession, onClearHistory, onNewChat,
  subjects, selectedSubjects, onSubjectsChange,
  currentModel, onModelChange,
  usage,
  topics, suggestions, onTopicClick, onRefreshSuggestions,
  syncStatus, onSync,
  pdfViewer, onOpenPdf, onClosePdf,
  settings, authStatus,
  onOpenCatalog, onRefineAll,
  onOpenAdmin,
  sidebarWidth, isResizing, onResizeStart,
  onLogin, onLogout,
  appMode, onModeChange,
  canvasContent, onCanvasChange, isCanvasVisible, onToggleCanvas, onOpenCanvas,
  pinnedItems, onPin,
  chatTone, onToneChange,
  theme, onThemeToggle,
  gems, onActivateGem,
  isClearingHistory
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isTopicsOpen, setIsTopicsOpen] = useState(false);
  const [isStatusExpanded, setIsStatusExpanded] = useState(false);
  
  // PDF Pane state
  const [pdfWidth, setPdfWidth] = useState(window.innerWidth * 0.45);
  const [isResizingPdf, setIsResizingPdf] = useState(false);

  // Close sidebars on resize if moving back to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsSidebarOpen(false);
        setIsStatusExpanded(true); // Default expanded on desktop
      } else {
        setIsStatusExpanded(false); // Closed on mobile
      }
    };
    window.addEventListener('resize', handleResize);
    // Set initial state
    if (window.innerWidth > 768) setIsStatusExpanded(true);
    else setIsStatusExpanded(false);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // PDF Pane Resize Logic
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizingPdf) return;
      const newWidth = window.innerWidth - e.clientX;
      // Constraint: Between 300px and 80% of screen
      setPdfWidth(Math.max(300, Math.min(window.innerWidth * 0.8, newWidth)));
    };
    const handleMouseUp = () => {
      setIsResizingPdf(false);
      document.body.style.cursor = 'default';
    };
    if (isResizingPdf) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizingPdf]);

  return (
    <div className="app-layout">
      {/* Mobile Overlays */}
      {(isSidebarOpen || isTopicsOpen) && (
        <div
          className="mobile-overlay"
          onClick={() => { setIsSidebarOpen(false); setIsTopicsOpen(false); }}
        />
      )}

      {/* Top Bar */}
      <header className="app-topbar">
        <div className="app-topbar-left">
          <button className="mobile-toggle-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <Menu size={20} />
          </button>
          <div className="app-logo">
            <Library className="app-logo-icon" size={20} />
            <span className="logo-text">Knowledge Base</span>
          </div>
          <div className="desktop-only-flex">
            <ToneSwitcher current={chatTone} onChange={onToneChange} />
            <GemSelector gems={gems} onSelect={onActivateGem} compact={true} />
          </div>
        </div>
        <div className="app-topbar-right">
          <div className="desktop-only-flex">
            <ModelSwitcher current={currentModel} onChange={onModelChange} />
            <TokenUsageMeter usage={usage} />
          </div>
          <button
            className="mobile-toggle-btn topic-toggle-btn"
            onClick={() => setIsTopicsOpen(!isTopicsOpen)}
          >
            <Compass size={20} />
          </button>
          <button
            className="settings-cog-btn"
            title="System Administration"
            onClick={onOpenAdmin}
          >
            <Settings size={18} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="app-main">
        <div className={`sidebar-wrapper ${isSidebarOpen ? 'mobile-open' : ''}`}>
          <Sidebar
            width={sidebarWidth}
            subjects={subjects}
            selectedSubjects={selectedSubjects}
            onSubjectsChange={onSubjectsChange}
            sessions={sessions}
            activeSessionId={activeSessionId}
            onLoadSession={onLoadSession}
            onDeleteSession={onDeleteSession}
            onClearHistory={onClearHistory}
            isClearingHistory={isClearingHistory}
            onNewChat={onNewChat}
            onOpenCatalog={onOpenCatalog}
            onRefineAll={onRefineAll}
            appMode={appMode}
            onModeChange={onModeChange}
            pinnedItems={pinnedItems}
            onPin={onPin}
            onOpenPdf={onOpenPdf}
            chatTone={chatTone}
            onToneChange={onToneChange}
            theme={theme}
            onThemeToggle={onThemeToggle}
            currentModel={currentModel}
            onModelChange={onModelChange}
            usage={usage}
            gems={gems}
            onActivateGem={onActivateGem}
          />
        </div>

        <div
          className={`sidebar-resizer ${isResizing ? 'active' : ''}`}
          onMouseDown={onResizeStart}
        />

        <div className="main-content-wrapper" style={{ 
          display: 'flex', 
          flex: 1, 
          overflow: 'hidden', 
          height: '100%',
          position: 'relative'
        }}>
          <div style={{ flex: 1, minWidth: 0, height: '100%', transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}>
            <ChatInterface
              messages={messages}
              isTyping={isTyping}
              onSendMessage={onSendMessage}
              onOpenPdf={onOpenPdf}
              suggestions={suggestions}
              onTopicClick={onTopicClick}
              appMode={appMode}
              onToggleCanvas={onToggleCanvas}
              onOpenCanvas={onOpenCanvas}
              onPin={onPin}
              pinnedItems={pinnedItems}
            />
          </div>

          {pdfViewer && (
            <div style={{ display: 'flex', height: '100%', animation: 'slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}>
              <div 
                className={`pdf-pane-resizer ${isResizingPdf ? 'active' : ''}`}
                onMouseDown={() => setIsResizingPdf(true)}
              />
              <div style={{ 
                width: pdfWidth, 
                height: '100%', 
                flexShrink: 0, 
                background: 'var(--bg-primary)',
                borderLeft: '1px solid var(--glass-border)',
                boxShadow: '-10px 0 40px rgba(0,0,0,0.5)',
                zIndex: 50,
                overflow: 'hidden'
              }}>
                <PDFWorkspace
                  driveFileId={pdfViewer.driveFileId}
                  initialPage={pdfViewer.pageNum}
                  filename={pdfViewer.filename}
                  highlightText={pdfViewer.highlightText}
                  onClose={() => onClosePdf()} 
                />
              </div>
            </div>
          )}

          {isCanvasVisible && (
            <Canvas
              content={canvasContent}
              onUpdate={onCanvasChange}
              onClose={() => onToggleCanvas(null)}
            />
          )}
        </div>

        {!pdfViewer && (
          <div className={`topic-discovery-wrapper ${isTopicsOpen ? 'mobile-open' : ''}`}>
            <TopicDiscovery
              topics={topics}
              suggestions={suggestions}
              onTopicClick={onTopicClick}
              onRefresh={onRefreshSuggestions}
            />
          </div>
        )}
      </div>

      {/* Status Bar */}
      <footer className={`app-statusbar ${isStatusExpanded ? 'expanded' : 'collapsed'}`}>
        <button
          className="mobile-status-toggle"
          onClick={() => setIsStatusExpanded(!isStatusExpanded)}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--status-green)' }} />
            <span>System Status</span>
          </div>
        </button>

        <div className="statusbar-content">
          {/* Full stats (hidden on mobile when compact row is used elsewhere?) No, keep it. */}
          <div className="mobile-full-width">
            <SyncStatus syncStatus={syncStatus} onSync={onSync} />
          </div>

          {authStatus?.authenticated ? (
            <div className="status-item user-info-item">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span className="user-email" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  color: authStatus.authError ? 'var(--status-red)' : 'inherit'
                }}>
                  <User size={12} className={authStatus.authError ? '' : 'text-accent'} />
                  {authStatus.email}
                </span>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <SyncStatus syncStatus={syncStatus} onSync={onSync} compact={true} />
                  <button className="auth-btn logout" onClick={onLogout}>Logout</button>
                </div>
              </div>
            </div>
          ) : (
            <div className="status-item" style={{ marginLeft: 'auto' }}>
              <button className="auth-btn login" onClick={onLogin}>
                <User size={12} />
                Login with Google
              </button>
            </div>
          )}
        </div>
      </footer>

    </div>
  );
}
