import React from "react";
import { Link } from "react-router-dom"; // Import Link for navigation
import MasonryLib from "react-masonry-css"; // Import Masonry from the library

const Masonry = ({ images, breakpointColumnsObj }) => {
  if (!images || images.length === 0) {
    return <p>No images to display.</p>; // Handle empty images array
  }

  return (
    <div className="container">
      <MasonryLib
        breakpointCols={breakpointColumnsObj}
        className="my-masonry-grid"
        columnClassName="my-masonry-grid_column"
      >
        {images.map((image, index) => (
    <div key={`${image._id}-${index}`} className="image-container">
        <Link to={`/image`} state={{ image }}>
            <img
                src={image.imageUrl}
                alt={image.description || "Image"}
                className="image-item"
                style={{ borderRadius: "10px", maxWidth: "100%" }}
            />
        </Link>
    </div>
))}

      </MasonryLib>
    </div>
  );
};

export default Masonry;
