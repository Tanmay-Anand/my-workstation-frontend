import React, { useState } from 'react';
import api from '../api/api'; 
import { Link } from 'react-router-dom'; 
import { useNavigate } from 'react-router-dom'; 

export default function Signup() {
  const [username,setUsername]=useState('');
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [err,setErr]=useState(null);
  const navigate = useNavigate();

  //Form submission handler
  const submit = async (e) => {
    e.preventDefault(); 
    try {
      await api.post('/auth/register', { username, email, password }); 
      //Hits Spring Boot endpoint: POST http://localhost:8080/api/auth/register
      navigate('/login');
    } catch (e) {
      setErr(e.response?.data || e.message);
    }
  }

  return (
    <div className="max-w-md mx-auto p-6"> 
      <h2 className="text-2xl mb-4">Sign Up</h2>
      {/* error */}
      {err && <div className="text-red-600 mb-2">{err}</div>}

      <form onSubmit={submit}>
        <input
          value={username}
          onChange={e => setUsername(e.target.value)} 
          placeholder="username"
          className="mb-2 w-full p-2 border rounded"
        />
        <input
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="email"
          type="email"
          className="mb-2 w-full p-2 border rounded"
        />
        <input
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="password"
          type="password"
          className="mb-2 w-full p-2 border rounded"
        />
        <button className="btn w-full mt-2">Sign Up</button>
      </form>

      <p className="mt-4 text-center">
        Already registered? <Link className="text-blue-500" to="/login">Login</Link>
      </p>
    </div>
  );
}

