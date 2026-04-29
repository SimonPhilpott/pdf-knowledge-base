import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { Tooltip } from './CursorHover';

export default function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === 'dark';

  return (
    <div className="tone-switcher">
      <Tooltip text="Switch to Light Mode">
        <button
          className={`tone-option ${!isDark ? 'active' : ''}`}
          onClick={() => isDark && onToggle()}
        >
          <Sun size={14} />
          <span>Light</span>
        </button>
      </Tooltip>
      <Tooltip text="Switch to Dark Mode">
        <button
          className={`tone-option ${isDark ? 'active' : ''}`}
          onClick={() => !isDark && onToggle()}
        >
          <Moon size={14} />
          <span>Dark</span>
        </button>
      </Tooltip>
    </div>
  );
}
