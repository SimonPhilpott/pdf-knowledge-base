import { Sparkles } from 'lucide-react';
import SubjectFilter from './SubjectFilter';
import ChatHistory from './ChatHistory';

export default function Sidebar({
  subjects, selectedSubjects, onSubjectsChange,
  sessions, activeSessionId, onLoadSession, onDeleteSession, onNewChat
}) {
  return (
    <aside className="sidebar">
      <div className="sidebar-section">
        <button className="new-chat-btn" onClick={onNewChat} id="new-chat-btn">
          <Sparkles size={14} />
          <span>New Chat</span>
        </button>
      </div>

      <div className="sidebar-section">
        <SubjectFilter
          subjects={subjects}
          selected={selectedSubjects}
          onChange={onSubjectsChange}
        />
      </div>

      <div className="sidebar-section" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <ChatHistory
          sessions={sessions}
          activeId={activeSessionId}
          onLoad={onLoadSession}
          onDelete={onDeleteSession}
        />
      </div>
    </aside>
  );
}
