import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import MyNav from '../Navbar/Navbar';

import './auth.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log(email, password);
    try {
      const response = await axios.post('http://localhost:8000/auth/login', { email, password });
      localStorage.setItem('token', response.data.token);
      navigate('/');
    } catch (error) {
      alert(`${error}`);
    }
  };

  return (
    <>
    <MyNav />
    <div className="login-container mt-5">
      <form onSubmit={handleLogin}>
        <h2>Login</h2>
        <input
          type="email"
          className='mb-3'
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className='mb-3'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
    </div>
    </>
  );
};

export default LoginPage;
