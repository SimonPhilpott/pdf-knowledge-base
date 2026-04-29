import React, { useState } from 'react';
import { MessageSquare, Trash2, Check, X } from 'lucide-react';

export default function ChatHistory({ sessions, activeId, onLoad, onDelete, onClearAll, isClearing }) {
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);

  const handleClearAll = () => {
    if (onClearAll) onClearAll();
    setIsConfirmingClear(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <div className="sidebar-section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MessageSquare size={12} />
          Chat History
        </div>
        
        {sessions && sessions.length > 0 && (
          <div className="clear-history-container">
            {isClearing ? (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 border-2 border-accent-indigo border-t-transparent rounded-full animate-spin" />
                <span className="text-[10px] text-accent-indigo font-bold animate-pulse">Clearing...</span>
              </div>
            ) : isConfirmingClear ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '10px', color: 'var(--status-red)', fontWeight: 'bold' }}>Sure?</span>
                <button 
                  className="sidebar-action-icon confirm" 
                  onClick={handleClearAll}
                  title="Confirm Delete All"
                  style={{ color: 'var(--status-green)', padding: '2px' }}
                >
                  <Check size={14} />
                </button>
                <button 
                  className="sidebar-action-icon cancel" 
                  onClick={() => setIsConfirmingClear(false)}
                  title="Cancel"
                  style={{ color: 'var(--text-muted)', padding: '2px' }}
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button 
                className="sidebar-action-icon" 
                onClick={() => setIsConfirmingClear(true)}
                title="Clear all history"
                style={{ opacity: 0.6, cursor: 'pointer', background: 'transparent', border: 'none', color: 'var(--text-muted)', display: 'flex', padding: '2px' }}
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        )}
      </div>
      
      {isClearing && (
        <div className="mt-2 mb-4 px-2">
          <div className="h-1 w-full bg-bg-tertiary rounded-full overflow-hidden border border-glass-border">
            <div className="h-full bg-primary-gradient animate-shimmer" style={{ width: '100%', backgroundSize: '200% 100%' }} />
          </div>
        </div>
      )}
      {!sessions || sessions.length === 0 ? (
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', padding: '8px 0' }}>
          No conversations yet. Start chatting!
        </p>
      ) : (
        <ul className="chat-history-list">
          {sessions.map((session) => (
            <li
              key={session.id}
              className={`chat-history-item ${activeId === session.id ? 'active' : ''}`}
              onClick={() => onLoad(session.id)}
            >
              <MessageSquare size={14} style={{ opacity: 0.6 }} />
              <span className="chat-history-title">
                {session.title || 'Untitled Chat'}
              </span>
              <button
                className="chat-history-delete"
                onClick={(e) => { e.stopPropagation(); onDelete(session.id); }}
                title="Delete conversation"
              >
                <Trash2 size={13} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
