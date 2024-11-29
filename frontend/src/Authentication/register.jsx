import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import MyNav from '../Navbar/Navbar';

import './auth.css';

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profilePictureFile, setProfilePictureFile] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);
      formData.append('email', email);
      if (profilePictureFile) {
        formData.append('file', profilePictureFile);
      }
      const response = await axios.post('http://localhost:8000/auth/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      localStorage.setItem('token', response.data.token);
      navigate('/'); // Redirect after registration
    } catch (error) {
      alert('User already exists');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setProfilePictureFile(file);
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
          className='form-control mb-3'
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          className='form-control mb-3'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className='form-control mb-3'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="file"
          id="profilePictureFile"
          className='form-control mb-3'
          accept="image/*"
          onChange={handleFileChange}
        />
        <button type="submit">Register</button>
      </form>
    </div>
    </>
  );
};

export default RegisterPage;
