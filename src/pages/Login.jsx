import React, { useState } from 'react';
import api from '../api/api'; 
import { useDispatch } from 'react-redux'; 
import { setCredentials } from '../store/slices/authSlice'; 
import { useNavigate } from 'react-router-dom'; 
import { Link } from 'react-router-dom'; 


export default function Login() {

  //Local state for form inputs
  const [username, setUsername] = useState(''); 
  const [password, setPassword] = useState(''); 
  const [err, setErr] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  //login request
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
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="w-full max-w-md bg-white p-8 rounded-lg shadow">
      <h2 className="text-2xl font-semibold mb-6 text-center">Login</h2>

      {err && (
        <div className="text-red-600 mb-4 text-center">
          {err}
        </div>
      )}

      <form onSubmit={submit} className="space-y-4">
        <input
          value={username}
          onChange={e => setUsername(e.target.value)}
          placeholder="Username"
          className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <input
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Password"
          type="password"
          className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <button
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-white font-medium
                     hover:bg-blue-700 active:bg-blue-800 transition-colors"
        >
          Login
        </button>
      </form>

      <p className="mt-6 text-center text-sm">
        New user?{' '}
        <Link className="text-blue-600 hover:underline" to="/signup"> 
          Create an account
        </Link>
      </p>
    </div>
  </div>
);

}

