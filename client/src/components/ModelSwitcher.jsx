import React from 'react';
import { Zap, Brain, MessageSquare, Search } from 'lucide-react';
import { useDraggableScroll } from '../hooks/useDraggableScroll';
import { Tooltip } from './CursorHover';

/**
 * Model selector component with draggable horizontal scroll.
 */
export default function ModelSwitcher({ current, onChange }) {
  const { scrollRef, isDragging, handlers } = useDraggableScroll();
  const models = [
    { id: 'flash', label: 'Flash', icon: Zap, desc: 'Fast & cost-effective (£0.24/1M)' },
    { id: 'thinking', label: 'Thinking', icon: MessageSquare, desc: 'Logical reasoning & problem solving' },
    { id: 'pro', label: 'Pro', icon: Brain, desc: 'Higher quality (£1.00/1M)' },
    { id: 'research', label: 'Research', icon: Search, desc: 'Deep multi-step analysis' }
  ];

  return (
    <div 
      className="tone-switcher" 
      id="model-switcher"
      ref={scrollRef}
      {...handlers}
      style={{
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none'
      }}
    >
      {models.map((model) => {
        const Icon = model.icon;
        return (
          <Tooltip key={model.id} text={model.desc}>
            <button
              key={model.id}
              className={`tone-option ${current === model.id ? 'active' : ''}`}
              onClick={() => !isDragging && onChange(model.id)}
              style={{ 
                flexShrink: 0,
                pointerEvents: isDragging ? 'none' : 'auto'
              }}
            >
              <Icon size={14} />
              <span>{model.label}</span>
            </button>
          </Tooltip>
        );
      })}
    </div>
  );
}
