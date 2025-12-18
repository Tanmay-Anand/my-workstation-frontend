import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotes, createNote, updateNote, deleteNote } from '../store/slices/notesSlice';
import { Search, Plus, Edit2, Trash2, Pin, Archive, X, Tag } from 'lucide-react';

export default function NotesPage() {
  const dispatch = useDispatch();
  const { page, loading, error } = useSelector(s => s.notes);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [pageNo, setPageNo] = useState(0);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: '',
    pinned: false,
    archived: false
  });

  //Fetch notes with debounce
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      dispatch(fetchNotes({ page: pageNo, size: 10, q: searchQuery || null }));
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [dispatch, pageNo, searchQuery]);

  //Create new note
  const handleOpenModal = (note = null) => {
    if (note) {
      setEditingNote(note);
      setFormData({
        title: note.title,
        content: note.content || '',
        tags: note.tags?.join(', ') || '',
        pinned: note.pinned,
        archived: note.archived
      });
    } else {
// Edit existing note
      setEditingNote(null);
      setFormData({ title: '', content: '', tags: '', pinned: false, archived: false });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingNote(null);
    setFormData({ title: '', content: '', tags: '', pinned: false, archived: false });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : []
    };

    try {
//If editing:
      if (editingNote) {
        await dispatch(updateNote({ id: editingNote.id, payload })).unwrap();
      } else {
        await dispatch(createNote(payload)).unwrap();
      }
      handleCloseModal();
      dispatch(fetchNotes({ page: pageNo, size: 10, q: searchQuery || null }));
    } catch (err) {
      console.error('Failed to save note:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this note?')) {
      try {
        //Delete handler
        await dispatch(deleteNote(id)).unwrap();
        dispatch(fetchNotes({ page: pageNo, size: 10, q: searchQuery || null }));
      } catch (err) {
        console.error('Failed to delete note:', err);
      }
    }
  };

//Toggle pin/unpin
  const handleTogglePin = async (note) => {
    const payload = {
      title: note.title,
      content: note.content,
      tags: note.tags || [],
      pinned: !note.pinned,
      archived: note.archived
    };
    try {
      await dispatch(updateNote({ id: note.id, payload })).unwrap();
      dispatch(fetchNotes({ page: pageNo, size: 10, q: searchQuery || null }));
    } catch (err) {
      console.error('Failed to toggle pin:', err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Notes</h1>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Plus size={20} /> New Note
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6 relative">
        <Search className="absolute left-3 top-3 text-gray-400" size={20} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setPageNo(0); }}
          placeholder="Search notes by title or content..."
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Loading & Error */}
      {loading && <div className="text-center py-8">Loading...</div>}
      {error && <div className="text-red-600 mb-4">Error: {JSON.stringify(error)}</div>}

      {/* Notes Grid */}
      {!loading && page.content?.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No notes found. Create your first note!
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {page.content?.map(note => (
          <div key={note.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-lg flex-1">{note.title}</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => handleTogglePin(note)}
                  className={`${note.pinned ? 'text-yellow-500' : 'text-gray-400'} hover:text-yellow-600`}
                >
                  <Pin size={18} />
                </button>
                <button
                  onClick={() => handleOpenModal(note)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => handleDelete(note.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            <p className="text-gray-700 text-sm mb-3 line-clamp-3">
              {note.content || 'No content'}
            </p>

            {note.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {note.tags.map((tag, i) => (
                  <span key={i} className="text-xs bg-gray-100 px-2 py-1 rounded">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <div className="text-xs text-gray-400">
              {new Date(note.updatedAt || note.createdAt).toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {page.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            disabled={pageNo === 0}
            onClick={() => setPageNo(0)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            First
          </button>
          <button
            disabled={pageNo === 0}
            onClick={() => setPageNo(pageNo - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>
          <span className="px-3 py-1">
            Page {pageNo + 1} of {page.totalPages}
          </span>
          <button
            disabled={pageNo >= page.totalPages - 1}
            onClick={() => setPageNo(pageNo + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
          <button
            disabled={pageNo >= page.totalPages - 1}
            onClick={() => setPageNo(page.totalPages - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Last
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold">
                {editingNote ? 'Edit Note' : 'New Note'}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter note title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Content</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={8}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Write your note here..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Tags</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="work, ideas, important (comma separated)"
                />
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.pinned}
                    onChange={(e) => setFormData({ ...formData, pinned: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Pin this note</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.archived}
                    onChange={(e) => setFormData({ ...formData, archived: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Archive</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {editingNote ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}