import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Masonry from 'react-masonry-css';
import MyNav from '../Navbar/Navbar.jsx';
import { Link } from 'react-router-dom'; // Import Link for navigation


import '../Home/Home.css';

const Result = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const query = queryParams.get("query");
  const [results, setResults] = useState([]);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/search/images/?query=${encodeURIComponent(query)}`);
        const data = await response.json();
        if (data.success) {
          setResults(data.data);
        }
      } catch (error) {
        console.error("Error fetching results:", error);
      }
    };

    if (query) fetchResults();
  }, [query]);

  const breakpointColumnsObj = {
    default: 5,
    1100: 4,
    800: 3,
    500: 2
};

  return (
    <div>
    <MyNav />

            <div className="container">
                <Masonry
                    breakpointCols={breakpointColumnsObj}
                    className="my-masonry-grid"
                    columnClassName="my-masonry-grid_column"
                >
                    {results.map((image) => (
                        <div key={image._id} className="image-container">
                            <Link to={`/image`} state={{ image }}> {/* Pass image data as state */}
                                <img src={image.imageUrl} alt={image.description} className="image-item" />
                            </Link>
                        </div>
                    ))}
                </Masonry>
            </div>

    </div>
  );
};

export default Result;
