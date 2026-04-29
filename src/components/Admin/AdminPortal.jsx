import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Shield, FileText, Code, Star, Trash2, Settings, Sparkles, Grid, Activity, Terminal
} from 'lucide-react';

/**
 * AdminPortal: Executive Control Interface.
 * Restored from GitHub Master Branch (main).
 */
export default function AdminPortal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('structure');
  const [data, setData] = useState({ structure: null, rules: [], devRules: '', features: null });
  const [loading, setLoading] = useState(false);
  const [newRule, setNewRule] = useState('');
  const [hoverDetail, setHoverDetail] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (isOpen) loadTabData(activeTab);
  }, [isOpen, activeTab]);

  const handleMouseMove = (e) => {
    setMousePos({ x: e.clientX, y: e.clientY });
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
      
      if (tab === 'dev-rules') {
        setData(prev => ({ ...prev, devRules: result }));
      } else {
        setData(prev => ({ ...prev, [tab]: result }));
      }
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
    try {
      await fetch(`/api/admin/rules/${id}`, { method: 'DELETE' });
      loadTabData('rules');
    } catch (err) { console.error('Rule Deletion Failed:', err); }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[2000] flex items-center justify-center p-6 md:p-12 overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-[40px]"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-6xl h-[85vh] bg-[var(--bg-secondary)] border border-[var(--glass-border)] rounded-[var(--radius-xl)] shadow-2xl flex flex-col overflow-hidden"
      >
        <header className="px-[var(--space-md)] py-[var(--space-sm)] border-b border-[var(--glass-border)] flex items-center justify-between shrink-0 bg-[var(--bg-tertiary)]">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-[var(--accent-indigo)] flex items-center justify-center text-white shadow-xl shadow-[var(--shadow-glow)]">
              <Settings size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">Admin Portal</h2>
              <p className="text-[10px] font-bold text-[var(--text-muted)] tracking-widest mt-1">Core Interface v1.0.4</p>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <nav className="flex items-center bg-[var(--bg-elevated)] p-[2px] rounded-full border border-[var(--glass-border)] gap-[1px]">
              {[
                { id: 'structure', label: 'Architecture', icon: Grid },
                { id: 'rules', label: 'Logic', icon: Shield },
                { id: 'dev-rules', label: 'Manifest', icon: Terminal },
                { id: 'features', label: 'Matrix', icon: Activity },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{ 
                    background: activeTab === tab.id ? 'var(--gradient-primary)' : 'transparent',
                    color: activeTab === tab.id ? 'white' : 'var(--text-muted)'
                  }}
                  className={`flex items-center gap-2 px-5 py-2 rounded-full text-[12px] font-semibold transition-all duration-300 group cursor-pointer ${activeTab === tab.id
                      ? 'shadow-[var(--shadow-glow)]'
                      : 'hover:text-[var(--text-primary)] hover:bg-[var(--glass-bg-light)]'
                    }`}
                >
                  <tab.icon size={14} className="shrink-0 transition-transform duration-300 group-hover:scale-110" />
                  <span className="shrink-0">{tab.label}</span>
                </button>
              ))}
            </nav>

            <button className="global-close-btn" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-[var(--space-md)] py-6 bg-[var(--bg-primary)] custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'structure' && <StructureView structure={data.structure} loading={loading} onHover={setHoverDetail} />}
              {activeTab === 'rules' && (
                <RulesView
                  rules={data.rules}
                  newRule={newRule}
                  setNewRule={setNewRule}
                  onAdd={handleAddRule}
                  onDelete={handleDeleteRule}
                  loading={loading}
                />
              )}
              {activeTab === 'dev-rules' && <DevRulesView content={data.devRules} loading={loading} />}
              {activeTab === 'features' && <FeaturesView features={data.features} loading={loading} onHover={setHoverDetail} />}
            </motion.div>
          </AnimatePresence>
        </main>
        
        {hoverDetail && (
          <div 
            style={{ 
              position: 'fixed',
              left: mousePos.x > window.innerWidth / 2 ? mousePos.x - 20 : mousePos.x + 20,
              top: mousePos.y + 15,
              transform: mousePos.x > window.innerWidth / 2 ? 'translateX(-100%)' : 'none',
              zIndex: 1000000 
            }}
            className="px-3 py-2 bg-[var(--glass-bg)] backdrop-blur-[12px] border border-[var(--glass-border)] text-[var(--text-primary)] text-[11px] font-bold rounded-[var(--radius-md)] shadow-2xl pointer-events-none transition-all duration-75"
          >
            {hoverDetail}
          </div>
        )}
      </motion.div>
    </div>
  );
}

