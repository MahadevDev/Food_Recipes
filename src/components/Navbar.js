import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../App.css";

const Navbar = () => {
  const navigate = useNavigate();
  
  const LogoutUser = () => {
    if (window.confirm("You wanna logout?")) {
      localStorage.clear();
      navigate("/login");
    } else {
      navigate("/recipes");
    }
  };

  const auth = localStorage.getItem("token");

  return (
    <div className="pos-f-t">
      <nav className="navbar navbar-dark bg-dark">
        <div className="navbar-brand text-white">Recipe Sharing App</div>
        {auth ? (
          <div className="navbar-nav">
            <NavLink 
              className="nav-link text-white" 
              to="/recipes"
            >
              Recipes
            </NavLink>
            <NavLink 
              className="nav-link text-white" 
              to="/add-recipe"
            >
              Add Recipe
            </NavLink>
            <NavLink 
              className="nav-link text-white" 
              to="/liked-products"
            >
              Favorite Recipes
            </NavLink>
            <button 
              className="btn btn-link nav-link text-white" 
              type="button"
              onClick={LogoutUser}
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="navbar-nav">
            <span className="text-muted">Please login to access navigation</span>
          </div>
        )}
      </nav>
    </div>
  );
};

export default Navbar;
