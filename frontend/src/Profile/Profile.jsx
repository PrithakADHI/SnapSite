import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import Masonry from "react-masonry-css";
import MyNav from "../Navbar/Navbar";
import "bootstrap/dist/css/bootstrap.min.css";
import "./profile.css";

const Profile = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [images, setImages] = useState([]);
  const [savedImages, setSavedImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const breakpointColumnsObj = {
    default: 5,
    1100: 4,
    800: 3,
    500: 2,
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Fetch user details
        const response = await axios.get(
          `http://localhost:8000/auth/user/${userId}/`
        );
        if (response.data.success) {
          setUser(response.data.data);
        } else {
          setError("Failed to fetch user data.");
        }

        // Fetch user's uploaded images
        const getImages = await axios.post(
          `http://localhost:8000/api/search/imageofuser`,
          { userId: userId }
        );
        if (getImages.data.success) {
          setImages(getImages.data.data);
        } else {
          console.log("No images found for the user.");
        }

        // Fetch saved images for the user
        if (response.data.data.savedPictures) {
          const savedImagesPromises = response.data.data.savedPictures.map(
            async (imageId) => {
              const imageResponse = await axios.get(
                `http://localhost:8000/api/images/${imageId}/`
              );
              return imageResponse.data.data; // Assuming it returns the image URL and other data
            }
          );
          const savedImagesData = await Promise.all(savedImagesPromises);
          setSavedImages(savedImagesData);
        }
      } catch (err) {
        setError("Error fetching data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    );
  }

  return (
    <>
      <MyNav />
      <div className="container profile text-center py-5">
        {/* User Profile Picture */}
        <img
          src={
            user?.profilePicture ||
            "https://i.pinimg.com/736x/a3/98/a9/a398a928bf4112234757a4adc2376d4c.jpg"
          }
          alt={user?.username || "User"}
          className="rounded-circle mb-3"
          style={{ width: "150px", height: "150px", objectFit: "cover" }}
        />
        <h3>{user?.username || "Unknown User"}</h3>
      </div>

      {/* Saved Pictures Section */}
      <div className="container">
        <h4 className="mb-4">Saved Images</h4>
        <Masonry
          breakpointCols={breakpointColumnsObj}
          className="my-masonry-grid"
          columnClassName="my-masonry-grid_column"
        >
          {savedImages.map((image, index) => (
  <div key={image._id || `saved-${image.thumbnailId || index}`} className="image-container">
    <Link to={`/image`} state={{ image }}>
      <img
        src={image.imageUrl}
        alt="Saved Image"
        className="image-item"
        style={{ borderRadius: "10px", maxWidth: "100%" }}
      />
    </Link>
  </div>
))}
        </Masonry>
      </div>

      {/* Uploaded Images Section */}
      <div className="container">
        <h4 className="mb-4">Uploaded Images</h4>
        <Masonry
          breakpointCols={breakpointColumnsObj}
          className="my-masonry-grid"
          columnClassName="my-masonry-grid_column"
        >
          {images.map((image, index) => (
  <div key={image._id || `uploaded-${image.id || index}`} className="image-container">
    <Link to={`/image`} state={{ image }}>
      <img
        src={image.imageUrl}
        alt={image.description}
        className="image-item"
        style={{ borderRadius: "10px", maxWidth: "100%" }}
      />
    </Link>
  </div>
))}
        </Masonry>
      </div>
    </>
  );
};

export default Profile;
