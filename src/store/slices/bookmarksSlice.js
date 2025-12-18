import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as bookmarksApi from '../../api/bookmarksApi';

// Async thunks
export const fetchBookmarks = createAsyncThunk('bookmarks/fetch', async (params, { rejectWithValue }) => {
  try {
    const res = await bookmarksApi.fetchBookmarks(params);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || err.message);
  }
});

export const createBookmark = createAsyncThunk('bookmarks/create', async (payload, { rejectWithValue }) => {
  try {
    const res = await bookmarksApi.createBookmark(payload);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || err.message);
  }
});

export const updateBookmark = createAsyncThunk('bookmarks/update', async ({ id, payload }, { rejectWithValue }) => {
  try {
    const res = await bookmarksApi.updateBookmark(id, payload);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || err.message);
  }
});

export const deleteBookmark = createAsyncThunk('bookmarks/delete', async (id, { rejectWithValue }) => {
  try {
    await bookmarksApi.deleteBookmark(id);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data || err.message);
  }
});

// slice
const bookmarksSlice = createSlice({
  name: 'bookmarks',
  initialState: {
    page: { content: [], totalElements: 0, totalPages: 0, number: 0, size: 20 },
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchBookmarks.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchBookmarks.fulfilled, (s, a) => { s.loading = false; s.page = a.payload; })
      .addCase(fetchBookmarks.rejected, (s, a) => { s.loading = false; s.error = a.payload; })

      .addCase(createBookmark.pending, (s) => { s.error = null; })
      .addCase(createBookmark.fulfilled, (s, a) => {
        s.page.content.unshift(a.payload);
        s.page.totalElements += 1;
      })
      .addCase(createBookmark.rejected, (s, a) => { s.error = a.payload; })

      .addCase(updateBookmark.fulfilled, (s, a) => {
        s.page.content = s.page.content.map(item => item.id === a.payload.id ? a.payload : item);
      })
      .addCase(deleteBookmark.fulfilled, (s, a) => {
        s.page.content = s.page.content.filter(item => item.id !== a.payload);
        s.page.totalElements = Math.max(0, s.page.totalElements - 1);
      });
  }
});

export default bookmarksSlice.reducer;