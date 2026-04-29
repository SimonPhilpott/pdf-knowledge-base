import { Sparkles, Library, Bookmark, Trash2, FileText } from 'lucide-react';
import SubjectFilter from './SubjectFilter';
import ChatHistory from './ChatHistory';
import ToneSwitcher from './ToneSwitcher';
import ThemeToggle from './ThemeToggle';
import ModelSwitcher from './ModelSwitcher';
import TokenUsageMeter from './TokenUsageMeter';
import GemSelector from './GemSelector';

export default function Sidebar({
  subjects, selectedSubjects, onSubjectsChange, onRefineAll,
  sessions, activeSessionId, onLoadSession, onDeleteSession, onClearHistory, onNewChat,
  onOpenCatalog, width,
  appMode, onModeChange,
  pinnedItems = [], onPin, onOpenPdf,
  chatTone, onToneChange,
  theme, onThemeToggle,
  currentModel, onModelChange,
  usage,
  gems, onActivateGem,
  isClearingHistory
}) {
  return (
    <aside className="sidebar" style={{ width: `${width}px`, overflowY: 'auto' }}>
      <div className="sidebar-section">
        <ThemeToggle theme={theme} onToggle={onThemeToggle} />
      </div>

      <div className="sidebar-section">
        <div className="mode-switcher">
          <div
            className={`mode-item ${appMode === 'kb' ? 'active' : ''}`}
            onClick={() => onModeChange('kb')}
          >
            <Library size={14} fill="none" stroke="currentColor" />
            <span>Library</span>
          </div>
          <div
            className={`mode-item ${appMode === 'general' ? 'active' : ''}`}
            onClick={() => onModeChange('general')}
          >
            <Sparkles size={14} fill="none" stroke="currentColor" />
            <span>Gemini</span>
          </div>
        </div>
      </div>

      <div className="sidebar-section">
        <button className="new-chat-btn" onClick={onNewChat} id="new-chat-btn" style={{ width: '100%', marginBottom: '8px' }}>
          <Sparkles size={14} fill="none" stroke="currentColor" />
          <span>New Chat</span>
        </button>

        <button className="sidebar-action-btn" onClick={onOpenCatalog} style={{ width: '100%' }}>
          <Library size={14} fill="none" stroke="currentColor" />
          <span>Browse Library</span>
        </button>
      </div>

      {appMode === 'kb' && (
        <div className="sidebar-section">
          <SubjectFilter
            subjects={subjects}
            selected={selectedSubjects}
            onChange={onSubjectsChange}
            onRefineAll={onRefineAll}
          />
        </div>
      )}

      <div className="sidebar-section">
        <ChatHistory
          sessions={sessions}
          activeId={activeSessionId}
          onLoad={onLoadSession}
          onDelete={onDeleteSession}
          onClearAll={onClearHistory}
          isClearing={isClearingHistory}
        />
      </div>

      {pinnedItems.length > 0 && (
        <div className="sidebar-section" style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '16px' }}>
          <div className="sidebar-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Bookmark size={12} className="text-accent" />
            <span>Pinned Rules</span>
          </div>
          <div className="pinned-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {pinnedItems.map(pin => (
              <div key={pin.id} className="pinned-item" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--glass-bg)',
                fontSize: '12px'
              }}>
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', flex: 1, overflow: 'hidden' }}
                  onClick={() => onOpenPdf(pin.drive_file_id, pin.page_num, pin.filename)}
                >
                  <FileText size={12} style={{ opacity: 0.6 }} />
                  <span style={{
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {pin.filename.replace('.pdf', '')} (p.{pin.page_num})
                  </span>
                </div>
                <button
                  onClick={() => onPin({ driveFileId: pin.drive_file_id, pageNum: pin.page_num })}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
