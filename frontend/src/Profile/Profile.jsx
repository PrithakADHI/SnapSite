import React, { useEffect, useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Masonry from "../Masonry/Masonry";
import MyNav from "../Navbar/Navbar";
import { jwtDecode } from "jwt-decode"; // Fixed import
import "./profile.css";

const getUserInfo = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    return null;
  }

  try {
    return jwtDecode(token);
  } catch (error) {
    console.error("Invalid token:", error);
    localStorage.removeItem("token");
    return null;
  }
};

const Profile = () => {
  const { userId } = useParams();
  const currentUser = useMemo(() => getUserInfo(), []);
  const [user, setUser] = useState(null);
  const [images, setImages] = useState([]);
  const [savedImages, setSavedImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const navigate = useNavigate();

  const breakpointColumnsObj = {
    default: 5,
    1100: 4,
    800: 3,
    500: 2,
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);

        // Fetch user details
        const response = await axios.get(
          `http://localhost:8000/auth/user/${userId}/`
        );

        if (response.data.success) {
          setUser(response.data.data);
          setFollowing(response.data.data.following || []);
          setFollowers(response.data.data.followers || []);
        } else {
          throw new Error("Failed to fetch user data.");
        }

        // Fetch user's uploaded images
        const getImages = await axios.post(
          `http://localhost:8000/api/search/imageofuser`,
          { userId }
        );

        if (getImages.data.success) {
          setImages(getImages.data.data);
        }

        // Fetch saved images for the user
        const savedPictures = response.data.data.savedPictures || [];
        if (savedPictures.length > 0) {
          const savedImagesData = await Promise.all(
            savedPictures.map(async (imageId) => {
              const imageResponse = await axios.get(
                `http://localhost:8000/api/images/${imageId}/`
              );
              return imageResponse.data.data;
            })
          );
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

  const handleFollowToggle = async () => {
    if (!user || !currentUser) return;

    try {
      const isFollowing = followers.includes(currentUser.id);

      // Update the logged-in user's `following` array
      const updatedFollowing = isFollowing
        ? following.filter((id) => id !== userId)
        : [...following, userId];

      // Update the visited user's `followers` array
      const updatedFollowers = isFollowing
        ? followers.filter((id) => id !== currentUser.id)
        : [...followers, currentUser.id];

      // Make API calls to update both arrays
      await Promise.all([
        axios.put(`http://localhost:8000/auth/user/${currentUser.id}/`, {
          following: JSON.stringify(updatedFollowing),
        }),
        axios.put(`http://localhost:8000/auth/user/${userId}/`, {
          followers: JSON.stringify(updatedFollowers),
        }),
      ]);

      setFollowers(updatedFollowers);
    } catch (err) {
      console.error("Failed to update follow status:", err);
    }
  };

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

        {(currentUser?.id !== userId) && (currentUser) && (
          <div>
            <button
              onClick={handleFollowToggle}
              type="button"
              className={`btn ${
                followers.includes(currentUser?.id)
                  ? "btn-outline-danger"
                  : "btn-outline-primary"
              } mb-2`}
            >
              {followers.includes(currentUser?.id) ? "Unfollow" : "Follow"}
            </button>
          </div>
        )}
        <p>
          Following: {following.length} Followers: {followers.length}
        </p>
      </div>

      {/* Saved Images Section */}
      <div className="container">
        {savedImages.length > 0 && <h4 className="mb-4">Saved Images</h4>}
      </div>
      <Masonry images={savedImages} breakpointColumnsObj={breakpointColumnsObj} />

      {/* Uploaded Images Section */}
      <div className="container">
        {images.length > 0 && <h4 className="mb-4">Uploaded Images</h4>}
      </div>
      <Masonry images={images} breakpointColumnsObj={breakpointColumnsObj} />
    </>
  );
};

export default Profile;
