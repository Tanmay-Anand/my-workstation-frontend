import api from './api';

export const fetchNotes = ({ page = 0, size = 10, sort = 'createdAt,desc', q = null, tags = null, pinned = null }) => {

  const params = { page, size, sort };
  if (q) params.q = q; 
  if (tags && tags.length) params.tags = tags.join(','); 
  if (pinned !== null) params.pinned = pinned; 
  return api.get('/notes', { params }); 
};

export const fetchNote = (id) => api.get(`/notes/${id}`);
export const createNote = (payload) => api.post('/notes', payload); 
export const updateNote = (id, payload) => api.put(`/notes/${id}`, payload); 
export const deleteNote = (id) => api.delete(`/notes/${id}`); 
