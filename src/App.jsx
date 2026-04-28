import React, { useEffect } from 'react';
import Layout from './components/Layout';
import OnboardingSetup from './components/OnboardingSetup';
import CatalogBrowser from './components/CatalogBrowser';
import AdminPortal from './components/AdminPortal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useAppLogic } from './hooks/useAppLogic';
import { Sparkles } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

/**
 * App component serves as the top-level orchestrator.
 * It uses the useAppLogic hook to manage business logic and state.
 */
export default function App() {
  const { state, actions } = useAppLogic();
  const { 
    authStatus, settings, loading, messages, sidebarWidth, isResizing,
    sessionId, sessions, isTyping, subjects, selectedSubjects, currentModel,
    usage, appMode, chatTone, canvasContent, isCanvasVisible, topics,
    suggestions, syncStatus, pdfViewer, pinnedItems, showCapWarning,
    showCatalog, showAdmin, isRefining, refineProgress, theme,
    gems
  } = state;

  const {
    setMessages, setIsResizing, setSidebarWidth, setSelectedSubjects, 
    setAppMode, setChatTone, setCanvasContent, setIsCanvasVisible, 
    setPdfViewer, setShowCapWarning, setShowCatalog, setShowAdmin,
    sendMessage, triggerSync, refineAllLibrary, loadSession, deleteSession, clearAllHistory,
    updateModel, handlePin, handleLogin, handleLogout, activateGem
  } = actions;

  // Global sidebar resize listener
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      const newWidth = Math.max(200, Math.min(600, e.clientX));
      setSidebarWidth(newWidth);
    };
    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    };
    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, setSidebarWidth, setIsResizing]);

  // Auth callback check
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('auth') === 'success') {
      window.history.replaceState({}, '', '/');
      window.location.reload(); // Refresh to pick up new tokens
    }
  }, []);

  if (loading) {
    return (
      <div className="onboarding-overlay">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-accent-indigo border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-text-secondary font-medium animate-pulse">Initializing System...</p>
        </div>
      </div>
    );
  }

  if (!authStatus.isAuthorized || !settings?.isConfigured) {
    return (
      <OnboardingSetup
        authStatus={authStatus}
        onComplete={() => window.location.reload()}
        API=""
      />
    );
  }


  return (
    <div className="h-screen w-screen overflow-hidden bg-bg-primary text-text-primary">
      <Layout
        sidebarWidth={sidebarWidth}
        isResizing={isResizing}
        onResizeStart={() => setIsResizing(true)}
        messages={messages}
        isTyping={isTyping}
        onSendMessage={sendMessage}
        sessions={sessions}
        activeSessionId={sessionId}
        onLoadSession={loadSession}
        onDeleteSession={deleteSession}
        onClearHistory={clearAllHistory}
        isClearingHistory={state.isClearingHistory}
        onNewChat={() => { setMessages([]); }}
        subjects={subjects}
        selectedSubjects={selectedSubjects}
        onSubjectsChange={setSelectedSubjects}
        onRefineAll={refineAllLibrary}
        currentModel={currentModel}
        onModelChange={updateModel}
        chatTone={chatTone}
        onToneChange={setChatTone}
        usage={usage}
        topics={topics}
        suggestions={suggestions}
        onTopicClick={sendMessage}
        onRefreshSuggestions={() => actions.loadAppData()}
        syncStatus={syncStatus}
        onSync={triggerSync}
        pdfViewer={pdfViewer}
        onOpenPdf={(id, p, f, t) => setPdfViewer(id ? { driveFileId: id, pageNum: p, filename: f, highlightText: t } : null)}
        onClosePdf={() => setPdfViewer(null)}
        settings={settings}
        authStatus={authStatus}
        onOpenCatalog={() => setShowCatalog(true)}
        onOpenAdmin={() => setShowAdmin(true)}
        onLogin={handleLogin}
        onLogout={handleLogout}
        appMode={appMode}
        onModeChange={setAppMode}
        canvasContent={canvasContent}
        isCanvasVisible={isCanvasVisible}
        onCanvasChange={setCanvasContent}
        onToggleCanvas={(c) => { 
          if (c) setCanvasContent(c); 
          setIsCanvasVisible(prev => !prev); 
        }}
        onOpenCanvas={(c) => {
          if (c) setCanvasContent(c);
          setIsCanvasVisible(true);
        }}
        pinnedItems={pinnedItems}
        onPin={handlePin}
        theme={theme}
        onThemeToggle={actions.toggleTheme}
        gems={gems}
        onActivateGem={activateGem}
      />

      <ErrorBoundary>
        {showAdmin && (
          <AdminPortal 
            key="admin-portal"
            isOpen={showAdmin} 
            onClose={() => setShowAdmin(false)} 
          />
        )}
      </ErrorBoundary>

      {isRefining && (
        <div className="fixed inset-0 z-[6000] flex items-center justify-center bg-black/80 backdrop-blur-2xl">
          <div className="bg-bg-secondary/40 backdrop-blur-md border border-glass-border p-8 rounded-2xl shadow-2xl max-w-sm w-full text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-accent-indigo/10 to-transparent pointer-events-none" />
            <Sparkles size={48} className="mx-auto text-accent-indigo animate-pulse mb-6 relative z-10" />
            <h3 className="text-xl font-bold mb-2 relative z-10">Refreshing Subjects</h3>
            <p className="text-sm text-text-muted mb-6 relative z-10">{refineProgress.currentFile}</p>
            <div className="h-2 w-full bg-bg-tertiary rounded-full overflow-hidden mb-8 border border-glass-border relative z-10">
              <div 
                className="h-full bg-primary-gradient shadow-[0_0_10px_rgba(99,102,241,0.5)] transition-all duration-500 ease-out" 
                style={{ width: `${(refineProgress.current / (refineProgress.total || 1)) * 100}%` }}
              />
            </div>
            <button 
              className="px-6 py-2 rounded-xl text-sm font-semibold border border-glass-border hover:bg-white/5 transition-all relative z-10 hover:border-accent-indigo/50"
              onClick={() => { window.refine_abort = true; }}
            >
              Abort Refinement
            </button>
          </div>
        </div>
      )}

      {showCapWarning && (
        <div className="fixed inset-0 z-[6000] flex items-center justify-center bg-black/60 backdrop-blur-xl">
          <div className="bg-bg-secondary/90 border border-accent-amber/30 p-8 rounded-2xl shadow-2xl max-w-sm w-full text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h3 className="text-xl font-bold mb-2">Spend Limit Reached</h3>
            <p className="text-sm text-text-secondary mb-8">
              You've used <strong>{usage?.percentage?.toFixed(1)}%</strong> of your monthly cap.
              Proceeding may incur extra costs.
            </p>
            <div className="flex gap-3">
              <button className="flex-1 px-4 py-2 rounded-xl border border-glass-border font-medium" onClick={() => setShowCapWarning(false)}>Cancel</button>
              <button className="flex-1 px-4 py-2 rounded-xl bg-accent-amber text-bg-primary font-bold shadow-lg shadow-accent-amber/20" onClick={() => setShowCapWarning(false)}>Proceed</button>
            </div>
          </div>
        </div>
      )}

      {showCatalog && (
        <CatalogBrowser 
          onClose={() => setShowCatalog(false)} 
          onOpenFile={(id, page, name) => {
            setShowCatalog(false);
            setPdfViewer({ driveFileId: id, pageNum: page, filename: name });
          }}
        />
      )}
    </div>
  );
}
