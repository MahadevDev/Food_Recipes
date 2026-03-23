import React, { useState } from "react";
import { toast } from "react-toastify";

const RecipeCard = ({ recipe, onDelete, onAddFavorite, onOrderRecipe }) => {
  const [liked, setLiked] = useState(recipe.liked || false);
  const token = localStorage.getItem("token");
  
  // Get current user ID from token (you may need to decode JWT or get it from login state)
  const getCurrentUserId = () => {
    try {
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      return tokenData?.id || null;
    } catch (error) {
      return null;
    }
  };

  const isRecipeOwner = () => {
    const currentUserId = getCurrentUserId();
    return currentUserId && recipe.userId === currentUserId;
  };

  const handleLike = async () => {
    if (!token) {
      toast.error("Please login to like recipes");
      return;
    }

    try {
      // Assuming onAddFavorite handles the like functionality
      await onAddFavorite(recipe._id);
      setLiked(!liked);
    } catch (error) {
      toast.error("Error: " + error.message);
    }
  };

  const handleOrder = () => {
    onOrderRecipe && onOrderRecipe(recipe._id);
  };

  const handleDeleteRecipe = () => {
    onDelete && onDelete(recipe._id);
  };

  return (
    <div className="recipe-card">
      <div className="recipe-image">
        {recipe.imageUrl ? (
          <img src={recipe.imageUrl} alt={recipe.title} />
        ) : (
          <div className="placeholder">No image</div>
        )}
      </div>
      <div className="recipe-content">
        <h3>{recipe.title}</h3>
        {recipe.description && <p className="description">{recipe.description}</p>}
        
        <div className="recipe-details">
          <div className="recipe-info">
            <span>Prep Time: {recipe.prepTime || 0} min</span>
            <span>Cost: ₹{recipe.price || 0}</span>
          </div>
          {recipe.ingredients && recipe.ingredients.length > 0 && (
            <div className="ingredients-section">
              <h4>Ingredients:</h4>
              <ul>
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index}>{ingredient}</li>
                ))}
              </ul>
            </div>
          )}
          
          {recipe.instructions && (
            <div className="instructions-section">
              <h4>Instructions:</h4>
              <p>{recipe.instructions}</p>
            </div>
          )}
        </div>
      </div>
      <div className="recipe-actions">
        <button
          className={`like-btn ${liked ? "liked" : ""}`}
          onClick={handleLike}
          title={liked ? "Unlike" : "Like"}
        >
          {liked ? "❤️" : "🤍"}
        </button>
        <button
          className="order-btn"
          onClick={handleOrder}
        >
          Order Now
        </button>
        {isRecipeOwner() && (
          <button
            className="delete-btn"
            onClick={handleDeleteRecipe}
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
};

export default RecipeCard;
