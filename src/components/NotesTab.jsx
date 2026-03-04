import React from 'react';
import { useBid } from '../context/BidContext';

export default function NotesTab() {
  const { state, dispatch } = useBid();
  const { notes } = state;

  return (
    <div className="bp" style={{ padding: 20 }}>
      {notes.map(sec => (
        <div key={sec.id} className="note-section">
          <div className="note-section-head">
            <input
              className="et"
              value={sec.title}
              onChange={e => dispatch({ type: 'UPDATE_NOTE_SECTION_TITLE', sectionId: sec.id, title: e.target.value })}
              style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy)', textTransform: 'uppercase', flex: 1 }}
            />
            <button
              className="db"
              onClick={() => dispatch({ type: 'DELETE_NOTE_SECTION', sectionId: sec.id })}
              title="Delete section"
              style={{ fontSize: 14 }}
            >✕</button>
          </div>
          <div style={{ padding: '8px 16px' }}>
            {sec.items.map(item => (
              <div key={item.id} className="note-item">
                <span className="note-bullet">•</span>
                <input
                  className="et"
                  value={item.text}
                  onChange={e => dispatch({ type: 'UPDATE_NOTE', sectionId: sec.id, noteId: item.id, text: e.target.value })}
                  style={{ flex: 1, fontSize: 12, color: 'var(--gray-700)', lineHeight: 1.6 }}
                />
                <button
                  className="db"
                  onClick={() => dispatch({ type: 'DELETE_NOTE', sectionId: sec.id, noteId: item.id })}
                  style={{ marginTop: 2 }}
                >✕</button>
              </div>
            ))}
            <button
              className="ar"
              onClick={() => dispatch({ type: 'ADD_NOTE', sectionId: sec.id })}
              style={{ marginTop: 6, fontSize: 10, padding: '3px 10px' }}
            >+ Add Note</button>
          </div>
        </div>
      ))}
      <div style={{ marginTop: 16 }}>
        <button
          className="ar"
          onClick={() => dispatch({ type: 'ADD_NOTE_SECTION' })}
          style={{ maxWidth: 300, margin: 0 }}
        >+ Add Section</button>
      </div>
    </div>
  );
}
