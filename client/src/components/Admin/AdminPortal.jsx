import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Shield, FileText, Code, Star, Trash2, Settings, Sparkles, Grid, Activity, Terminal, Globe, Copy, Zap, CheckCircle2,
  MousePointer2, Layers, Type, Folder, Search
} from 'lucide-react';
import { useDraggableScroll } from '../../hooks/useDraggableScroll';
import { Tooltip } from '../CursorHover';

/**
 * AdminPortal: Executive Control Interface.
 * Restored from GitHub Master Branch (main).
 */
export default function AdminPortal({ isOpen, onClose }) {
  const { scrollRef, isDragging, handlers } = useDraggableScroll();
  const [activeTab, setActiveTab] = useState('structure');
  const [data, setData] = useState({ structure: null, rules: [], devRules: '', features: null, styleRules: null });
  const [loading, setLoading] = useState(false);
  const [newRule, setNewRule] = useState('');
  const [ngrokStatus, setNgrokStatus] = useState({ active: false, url: null });
  const [isNgrokTransitioning, setIsNgrokTransitioning] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadTabData(activeTab);
      fetchNgrokStatus();
    }
  }, [isOpen, activeTab]);

  const fetchNgrokStatus = async () => {
    try {
      const res = await fetch('/api/admin/ngrok/status');
      const data = await res.json();
      setNgrokStatus(data);
    } catch (err) {
      console.error('[Admin] Failed to fetch ngrok status:', err);
    }
  };

  const toggleNgrok = async () => {
    setIsNgrokTransitioning(true);
    const action = ngrokStatus.active ? 'stop' : 'start';
    try {
      const res = await fetch('/api/admin/ngrok/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      const data = await res.json();
      setNgrokStatus(data);
    } catch (err) {
      console.error('[Admin] Failed to toggle ngrok:', err);
    } finally {
      setIsNgrokTransitioning(false);
    }
  };

  const loadTabData = async (tab) => {
    if (tab === 'network') return;
    setLoading(true);
    try {
      const endpoints = {
        structure: '/api/admin/structure',
        rules: '/api/admin/rules',
        'dev-rules': '/api/admin/dev-rules',
        features: '/api/admin/features',
        'style-rules': '/api/admin/style-rules'
      };
      const res = await fetch(endpoints[tab]);
      const result = await res.json();
      
      if (tab === 'dev-rules') {
        setData(prev => ({ ...prev, devRules: result }));
      } else if (tab === 'style-rules') {
        setData(prev => ({ ...prev, styleRules: result }));
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
        <header className="px-[var(--space-md)] py-[var(--space-sm)] border-b border-[var(--glass-border)] flex flex-col md:flex-row md:items-center justify-between shrink-0 bg-[var(--bg-tertiary)] gap-4">
          <div className="flex items-center justify-between w-full md:w-auto">
            <div className="flex items-center gap-4 md:gap-6">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-[var(--accent-indigo)] flex items-center justify-center text-white shadow-xl shadow-[var(--shadow-glow)]">
                <Settings size={24} className="md:w-[28px] md:h-[28px]" />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-[var(--text-primary)] tracking-tight">Admin Portal</h2>
                <p className="text-[10px] font-bold text-[var(--text-muted)] tracking-widest mt-1">Core Interface v1.0.4</p>
              </div>
            </div>
            
            <button className="md:hidden global-close-btn" onClick={onClose}>
              <X size={18} />
            </button>
          </div>

          <div className="flex items-center gap-8 min-w-0 md:flex-1 md:justify-end w-full md:w-auto">
            <nav 
              ref={scrollRef}
              {...handlers}
              className="flex items-center bg-[var(--bg-elevated)] p-[2px] rounded-full border border-[var(--glass-border)] gap-[1px] overflow-x-auto scrollbar-none flex-1 md:flex-none"
              style={{
                cursor: isDragging ? 'grabbing' : 'grab',
                userSelect: 'none',
                maxWidth: '100%'
              }}
            >
              {[
                { id: 'structure', label: 'Architecture', icon: Grid },
                { id: 'style-rules', label: 'Components', icon: Sparkles },
                { id: 'rules', label: 'Logic', icon: Shield },
                { id: 'dev-rules', label: 'Manifest', icon: Terminal },
                { id: 'features', label: 'Matrix', icon: Activity },
                { id: 'network', label: 'Network', icon: Globe },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => !isDragging && setActiveTab(tab.id)}
                  style={{ 
                    background: activeTab === tab.id ? 'var(--gradient-primary)' : 'transparent',
                    color: activeTab === tab.id ? 'white' : 'var(--text-muted)'
                  }}
                  className={`flex items-center gap-2 px-4 md:px-5 py-2 rounded-full text-[11px] md:text-[12px] font-semibold transition-all duration-300 group cursor-pointer shrink-0 ${activeTab === tab.id
                      ? 'shadow-[var(--shadow-glow)]'
                      : 'hover:text-[var(--text-primary)] hover:bg-[var(--glass-bg-light)]'
                    }`}
                >
                  <tab.icon size={14} className="shrink-0 transition-transform duration-300 group-hover:scale-110" />
                  <span className="shrink-0">{tab.label}</span>
                </button>
              ))}
            </nav>

            <button className="hidden md:flex global-close-btn shrink-0" onClick={onClose}>
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
              {activeTab === 'structure' && <StructureView structure={data.structure} loading={loading} />}
              {activeTab === 'style-rules' && <ComponentRulesView rules={data.styleRules} loading={loading} />}
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
              {activeTab === 'features' && <FeaturesView features={data.features} loading={loading} />}
              {activeTab === 'network' && (
                <NetworkView 
                  status={ngrokStatus} 
                  onToggle={toggleNgrok} 
                  isTransitioning={isNgrokTransitioning} 
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
        

      </motion.div>
    </div>
  );
}

function StructureView({ structure, loading }) {
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
              <Tooltip key={path} text={`${path}: ${desc}`}>
                <div 
                  className="bg-[var(--bg-tertiary)] border border-[var(--glass-border)] rounded-[var(--radius-md)] p-2 hover:border-[var(--accent-indigo)] transition-all group cursor-help"
                >
                  <div className="w-8 h-8 rounded-lg bg-[var(--bg-primary)] flex items-center justify-center text-[var(--accent-indigo)] mb-2 group-hover:scale-110 transition-transform mx-auto">
                    {path.endsWith('.js') || path.endsWith('.jsx') ? <Code size={14} /> : <FileText size={14} />}
                  </div>
                  <h4 className="text-[9px] font-mono font-bold text-[var(--text-primary)] text-center truncate">{path}</h4>
                </div>
              </Tooltip>
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
      let color = 'var(--manifest-text)';
      let fontWeight = '400';
      let opacity = '1';
      let paddingLeft = line.startsWith(' ') ? '15px' : '0';

      // Parse line for structure
      if (line.startsWith('#')) {
        color = 'var(--manifest-heading)';
        fontWeight = '800';
      } else if (line.trim().startsWith('-') || line.trim().startsWith('*')) {
        opacity = '0.75'; // Soften list markers slightly
      }

      // Handle Bold Sub-headings (**Text:**)
      const boldMatch = line.match(/\*\*(.*?)\*\*/);
      if (boldMatch) {
        const [full, content] = boldMatch;
        const parts = line.split(full);
        return (
          <div key={i} style={{ color, fontWeight, opacity, paddingLeft, minHeight: '1.2em', marginBottom: '2px' }}>
            {parts[0]}
            <span style={{ color: 'var(--manifest-subheading)', fontWeight: '700' }}>{content}</span>
            {parts[1]}
          </div>
        );
      }

      return (
        <div key={i} style={{ color, fontWeight, opacity, paddingLeft, minHeight: '1.2em', marginBottom: '2px' }}>
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

function FeaturesView({ features, loading }) {
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
            <Tooltip key={f.id} text={f.description}>
              <div 
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
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
}

function BoxModel({ specs }) {
  const padding = specs?.padding || '0';
  const margin = specs?.margin || '0';
  const border = specs?.border ? (specs.border === 'none' ? '0' : '1') : '0';
  
  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl mt-4 border border-[var(--glass-border)] shadow-inner">
      <div className="relative border-2 border-dashed border-orange-400/40 p-5 bg-orange-400/5 rounded-xl flex items-center justify-center min-w-[200px]">
        <span className="absolute top-1 left-2 text-[7px] font-bold text-orange-600/60 uppercase">Margin {margin}</span>
        
        <div className="relative border border-yellow-400/60 p-4 bg-yellow-400/10 rounded-lg flex items-center justify-center w-full">
          <span className="absolute top-1 left-2 text-[7px] font-bold text-yellow-700/80 uppercase">Border {border}</span>
          
          <div className="relative border-2 border-dashed border-green-400/50 p-5 bg-green-400/10 rounded-md flex items-center justify-center w-full">
            <span className="absolute top-1 left-2 text-[7px] font-bold text-green-700/80 uppercase">Padding {padding}</span>
            
            <div className="bg-blue-400/20 border border-blue-400/40 rounded px-5 py-2.5 flex items-center justify-center min-w-[80px] shadow-sm">
              <span className="text-[10px] font-mono font-black text-blue-600">
                {specs?.icon_size ? `${specs.icon_size}px` : 'AUTO'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function VisualPreview({ type, variant, specs }) {
  const [isHovered, setIsHovered] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(0);
  
  if (variant === 'segment_toggles') {
    const items = ['RESEARCH', 'CRITIC', 'GURU'];
    return (
      <div className="p-4 bg-black/5 rounded-xl flex flex-col gap-3 items-center justify-center border border-dashed border-[var(--glass-border)]">
        <div 
          style={{ 
            padding: specs.container_padding, 
            borderRadius: specs.container_radius,
            background: 'var(--bg-elevated)',
            border: '1px solid var(--glass-border)',
            display: 'flex',
            gap: specs.between_item_gap
          }}
        >
          {items.map((item, i) => (
            <div 
              key={item}
              onClick={() => setActiveIndex(i)}
              style={{
                padding: specs.item_padding,
                borderRadius: specs.item_radius,
                background: i === activeIndex ? specs.active_background : 'transparent',
                color: i === activeIndex ? specs.active_text : 'var(--text-muted)',
                fontSize: specs.font_size,
                fontWeight: specs.font_weight,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: specs.internal_icon_gap,
                transition: 'background 0.2s ease'
              }}
            >
              <Star size={10} className={i === activeIndex ? 'opacity-100' : 'opacity-40'} />
              <span className="tracking-tight">{item}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'buttons') {
    const style = {
      padding: specs.padding,
      borderRadius: specs.radius || 'var(--radius-full)',
      background: specs.background || 'var(--bg-tertiary)',
      border: specs.border || '1px solid var(--glass-border)',
      color: specs.active_text || 'var(--text-primary)',
      fontSize: specs.font_size || '12px',
      fontWeight: specs.font_weight || 600,
      display: 'flex',
      alignItems: 'center',
      gap: specs.internal_icon_gap || '8px',
      cursor: 'pointer',
      transition: 'border-color 0.2s ease'
    };

    return (
      <div className="p-4 bg-black/5 rounded-xl flex items-center justify-center border border-dashed border-[var(--glass-border)]">
        <div 
          style={style}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <Sparkles 
            size={specs.icon_size || 14} 
            style={{ 
              transform: isHovered ? 'scale(1.2)' : 'scale(1)',
              transition: 'transform 0.2s ease' 
            }} 
          />
          <span>{variant.charAt(0).toUpperCase() + variant.slice(1).replace(/_/g, ' ')}</span>
        </div>
      </div>
    );
  }

  if (type === 'messages') {
    const isUser = variant === 'user_prompt';
    return (
      <div className={`p-4 bg-black/5 rounded-xl flex flex-col gap-2 border border-dashed border-[var(--glass-border)] ${isUser ? 'items-end' : 'items-start'}`}>
        <div 
          style={{
            padding: '12px 16px',
            borderRadius: specs.radius,
            borderBottomRightRadius: specs.border_bottom_right_radius || specs.radius,
            borderBottomLeftRadius: specs.border_bottom_left_radius || specs.radius,
            background: specs.background,
            border: specs.border || 'none',
            color: specs.color || 'var(--text-primary)',
            fontSize: '13px',
            lineHeight: 1.5,
            maxWidth: '180px'
          }}
        >
          {isUser ? 'Researcher Query Protocol' : 'Intelligence Synthesis Reply'}
        </div>
      </div>
    );
  }

  if (variant === 'file_explorer') {
    return (
      <div className="p-4 bg-black/5 rounded-xl flex flex-col gap-1 border border-dashed border-[var(--glass-border)]">
        <div className="flex items-center gap-2 p-1.5 opacity-60">
          <Folder size={14} className="text-indigo-400" />
          <span className="text-xs font-bold text-[var(--text-primary)]">Knowledge Base Root</span>
        </div>
        <div 
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{ 
            marginLeft: specs.indent_step,
            background: isHovered ? 'var(--accent-indigo)' : 'var(--accent-indigo)1a',
            color: isHovered ? 'white' : 'var(--accent-indigo)',
            borderColor: isHovered ? 'transparent' : 'var(--accent-indigo)33'
          }} 
          className="flex items-center gap-2 p-1.5 rounded border transition-colors cursor-pointer"
        >
          <Folder size={14} className={isHovered ? 'text-white' : 'text-indigo-500'} />
          <span className="text-xs font-bold">Active Research Subject</span>
        </div>
        <div style={{ marginLeft: `calc(${specs.indent_step} * 2)` }} className="flex items-center gap-2 p-1.5 opacity-80 hover:bg-black/5 rounded cursor-default">
          <FileText size={14} className="text-slate-400" />
          <span className="text-xs font-medium text-[var(--text-primary)]">Executive_Summary.pdf</span>
        </div>
      </div>
    );
  }

  if (type === 'hover_components') {
    const isPopover = variant === 'cursor_popover';
    return (
      <div className="p-4 bg-black/5 rounded-xl flex items-center justify-center border border-dashed border-[var(--glass-border)] overflow-visible relative h-32">
        <div 
          className="flex flex-col items-center gap-2"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className={`flex items-center gap-2 px-3 py-1.5 border rounded-full text-[10px] font-bold transition-all duration-300 ${isHovered ? 'bg-[var(--accent-indigo)] text-white border-[var(--accent-indigo)]' : 'bg-[var(--bg-primary)] text-[var(--accent-indigo)] border-[var(--accent-indigo)]/30'}`}>
             <MousePointer2 size={10} /> {isHovered ? 'PROTOCOL ACTIVE' : 'HOVER TO INSPECT'}
          </div>
          
          <div className={`absolute top-full mt-2 z-10 transition-all duration-300 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
            {isPopover ? (
              <div style={{ width: '200px', background: 'var(--bg-secondary)', borderRadius: '16px', border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow-xl)', padding: '12px' }}>
                <div className="flex items-center justify-between mb-2">
                   <div className="flex items-center gap-2">
                    <Shield size={12} className="text-indigo-500" />
                    <span className="text-[10px] font-black uppercase text-[var(--text-primary)]">Insight</span>
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                </div>
                <p className="text-[10px] text-[var(--text-muted)] leading-relaxed">Multimodal synthesis active. Surfacing document provenance metadata.</p>
              </div>
            ) : (
              <div style={{ padding: specs.padding, background: 'var(--glass-bg)', backdropFilter: `blur(${specs.blur})`, borderRadius: '8px', border: '1px solid var(--glass-border)', fontSize: specs.font_size, color: 'var(--text-primary)', fontWeight: 700, whiteSpace: 'nowrap', boxShadow: 'var(--shadow-lg)' }}>
                Provenance: Page 24
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-black/5 rounded-xl flex items-center justify-center border border-dashed border-[var(--glass-border)] italic text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-black">
       Proxy Node_{variant.toUpperCase()}
    </div>
  );
}

function TypographyView({ typography }) {
  if (!typography) return null;
  return (
    <div className="mt-12 space-y-8">
      <div className="flex items-center gap-3 mb-6">
        <h3 className="text-[10px] font-bold text-[var(--accent-indigo)] tracking-[4px] bg-[var(--accent-indigo)]/10 px-4 py-2 rounded-md border border-[var(--accent-indigo)]/50 uppercase">
          Typography & Semantic Palette
        </h3>
        <div className="h-px flex-1 bg-[var(--glass-border)]" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-[var(--bg-tertiary)] border border-[var(--glass-border)] rounded-[32px] p-10 shadow-2xl">
           <div className="flex items-center gap-4 mb-8">
              <div className="p-3 rounded-2xl bg-[var(--accent-indigo)]/10 text-[var(--accent-indigo)]">
                <Type size={24} />
              </div>
              <h4 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">Heading Hierarchy</h4>
           </div>
           <div className="space-y-8">
              {Object.entries(typography.headings).map(([key, val]) => {
                const color = key.includes('manifest') ? 'var(--manifest-heading)' : 'var(--text-primary)';
                return (
                  <div key={key} className="flex flex-col gap-3 group">
                    <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[3px] group-hover:text-[var(--accent-indigo)] transition-colors">{key.replace(/_/g, ' ')}</span>
                    <div className="flex items-baseline gap-4">
                        <span 
                          style={{ 
                            fontSize: val.split(' / ')[0], 
                            fontWeight: val.split(' / ')[1].split(' ')[0],
                            letterSpacing: val.includes('letter-spacing') ? val.split(' / ')[2].split(' ')[0] : 'normal',
                            color: color
                          }}
                        >
                          Executive Intelligence
                        </span>
                    </div>
                    <div className="h-px w-full bg-gradient-to-r from-[var(--glass-border)] to-transparent" />
                    <span className="text-[10px] font-mono font-bold text-[var(--accent-indigo)] opacity-60 tracking-tight">{val}</span>
                  </div>
                );
              })}
           </div>
        </div>

        <div className="bg-[var(--bg-tertiary)] border border-[var(--glass-border)] rounded-[32px] p-10 shadow-2xl">
           <div className="flex items-center gap-4 mb-8">
              <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-500">
                <FileText size={24} />
              </div>
              <h4 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">Body & Interface Copy</h4>
           </div>
           <div className="space-y-8">
              {Object.entries(typography.body).map(([key, val]) => {
                const color = key.includes('manifest') ? 'var(--manifest-text)' : 'var(--text-secondary)';
                return (
                  <div key={key} className="flex flex-col gap-3 group">
                    <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[3px] group-hover:text-indigo-500 transition-colors">{key.replace(/_/g, ' ')}</span>
                    <p 
                      style={{ 
                        fontSize: val.split(' / ')[0], 
                        lineHeight: val.split(' / ')[1].split(' ')[0],
                        fontWeight: val.includes('weight') ? val.split(' / ')[2].split(' ')[0] : 500,
                        color: color
                      }}
                      className="italic"
                    >
                      "The Knowledge Base synthesizes document intelligence with a 98.4% relevance threshold across multimodal datasets."
                    </p>
                    <div className="h-px w-full bg-gradient-to-r from-[var(--glass-border)] to-transparent" />
                    <span className="text-[10px] font-mono font-bold text-[var(--accent-indigo)] opacity-60 tracking-tight">{val}</span>
                  </div>
                );
              })}
           </div>
        </div>
      </div>
    </div>
  );
}

function ComponentRulesView({ rules, loading }) {
  if (loading && !rules) return <LoadingPulse />;
  if (!rules || !rules.components) return <div className="text-slate-500 p-20 text-center font-bold uppercase tracking-widest text-xs">No Component Data</div>;

  return (
    <div className="space-y-12 pb-20">
      <div className="flex items-center gap-3 mb-6">
        <h3 className="text-[11px] font-black text-[var(--accent-indigo)] tracking-[5px] bg-[var(--accent-indigo)]/10 px-5 py-2.5 rounded-xl border-2 border-[var(--accent-indigo)]/40 uppercase shadow-glow-sm">
          System Design Protocol v{rules.version}
        </h3>
        <div className="h-px flex-1 bg-[var(--glass-border)]" />
      </div>

      <TypographyView typography={rules.tokens.typography} />

      <div className="grid grid-cols-1 gap-12 mt-16">
        {Object.entries(rules.components).map(([compName, compData]) => (
          <div 
            key={compName} 
            className="bg-[var(--bg-secondary)] border border-[var(--glass-border)] rounded-[32px] overflow-hidden flex flex-col shadow-2xl"
          >
            <div className="p-8 border-b border-[var(--glass-border)] bg-[var(--bg-tertiary)] flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-[var(--bg-primary)] flex items-center justify-center text-[var(--accent-indigo)] shadow-xl">
                  <Grid size={24} />
                </div>
                <div>
                  <h4 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">
                    {compName.charAt(0).toUpperCase() + compName.slice(1).replace(/_/g, ' ')}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-black text-[var(--accent-indigo)] tracking-widest uppercase">
                      Architecture Node
                    </span>
                    <div className="w-1 h-1 rounded-full bg-[var(--glass-border)]" />
                    <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase italic">
                      {compData.classes?.length || 0} Selectors Bound
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap lg:justify-end gap-2">
                {(compData.classes || []).map(cls => (
                  <span key={cls} className="text-[10px] font-mono font-bold px-3 py-1 rounded-lg bg-[var(--bg-primary)] border border-[var(--glass-border)] text-[var(--text-secondary)] shadow-sm">
                    .{cls.split(' ')[0]}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-8 grid grid-cols-1 lg:grid-cols-12 gap-12 bg-[var(--bg-primary)]">
              <div className="lg:col-span-4 space-y-8">
                <div>
                  <h5 className="text-[11px] font-black text-[var(--text-primary)] uppercase tracking-[2px] mb-4 flex items-center gap-2">
                    <Activity size={12} className="text-[var(--accent-indigo)]" /> Intent & Summary
                  </h5>
                  <div className="p-5 bg-[var(--bg-tertiary)] rounded-2xl border border-[var(--glass-border)] shadow-sm">
                    <p className="text-[14px] text-[var(--text-secondary)] leading-relaxed font-medium">
                      {compData.description}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h5 className="text-[11px] font-black text-[var(--text-primary)] uppercase tracking-[2px] mb-4">Geometry Matrix</h5>
                  <BoxModel specs={compData.specs || (compData.variants ? Object.values(compData.variants)[0].specs : {})} />
                </div>
              </div>

              <div className="lg:col-span-8 space-y-8">
                <h5 className="text-[11px] font-black text-[var(--text-primary)] uppercase tracking-[2px] mb-4 flex items-center gap-2">
                  <Sparkles size={12} className="text-[var(--accent-indigo)]" /> Rendered Variants & Hover Protocols
                </h5>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {compData.variants ? (
                    Object.entries(compData.variants).map(([vName, vData]) => (
                      <div key={vName} className="p-6 bg-[var(--bg-tertiary)] rounded-3xl border border-[var(--glass-border)] flex flex-col gap-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-[var(--text-primary)] uppercase tracking-wider">{vName.replace(/_/g, ' ')}</span>
                          <span className="text-[10px] font-mono font-bold text-[var(--accent-indigo)]">PROTOCOL_{vName.toUpperCase()}</span>
                        </div>
                        
                        <VisualPreview type={compName} variant={vName} specs={vData.specs} />
                        
                        <div className="space-y-3">
                           <div className="flex items-center gap-2">
                              <MousePointer2 size={10} className="text-[var(--accent-indigo)]" />
                              <span className="text-[9px] font-black text-[var(--text-primary)] uppercase tracking-wider">Hover Spec</span>
                           </div>
                           <p className="text-[10px] text-[var(--text-muted)] italic pl-4 border-l border-[var(--accent-indigo)]/30">
                              Triggers: {vData.specs?.shadow ? 'Depth Shift, ' : ''}{vData.specs?.icon_size ? 'Icon Scaling, ' : ''}{vData.specs?.background?.includes('gradient') ? 'Glow Intensity' : 'Border Highlight'}
                           </p>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mt-auto">
                          {Object.entries(vData.specs || {}).slice(0, 4).map(([sk, sv]) => (
                            <div key={sk} className="bg-[var(--bg-primary)] p-2 rounded-lg border border-[var(--glass-border)]">
                              <span className="block text-[8px] font-bold text-[var(--text-muted)] uppercase mb-0.5">{sk.replace(/_/g, ' ')}</span>
                              <span className="text-[10px] font-mono text-[var(--text-primary)] truncate block">{sv}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="md:col-span-2 p-6 bg-[var(--bg-tertiary)] rounded-3xl border border-[var(--glass-border)] flex flex-col gap-6">
                       <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-[var(--text-primary)] uppercase tracking-wider">Standard Variant</span>
                          <span className="text-[10px] font-mono font-bold text-[var(--accent-indigo)]">UNI_SPEC_V1</span>
                        </div>
                        <VisualPreview type={compName} variant={compName} specs={compData.specs} />
                        <div className="grid grid-cols-4 gap-3 mt-auto">
                          {Object.entries(compData.specs || {}).map(([sk, sv]) => (
                            <div key={sk} className="bg-[var(--bg-primary)] p-2 rounded-lg border border-[var(--glass-border)]">
                              <span className="block text-[8px] font-bold text-[var(--text-muted)] uppercase mb-0.5">{sk.replace(/_/g, ' ')}</span>
                              <span className="text-[10px] font-mono text-[var(--text-primary)] truncate block">{sv}</span>
                            </div>
                          ))}
                        </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LoadingPulse() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '400px', gap: '24px' }}>
      <div className="w-12 h-12 border-4 border-[var(--glass-border)] border-t-[var(--accent-indigo)] rounded-full animate-spin"></div>
      <div className="flex flex-col items-center gap-1">
        <span className="text-[12px] font-black tracking-[3px] text-[var(--text-primary)] uppercase">Syncing Design Spec</span>
        <span className="text-[10px] font-medium text-[var(--text-muted)] italic">Finalising Architecture Matrix...</span>
      </div>
    </div>
  );
}

function NetworkView({ status, onToggle, isTransitioning }) {
  const [copied, setCopied] = useState(false);

  const copyUrl = () => {
    if (status.url) {
      navigator.clipboard.writeText(status.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 flex flex-col md:flex-row gap-8">
      <div className="flex-1 bg-[var(--bg-elevated)] border border-[var(--glass-border)] rounded-[24px] p-8 shadow-xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${status.active ? "bg-green-500/20 text-green-500" : "bg-slate-500/20 text-slate-500"}`}>
              <Globe size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[var(--text-primary)]">External Access Control</h3>
              <p className="text-xs text-[var(--text-muted)] font-medium">Secure public tunnel via Ngrok</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <span className={`text-[10px] font-bold tracking-widest ${status.active ? 'text-green-500' : 'text-slate-500'}`}>
              {status.active ? 'ONLINE' : 'OFFLINE'}
            </span>
            <button
              onClick={onToggle}
              disabled={isTransitioning}
              className={`relative w-14 h-7 rounded-full transition-all duration-300 ${status.active ? "bg-green-500" : "bg-slate-600"} p-1 cursor-pointer outline-none border-none`}
            >
              <motion.div
                animate={{ x: status.active ? 28 : 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="w-5 h-5 bg-white rounded-full shadow-lg flex items-center justify-center"
              >
                {isTransitioning && <Zap size={10} className="text-slate-400 animate-pulse" />}
              </motion.div>
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className={`p-6 rounded-2xl border transition-all duration-300 ${status.active ? "bg-green-500/5 border-green-500/20" : "bg-slate-500/5 border-slate-500/10"}`}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Live URL</span>
              {status.active && (
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-green-500">
                  <CheckCircle2 size={10} /> TLS 1.3 SECURE
                </span>
              )}
            </div>
            
            {status.active ? (
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-black/20 border border-white/5 rounded-lg px-4 py-3 font-mono text-xs text-[var(--text-primary)] truncate">
                  {status.url}
                </div>
                <button
                  onClick={copyUrl}
                  className="p-3 bg-[var(--bg-elevated)] border border-[var(--glass-border)] rounded-lg hover:bg-[var(--glass-bg-light)] transition-colors text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  {copied ? <CheckCircle2 size={16} className="text-green-500" /> : <Copy size={16} />}
                </button>
              </div>
            ) : (
              <p className="text-sm text-[var(--text-muted)] italic">Tunnel is offline. Toggle the switch to activate.</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-white/5 border border-white/5">
              <span className="block text-[9px] font-bold text-[var(--text-muted)] uppercase mb-1">Region</span>
              <span className="text-xs font-bold text-[var(--text-primary)]">Europe (uk)</span>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/5">
              <span className="block text-[9px] font-bold text-[var(--text-muted)] uppercase mb-1">Domain Type</span>
              <span className="text-xs font-bold text-[var(--text-primary)]">Static Endpoint</span>
            </div>
          </div>
        </div>
      </div>

      {status.active && (
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full md:w-64 bg-[var(--bg-elevated)] border border-[var(--glass-border)] rounded-[24px] p-6 flex flex-col items-center justify-center text-center"
        >
          <div className="bg-white p-3 rounded-xl mb-4 shadow-inner">
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(status.url)}`}
              alt="Tunnel QR Code"
              className="w-32 h-32"
            />
          </div>
          <h4 className="text-xs font-bold text-[var(--text-primary)] mb-1">Quick Mobile Access</h4>
          <p className="text-[10px] text-[var(--text-muted)] px-2">Scan to open the mobile-optimised interface on your device.</p>
        </motion.div>
      )}
    </div>
  );
}

