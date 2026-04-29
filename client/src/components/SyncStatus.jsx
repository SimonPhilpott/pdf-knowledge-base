import React from 'react';
import { RefreshCw, CheckCircle2, AlertCircle, FileText, Loader2 } from 'lucide-react';

export default function SyncStatus({ syncStatus, onSync, compact = false }) {
  const isSyncing = syncStatus?.drive?.active || syncStatus?.indexing?.active;
  const stats = syncStatus?.stats;
  const progress = syncStatus?.indexing;

  if (compact) {
    return (
      <button
        onClick={onSync}
        disabled={isSyncing}
        className={`sync-btn ${isSyncing ? 'active' : ''}`}
        title="Sync Library"
        style={{ margin: 0 }}
      >
        <RefreshCw size={14} className={isSyncing ? 'spin' : ''} />
        <span className="mobile-hide">{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
      </button>
    );
  }

  const percent = progress?.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, flexWrap: 'wrap' }}>
      <div className="status-item">
        {isSyncing ? (
          <RefreshCw size={14} className="spin" style={{ color: 'var(--accent-indigo-light)' }} />
        ) : (
          <CheckCircle2 size={14} style={{ color: 'var(--status-green)' }} />
        )}
        <span style={{ fontWeight: 500 }}>
          {isSyncing 
            ? (syncStatus?.indexing?.active ? 'Indexing PDFs...' : 'Checking Drive...') 
            : 'Library Synced'
          }
        </span>
      </div>

      {isSyncing && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, maxWidth: '400px' }}>
          <div className="sync-progress-container" style={{ flex: 1, height: '6px', background: 'var(--bg-tertiary)', borderRadius: '3px', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
            <div 
              className="sync-progress-fill" 
              style={{ 
                width: `${
                  syncStatus?.indexing?.active 
                    ? (syncStatus.indexing.total > 0 ? (syncStatus.indexing.current / syncStatus.indexing.total) * 100 : 0)
                    : (syncStatus?.drive?.total > 0 ? (syncStatus.drive.current / syncStatus.drive.total) * 100 : 0)
                }%`, 
                height: '100%', 
                background: 'var(--gradient-primary)',
                transition: 'width 0.3s ease-out'
              }} 
            />
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', minWidth: '70px', fontFamily: 'var(--font-mono)' }}>
            {syncStatus?.indexing?.active 
              ? `${syncStatus.indexing.current} / ${syncStatus.indexing.total}`
              : `${syncStatus?.drive?.current || 0} / ${syncStatus?.drive?.total || 0}`
            }
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {syncStatus?.indexing?.active ? syncStatus.indexing.currentFile : syncStatus?.drive?.currentFile}
          </span>
        </div>
      )}

      {!isSyncing && stats && (
        <div className="status-item">
          <FileText size={12} />
          <span>
            Indexed: <strong style={{ color: stats.indexedDocuments === stats.totalDocuments ? 'var(--status-green)' : 'var(--status-amber)' }}>
              {stats.indexedDocuments || 0}
            </strong> / {stats.totalDocuments || 0} PDFs
          </span>
        </div>
      )}

      {!isSyncing && stats?.lastSynced && (
        <div className="status-item" style={{ color: 'var(--text-muted)' }}>
          Last sync: {formatTimeAgo(stats.lastSynced)}
        </div>
      )}

      <button
        onClick={onSync}
        disabled={isSyncing}
        className={`sync-btn ${isSyncing ? 'active' : ''}`}
        title="Sync Library"
      >
        <RefreshCw size={14} className={isSyncing ? 'spin' : ''} />
        <span className="mobile-hide">{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
      </button>
    </div>
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
