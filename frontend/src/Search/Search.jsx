import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, FormControl, Button } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SearchForm = () => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const notifyError = () =>
    toast.error("Result not found.", {
      position: "bottom-center", // Set toast position
      autoClose: 3000, // Close after 3 seconds
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      className: "custom-toast", // Custom class for styling
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_REACT_APP_BACKEND_URL}api/search/images/?query=${encodeURIComponent(query)}`
      );
      const data = await response.json();

      if (data.success && data.data.length > 0) {
        // Redirect to a results page with the query as a parameter
        navigate(`/results?query=${encodeURIComponent(query)}`);
      } else {
        notifyError();
      }
    } catch (error) {
      console.error("Error fetching search results:", error);
      toast.error("An error occurred while fetching search results.", {
        position: "bottom-center",
      });
    }
  };

  return (
    <>
      <Form onSubmit={handleSubmit} className="mx-auto w-100">
        <FormControl
          type="text"
          placeholder="Search"
          className="w-100"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button type="submit" className="d-none">
          Submit
        </Button>
      </Form>
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

export default SearchForm;
