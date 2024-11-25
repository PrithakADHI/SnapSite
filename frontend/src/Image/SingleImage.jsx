import { Container, Row, Col, Image, Button } from 'react-bootstrap';
import { useLocation, useNavigate, Link } from 'react-router-dom'; 
import { useState, useEffect } from 'react';
import Spinner from 'react-bootstrap/Spinner';
import axios from 'axios';
import { jwtDecode } from "jwt-decode";
import MyNav from '../Navbar/Navbar.jsx';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SingleImage = () => {
    const location = useLocation(); 
    const navigate = useNavigate(); 
    const { image } = location.state || {}; 

    const [user, setUser] = useState({}); // Initialize user as an object
    const [loading, setLoading] = useState(true);
    const [isSaved, setIsSaved] = useState(false);
    const [currentUserId, setCurrentUserId] = useState(null); // Track current authenticated user


    // Handle the case where no image data is available
    if (!image) {
        return <p>No image data available</p>; 
    }

    useEffect(() => {
        // Fetch authenticated user info from token
        const fetchAuthenticatedUser = () => {
            const token = localStorage.getItem('token'); 
            if (token) {
                try {
                    const decodedToken = jwtDecode(token); // Decode the JWT
                    setCurrentUserId(decodedToken.id); // Assuming 'userId' is in the token
                } catch (error) {
                    console.error("Error decoding token:", error);
                }
            }
        };
    
        const fetchUserData = async () => {
            if (!image.userId) {
                setLoading(false); // No userId to fetch, stop loading
                return;
            }
    
            try {
                const response = await axios.get(`http://localhost:8000/auth/user/${image.userId}/`);
                if (response.data.success) {
                    setUser(response.data.data);
                }
    
                // Check if the image is saved
                if (Array.isArray(response.data.data.savedPictures) && response.data.data.savedPictures.includes(image._id)) {
                    setIsSaved(true);
                }
    
            } catch (error) {
                console.error("Error fetching user data:", error);
            } finally {
                setLoading(false);
            }
        };
    
        fetchAuthenticatedUser(); // Get the authenticated user's info
        fetchUserData(); // Fetch the image owner's data
    }, [image.userId]);
    

    const handleSave = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
    
        try {
            const response = await axios.put(
                `http://localhost:8000/auth/user/${currentUserId}/`,
                { savedPictureId: image._id }, // Send the image ID to save
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
    
            if (response.data.success) {
                toast.success("Saved Image Successfully");
                setIsSaved(true); // Mark the image as saved
            }
        } catch (error) {
            console.error("Error saving image:", error);
            toast.error("Some Error Occured while Saving Image.");
        }
    };

    const handleUnsave = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
    
        try {
            // Fetch current user data
            const userResponse = await axios.get(`http://localhost:8000/auth/user/${currentUserId}/`, {
                headers: { Authorization: `Bearer ${token}` },
            });
    
            if (userResponse.data.success) {
                const updatedSavedPictures = userResponse.data.data.savedPictures.filter(
                    (savedPictureId) => savedPictureId !== image._id
                );
    
                // Update user data with the modified savedPictures array
                const updateResponse = await axios.put(
                    `http://localhost:8000/auth/user/${currentUserId}/`,
                    { savedPictures: updatedSavedPictures }, // Send the updated saved pictures array
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
    
                if (updateResponse.data.success) {
                    toast.success("Unsaved Image Successfully");
                    setIsSaved(false); // Mark the image as unsaved
                }
            }
        } catch (error) {
            console.error("Error unsaving image:", error);
            toast.error("Some Error Occurred while Unsaving Image.");
        }
    };
    
    
    

    const deleteImage = async () => {
        const token = localStorage.getItem('token'); // Get the token for authorization
        if (!token) return;

        try {
            await axios.delete(`http://localhost:8000/api/images/${image._id}/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            navigate(-1); // Navigate back after successful deletion
        } catch (error) {
            console.error("Error deleting image:", error);
        }
    };

    // Show spinner while loading
    if (loading) {
      return (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      );
    }

    return (
        <>
            <MyNav />
            <Container>
                {/* Back Button */}
                <Row className="my-3">
                    <Col>
                        <Button variant='link' className="text-dark" onClick={() => navigate(-1)}>
                            ← Back
                        </Button>
                    </Col>
                </Row>

                {/* Main Content */}
                <Row>
                    {/* Art Section */}
                    <Col md={8}>
                        <Image
                            src={image.imageUrl} 
                            alt={image.description}
                            fluid
                            style={{
                                borderRadius: '15px', 
                                maxHeight: '800px',
                                objectFit: 'cover' 
                            }}
                        />
                    </Col>

                    {/* Side Panel with Actions */}
                    <Col md={4}>
                        <div className="d-flex flex-column align-items-start">
                            {/* Profile */}
                            <div className="d-flex align-items-center mb-3">
                                <Link to={`/profile/${image.userId}`}>
                                <Image
                                    src={user.profilePicture || "https://i.pinimg.com/enabled/564x/47/c5/9a/47c59ac4b10d918a61c9f3cb7d08c17a.jpg"} // Fallback to default image if no profile picture
                                    roundedCircle
                                    width={50}
                                    height={50}
                                    className="me-3" // Use Bootstrap 5 class
                                />
                                </Link>
                                <div>
                                    <h6 className="mb-0">{user.username || "User Name"}</h6>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="w-100 mb-3">
                                <h3>{image.name}</h3>
                                <p>{image.description}</p>
                                { !isSaved ? (
                                    <Button onClick={handleSave} className='btn btn-primary mb-3'>Save</Button>
                                ): (
                                    <Button onClick={handleUnsave} variant="danger" className='mb-3'>
                                        Unsave
                                    </Button>
                                )}
                                <div className="d-flex">
                                        
                                    {currentUserId === image.userId && (
                                        <>
                                        <Link to={`/edit/${image._id}`} className="btn btn-primary mx-1">
                                        Edit
                                        </Link>
                                        <Button variant="danger" onClick={deleteImage}>Delete</Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Col>
                </Row>
            </Container>
            <ToastContainer
                position="bottom-center" // Default position for all toasts
                autoClose={3000}
                hideProgressBar
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
        </>
    );
};

export default SingleImage;
