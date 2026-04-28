import React, { useState, useEffect } from 'react';
import { 
  X, Shield, FileText, Code, Star, Trash2, Settings, Sparkles, Grid, Activity, Terminal, Globe
} from 'lucide-react';
import { CursorTooltip } from './CursorHover';

/**
 * AdminPortal: High-Fidelity version adhering to ComponentStyleRules.JSON.
 * Standardized padding, radius, and navigation logic.
 */
export default function AdminPortal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = React.useState('structure');
  const [data, setData] = React.useState({ structure: null, rules: [], devRules: '', features: null });
  const [loading, setLoading] = React.useState(false);
  const [newRule, setNewRule] = React.useState('');
  const [hoveredText, setHoveredText] = React.useState(null);
  const [ngrokState, setNgrokState] = React.useState({ active: false, url: null, loading: true });

  React.useEffect(() => {
    if (isOpen) {
      loadTabData(activeTab);
      fetch('/api/admin/ngrok/status')
        .then(r => r.json())
        .then(res => setNgrokState({ ...res, loading: false }))
        .catch(err => {
          console.error("Ngrok status error:", err);
          setNgrokState({ active: false, url: null, loading: false });
        });
    }
  }, [isOpen, activeTab]);

  const toggleNgrok = async () => {
    setNgrokState(prev => ({ ...prev, loading: true }));
    try {
      const action = ngrokState.active ? 'stop' : 'start';
      const res = await fetch('/api/admin/ngrok/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      const data = await res.json();
      setNgrokState({ active: data.active, url: data.url, loading: false });
    } catch (err) {
      console.error("Ngrok toggle error:", err);
      setNgrokState(prev => ({ ...prev, loading: false }));
    }
  };

  const loadTabData = async (tab) => {
    setLoading(true);
    try {
      const endpoints = {
        structure: '/api/admin/structure',
        rules: '/api/admin/rules',
        'dev-rules': '/api/admin/dev-rules',
        features: '/api/admin/features'
      };
      const res = await fetch(endpoints[tab]);
      const result = await res.json();
      
      setData(prev => ({
        ...prev,
        [tab === 'dev-rules' ? 'devRules' : tab]: result
      }));
    } catch (err) {
      console.error(`Admin Sync Error [${tab}]:`, err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRule = async () => {
    if (!newRule.trim()) return;
    try {
      await fetch('/api/admin/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newRule })
      });
      setNewRule('');
      loadTabData('rules');
    } catch (err) { console.error('Rule Injection Failed:', err); }
  };

  const handleDeleteRule = async (id) => {
    if (!window.confirm("ARE YOU SURE YOU WANT TO DECOMMISSION THIS SYSTEM RULE?")) return;
    try {
      setLoading(true);
      await fetch(`http://localhost:5000/api/admin/rules/${id}`, { method: 'DELETE' });
      await loadTabData('rules');
    } catch (err) {
      console.error('Rule Deletion Failed:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{ 
      position: 'fixed', 
      inset: 0, 
      backgroundColor: 'rgba(0, 0, 0, 0.4)', 
      zIndex: 999999, 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backdropFilter: 'blur(30px)',
      padding: 'var(--space-xl)'
    }}>
      <style>{`
        .compact-card {
          padding: 12px var(--space-md);
          border-radius: var(--radius-lg);
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--glass-border);
          transition: all var(--transition-base);
          position: relative;
          overflow: hidden;
          min-height: 60px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .compact-card:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: var(--accent-indigo);
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }
        .compact-card:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: var(--accent-indigo);
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }
        .admin-delete-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 8px;
          border-radius: 8px;
          transition: all var(--transition-fast);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .admin-delete-btn:hover {
          color: var(--status-red);
          background: rgba(239, 68, 68, 0.1);
        }
        @media (max-width: 768px) {
          .admin-portal-modal {
            width: 100% !important;
            height: 100% !important;
            max-width: none !important;
            max-height: none !important;
            border-radius: 0 !important;
          }
          .admin-modal-header {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 16px !important;
            padding: 16px !important;
          }
          .admin-header-right {
            width: 100%;
            justify-content: flex-start;
          }
          .admin-portal-modal .global-close-btn {
            position: absolute !important;
            top: 12px !important;
            right: 12px !important;
            z-index: 100;
            background: rgba(255, 255, 255, 0.05) !important;
          }
          .tone-option {
            flex: initial !important;
            min-width: 80px;
          }
        }
      `}</style>

      {/* Background click to close */}
      <div onClick={onClose} style={{ position: 'absolute', inset: 0 }} />

      {/* Main Window */}
      <div className="admin-portal-modal" style={{ 
        position: 'relative',
        width: '100%',
        maxWidth: '1200px',
        height: '90vh',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--glass-border)',
        borderRadius: 'var(--radius-xl)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-lg)'
      }}>
        {/* Header - Normalized Padding */}
        <header className="admin-modal-header" style={{
          padding: '12px var(--space-xl)',
          borderBottom: '1px solid var(--glass-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(255, 255, 255, 0.02)',
          flexShrink: 0,
          flexWrap: 'wrap',
          gap: '12px',
          position: 'relative'
        }}>
          <button 
            onClick={onClose}
            className="global-close-btn"
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: 'var(--text-muted)', 
              cursor: 'pointer',
              padding: '8px'
            }}
          >
            <X size={24} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
            <div style={{ 
              width: '42px', 
              height: '42px', 
              borderRadius: 'var(--radius-md)', 
              background: 'var(--gradient-primary)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: 'white',
              boxShadow: 'var(--shadow-glow)'
            }}>
              <Settings size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.5px' }}>Admin</h2>
              <p style={{ fontSize: '8px', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '2px', marginTop: '1px' }}>
                Knowledge Base Core v1.0.4
              </p>
            </div>
          </div>

          <div className="admin-header-right" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-lg)', flexWrap: 'wrap' }}>
            <div className="tone-switcher">
              {[
                { id: 'structure', label: 'Architecture', icon: Grid },
                { id: 'rules', label: 'System Rules', icon: Shield },
                { id: 'dev-rules', label: 'Manifest', icon: Terminal },
                { id: 'features', label: 'Matrix', icon: Activity },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`tone-option ${activeTab === tab.id ? 'active' : ''}`}
                  style={{ padding: '6px 14px' }}
                >
                  <tab.icon size={13} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
              {/* Ngrok Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {ngrokState.active && (
                  <a 
                    href={ngrokState.url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="desktop-only"
                    style={{ fontSize: '11px', color: 'var(--accent-indigo)', textDecoration: 'none', fontWeight: 600 }}
                  >
                    {ngrokState.url.replace('https://', '')}
                  </a>
                )}
                <button
                  onClick={toggleNgrok}
                  disabled={ngrokState.loading}
                  className="toolbar-btn"
                  style={{
                    background: ngrokState.active ? 'var(--status-green)' : 'var(--bg-tertiary)',
                    color: ngrokState.active ? 'black' : 'var(--text-secondary)',
                    borderColor: ngrokState.active ? 'var(--status-green)' : 'var(--glass-border)',
                    opacity: ngrokState.loading ? 0.5 : 1
                  }}
                  title="Toggle External Access (Ngrok)"
                >
                  <Globe size={14} />
                  <span>{ngrokState.active ? 'External ON' : 'External OFF'}</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area - Normalized Padding */}
        <main className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-lg) var(--space-xl)', background: 'rgba(0, 0, 0, 0.05)' }}>
          {activeTab === 'structure' && <StructureView structure={data.structure} loading={loading} onHover={setHoveredText} />}
          {activeTab === 'rules' && (
            <RulesView 
              rules={data.rules} 
              newRule={newRule} 
              setNewRule={setNewRule} 
              onAdd={handleAddRule} 
              onDelete={handleDeleteRule}
              loading={loading}
              onHover={setHoveredText}
            />
          )}
          {activeTab === 'dev-rules' && <DevRulesView content={data.devRules} loading={loading} />}
          {activeTab === 'features' && <FeaturesView features={data.features} loading={loading} onHover={setHoveredText} />}
        </main>
      </div>
      <CursorTooltip text={hoveredText} isVisible={!!hoveredText} />
    </div>
  );
}

