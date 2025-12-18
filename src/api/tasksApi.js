import api from './api';

export const fetchTasks = ({ page = 0, size = 20, q = null, status = null, priority = null, dueBefore = null, dueAfter = null }) => {
  const params = { page, size };
  if (q) params.q = q;
  if (status) params.status = status;
  if (priority) params.priority = priority;
  if (dueBefore) params.dueBefore = dueBefore; 
  if (dueAfter) params.dueAfter = dueAfter;
  return api.get('/tasks', { params });
};

export const fetchTask = (id) => api.get(`/tasks/${id}`);
export const createTask = (payload) => api.post('/tasks', payload);
export const updateTask = (id, payload) => api.put(`/tasks/${id}`, payload);
export const deleteTask = (id) => api.delete(`/tasks/${id}`);
export const completeTask = (id) => api.post(`/tasks/${id}/complete`);

