import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../App.css";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  
  const LogoutUser = () => {
    if (window.confirm("You wanna logout?")) {
      localStorage.clear();
      navigate("/login");
    } else {
      navigate("/recipes");
    }
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const auth = localStorage.getItem("token");

  return (
    <div className="pos-f-t">
      <nav className="navbar navbar-light">
        <button 
          className="navbar-toggler" 
          type="button" 
          onClick={toggleMenu}
          aria-controls="navbarNav" 
          aria-expanded={isOpen ? "true" : "false"}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="navbar-brand">Recipe Sharing App</div>

        <div className={`collapse navbar-collapse ${isOpen ? "show" : ""}`} id="navbarNav">
          {auth ? (
            <ul className="navbar-nav">
              <li className="nav-item">
                <NavLink className="nav-link" to="/recipes">
                  Recipes
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/add-recipe">
                  Add Recipe
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/liked-products">
                  Favorite Recipes
                </NavLink>
              </li>
              <li className="nav-item">
                <button 
                  className="btn btn-link nav-link px-3" 
                  type="button"
                  onClick={LogoutUser}
                >
                  Logout
                </button>
              </li>
            </ul>
          ) : (
            <div className="ms-auto">
            </div>
          )}
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