function StructureView({ structure, loading, onHover }) {
  if (loading && !structure) return <LoadingPulse />;
  if (!structure || !structure.structure) return <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', fontSize: '9px' }}>Matrix offline</div>;
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {Object.entries(structure.structure).map(([moduleName, files]) => (
        <section key={moduleName}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
            <span style={{ fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1.2px', color: 'var(--text-muted)' }}>
              {moduleName}
            </span>
            <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)', opacity: 0.2 }}></div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--space-md)' }}>
            {Object.entries(files || {}).map(([path, desc]) => (
              <div 
                key={path} 
                className="compact-card"
                onMouseEnter={() => onHover(desc)}
                onMouseLeave={() => onHover(null)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ color: 'var(--accent-indigo)', display: 'flex' }}>
                    {path.endsWith('.js') || path.endsWith('.jsx') ? <Code size={13} /> : <FileText size={13} />}
                  </div>
                  <h4 style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)', margin: 0, fontFamily: 'var(--font-mono)' }}>{path}</h4>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function RulesView({ rules, newRule, setNewRule, onAdd, onDelete, loading }) {
  const safeRules = Array.isArray(rules) ? rules : [];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '32px' }}>
      <div style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-lg)', height: 'fit-content' }}>
        <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: 800 }}>Inject Strategy</h4>
        <textarea 
          value={newRule}
          onChange={(e) => setNewRule(e.target.value)}
          placeholder="Define protocol..."
          style={{ width: '100%', height: '150px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', padding: '12px', color: 'white', fontSize: '12px', outline: 'none', resize: 'none' }}
        />
        <button 
          onClick={onAdd} 
          disabled={!newRule.trim()} 
          style={{ width: '100%', marginTop: '16px', padding: '12px', background: 'var(--gradient-primary)', border: 'none', borderRadius: 'var(--radius-md)', color: 'white', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1.5px', fontSize: '10px', cursor: 'pointer' }}
        >
          Deploy Rule
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {safeRules.map((rule) => (
          <div key={rule.id} className="admin-glass-card" style={{ padding: '12px 16px', borderRadius: 'var(--radius-md)', display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ color: 'var(--accent-indigo)', flexShrink: 0 }}>
              <Shield size={13} />
            </div>
            <p style={{ flex: 1, margin: 0, fontSize: '12px', color: 'var(--text-primary)', lineHeight: 1.4 }}>{rule.content}</p>
            <button onClick={() => onDelete(rule.id)} className="admin-delete-btn">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function DevRulesView({ content, loading }) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editText, setEditText] = React.useState('');
  const [isSaving, setIsSaving] = React.useState(false);
  
  const actualContent = content?.content || '';
  const filePath = content?.filePath || '';

  React.useEffect(() => {
    if (!isEditing) setEditText(actualContent);
  }, [actualContent, isEditing]);

  const handleSave = async () => {
    if (!filePath) return alert("Cannot save: No file path associated with this manifest.");
    setIsSaving(true);
    try {
      await fetch('/api/admin/dev-rules', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editText, filePath })
      });
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to save rules:", err);
      alert("Failed to save manifest.");
    } finally {
      setIsSaving(false);
    }
  };

  const formatRules = (text) => {
    if (!text) return '';
    return text.split('\n').map((line, i) => {
      let color = 'var(--text-secondary)';
      let fontWeight = 'normal';
      if (line.startsWith('#')) {
        color = 'var(--accent-indigo)';
        fontWeight = 'bold';
      } else if (line.trim().startsWith('-') || line.trim().startsWith('*')) {
        color = 'var(--status-green)';
      } else if (line.match(/^\[.*\]/)) {
        color = 'var(--accent-teal)';
      }
      return (
        <div key={i} style={{ color, fontWeight, paddingLeft: line.startsWith(' ') ? '15px' : '0', minHeight: '1em' }}>
          {line}
        </div>
      );
    });
  };

  if (loading && !content) return <LoadingPulse />;
  
  return (
    <div style={{ background: '#050505', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '10px 20px', background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Terminal size={13} style={{ color: 'var(--text-muted)', marginRight: '10px' }} />
          <span style={{ fontSize: '9px', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '2px' }}>
            Manifest {filePath && <span style={{ opacity: 0.5 }}>- {filePath.split('\\').pop() || filePath.split('/').pop()}</span>}
          </span>
        </div>
        <div>
          {isEditing ? (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setIsEditing(false)} className="toolbar-btn">Cancel</button>
              <button onClick={handleSave} disabled={isSaving} className="toolbar-btn" style={{ background: 'var(--accent-indigo)', color: 'white', borderColor: 'var(--accent-indigo)' }}>
                {isSaving ? 'Saving...' : 'Save Manifest'}
              </button>
            </div>
          ) : (
            <button onClick={() => setIsEditing(true)} className="toolbar-btn">Edit Manifest</button>
          )}
        </div>
      </div>
      <div className="custom-scrollbar" style={{ height: '550px', overflowY: 'auto', padding: '24px' }}>
        {isEditing ? (
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            spellCheck="false"
            style={{
              width: '100%', height: '100%', minHeight: '500px', background: 'transparent', border: 'none',
              color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: '12px',
              resize: 'vertical', outline: 'none', lineHeight: 1.7
            }}
          />
        ) : (
          <div style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: '12px', lineHeight: 1.7 }}>
            {formatRules(editText)}
          </div>
        )}
      </div>
    </div>
  );
}

