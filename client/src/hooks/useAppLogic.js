import { useState, useEffect, useCallback } from 'react';

const API = '';

/**
 * Custom hook to manage the core application logic, state, and API interactions.
 * This follows the "Modular" rule to keep App.jsx focused on orchestration.
 */
export function useAppLogic() {
  const [authStatus, setAuthStatus] = useState({ authenticated: false });
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  // Chat state
  const [messages, setMessages] = useState([]);
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [isResizing, setIsResizing] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [gems, setGems] = useState([]);

  // Filter state
  const [subjects, setSubjects] = useState(null);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [currentModel, setCurrentModel] = useState('flash');

  // Usage state
  const [usage, setUsage] = useState(null);
  const [appMode, setAppMode] = useState('kb'); // 'kb' or 'general'
  const [chatTone, setChatTone] = useState('friendly');
  const [canvasContent, setCanvasContent] = useState(null);
  const [isCanvasVisible, setIsCanvasVisible] = useState(false);

  // Topic state
  const [topics, setTopics] = useState({});
  const [suggestions, setSuggestions] = useState([]);

  // Sync state
  const [syncStatus, setSyncStatus] = useState(null);

  // PDF viewer state
  const [pdfViewer, setPdfViewer] = useState(null);
  const [pinnedItems, setPinnedItems] = useState([]);

  // Modals
  const [showCapWarning, setShowCapWarning] = useState(false);
  const [pendingMessage, setPendingMessage] = useState(null);
  const [showCatalog, setShowCatalog] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [refineProgress, setRefineProgress] = useState({ current: 0, total: 0, currentFile: '' });
  const [isClearingHistory, setIsClearingHistory] = useState(false);

  // Theme state
  const [theme, setTheme] = useState(() => localStorage.getItem('app-theme') || 'dark');

  // Apply theme class to document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  }, []);

  const loadAppData = useCallback(async () => {
    try {
      const fetchJson = (url, defaultValue) => 
        fetch(`${API}${url}`)
          .then(r => {
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            return r.json();
          })
          .catch(err => {
            console.warn(`[API] Failed to load ${url}:`, err);
            return defaultValue;
          });

      const [subjectsRes, sessionsRes, usageRes, topicsRes, suggestionsRes, statusRes, canvasRes, pinsRes, gemsRes] = await Promise.all([
        fetchJson('/api/subjects', { name: 'All Subjects', children: [], documentCount: 0, path: '' }),
        fetchJson('/api/chat/history', []),
        fetchJson('/api/usage/summary', { month: { cost: 0 }, today: { cost: 0 }, percentage: 0 }),
        fetchJson('/api/subjects/topics', {}),
        fetchJson('/api/subjects/suggestions', []),
        fetchJson('/api/drive/status', { drive: { active: false }, indexing: { active: false } }),
        fetchJson('/api/settings/canvas', { content: null }),
        fetchJson('/api/notebook', []),
        fetchJson('/api/gems', [])
      ]);

      setSubjects(subjectsRes);
      setSessions(sessionsRes);
      setUsage(usageRes);
      setTopics(topicsRes);
      setSuggestions(suggestionsRes);
      setSyncStatus(statusRes);
      if (canvasRes && canvasRes.content) setCanvasContent(canvasRes.content);
      setPinnedItems(pinsRes || []);
      setGems(gemsRes || []);
    } catch (err) {
      console.error('Critical failure in loadAppData:', err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/auth/status`).then(r => r.json()),
      fetch(`${API}/api/settings`).then(r => r.json())
    ]).then(([auth, settings]) => {
      setAuthStatus(auth);
      setSettings(settings);
      if (settings.preferredModel) setCurrentModel(settings.preferredModel);
      setLoading(false);

      if (auth.authenticated && auth.isAuthorized && settings.isConfigured) {
        loadAppData();
      }
    }).catch(err => {
      console.error('Failed to load initial state:', err);
      setLoading(false);
    });
  }, [loadAppData]);

  const sendMessage = useCallback(async (text, forceModel, image = null) => {
    if (!text.trim() && !image) return;

    if (usage && usage.percentage >= 95) {
      setShowCapWarning(true);
      setPendingMessage(text);
      return;
    }

    const modelToUse = forceModel || currentModel;
    setMessages(prev => [...prev, { role: 'user', content: text, image }]);
    setIsTyping(true);

    try {
      const res = await fetch(`${API}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          sessionId,
          subjects: selectedSubjects,
          model: modelToUse,
          appMode: appMode,
          tone: chatTone,
          image: image
        })
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Server Error: ${res.status}`);
      }

      const data = await res.json();

      if (data.canvasUpdate) setCanvasContent(data.canvasUpdate);
      if (!sessionId && data.sessionId) setSessionId(data.sessionId);

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.response, 
        citations: data.citations || [],
        model: data.model,
        canvasUpdate: data.canvasUpdate,
        image: data.generatedImage
      }]);

      fetch(`${API}/api/usage/summary`).then(r => r.json()).then(setUsage);
      fetch(`${API}/api/chat/history`).then(r => r.json()).then(setSessions);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '❌ Failed to get a response. Please try again.',
        citations: [],
        model: null
      }]);
    }
    setIsTyping(false);
  }, [sessionId, selectedSubjects, currentModel, chatTone, usage, appMode]);

  const triggerSync = useCallback(async () => {
    try {
      await fetch(`${API}/api/drive/sync`, { method: 'POST' });
      const pollInterval = setInterval(async () => {
        const status = await fetch(`${API}/api/drive/status`).then(r => r.json());
        setSyncStatus(status);
        if (!status.drive.active && !status.indexing.active) {
          clearInterval(pollInterval);
          loadAppData();
        }
      }, 2000);
    } catch (err) {
      console.error('Sync failed:', err);
    }
  }, [loadAppData]);

  const refineAllLibrary = async () => {
    if (isRefining) return;
    try {
      setIsRefining(true);
      setRefineProgress({ current: 0, total: 0, currentFile: 'Checking for updates...' });
      const syncRes = await fetch(`${API}/api/drive/sync`, { method: 'POST' });
      let isIndexing = true;
      while (isIndexing) {
        if (window.refine_abort) break;
        const status = await fetch(`${API}/api/drive/status`).then(r => r.json());
        if (!status.indexing.active && !status.drive.active) isIndexing = false;
        else {
          setRefineProgress({ 
            current: status.indexing.current || 0,
            total: status.indexing.total || 1,
            currentFile: status.indexing.currentFile ? `Indexing: ${status.indexing.currentFile}...` : 'Indexing new books...'
          });
          await new Promise(r => setTimeout(r, 2000));
        }
      }
      if (window.refine_abort) { setIsRefining(false); window.refine_abort = false; return; }
      const catalog = await fetch(`${API}/api/drive/catalog`).then(r => r.json());
      const needsRefine = [];
      const extractIds = (node) => {
        if (node.type === 'file') {
          const isUncategorised = !node.subject || ['Uncategorised', 'Uncategorized', 'Library', 'General'].includes(node.subject);
          const isShallow = (node.subject || '').split(' / ').filter(p => p.trim() !== '').length < 2;
          if (isUncategorised || isShallow) needsRefine.push({ id: node.driveFileId, name: node.name });
        }
        if (node.children) node.children.forEach(extractIds);
      };
      extractIds(catalog);
      if (needsRefine.length === 0) { setIsRefining(false); await loadAppData(); return; }
      setRefineProgress({ current: 0, total: needsRefine.length, currentFile: 'Organising library...' });
      for (let i = 0; i < needsRefine.length; i++) {
        if (window.refine_abort) break;
        setRefineProgress(prev => ({ ...prev, currentFile: `Refining: ${needsRefine[i].name}...` }));
        await fetch(`${API}/api/drive/auto-categorise`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ driveFileIds: [needsRefine[i].id] })
        });
        setRefineProgress(prev => ({ ...prev, current: i + 1 }));
      }
      setIsRefining(false); window.refine_abort = false; await loadAppData(); 
    } catch (err) { console.error('Refinement failed:', err); setIsRefining(false); }
  };

  const loadSession = useCallback(async (id) => {
    try {
      const msgs = await fetch(`${API}/api/chat/history/${id}`).then(r => r.json());
      setSessionId(id);
      setMessages(msgs.map(m => ({
        role: m.role, content: m.content, citations: m.citations || [], model: m.model_used
      })));
    } catch (err) { console.error('Failed to load session:', err); }
  }, []);

  const deleteSession = useCallback(async (id) => {
    try {
      await fetch(`${API}/api/chat/history/${id}`, { method: 'DELETE' });
      setSessions(prev => prev.filter(s => s.id !== id));
      if (sessionId === id) { setSessionId(null); setMessages([]); }
    } catch (err) { console.error('Failed to delete session:', err); }
  }, [sessionId]);

  const clearAllHistory = useCallback(async () => {
    if (!window.confirm('Are you sure you want to delete ALL chat history? This cannot be undone.')) return;
    try {
      setIsClearingHistory(true);
      await fetch(`${API}/api/chat/history`, { method: 'DELETE' });
      // Simulate progress for UI feedback if it's too fast
      await new Promise(r => setTimeout(r, 800));
      setSessions([]);
      setSessionId(null);
      setMessages([]);
    } catch (err) { 
      console.error('Failed to clear history:', err); 
    } finally {
      setIsClearingHistory(false);
    }
  }, []);

  const updateModel = useCallback(async (model) => {
    setCurrentModel(model);
    await fetch(`${API}/api/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ preferredModel: model })
    });
  }, []);

  const handlePin = useCallback(async (citation) => {
    const isPinned = pinnedItems.some(p => p.drive_file_id === citation.driveFileId && p.page_num === citation.pageNum);
    const id = `${citation.driveFileId}_${citation.pageNum}`;
    if (isPinned) {
      setPinnedItems(prev => prev.filter(p => p.id !== id));
      await fetch(`${API}/api/notebook/pin/${id}`, { method: 'DELETE' });
    } else {
      const newPin = { id, drive_file_id: citation.driveFileId, filename: citation.filename, page_num: citation.pageNum, excerpt: citation.excerpt };
      setPinnedItems(prev => [newPin, ...prev]);
      await fetch(`${API}/api/notebook/pin`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newPin) });
    }
  }, [pinnedItems]);

  const handleLogin = async () => {
    const data = await fetch(`${API}/api/auth/url`).then(r => r.json());
    if (data.url) window.location.href = data.url;
  };

  const handleLogout = async () => {
    await fetch(`${API}/api/auth/logout`, { method: 'POST' });
    setAuthStatus({ authenticated: false });
    await loadAppData();
  };

  const activateGem = useCallback(async (id) => {
    try {
      await fetch(`${API}/api/gems/activate/${id}`, { method: 'POST' });
      const gemsRes = await fetch(`${API}/api/gems`).then(r => r.json());
      setGems(gemsRes);
    } catch (err) { console.error('Failed to activate gem:', err); }
  }, []);

  return {
    state: {
      authStatus, settings, loading, messages, sidebarWidth, isResizing,
      sessionId, sessions, isTyping, subjects, selectedSubjects, currentModel,
      usage, appMode, chatTone, canvasContent, isCanvasVisible, topics,
      suggestions, syncStatus, pdfViewer, pinnedItems, showCapWarning,
      pendingMessage, showCatalog, showAdmin, isRefining, refineProgress, theme,
      gems, isClearingHistory
    },
    actions: {
      setAuthStatus, setSettings, setLoading, setMessages, setSidebarWidth,
      setIsResizing, setSessionId, setSessions, setIsTyping, setSubjects,
      setSelectedSubjects, setCurrentModel, setUsage, setAppMode, setChatTone,
      setCanvasContent, setIsCanvasVisible, setTopics, setSuggestions,
      setSyncStatus, setPdfViewer, setPinnedItems, setShowCapWarning,
      setPendingMessage, setShowCatalog, setShowAdmin, setIsRefining,
      setRefineProgress, loadAppData, sendMessage, triggerSync,
      refineAllLibrary, loadSession, deleteSession, clearAllHistory, updateModel, handlePin,
      handleLogin, handleLogout, toggleTheme, activateGem
    }
  };
}
