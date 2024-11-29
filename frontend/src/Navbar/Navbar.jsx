import React, { useEffect, useState, useMemo, useRef } from "react";
import { Navbar, Nav, Button, Spinner, Dropdown, Offcanvas, Image } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faSearch, faSignInAlt, faUserPlus } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import Search from "../Search/Search";
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
  window.location.reload();
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
    <Navbar bg="dark" variant="dark" expand="lg" className="py-3">
      <Navbar.Brand onClick={() => navigate("/")} className="px-3">
        <p className="m-0 logo londrina-sketch-regular">SnapSite</p>
      </Navbar.Brand>

      <Navbar.Toggle aria-controls="offcanvas-navbar" />
      <Navbar.Offcanvas id="offcanvas-navbar" placement="end" style={{ width: "70%" }}>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title className="londrina-sketch-regular">SnapSite</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Nav className="me-auto searchbar">
            <Search />
          </Nav>
          <Nav>
          {loading ? (
              <Spinner animation="border" size="sm" />
            ) : user ? (
              <Nav.Link onClick={() => navigate("/create")} className="">
                <span>+</span>
              </Nav.Link>
            ) : null}
            {user ? (
              <Dropdown align="end">
                <Dropdown.Toggle as="div" style={{ cursor: "pointer" }}>
                  <Image
                    src={user?.profilePicture || "https://i.pinimg.com/736x/a3/98/a9/a398a928bf4112234757a4adc2376d4c.jpg"}
                    roundedCircle
                    width={40}
                    height={40}
                  />
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  
                  <Dropdown.Item onClick={() => navigate(`/profile/${userId.id}`)}>Profile</Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            ) : (
              <>
                <Button onClick={() => navigate("/login")} variant="outline-primary" className="me-2">
                  Login
                </Button>
                <Button onClick={() => navigate("/register")} variant="outline-success">
                  Register
                </Button>
              </>
            )}
          </Nav>
        </Offcanvas.Body>
      </Navbar.Offcanvas>
    </Navbar>
  );
};

export default MyNav;
