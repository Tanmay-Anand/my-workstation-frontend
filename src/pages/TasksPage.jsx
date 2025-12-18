import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTasks, createTask, updateTask, deleteTask, completeTask } from '../store/slices/tasksSlice';
import { Search, Plus, Edit2, Trash2, X, CheckCircle, Circle, Calendar, AlertCircle } from 'lucide-react';

export default function TasksPage() {
  const dispatch = useDispatch();
  const { page, loading, error } = useSelector(s => s.tasks);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [pageNo, setPageNo] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  
  const [formData, setFormData] = useState({
    text: '',
    status: 'PENDING',
    priority: 'MEDIUM',
    dueDate: ''
  });

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      dispatch(fetchTasks({
        page: pageNo,
        size: 20,
        q: searchQuery || null,
        status: statusFilter || null,
        priority: priorityFilter || null
      }));
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [dispatch, pageNo, searchQuery, statusFilter, priorityFilter]);

  const handleOpenModal = (task = null) => {
    if (task) {
      setEditingTask(task);
      setFormData({
        text: task.text,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate || ''
      });
    } else {
      setEditingTask(null);
      setFormData({ text: '', status: 'PENDING', priority: 'MEDIUM', dueDate: '' });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTask(null);
    setFormData({ text: '', status: 'PENDING', priority: 'MEDIUM', dueDate: '' });
  };

  const handleSubmit = async () => {
    if (!formData.text.trim()) {
      alert('Task text is required');
      return;
    }

    const payload = {
      ...formData,
      dueDate: formData.dueDate || null
    };

    try {
      if (editingTask) {
        await dispatch(updateTask({ id: editingTask.id, payload })).unwrap();
      } else {
        await dispatch(createTask(payload)).unwrap();
      }
      handleCloseModal();
      dispatch(fetchTasks({ page: pageNo, size: 20, q: searchQuery || null, status: statusFilter || null, priority: priorityFilter || null }));
    } catch (err) {
      console.error('Failed to save task:', err);
      alert('Failed to save task: ' + (err.message || 'Unknown error'));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this task?')) {
      try {
        await dispatch(deleteTask(id)).unwrap();
        dispatch(fetchTasks({ page: pageNo, size: 20, q: searchQuery || null, status: statusFilter || null, priority: priorityFilter || null }));
      } catch (err) {
        console.error('Failed to delete task:', err);
      }
    }
  };

  const handleToggleComplete = async (task) => {
    try {
      if (task.status === 'PENDING') {
        await dispatch(completeTask(task.id)).unwrap();
      } else {
        const payload = { ...task, status: 'PENDING' };
        await dispatch(updateTask({ id: task.id, payload })).unwrap();
      }
      dispatch(fetchTasks({ page: pageNo, size: 20, q: searchQuery || null, status: statusFilter || null, priority: priorityFilter || null }));
    } catch (err) {
      console.error('Failed to toggle task:', err);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH': return 'text-red-600 bg-red-50';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-50';
      case 'LOW': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const isOverdue = (dueDate, status) => {
    if (!dueDate || status === 'DONE') return false;
    return new Date(dueDate) < new Date(new Date().setHours(0, 0, 0, 0));
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Tasks</h1>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Plus size={20} /> New Task
        </button>
      </div>

      <div className="mb-6 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPageNo(0); }}
            placeholder="Search tasks..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Filters
          </button>
          
          {statusFilter && (
            <button
              onClick={() => { setStatusFilter(''); setPageNo(0); }}
              className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg"
            >
              Status: {statusFilter} <X size={16} />
            </button>
          )}
          
          {priorityFilter && (
            <button
              onClick={() => { setPriorityFilter(''); setPageNo(0); }}
              className="flex items-center gap-2 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg"
            >
              Priority: {priorityFilter} <X size={16} />
            </button>
          )}
        </div>

        {showFilters && (
          <div className="p-4 bg-gray-50 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPageNo(0); }}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All</option>
                <option value="PENDING">Pending</option>
                <option value="DONE">Done</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Priority</label>
              <select
                value={priorityFilter}
                onChange={(e) => { setPriorityFilter(e.target.value); setPageNo(0); }}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {loading && <div className="text-center py-8">Loading...</div>}
      {error && <div className="text-red-600 mb-4">Error: {JSON.stringify(error)}</div>}

      {!loading && page.content?.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No tasks found. Create your first task!
        </div>
      )}

      <div className="space-y-2 mb-6">
        {page.content?.map(task => (
          <div
            key={task.id}
            className={`bg-white border rounded-lg p-4 hover:shadow-md transition ${
              task.status === 'DONE' ? 'opacity-60' : ''
            }`}
          >
            <div className="flex items-start gap-3">
              <button
                onClick={() => handleToggleComplete(task)}
                className="mt-1"
              >
                {task.status === 'DONE' ? (
                  <CheckCircle size={24} className="text-green-600" />
                ) : (
                  <Circle size={24} className="text-gray-400 hover:text-gray-600" />
                )}
              </button>

              <div className="flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className={`text-lg ${task.status === 'DONE' ? 'line-through text-gray-500' : ''}`}>
                      {task.text}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>

                      {task.dueDate && (
                        <span className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${
                          isOverdue(task.dueDate, task.status)
                            ? 'bg-red-100 text-red-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          <Calendar size={12} />
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                          {isOverdue(task.dueDate, task.status) && (
                            <AlertCircle size={12} className="ml-1" />
                          )}
                        </span>
                      )}

                      <span className="text-xs text-gray-400">
                        Created: {new Date(task.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenModal(task)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(task.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
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
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold">
                {editingTask ? 'Edit Task' : 'New Task'}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Task *</label>
                <textarea
                  required
                  value={formData.text}
                  onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                  rows={3}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="What needs to be done?"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="DONE">Done</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Due Date</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  {editingTask ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}