// src/components/pagination/Pagination.jsx
import React from 'react';

export default function Pagination({ page, onChange }) {
  if (!page) return null;
  const { number, totalPages } = page;
  const current = number;
  const pages = Math.min(totalPages, 7);
  const start = Math.max(0, current - 3);
  const displayed = Array.from({ length: Math.min(pages, totalPages) }, (_, i) => start + i).filter(n => n >= 0 && n < totalPages);

  return (
    <div className="flex items-center gap-2 mt-4">
      <button disabled={current === 0} onClick={() => onChange(0)} className="px-2 py-1 rounded bg-gray-200 disabled:opacity-50">First</button>
      <button disabled={current === 0} onClick={() => onChange(current - 1)} className="px-2 py-1 rounded bg-gray-200 disabled:opacity-50">Prev</button>

      {displayed.map(p => (
        <button key={p}
                onClick={() => onChange(p)}
                className={`px-3 py-1 rounded ${p === current ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>
          {p + 1}
        </button>
      ))}

      <button disabled={current === totalPages - 1} onClick={() => onChange(current + 1)} className="px-2 py-1 rounded bg-gray-200 disabled:opacity-50">Next</button>
      <button disabled={current === totalPages - 1} onClick={() => onChange(totalPages - 1)} className="px-2 py-1 rounded bg-gray-200 disabled:opacity-50">Last</button>
    </div>
  );
}
