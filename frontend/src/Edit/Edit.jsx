import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

import MyNav from '../Navbar/Navbar';

const EditImagePage = () => {
  const { _id } = useParams(); 
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
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

  
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get(`http://localhost:8000/api/images/${_id}/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const { name, description, tags } = response.data.data;
        setName(name || ''); 
        setDescription(description || '');
        setTags(tags || '');
      } catch (err) {
        console.error('Error fetching image details:', err);
        setError('Failed to fetch image details.');
      }
    };
    if (_id) fetchData();
  }, [_id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError('');

    const token = localStorage.getItem('token'); // Retrieve the token

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('tags', tags);
    if (imageFile) {
      formData.append('file', imageFile);
    }

    try {
      await axios.put(`http://localhost:8000/api/images/${_id}/`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSuccess(true);
      navigate('/');
    } catch (err) {
      console.error('Error updating image:', err.response || err);
      setError(err.response?.data?.message || 'Failed to update image. Please try again.');
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
              <h3 className="text-center mb-4">Edit Image</h3>
              {success && <div className="alert alert-success">Image updated successfully!</div>}
              {error && <div className="alert alert-danger">{error}</div>}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label" htmlFor="name">Name</label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    value={name || ''} 
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
                    value={description || ''} 
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  ></textarea>
                </div>

                <div className="mb-3">
                  <label className="form-label" htmlFor="tags">Tags</label>
                  <textarea
                    className="form-control"
                    id="tags"
                    rows="3"
                    value={tags || ''} 
                    onChange={(e) => setTags(e.target.value)}
                  ></textarea>
                </div>

                <div className="mb-3">
                  <label className="form-label" htmlFor="imageFile">Upload New Image (Optional)</label>
                  <input
                    type="file"
                    className="form-control"
                    id="imageFile"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </div>

                <div className="d-grid">
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? (
                      <div className="spinner-border spinner-border-sm" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    ) : (
                      'Update'
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

export default EditImagePage;
