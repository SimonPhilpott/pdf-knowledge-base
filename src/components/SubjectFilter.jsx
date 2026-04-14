import { Folder } from 'lucide-react';

export default function SubjectFilter({ subjects, selected, onChange }) {
  const toggleSubject = (subject) => {
    if (selected.includes(subject)) {
      onChange(selected.filter(s => s !== subject));
    } else {
      onChange([...selected, subject]);
    }
  };

  const toggleAll = () => {
    if (selected.length === subjects.length) {
      onChange([]);
    } else {
      onChange(subjects.map(s => s.subject));
    }
  };

  if (!subjects || subjects.length === 0) {
    return (
      <div>
        <div className="sidebar-section-title">
          <Folder size={12} />
          Subjects
        </div>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', padding: '8px 0' }}>
          No subjects found. Sync your Drive to get started.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="sidebar-section-title" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Folder size={12} />
          Subjects
        </span>
        <button
          onClick={toggleAll}
          style={{
            background: 'none', border: 'none', color: 'var(--accent-indigo-light)',
            cursor: 'pointer', fontSize: '10px', fontFamily: 'var(--font-sans)', fontWeight: 600
          }}
        >
          {selected.length === subjects.length ? 'None' : 'All'}
        </button>
      </div>
      <ul className="subject-filter-list">
        {subjects.map((s) => (
          <li
            key={s.subject}
            className="subject-filter-item"
            onClick={() => toggleSubject(s.subject)}
          >
            <input
              type="checkbox"
              checked={selected.includes(s.subject)}
              readOnly
            />
            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {s.subject}
            </span>
            <span className="subject-badge">{s.document_count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
