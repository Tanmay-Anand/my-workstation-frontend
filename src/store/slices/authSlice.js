

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'; 
import { jwtDecode } from 'jwt-decode'; 
import { setToken as setApiToken } from '../../api/authToken'; 

/*******************************
 * Helpers
 *******************************/

function decodeJwt(token) {
  try {
    const claims = jwtDecode(token);
    return {
      username: claims.sub,
      uid: claims.uid,
      expiresAt: claims.exp * 1000
    };
  } catch {
    return null;
  }
}

/*******************************
 * Initial Redux State
 *******************************/
//Before login:
const initialState = {
  token: null,
  user: null,
  expiresAt: null
};

/*******************************
 * loginUser Thunk
 *******************************/
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ username, password }, { rejectWithValue }) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      //Error handling
      if (!res.ok) {
        const err = await res.json();
        return rejectWithValue(err);
      }

      //On success:
      const data = await res.json(); 
      return { token: data.token };

    } catch (err) {
      return rejectWithValue({ message: 'Network error' });
    }
  }
);

/*******************************
 * Slice
 *******************************/
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action) {
      const { token } = action.payload;

      const decoded = decodeJwt(token);
      if (!decoded) {
        // invalid/corrupted token
        state.token = null;
        state.user = null;
        state.expiresAt = null;
        localStorage.removeItem('authToken');
        setApiToken(null);
        return;
      }

      state.token = token;
      state.user = {
        username: decoded.username,
        uid: decoded.uid
      };
      state.expiresAt = decoded.expiresAt;

      // persist
      localStorage.setItem('authToken', token);
      setApiToken(token);
    },

    clearCredentials(state) {
      state.token = null;
      state.user = null;
      state.expiresAt = null;

      localStorage.removeItem('authToken');
      setApiToken(null);
    }
  },

  extraReducers: builder => {
    builder
      .addCase(loginUser.fulfilled, (state, action) => {
        const { token } = action.payload;

        const decoded = decodeJwt(token);
        if (!decoded) return;

        state.token = token;
        state.user = {
          username: decoded.username,
          uid: decoded.uid
        };
        state.expiresAt = decoded.expiresAt;

        localStorage.setItem('authToken', token);
        setApiToken(token);
      })
      .addCase(loginUser.rejected, (state, action) => {
      });
  }
});

export const { setCredentials, clearCredentials } = authSlice.actions;
export default authSlice.reducer;

/*******************************
 * Auto Logout System
 *******************************/
export const scheduleLogout = (token) => dispatch => {
  const decoded = decodeJwt(token);
  if (!decoded) {
    dispatch(clearCredentials());
    return;
  }

  const delay = decoded.expiresAt - Date.now();
  if (delay <= 0) {
    dispatch(clearCredentials());
    return;
  }

  setTimeout(() => {
    dispatch(clearCredentials());
    window.location.href = '/login';
  }, delay);
};

/*******************************
 * Restore Session After Refresh
 *******************************/
export const restoreSession = () => dispatch => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    // No token, clear everything
    dispatch(clearCredentials());
    return;
  }

  const decoded = decodeJwt(token);
  if (!decoded || decoded.expiresAt < Date.now()) {
    // Token expired or invalid
    dispatch(clearCredentials());
    return;
  }

  // Valid token, restore session
  dispatch(setCredentials({ token }));
  dispatch(scheduleLogout(token));
};