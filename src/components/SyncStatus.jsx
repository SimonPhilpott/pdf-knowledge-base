import React from 'react';

export default function SyncStatus({ syncStatus, onSync }) {
  const isActive = syncStatus?.drive?.active || syncStatus?.indexing?.active;
  const stats = syncStatus?.stats;

  return (
    <>
      <div className="status-item">
        <div className={`status-dot ${isActive ? 'syncing' : ''}`}></div>
        <span>{isActive ? 'Syncing...' : 'Connected'}</span>
      </div>

      {stats && (
        <div className="status-item">
          📄 {stats.indexedDocuments || 0} PDFs indexed
        </div>
      )}

      {stats?.lastSynced && (
        <div className="status-item">
          🕐 Last sync: {formatTimeAgo(stats.lastSynced)}
        </div>
      )}

      {isActive && syncStatus?.indexing?.active && (
        <div className="status-item">
          ⏳ {syncStatus.indexing.currentFile} ({syncStatus.indexing.current}/{syncStatus.indexing.total})
        </div>
      )}

      <button
        onClick={onSync}
        disabled={isActive}
        style={{
          background: 'none',
          border: 'none',
          color: isActive ? 'var(--text-muted)' : 'var(--accent-indigo-light)',
          cursor: isActive ? 'default' : 'pointer',
          fontSize: '12px',
          fontFamily: 'var(--font-sans)',
          padding: '2px 8px',
          borderRadius: '4px',
          transition: 'background 0.15s'
        }}
        title="Re-sync PDFs from Google Drive"
      >
        🔄 {isActive ? 'Syncing' : 'Sync'}
      </button>
    </>
  );
}

function formatTimeAgo(dateStr) {
  if (!dateStr) return 'never';
  const date = new Date(dateStr);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
