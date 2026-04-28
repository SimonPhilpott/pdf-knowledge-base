import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Hook to track mouse position and calculate optimal positioning to stay on screen.
 */
export function useCursorFollow() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [alignment, setAlignment] = useState('bottom-right');

  useEffect(() => {
    const handleMouseMove = (e) => {
      const { clientX: x, clientY: y } = e;
      const { innerWidth: width, innerHeight: height } = window;

      // Determine alignment based on cursor position relative to screen edges
      const vertical = y > height / 2 ? 'top' : 'bottom';
      const horizontal = x > width / 2 ? 'left' : 'right';
      
      setPosition({ x, y });
      setAlignment(`${vertical}-${horizontal}`);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return { position, alignment };
}

/**
 * CursorTooltip: High-fidelity floating text block that follows the cursor.
 */
export function CursorTooltip({ text, isVisible }) {
  const { position, alignment } = useCursorFollow();

  const getStyle = () => {
    const offset = 15;
    const [v, h] = alignment.split('-');
    
    return {
      position: 'fixed',
      left: position.x,
      top: position.y,
      zIndex: 1000000,
      pointerEvents: 'none',
      transform: `translate(${h === 'left' ? `calc(-100% - ${offset}px)` : `${offset}px`}, ${v === 'top' ? `calc(-100% - ${offset}px)` : `${offset}px`})`
    };
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          style={getStyle()}
        >
          <div style={{
            padding: '8px 12px',
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(12px)',
            border: '1px solid var(--glass-border)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-primary)',
            fontSize: '11px',
            fontWeight: 600,
            boxShadow: 'var(--shadow-lg)',
            maxWidth: '240px',
            lineHeight: 1.5,
            whiteSpace: 'pre-wrap'
          }}>
            {text}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * CursorPopover: Advanced hover window supporting rich content and dynamic dashboards.
 */
export function CursorPopover({ isVisible, children, title }) {
  const { position, alignment } = useCursorFollow();

  const getStyle = () => {
    const offset = 20;
    const [v, h] = alignment.split('-');
    
    return {
      position: 'fixed',
      left: position.x,
      top: position.y,
      zIndex: 1000000,
      pointerEvents: 'none',
      transform: `translate(${h === 'left' ? `calc(-100% - ${offset}px)` : `${offset}px`}, ${v === 'top' ? `calc(-100% - ${offset}px)` : `${offset}px`})`
    };
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
          style={getStyle()}
        >
          <div style={{
            width: '320px',
            background: 'var(--bg-secondary)',
            backdropFilter: 'blur(40px)',
            border: '1px solid var(--glass-border)',
            borderRadius: 'var(--radius-xl)',
            boxShadow: 'var(--shadow-xl)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {title && (
              <header style={{
                padding: '12px 16px',
                borderBottom: '1px solid var(--glass-border)',
                background: 'rgba(255, 255, 255, 0.02)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <div style={{ width: '4px', height: '12px', background: 'var(--accent-indigo)', borderRadius: '2px' }} />
                <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)' }}>
                  {title}
                </span>
              </header>
            )}
            <div style={{ padding: '16px' }}>
              {children}
            </div>
            <footer style={{
              padding: '8px 16px',
              background: 'rgba(0,0,0,0.1)',
              fontSize: '9px',
              color: 'var(--text-muted)',
              textAlign: 'right',
              borderTop: '1px solid var(--glass-border)'
            }}>
              System Intelligence Hover Protocol v1.0
            </footer>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
