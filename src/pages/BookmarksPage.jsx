import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBookmarks, createBookmark, updateBookmark, deleteBookmark } from '../store/slices/bookmarksSlice';
import { Search, Plus, Edit2, Trash2, X, ExternalLink, Bookmark, Tag, Filter } from 'lucide-react';

export default function BookmarksPage() {
  const dispatch = useDispatch();
  const { page, loading, error } = useSelector(s => s.bookmarks);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState(null);
  const [pageNo, setPageNo] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  
  const [formData, setFormData] = useState({
    url: '',
    title: '',
    description: '',
    category: '',
    tags: ''
  });

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      dispatch(fetchBookmarks({
        page: pageNo,
        size: 20,
        q: searchQuery || null,
        category: categoryFilter || null
      }));
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [dispatch, pageNo, searchQuery, categoryFilter]);

  const handleOpenModal = (bookmark = null) => {
    if (bookmark) {
      setEditingBookmark(bookmark);
      setFormData({
        url: bookmark.url,
        title: bookmark.title || '',
        description: bookmark.description || '',
        category: bookmark.category || '',
        tags: bookmark.tags?.join(', ') || ''
      });
    } else {
      setEditingBookmark(null);
      setFormData({ url: '', title: '', description: '', category: '', tags: '' });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingBookmark(null);
    setFormData({ url: '', title: '', description: '', category: '', tags: '' });
  };

  const handleSubmit = async () => {
    if (!formData.url.trim()) {
      alert('URL is required');
      return;
    }
    
    if (!formData.url.startsWith('http://') && !formData.url.startsWith('https://')) {
      alert('URL must start with http:// or https://');
      return;
    }

    const payload = {
      ...formData,
      tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : []
    };

    try {
      if (editingBookmark) {
        await dispatch(updateBookmark({ id: editingBookmark.id, payload })).unwrap();
      } else {
        await dispatch(createBookmark(payload)).unwrap();
      }
      handleCloseModal();
      dispatch(fetchBookmarks({ page: pageNo, size: 20, q: searchQuery || null, category: categoryFilter || null }));
    } catch (err) {
      console.error('Failed to save bookmark:', err);
      alert('Failed to save bookmark: ' + (err.message || 'Unknown error'));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this bookmark?')) {
      try {
        await dispatch(deleteBookmark(id)).unwrap();
        dispatch(fetchBookmarks({ page: pageNo, size: 20, q: searchQuery || null, category: categoryFilter || null }));
      } catch (err) {
        console.error('Failed to delete bookmark:', err);
      }
    }
  };

  const uniqueCategories = [...new Set(page.content?.map(b => b.category).filter(Boolean))];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Bookmarks</h1>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Plus size={20} /> New Bookmark
        </button>
      </div>

      <div className="mb-6 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPageNo(0); }}
            placeholder="Search bookmarks by title..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Filter size={18} /> Filters
          </button>
          {categoryFilter && (
            <button
              onClick={() => { setCategoryFilter(''); setPageNo(0); }}
              className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg"
            >
              Category: {categoryFilter} <X size={16} />
            </button>
          )}
        </div>

        {showFilters && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <label className="block text-sm font-medium mb-2">Filter by Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setPageNo(0); }}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {uniqueCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {loading && <div className="text-center py-8">Loading...</div>}
      {error && <div className="text-red-600 mb-4">Error: {JSON.stringify(error)}</div>}

      {!loading && page.content?.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No bookmarks found. Add your first bookmark!
        </div>
      )}

      <div className="space-y-3 mb-6">
        {page.content?.map(bookmark => (
          <div key={bookmark.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Bookmark size={18} className="text-blue-600" />
                  <h3 className="font-semibold text-lg">
                    {bookmark.title || 'Untitled'}
                  </h3>
                  {bookmark.category && (
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                      {bookmark.category}
                    </span>
                  )}
                </div>

                <a
                  href={bookmark.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline flex items-center gap-1 mb-2"
                >
                  {bookmark.url.slice(0, 60)}{bookmark.url.length > 60 ? '...' : ''}
                  <ExternalLink size={14} />
                </a>

                {bookmark.description && (
                  <p className="text-gray-700 text-sm mb-2">{bookmark.description}</p>
                )}

                {bookmark.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {bookmark.tags.map((tag, i) => (
                      <span key={i} className="text-xs bg-gray-100 px-2 py-1 rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="text-xs text-gray-400">
                  Added: {new Date(bookmark.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => handleOpenModal(bookmark)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => handleDelete(bookmark.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

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

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold">
                {editingBookmark ? 'Edit Bookmark' : 'New Bookmark'}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">URL *</label>
                <input
                  type="url"
                  required
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Bookmark title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="What is this bookmark about?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., reading, coding, tools"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Tags</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="tutorial, react, javascript (comma separated)"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {editingBookmark ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}