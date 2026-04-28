import React, { useRef, useState, useEffect } from 'react';
import { Sparkles, Search, Shield, Book } from 'lucide-react';

const ICON_MAP = {
  Sparkles: <Sparkles size={14} />,
  Search: <Search size={14} />,
  Shield: <Shield size={14} />,
  Book: <Book size={14} />
};

export default function GemSelector({ gems, onSelect, compact = false }) {
  const scrollRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  if (!gems || gems.length === 0) return null;

  const activeGem = gems.find(g => g.is_active === 1) || gems[0];

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll speed
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <div className="gem-selector-container" style={{ margin: compact ? '0 12px' : '0' }}>
      
      <div 
        className="tone-switcher gem-toggle" 
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        style={{ 
          cursor: isDragging ? 'grabbing' : 'grab',
          userSelect: 'none',
          overflowX: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          whiteSpace: 'nowrap',
          display: 'flex',
          padding: '2px'
        }}
      >
        {gems.map(gem => (
          <button
            key={gem.id}
            className={`tone-option ${gem.id === activeGem.id ? 'active' : ''}`}
            onClick={() => !isDragging && onSelect(gem.id)}
            title={gem.instruction}
            style={{ 
              flexShrink: 0, 
              minWidth: 'fit-content',
              padding: '8px 16px',
              pointerEvents: isDragging ? 'none' : 'auto'
            }}
          >
            {ICON_MAP[gem.icon] || <Sparkles size={14} />}
            <span style={{ fontSize: '11px', fontWeight: 600 }}>{gem.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
