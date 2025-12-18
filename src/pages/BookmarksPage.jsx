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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Bookmarks</h1>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition"
        >
          <Plus size={20} /> New Bookmark
        </button>
      </div>

      <div className="mb-6 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400 dark:text-gray-500" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPageNo(0); }}
            placeholder="Search bookmarks by title..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 transition"
          >
            <Filter size={18} /> Filters
          </button>
          {categoryFilter && (
            <button
              onClick={() => { setCategoryFilter(''); setPageNo(0); }}
              className="flex items-center gap-2 px-3 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition"
            >
              Category: {categoryFilter} <X size={16} />
            </button>
          )}
        </div>

        {showFilters && (
          <div className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Filter by Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setPageNo(0); }}
              className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Categories</option>
              {uniqueCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {loading && <div className="text-center py-8 text-gray-600 dark:text-gray-400">Loading...</div>}
      {error && <div className="text-red-600 dark:text-red-400 mb-4 bg-red-50 dark:bg-red-900/20 p-3 rounded">Error: {JSON.stringify(error)}</div>}

      {!loading && page.content?.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          No bookmarks found. Add your first bookmark!
        </div>
      )}

      <div className="space-y-3 mb-6">
        {page.content?.map(bookmark => (
          <div key={bookmark.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Bookmark size={18} className="text-blue-600 dark:text-blue-400" />
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                    {bookmark.title || 'Untitled'}
                  </h3>
                  {bookmark.category && (
                    <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-2 py-1 rounded">
                      {bookmark.category}
                    </span>
                  )}
                </div>

                <a
                  href={bookmark.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 mb-2"
                >
                  {bookmark.url.slice(0, 60)}{bookmark.url.length > 60 ? '...' : ''}
                  <ExternalLink size={14} />
                </a>

                {bookmark.description && (
                  <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">{bookmark.description}</p>
                )}

                {bookmark.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {bookmark.tags.map((tag, i) => (
                      <span key={i} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="text-xs text-gray-400 dark:text-gray-500">
                  Added: {new Date(bookmark.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => handleOpenModal(bookmark)}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => handleDelete(bookmark.id)}
                  className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
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
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            First
          </button>
          <button
            disabled={pageNo === 0}
            onClick={() => setPageNo(pageNo - 1)}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Prev
          </button>
          <span className="px-3 py-1 text-gray-700 dark:text-gray-300">
            Page {pageNo + 1} of {page.totalPages}
          </span>
          <button
            disabled={pageNo >= page.totalPages - 1}
            onClick={() => setPageNo(pageNo + 1)}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Next
          </button>
          <button
            disabled={pageNo >= page.totalPages - 1}
            onClick={() => setPageNo(page.totalPages - 1)}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Last
          </button>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {editingBookmark ? 'Edit Bookmark' : 'New Bookmark'}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">URL *</label>
                <input
                  type="url"
                  required
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="Bookmark title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="What is this bookmark about?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="e.g., reading, coding, tools"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Tags</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="tutorial, react, javascript (comma separated)"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-600 transition"
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