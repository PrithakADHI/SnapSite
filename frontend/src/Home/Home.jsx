import axios from 'axios';
import { useEffect, useState } from 'react';
import Masonry from 'react-masonry-css';
import { Link } from 'react-router-dom'; // Import Link for navigation
import Spinner from 'react-bootstrap/Spinner';
import MyNav from '../Navbar/Navbar.jsx';
import './Home.css';

const Home = () => {
    const [images, setImages] = useState([]);  // Store an array of image objects
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        axios.get('http://localhost:8000/api/images')
            .then((response) => {
                if (response.data.success) {
                    setImages(response.data.data);  // Access the array of images in the response
                } else {
                    setError("Failed to fetch images");
                }
                setLoading(false);
            })
            .catch((error) => {
                setError(error.message);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          );
    }

    if (error) {
        return <p>Error: {error}</p>;
    }

    // Set the breakpoint columns for the grid (responsive design)
    const breakpointColumnsObj = {
        default: 5,
        1100: 4,
        800: 3,
        500: 2
    };

    return (
        <>
            <MyNav />
            <div className="container">
                <Masonry
                    breakpointCols={breakpointColumnsObj}
                    className="my-masonry-grid"
                    columnClassName="my-masonry-grid_column"
                >
                    {images.map((image) => (
                        <div key={image._id} className="image-container">
                            <Link to={`/image`} state={{ image }}> {/* Pass image data as state */}
                                <img src={image.imageUrl} alt={image.description} className="image-item" />
                            </Link>
                        </div>
                    ))}
                </Masonry>
            </div>
        </>
    );
}

export default Home;
