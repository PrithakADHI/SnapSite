import axios from 'axios';
import { useEffect, useState } from 'react';
import Spinner from 'react-bootstrap/Spinner';
import MyNav from '../Navbar/Navbar.jsx';
import Masonry from '../Masonry/Masonry.jsx';

import './Home.css';

const deduplicateImages = (images) => {
    const seen = new Set();
    return images.filter((image) => {
        if (seen.has(image._id)) {
            return false;
        }
        seen.add(image._id);
        return true;
    });
};

const Home = () => {
    const [images, setImages] = useState([]); // Store an array of image objects
    const [loading, setLoading] = useState(true); // Loading state for initial fetch
    const [loadingMore, setLoadingMore] = useState(false); // Loading state for additional fetches
    const [error, setError] = useState(null); // Error state
    const [page, setPage] = useState(1); // Current page
    const [hasMore, setHasMore] = useState(true); // Whether there are more images to load
    const [observer, setObserver] = useState(null); // Store the IntersectionObserver instance

    useEffect(() => {
        const fetchImages = async () => {
            try {
                if (loadingMore || !hasMore) return; // Prevent duplicate or unnecessary calls

                setLoadingMore(true);

                const response = await axios.get(
                    `${import.meta.env.VITE_REACT_APP_BACKEND_URL}api/images?page=${page}&limit=3`
                );

                if (response.data.success) {
                    setImages((prevImages) =>
                        deduplicateImages([...prevImages, ...response.data.data])
                    );
                    setHasMore(response.data.hasMore);
                } else {
                    setError('Failed to fetch images');
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
                setLoadingMore(false);
            }
        };

        fetchImages();
    }, [page]);

    useEffect(() => {
        const intersectionObserver = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loadingMore) {
                    setPage((prevPage) => prevPage + 1); // Increment the page
                }
            },
            {
                threshold: 1.0, // Trigger when the sentinel is fully in view
            }
        );

        const sentinel = document.querySelector('#scroll-sentinel');
        if (sentinel) intersectionObserver.observe(sentinel);

        setObserver(intersectionObserver);

        return () => intersectionObserver.disconnect(); // Clean up the observer on unmount
    }, [hasMore, loadingMore]);

    // Stop observing the sentinel when no more images are available
    useEffect(() => {
        if (!hasMore && observer) {
            observer.disconnect();
        }
    }, [hasMore, observer]);

    if (loading && images.length === 0) {
        return (
            <div
                className="d-flex justify-content-center align-items-center"
                style={{ height: '100vh' }}
            >
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </div>
        );
    }

    if (error) {
        return <p>Error: {error}</p>;
    }

    const breakpointColumnsObj = {
        default: 5,
        1100: 4,
        800: 3,
        500: 2,
    };

    return (
        <>
            <MyNav />
            <Masonry
                images={images}
                breakpointColumnsObj={breakpointColumnsObj}
            />
            <div id="scroll-sentinel" style={{ height: '20px' }} />
            {loadingMore && hasMore && (
                <div className="d-flex justify-content-center my-3">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                </div>
            )}
        </>
    );
};

export default Home;