function StructureView({ structure, loading, onHover }) {
  if (loading && !structure) return <LoadingPulse />;
  if (!structure) return <div className="text-slate-500 p-20 text-center font-bold uppercase tracking-widest text-xs">No Matrix Data</div>;

  return (
    <div className="space-y-4">
      {Object.entries(structure.structure).map(([moduleName, files]) => (
        <section key={moduleName} className="mb-6 last:mb-0">
          <div className="flex items-center gap-3 mb-3">
            <h3 className="text-[9px] font-bold text-[var(--accent-indigo)] tracking-[2px] bg-[var(--accent-indigo)]/10 px-2.5 py-1 rounded-md border border-[var(--accent-indigo)]/30">
              {moduleName.charAt(0).toUpperCase() + moduleName.slice(1).toLowerCase()}
            </h3>
            <div className="h-px flex-1 bg-[var(--glass-border)]" />
          </div>

          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
            {Object.entries(files || {}).map(([path, desc]) => (
              <div 
                key={path} 
                onMouseEnter={() => onHover(`${path}: ${desc}`)}
                onMouseLeave={() => onHover(null)}
                className="bg-[var(--bg-tertiary)] border border-[var(--glass-border)] rounded-[var(--radius-md)] p-2 hover:border-[var(--accent-indigo)] transition-all group cursor-help"
              >
                <div className="w-8 h-8 rounded-lg bg-[var(--bg-primary)] flex items-center justify-center text-[var(--accent-indigo)] mb-2 group-hover:scale-110 transition-transform mx-auto">
                  {path.endsWith('.js') || path.endsWith('.jsx') ? <Code size={14} /> : <FileText size={14} />}
                </div>
                <h4 className="text-[9px] font-mono font-bold text-[var(--text-primary)] text-center truncate">{path}</h4>
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
      <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--glass-border)', borderRadius: '24px', padding: '24px', height: 'fit-content' }}>
        <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>Inject Strategy</h4>
        <textarea 
          value={newRule}
          onChange={(e) => setNewRule(e.target.value)}
          placeholder="Define protocol..."
          style={{ width: '100%', height: '150px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', padding: '12px', color: 'var(--text-primary)', fontSize: '12px', outline: 'none', resize: 'none' }}
        />
        <button 
          onClick={onAdd} 
          disabled={!newRule.trim()} 
          style={{ width: '100%', marginTop: '16px', padding: '12px', background: 'var(--gradient-primary)', border: 'none', borderRadius: 'var(--radius-md)', color: 'white', fontWeight: 600, letterSpacing: '0.5px', fontSize: '11px', cursor: 'pointer' }}
        >
          Deploy Strategy
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {safeRules.map((rule) => (
          <div key={rule.id} className="admin-glass-card" style={{ padding: '12px 16px', borderRadius: '12px', display: 'flex', gap: '12px', alignItems: 'center' }}>
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
      let color = 'var(--text-muted)';
      let fontWeight = 'normal';
      if (line.startsWith('#')) {
        color = 'var(--accent-indigo)';
        fontWeight = 'bold';
      } else if (line.trim().startsWith('-') || line.trim().startsWith('*')) {
        color = 'var(--status-green)';
        // Ensure visible in light mode by checking if dark is NOT applied?
        // Actually, status-green is generally fine.
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
    <div style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', borderRadius: '24px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '10px 20px', background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Terminal size={13} style={{ color: '#475569', marginRight: '10px' }} />
          <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '1px' }}>
            System Manifest {filePath && <span style={{ opacity: 0.5 }}>- {filePath.split('\\').pop() || filePath.split('/').pop()}</span>}
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
              color: 'var(--text-primary)', fontFamily: 'monospace', fontSize: '12px',
              resize: 'vertical', outline: 'none', lineHeight: 1.7
            }}
          />
        ) : (
          <div style={{ margin: 0, fontFamily: 'monospace', fontSize: '12px', lineHeight: 1.7 }}>
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
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <h3 className="text-[9px] font-bold text-[var(--accent-indigo)] tracking-[2px] bg-[var(--accent-indigo)]/10 px-2.5 py-1 rounded-md border border-[var(--accent-indigo)]/30">
          Feature Matrix
        </h3>
        <div className="h-px flex-1 bg-[var(--glass-border)]" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {items.map((f) => {
          const status = (f.status || 'stable').toLowerCase().replace(' ', '-');
          const isImplemented = status === 'implemented';
          
          return (
            <div 
              key={f.id} 
              onMouseEnter={() => onHover(f.description)}
              onMouseLeave={() => onHover(null)}
              className="bg-[var(--bg-tertiary)] border border-[var(--glass-border)] rounded-[var(--radius-md)] p-3 hover:border-[var(--accent-indigo)] transition-all group cursor-help flex flex-col gap-3"
            >
              <div className="flex items-start justify-between">
                <div className="w-8 h-8 rounded-lg bg-[var(--bg-primary)] flex items-center justify-center text-[var(--accent-indigo)] group-hover:scale-110 transition-transform">
                  <Star size={14} fill={isImplemented ? "currentColor" : "none"} />
                </div>
                <span className={`status-badge ${status}`}>
                  {f.status}
                </span>
              </div>
              <div>
                <h4 className="text-[10px] font-bold text-[var(--text-primary)] tracking-wider mb-1 line-clamp-1">
                  {f.name}
                </h4>
                <div className="h-0.5 w-8 bg-[var(--accent-indigo)]/30 rounded-full" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LoadingPulse() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '350px', gap: '20px' }}>
      <div style={{ width: '32px', height: '32px', border: '3px solid var(--glass-border)', borderTopColor: 'var(--accent-indigo)', borderRadius: '50%' }} className="animate-spin"></div>
      <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '1px', color: 'var(--text-muted)' }}>Syncing Library...</span>
    </div>
  );
}
