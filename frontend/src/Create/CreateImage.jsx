import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import MyNav from '../Navbar/Navbar';

const AddImagePage = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  // Redirect to login if no token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError('');

    const token = localStorage.getItem('token'); // Retrieve the token

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    if (imageFile) {
      formData.append('file', imageFile); // Attach the file
    }

    try {
      await axios.post(
        'http://localhost:8000/api/images/',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Send the token in headers
            'Content-Type': 'multipart/form-data', // Ensure multipart form-data is set
          },
        }
      );
      setSuccess(true);
      setName('');
      setDescription('');
      setImageFile(null); // Clear the form
    } catch (err) {
      setError('Failed to add image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
  };

  return (
    <>
      <MyNav />
      <div className="container my-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card p-4">
              <h3 className="text-center mb-4">Add New Image</h3>
              {success && <div className="alert alert-success">Image added successfully!</div>}
              {error && <div className="alert alert-danger">{error}</div>}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label" htmlFor="name">Name</label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label" htmlFor="description">Description</label>
                  <textarea
                    className="form-control"
                    id="description"
                    rows="3"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  ></textarea>
                </div>

                <div className="mb-3">
                  <label className="form-label" htmlFor="imageFile">Upload Image</label>
                  <input
                    type="file"
                    className="form-control"
                    id="imageFile"
                    accept="image/*" // Restrict file type to images
                    onChange={handleFileChange}
                    required
                  />
                </div>

                <div className="d-grid">
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? (
                      <div className="spinner-border spinner-border-sm" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    ) : (
                      'Submit'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddImagePage;
