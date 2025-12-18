// src/components/notes/NoteList.jsx
import React from 'react';
import NoteCard from './NoteCard';

export default function NoteList({ notes }) {
  if (!notes || notes.length === 0) return <div>No notes</div>;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {notes.map(n => <NoteCard key={n.id} note={n} />)}
    </div>
  );
}
