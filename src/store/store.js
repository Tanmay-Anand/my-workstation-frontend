import { configureStore } from '@reduxjs/toolkit'; 

import authReducer from './slices/authSlice';
import notesReducer from './slices/notesSlice';
import bookmarksReducer from './slices/bookmarksSlice';
import tasksReducer from './slices/tasksSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    notes: notesReducer,
    bookmarks: bookmarksReducer,
    tasks: tasksReducer,
  },
});

export default store;