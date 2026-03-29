import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../App.css";

const Navbar = () => {
  const [showNav, setShowNav] = useState(false);
  const navigate = useNavigate();
  
  const LogoutUser = () => {
    if (window.confirm("You wanna logout?")) {
      localStorage.clear();
      navigate("/login");
    } else {
      navigate("/recipes");
    }
  };

  const toggleNav = () => {
    setShowNav(!showNav);
  };

  const auth = localStorage.getItem("token");

  return (
    <div className="pos-f-t">
      <nav className="navbar navbar-dark bg-dark">
        <div className="navbar-brand text-white">Recipe Sharing App</div>
        <button 
          className="navbar-toggler" 
          type="button" 
          onClick={toggleNav}
          aria-expanded={showNav ? "true" : "false"}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        {auth && showNav && (
          <div className="navbar-nav-inline">
            <NavLink 
              className="nav-link text-white" 
              to="/recipes"
              onClick={() => setShowNav(false)}
            >
              Recipes
            </NavLink>
            <NavLink 
              className="nav-link text-white" 
              to="/add-recipe"
              onClick={() => setShowNav(false)}
            >
              Add Recipe
            </NavLink>
            <NavLink 
              className="nav-link text-white" 
              to="/liked-products"
              onClick={() => setShowNav(false)}
            >
              Favorite Recipes
            </NavLink>
            <NavLink
              className="nav-link text-white"
              to="/owner-information"
              onClick={() => setShowNav(false)}
            >
              Owner Information
            </NavLink>
            <button 
              className="btn btn-link nav-link text-white" 
              type="button"
              onClick={() => {
                LogoutUser();
                setShowNav(false);
              }}
            >
              Logout
            </button>
          </div>
        )}
      </nav>
    </div>
  );
};

export default Navbar;
