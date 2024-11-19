import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import MyNav from '../Navbar/Navbar';

import './auth.css';

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8000/auth/register', {
        username,
        email,
        password,
        profilePicture
      });
      localStorage.setItem('token', response.data.token);
      navigate('/'); // Redirect after registration
    } catch (error) {
      alert('User already exists');
    }
  };

  return (
    <>
    <MyNav />
    <div className="register-container mt-5">
      <form onSubmit={handleRegister}>
        <h2>Register</h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Profile Picture URL"
          value={profilePicture}
          onChange={(e) => setProfilePicture(e.target.value)}
        />
        <button type="submit">Register</button>
      </form>
    </div>
    </>
  );
};

export default RegisterPage;
