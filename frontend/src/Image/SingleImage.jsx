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

    const [user, setUser] = useState({});
    const [loading, setLoading] = useState(true);
    const [isSaved, setIsSaved] = useState(false);
    const [currentUserId, setCurrentUserId] = useState(null);

    if (!image) {
        return <p>No image data available</p>; 
    }

    useEffect(() => {
        const fetchAuthenticatedUser = () => {
            const token = localStorage.getItem('token'); 

            if (token) {
                try {
                    const decodedToken = jwtDecode(token);
                    setCurrentUserId(decodedToken.id);
                } catch (error) {
                    console.error("Error decoding token:", error);
                }
            }
        };
    
        const fetchUserData = async () => {
            if (!image.userId) {
                setLoading(false);
                return;
            }
    
            try {
                const response = await axios.get(`${import.meta.env.VITE_REACT_APP_BACKEND_URL}auth/user/${image.userId}/`);
                if (response.data.success) {
                    setUser(response.data.data);
                }
    
            } catch (error) {
                console.error("Error fetching user data:", error);
            } finally {
                setLoading(false);
            }
        };

        const fetchSaved = async () => {
            try {
                if (currentUserId) {
                    const response = await axios.get(`${import.meta.env.VITE_REACT_APP_BACKEND_URL}auth/user/${currentUserId}`);
                    if (!response.data.success) return;

                    if (Array.isArray(response.data.data.savedPictures) && response.data.data.savedPictures.includes(image._id)) {
                        setIsSaved(true);
                    }
                }
        } catch (error) {
            console.error("Error fetching data of current user: ", error);
        }
        }
    
        fetchAuthenticatedUser();
        fetchUserData();
        fetchSaved();
    }, [image.userId, currentUserId]);

    const handleSave = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
    
        try {
            const response = await axios.put(
                `${import.meta.env.VITE_REACT_APP_BACKEND_URL}auth/user/${currentUserId}/`,
                { savedPictureId: image._id },
                { headers: { Authorization: `Bearer ${token}` } }
            );
    
            if (response.data.success) {
                toast.success("Saved Image Successfully");
                setIsSaved(true);
            }
        } catch (error) {
            console.error("Error saving image:", error);
            toast.error("Some Error Occurred while Saving Image.");
        }
    };

    const handleUnsave = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
    
        try {
            const response = await axios.put(
                `${import.meta.env.VITE_REACT_APP_BACKEND_URL}auth/user/${currentUserId}/`,
                { removePictureId: image._id }, // Send the image ID to remove
                { headers: { Authorization: `Bearer ${token}` } }
            );
    
            if (response.data.success) {
                toast.success("Unsaved Image Successfully");
                setIsSaved(false);
            }
        } catch (error) {
            console.error("Error unsaving image:", error);
            toast.error("Some Error Occurred while Unsaving Image.");
        }
    };
    

    const deleteImage = async () => {
        const token = localStorage.getItem('token'); 
        if (!token) return;

        try {
            await axios.delete(`${import.meta.env.VITE_REACT_APP_BACKEND_URL}api/images/${image._id}/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            navigate(-1);
        } catch (error) {
            console.error("Error deleting image:", error);
        }
    };

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
                <Row className="my-3">
                    <Col>
                        <Button variant='outline-success' className="text-dark" onClick={() => navigate(-1)}>
                            ← Back
                        </Button>
                    </Col>
                </Row>

                <Row>
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
                    <Col md={4}>
                        <div className="d-flex flex-column align-items-start">
                            <div className="d-flex align-items-center mb-3">
                                <Link to={`/profile/${image.userId}`}>
                                    <Image
                                        src={user.profilePicture || "https://i.pinimg.com/enabled/564x/47/c5/9a/47c59ac4b10d918a61c9f3cb7d08c17a.jpg"}
                                        roundedCircle
                                        width={50}
                                        height={50}
                                        className="me-3"
                                    />
                                </Link>
                                <div>
                                    <h6 className="mb-0">{user.username || "User Name"}</h6>
                                </div>
                            </div>

                            <div className="w-100 mb-3">
                                <h3>{image.name}</h3>
                                <p>{image.description}</p>
                                
                                {(currentUserId && !isSaved) && (
                                    <Button onClick={handleSave} variant='outline-primary' className='mb-3'>Save</Button>
                                )}
                                {(currentUserId && isSaved) && (
                                    <Button onClick={handleUnsave} variant="outline-danger" className='mb-3'>
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
                position="bottom-center"
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
