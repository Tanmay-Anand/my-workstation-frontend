import React, { useState } from 'react';
import api from '../api/api'; 
import { useDispatch } from 'react-redux'; 
import { setCredentials } from '../store/slices/authSlice'; 
import { useNavigate } from 'react-router-dom'; 
import { Link } from 'react-router-dom'; 

export default function Login() {
  const [username, setUsername] = useState(''); 
  const [password, setPassword] = useState(''); 
  const [err, setErr] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault(); 
    try {
      const res = await api.post('/auth/login', { username, password });
      const token = res.data.token;
      dispatch(setCredentials({ token })); 
      navigate('/home');
    } catch (e) {
      setErr(e.response?.data || e.message); 
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-semibold mb-6 text-center text-gray-900 dark:text-white">Login</h2>

        {err && (
          <div className="text-red-600 dark:text-red-400 mb-4 text-center bg-red-50 dark:bg-red-900/20 p-3 rounded">
            {err}
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <input
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="Username"
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />

          <input
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            type="password"
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />

          <button
            className="w-full rounded-md bg-blue-600 dark:bg-blue-500 px-4 py-2 text-white font-medium
                     hover:bg-blue-700 dark:hover:bg-blue-600 active:bg-blue-800 transition-colors"
          >
            Login
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          New user?{' '}
          <Link className="text-blue-600 dark:text-blue-400 hover:underline" to="/signup"> 
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}