function FeaturesView({ features, loading, onHover }) {
  if (loading && !features) return <LoadingPulse />;
  const items = features?.features || [];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 'var(--space-md)' }}>
      {items.map((f) => {
        const isPrime = f.status === 'implemented';
        return (
          <div 
            key={f.id} 
            className="compact-card" 
            style={{ minHeight: '80px' }}
            onMouseEnter={() => onHover(f.description)}
            onMouseLeave={() => onHover(null)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Star size={13} fill={isPrime ? 'var(--accent-indigo)' : 'none'} color={isPrime ? 'var(--accent-indigo)' : 'var(--text-muted)'} />
                <h4 style={{ margin: 0, fontSize: '12px', fontWeight: 800, color: isPrime ? 'var(--text-primary)' : 'var(--text-muted)' }}>{f.name}</h4>
              </div>
              <span style={{ fontSize: '8px', fontWeight: 900, background: 'rgba(0,0,0,0.2)', padding: '2px 6px', borderRadius: '3px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                {f.status}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function LoadingPulse() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '350px', gap: '20px' }}>
      <div style={{ width: '32px', height: '32px', border: '3px solid var(--glass-border)', borderTopColor: 'var(--accent-indigo)', borderRadius: '50%' }} className="spin"></div>
      <span style={{ fontSize: '8px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '4px', color: 'var(--text-muted)' }}>Syncing</span>
    </div>
  );
}
