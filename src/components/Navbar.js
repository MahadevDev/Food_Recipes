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
      <div className={`collapse ${isOpen ? "show" : ""}`} id="navbarToggleExternalContent">
        <div className="bg-dark p-4">
          <div className="navbar-nav">
            {auth ? (
              <>
                <NavLink 
                  className="nav-link text-white mb-2" 
                  to="/recipes" 
                  onClick={() => setIsOpen(false)}
                >
                  Recipes
                </NavLink>
                <NavLink 
                  className="nav-link text-white mb-2" 
                  to="/add-recipe" 
                  onClick={() => setIsOpen(false)}
                >
                  Add Recipe
                </NavLink>
                <NavLink 
                  className="nav-link text-white mb-2" 
                  to="/liked-products" 
                  onClick={() => setIsOpen(false)}
                >
                  Favorite Recipes
                </NavLink>
                <button 
                  className="btn btn-link nav-link text-white mb-2" 
                  type="button"
                  onClick={() => {
                    LogoutUser();
                    setIsOpen(false);
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <span className="text-muted">Please login to access navigation</span>
            )}
          </div>
        </div>
      </div>
      <nav className="navbar navbar-dark bg-dark">
        <div className="navbar-brand text-white">Recipe Sharing App</div>
        <button 
          className="navbar-toggler" 
          type="button" 
          onClick={toggleMenu}
          aria-controls="navbarToggleExternalContent" 
          aria-expanded={isOpen ? "true" : "false"}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
      </nav>
    </div>
  );
};

export default Navbar;
