import React, { useEffect, useState, useMemo, useRef } from "react";
import { Navbar, Nav, Form, FormControl, Button, Spinner, Dropdown } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import "bootstrap/dist/css/bootstrap.min.css";
import {jwtDecode} from "jwt-decode";
import axios from "axios";
import "./Navbar.css";

const getUserInfo = () => {
  const token = localStorage.getItem("token");

  if (!token) return null;

  try {
    return jwtDecode(token);
  } catch (error) {
    console.error("Invalid token:", error);
    localStorage.removeItem("token");
    return null;
  }
};

const handleLogout = () => {
  localStorage.removeItem("token");
  window.location.reload(); // Reload the page after logging out
};

const MyNav = () => {
  const userId = useMemo(() => getUserInfo(), []);
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const isFetching = useRef(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId || !userId.id || isFetching.current) return;

      isFetching.current = true;
      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:8000/auth/user/${userId.id}/`);
        if (response.data.success) {
          setUser(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
        isFetching.current = false;
      }
    };

    fetchUserData();
  }, [userId]);

  return (
    <Navbar expand="lg" className="px-3 z-1 nav">
      <Navbar.Brand onClick={() => navigate("/")} className="d-flex justify-content-center">
        <p className="londrina-sketch-regular m-0 logo">SnapSite</p>
      </Navbar.Brand>

      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="mr-auto">
          {loading ? (
            <Spinner animation="border" role="status" size="sm" style={{ color: "white" }} />
          ) : user ? (
            <Nav.Link onClick={() => navigate("/create")}>
              <FontAwesomeIcon icon={faPlus} className="mr-2 logo" />
            </Nav.Link>
          ) : null}
        </Nav>

        <Form className="mx-auto w-100">
          <FormControl type="text" placeholder="Search" className="w-100" />
        </Form>

        <Nav className="d-flex align-items-center mx-2">
          {user ? (
            <Dropdown align="end">
              <Dropdown.Toggle
                as="div"
                style={{ cursor: "pointer" }}
                className="d-flex align-items-center"
              >
                <img
                  src={user?.profilePicture || "https://i.pinimg.com/736x/a3/98/a9/a398a928bf4112234757a4adc2376d4c.jpg"}
                  className="rounded-circle"
                  alt="Profile"
                  width={50}
                  height={50}
                />
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => navigate("/profile")}>Profile</Dropdown.Item>
                <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          ) : (
            <>
              <Button onClick={() => navigate("/login")} variant="outline-primary" className="mx-2">
                Login
              </Button>
              <Button onClick={() => navigate("/register")} variant="outline-success" className="mx-2">
                Register
              </Button>
            </>
          )}
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default MyNav;
