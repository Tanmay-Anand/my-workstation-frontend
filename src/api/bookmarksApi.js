// src/api/bookmarksApi.js
import api from './api';

export const fetchBookmarks = ({ page = 0, size = 20, tags = null, category = null, q = null }) => {
  const params = { page, size };
  if (tags && tags.length) params.tags = tags.join(',');
  if (category) params.category = category;
  if (q) params.q = q;
  return api.get('/bookmarks', { params });
};

export const fetchBookmark = (id) => api.get(`/bookmarks/${id}`);
export const createBookmark = (payload) => api.post('/bookmarks', payload);
export const updateBookmark = (id, payload) => api.put(`/bookmarks/${id}`, payload);
export const deleteBookmark = (id) => api.delete(`/bookmarks/${id}`);
