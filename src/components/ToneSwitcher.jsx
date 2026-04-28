import React from 'react';
import { Heart, Briefcase, Target, Search } from 'lucide-react';

export default function ToneSwitcher({ current, onChange }) {
  const tones = [
    { id: 'friendly', label: 'Friendly', icon: Heart, desc: 'Conversational & human sounding' },
    { id: 'professional', label: 'Professional', icon: Briefcase, desc: 'Formal & polished tone' },
    { id: 'direct', label: 'Direct', icon: Target, desc: 'No fluff, right to the point' },
    { id: 'investigator', label: 'Investigator', icon: Search, desc: 'Exhaustive research-oriented' }
  ];

  return (
    <div className="tone-switcher" id="tone-switcher">
      {tones.map((tone) => {
        const Icon = tone.icon;
        return (
          <button
            key={tone.id}
            className={`tone-option ${current === tone.id ? 'active' : ''}`}
            onClick={() => onChange(tone.id)}
            title={tone.desc}
          >
            <Icon size={14} />
            <span>{tone.label}</span>
          </button>
        );
      })}
    </div>
  );
}
