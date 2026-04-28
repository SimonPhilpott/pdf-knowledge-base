import React, { useState } from 'react';
import { Search, Lightbulb, Dice5, X } from 'lucide-react';

export default function TopicDiscovery({ topics, suggestions, onTopicClick, onRefresh }) {
  const [searchQuery, setSearchQuery] = useState('');
  
  const subjectKeys = Object.keys(topics || {});
  
  // Filter topics based on search query
  const filteredTopics = {};
  let totalFilteredCount = 0;
  
  subjectKeys.forEach(subject => {
    const matching = topics[subject].filter(t => 
      t.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    if (matching.length > 0) {
      filteredTopics[subject] = matching;
      totalFilteredCount += matching.length;
    }
  });

  const hasTopics = subjectKeys.some(k => topics[k].length > 0);
  const showSuggestions = !searchQuery && suggestions && suggestions.length > 0;

  return (
    <aside className="topic-panel">
      <div className="topic-panel-header">
        <div className="topic-panel-title">
          <Search size={16} />
          Discover Topics
        </div>
      </div>

      <div className="topic-search-wrapper">
        <Search size={14} className="search-icon" />
        <input 
          type="text" 
          placeholder="Filter topics..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="topic-search-input"
        />
        {searchQuery && (
          <button className="search-clear" onClick={() => setSearchQuery('')}>
            <X size={14} />
          </button>
        )}
      </div>

      <div className="topic-panel-content">
        {!searchQuery && (
          <div style={{ marginBottom: '16px' }}>
            <button className="surprise-btn" onClick={onRefresh} id="surprise-btn" style={{ width: '100%', marginBottom: '8px' }}>
              <Dice5 size={14} />
              Ask Your Knowledge Base
            </button>

            {showSuggestions && (
              <div>
                <div className="topic-subject-name" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Lightbulb size={12} />
                  Suggested Questions
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      className="topic-chip user-message-style"
                      onClick={() => onTopicClick(s.suggested_question)}
                      style={{ textAlign: 'left', width: '100%', marginBottom: '4px' }}
                      title={`From: ${s.filename}`}
                    >
                      {s.suggested_question}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {!hasTopics ? (
          <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)' }}>
            <Search size={32} style={{ marginBottom: '12px', opacity: 0.3 }} />
            <p style={{ fontSize: '13px', lineHeight: 1.6 }}>
              Topics will appear here once your PDFs are synced and indexed.
            </p>
          </div>
        ) : totalFilteredCount === 0 && searchQuery ? (
          <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '13px' }}>No topics match "{searchQuery}"</p>
          </div>
        ) : (
          <>
            {Object.keys(filteredTopics).map(subject => (
              <div key={subject} className="topic-subject-group">
                <div className="topic-subject-name">{subject}</div>
                <div className="topic-chips">
                  {filteredTopics[subject].map((topic, i) => (
                    <button
                      key={i}
                      className="topic-chip"
                      onClick={() => onTopicClick(topic.suggestedQuestion || `Tell me about ${topic.topic}`)}
                      title={topic.description || topic.topic}
                    >
                      {topic.topic}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </aside>
  );
}
