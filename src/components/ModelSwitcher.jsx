import React from 'react';
import { Zap, Brain, MessageSquare, Search } from 'lucide-react';

export default function ModelSwitcher({ current, onChange }) {
  const models = [
    { id: 'flash', label: 'Flash', icon: Zap, desc: 'Fast & cost-effective ($0.30/1M)' },
    { id: 'thinking', label: 'Thinking', icon: MessageSquare, desc: 'Logical reasoning & problem solving' },
    { id: 'pro', label: 'Pro', icon: Brain, desc: 'Higher quality ($1.25/1M)' },
    { id: 'research', label: 'Research', icon: Search, desc: 'Deep multi-step analysis' }
  ];

  return (
    <div className="tone-switcher" id="model-switcher">
      {models.map((model) => {
        const Icon = model.icon;
        return (
          <button
            key={model.id}
            className={`tone-option ${current === model.id ? 'active' : ''}`}
            onClick={() => onChange(model.id)}
            title={model.desc}
          >
            <Icon size={14} />
            <span>{model.label}</span>
          </button>
        );
      })}
    </div>
  );
}
