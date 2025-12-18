// src/store/slices/tasksSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as tasksApi from '../../api/tasksApi';

// Async thunks
export const fetchTasks = createAsyncThunk('tasks/fetch', async (params, { rejectWithValue }) => {
  try {
    const res = await tasksApi.fetchTasks(params);
    return res.data; 
  } catch (err) {
    return rejectWithValue(err.response?.data || err.message);
  }
});

export const createTask = createAsyncThunk('tasks/create', async (payload, { rejectWithValue }) => {
  try {
    const res = await tasksApi.createTask(payload);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || err.message);
  }
});

export const updateTask = createAsyncThunk('tasks/update', async ({ id, payload }, { rejectWithValue }) => {
  try {
    const res = await tasksApi.updateTask(id, payload);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || err.message);
  }
});

export const deleteTask = createAsyncThunk('tasks/delete', async (id, { rejectWithValue }) => {
  try {
    await tasksApi.deleteTask(id);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data || err.message);
  }
});

export const completeTask = createAsyncThunk('tasks/complete', async (id, { rejectWithValue }) => {
  try {
    const res = await tasksApi.completeTask(id);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || err.message);
  }
});

// slice
const tasksSlice = createSlice({
  name: 'tasks',
  initialState: {
    page: { content: [], totalElements: 0, totalPages: 0, number: 0, size: 20 },
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchTasks.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchTasks.fulfilled, (s, a) => { s.loading = false; s.page = a.payload; })
      .addCase(fetchTasks.rejected, (s, a) => { s.loading = false; s.error = a.payload; })

      .addCase(createTask.pending, (s) => { s.error = null; })
      .addCase(createTask.fulfilled, (s, a) => {
        s.page.content.unshift(a.payload);
        s.page.totalElements += 1;
      })
      .addCase(createTask.rejected, (s, a) => { s.error = a.payload; })

      .addCase(updateTask.fulfilled, (s, a) => {
        s.page.content = s.page.content.map(item => item.id === a.payload.id ? a.payload : item);
      })
      .addCase(deleteTask.fulfilled, (s, a) => {
        s.page.content = s.page.content.filter(item => item.id !== a.payload);
        s.page.totalElements = Math.max(0, s.page.totalElements - 1);
      })
      .addCase(completeTask.fulfilled, (s, a) => {
        s.page.content = s.page.content.map(item => item.id === a.payload.id ? a.payload : item);
      });
  }
});

export default tasksSlice.reducer;