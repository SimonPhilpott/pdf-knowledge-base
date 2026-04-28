import React from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === 'dark';

  return (
    <div className="tone-switcher">
      <button
        className={`tone-option ${!isDark ? 'active' : ''}`}
        onClick={() => isDark && onToggle()}
        title="Light Mode"
      >
        <Sun size={14} />
        <span>Light</span>
      </button>
      <button
        className={`tone-option ${isDark ? 'active' : ''}`}
        onClick={() => !isDark && onToggle()}
        title="Dark Mode"
      >
        <Moon size={14} />
        <span>Dark</span>
      </button>
    </div>
  );
}
