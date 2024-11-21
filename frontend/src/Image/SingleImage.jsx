import { Container, Row, Col, Image, Button } from 'react-bootstrap';
import { useLocation, useNavigate, Link } from 'react-router-dom'; 
import { useState, useEffect } from 'react';
import Spinner from 'react-bootstrap/Spinner';
import axios from 'axios';
import { jwtDecode } from "jwt-decode";
import MyNav from '../Navbar/Navbar.jsx';

const SingleImage = () => {
    const location = useLocation(); 
    const navigate = useNavigate(); 
    const { image } = location.state || {}; 

    const [user, setUser] = useState({}); // Initialize user as an object
    const [loading, setLoading] = useState(true);
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
            } catch (error) {
                console.error("Error fetching user data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAuthenticatedUser(); // Get the authenticated user's info
        fetchUserData(); // Fetch the image owner's data
    }, [image.userId]);

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
                            ← For You
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
                                <Image
                                    src={user.profilePicture || "https://i.pinimg.com/enabled/564x/47/c5/9a/47c59ac4b10d918a61c9f3cb7d08c17a.jpg"} // Fallback to default image if no profile picture
                                    roundedCircle
                                    width={50}
                                    height={50}
                                    className="me-3" // Use Bootstrap 5 class
                                />
                                <div>
                                    <h6 className="mb-0">{user.username || "User Name"}</h6>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="w-100 mb-3">
                                <h3>{image.name}</h3>
                                <p>{image.description}</p>
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
        </>
    );
};

export default SingleImage;
