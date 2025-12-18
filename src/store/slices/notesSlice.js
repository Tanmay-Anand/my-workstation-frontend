import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as notesApi from '../../api/notesApi';

// Async thunks
export const fetchNotes = createAsyncThunk('notes/fetch', async (params, { rejectWithValue }) => {
  try {
    const res = await notesApi.fetchNotes(params);
    return res.data; 
  } catch (err) {
    return rejectWithValue(err.response?.data || err.message);
  }
});

export const createNote = createAsyncThunk('notes/create', async (payload, { rejectWithValue }) => {
  try {
    const res = await notesApi.createNote(payload);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || err.message);
  }
});

export const updateNote = createAsyncThunk('notes/update', async ({ id, payload }, { rejectWithValue }) => {
  try {
    const res = await notesApi.updateNote(id, payload);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || err.message);
  }
});

export const deleteNote = createAsyncThunk('notes/delete', async (id, { rejectWithValue }) => {
  try {
    await notesApi.deleteNote(id);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data || err.message);
  }
});

// slice
const notesSlice = createSlice({
  name: 'notes',
  initialState: {
    page: { content: [], totalElements: 0, totalPages: 0, number: 0, size: 10 },
    loading: false,
    error: null,
  },
  reducers: {
    // optimistic UI add
    optimisticAdd(state, action) {
      state.page.content.unshift(action.payload);
      state.page.totalElements += 1;
    },
    optimisticRemove(state, action) {
      state.page.content = state.page.content.filter(n => n.id !== action.payload);
      state.page.totalElements -= 1;
    }
  },
  extraReducers(builder) {
    builder
      .addCase(fetchNotes.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchNotes.fulfilled, (s, a) => { s.loading = false; s.page = a.payload; })
      .addCase(fetchNotes.rejected, (s, a) => { s.loading = false; s.error = a.payload; })

      .addCase(createNote.pending, (s) => { s.error = null; })
      .addCase(createNote.fulfilled, (s, a) => {
        s.page.content.unshift(a.payload);
        s.page.totalElements += 1;
      })
      .addCase(createNote.rejected, (s, a) => { s.error = a.payload; })

      .addCase(updateNote.fulfilled, (s, a) => {
        s.page.content = s.page.content.map(item => item.id === a.payload.id ? a.payload : item);
      })
      .addCase(deleteNote.fulfilled, (s, a) => {
        s.page.content = s.page.content.filter(item => item.id !== a.payload);
        s.page.totalElements = Math.max(0, s.page.totalElements - 1);
      });
  }
});

export const { optimisticAdd, optimisticRemove } = notesSlice.actions;
export default notesSlice.reducer;
