import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Shield, FileText, Code, Star, Trash2, Settings, Sparkles, Grid, ChevronRight, Activity, Terminal
} from 'lucide-react';

/**
 * AdminPortal: High-Fidelity version using PURE TAILWIND.
 */
export default function AdminPortal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('structure');
  const [data, setData] = useState({ structure: null, rules: [], devRules: '', features: null });
  const [loading, setLoading] = useState(false);
  const [newRule, setNewRule] = useState('');

  useEffect(() => {
    if (isOpen) loadTabData(activeTab);
  }, [isOpen, activeTab]);

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
        [tab === 'dev-rules' ? 'devRules' : tab]: tab === 'dev-rules' ? result.content : result
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
    try {
      await fetch(`/api/admin/rules/${id}`, { method: 'DELETE' });
      loadTabData('rules');
    } catch (err) { console.error('Rule Deletion Failed:', err); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-6 md:p-12">
      {/* Background Blur Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-xl"
      />

      {/* Main Window */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-6xl h-[85vh] bg-slate-900 border border-white/10 rounded-[40px] shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <header className="px-10 py-8 border-b border-white/5 flex items-center justify-between shrink-0 bg-white/5">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-600/20">
              <Settings size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Admin</h2>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Core Interface v1.0.4</p>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <nav className="flex items-center bg-black/40 p-1 rounded-2xl border border-white/5">
              {[
                { id: 'structure', label: 'Architecture', icon: Grid },
                { id: 'rules', label: 'Logic', icon: Shield },
                { id: 'dev-rules', label: 'Manifest', icon: Terminal },
                { id: 'features', label: 'Matrix', icon: Activity },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all ${activeTab === tab.id
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                      : 'text-slate-500 hover:text-white'
                    }`}
                >
                  <tab.icon size={14} />
                  {tab.label}
                </button>
              ))}
            </nav>

            <button
              onClick={onClose}
              className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all"
            >
              <X size={20} />
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-10 bg-slate-900/50 custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'structure' && <StructureView structure={data.structure} loading={loading} />}
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
            </motion.div>
          </AnimatePresence>
        </main>
      </motion.div>
    </div>
  );
}

function StructureView({ structure, loading }) {
  if (loading && !structure) return <LoadingPulse />;
  if (!structure || !structure.structure) return <div className="text-slate-500 p-20 text-center font-bold uppercase tracking-widest text-xs">No Matrix Data</div>;

  return (
    <div className="space-y-16">
      {Object.entries(structure.structure).map(([moduleName, files]) => (
        <section key={moduleName} className="space-y-6">
          <div className="flex items-center gap-4">
            <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-4 py-1.5 rounded-full border border-indigo-500/20">
              {moduleName} Infrastructure
            </h3>
            <div className="h-px flex-1 bg-white/5" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(files || {}).map(([path, desc]) => (
              <div key={path} className="bg-white/5 border border-white/10 rounded-3xl p-6 hover:border-indigo-500/50 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-indigo-400 mb-4 group-hover:scale-110 transition-transform">
                  {path.endsWith('.js') || path.endsWith('.jsx') ? <Code size={18} /> : <FileText size={18} />}
                </div>
                <h4 className="text-[13px] font-mono font-bold text-white mb-2 truncate">{path}</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">{desc}</p>
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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-white/5 border border-white/10 rounded-[32px] p-8">
          <h4 className="text-sm font-bold text-white mb-4">Add Global Strategy</h4>
          <textarea
            value={newRule}
            onChange={(e) => setNewRule(e.target.value)}
            placeholder="Define system constraint..."
            className="w-full h-40 bg-black/40 border border-white/10 rounded-2xl p-6 text-sm text-white outline-none focus:border-indigo-500/50 transition-all resize-none"
          />
          <button
            onClick={onAdd}
            disabled={!newRule.trim()}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all disabled:opacity-20 mt-6"
          >
            Deploy Rule
          </button>
        </div>
      </div>

      <div className="lg:col-span-8 space-y-4">
        {safeRules.map((rule) => (
          <div key={rule.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
              <Shield size={18} />
            </div>
            <div className="flex-1">
              <p className="text-sm text-slate-300 leading-relaxed">{rule.content}</p>
              <div className="flex items-center gap-2 mt-4">
                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Active</span>
                <span className="text-[9px] font-mono text-slate-600">SIG: {rule.id?.slice(0, 8)}</span>
              </div>
            </div>
            <button onClick={() => onDelete(rule.id)} className="text-slate-600 hover:text-red-400 p-2">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function DevRulesView({ content, loading }) {
  if (loading && !content) return <LoadingPulse />;
  return (
    <div className="h-[600px] bg-black/60 border border-white/10 rounded-3xl overflow-hidden flex flex-col">
      <div className="px-6 py-3 border-b border-white/5 bg-white/5 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-red-500/40" />
        <div className="w-2 h-2 rounded-full bg-amber-500/40" />
        <div className="w-2 h-2 rounded-full bg-emerald-500/40" />
        <span className="text-[9px] font-mono text-slate-500 ml-4 uppercase">GEMINI.MANIFEST</span>
      </div>
      <div className="flex-1 p-8 overflow-y-auto">
        <pre className="font-mono text-[12px] text-slate-400 leading-relaxed whitespace-pre-wrap">
          {typeof content === 'string' ? content : JSON.stringify(content, null, 2)}
        </pre>
      </div>
    </div>
  );
}

function FeaturesView({ features, loading }) {
  if (loading && !features) return <LoadingPulse />;
  const items = features?.features || [];
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((f) => (
        <div key={f.id} className="bg-white/5 border border-white/10 rounded-[32px] p-8">
          <div className="flex justify-between items-start mb-6">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <Star size={18} fill={f.status === 'implemented' ? 'currentColor' : 'none'} />
            </div>
            <span className={`text-[9px] font-black px-2 py-1 rounded-md border ${f.status === 'implemented' ? 'border-emerald-500/30 text-emerald-400' : 'border-white/10 text-slate-500'} uppercase`}>
              {f.status}
            </span>
          </div>
          <h4 className="text-sm font-bold text-white mb-2">{f.name}</h4>
          <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">{f.description}</p>
        </div>
      ))}
    </div>
  );
}

function LoadingPulse() {
  return (
    <div className="flex flex-col items-center justify-center h-[400px] gap-4">
      <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Syncing...</p>
    </div>
  );
}
