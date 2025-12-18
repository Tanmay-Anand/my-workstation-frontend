// src/components/notes/NoteCard.jsx
import React from 'react';
import { format } from 'date-fns';

export default function NoteCard({ note }) {
  return (
    <div className="p-4 bg-white rounded shadow">
      <div className="flex justify-between items-start">
        <h3 className="font-semibold">{note.title}</h3>
        <div className="text-sm text-gray-500">{note.pinned ? '📌' : ''}</div>
      </div>

      <p className="mt-2 text-sm text-gray-700">{note.content?.slice(0, 200)}</p>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex gap-2">
          {note.tags?.map(t => <span key={t} className="text-xs bg-gray-100 px-2 py-1 rounded">{t}</span>)}
        </div>
        <div className="text-xs text-gray-400">{note.updatedAt ? format(new Date(note.updatedAt), 'PP p') : format(new Date(note.createdAt), 'PP p')}</div>
      </div>
    </div>
  );
}
