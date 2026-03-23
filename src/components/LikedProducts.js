import React, { useCallback, useEffect, useState } from "react";
import "../pages/likedRecipes.css";
import { toast, ToastContainer } from "react-toastify";
import { buildUrl } from "../utils/apiConfig";

const LikedProducts = () => {
  const [likedProducts, setLikedProducts] = useState([]);
  const token = localStorage.getItem("token");

  const fetchLikedProducts = useCallback(async () => {
    if (!token) {
      toast.error("Please login to view your liked recipes");
      return;
    }

    try {
      const response = await fetch(buildUrl("/auth/likedRecipes"), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        toast.error("Failed to fetch liked products");
        return;
      }

      const data = await response.json();

      // Set the fetched data to the state
      setLikedProducts(data);
    } catch (error) {
      toast.error("Error fetching liked products:", error);
    }
  }, [token]);

  useEffect(() => {
    fetchLikedProducts();
  }, [fetchLikedProducts]);

  const handleRemoveItem = async (recipeId) => {
    if (!token) {
      toast.error("Please login to remove items from favorites");
      return;
    }

    try {
      if (
        window.confirm(
          "Are you sure you wanna remove this recipe from favourites??"
        )
      ) {
        const response = await fetch(
          buildUrl(`/auth/removeLiked/${recipeId}`),
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          toast.success("Item Removed successfully");
          fetchLikedProducts();
          setTimeout(() => {
            window.location.href = "/liked-products";
          }, 4000);
        } else {
          const data = await response.json();
          toast.error(data.error);
        }
      } else {
        window.location.href = "/liked-products";
      }
    } catch (error) {
      toast.error("Error removing item from liked products:", error);
    }
  };

  return (
    <div className="main-content">
      <div className="likedRecipes">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>My Favorite Recipes</h2>
        </div>
        {!token ? (
          <p>Please login to view your favorite recipes.</p>
        ) : !Array.isArray(likedProducts) ? (
          <p>Loading your favorite recipes...</p>
        ) : likedProducts.length === 0 ? (
          <p>You haven't added any recipes to your favorites yet.</p>
        ) : (
          <ul>
            {likedProducts.map((product) => (
              <li key={product._id} className="list">
                <div className="recipe-image">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.title} />
                  ) : (
                    <div className="placeholder">No image</div>
                  )}
                </div>
                <div className="recipe-content">
                  <h3>{product.title}</h3>
                  {product.description && <p className="description">{product.description}</p>}
                  <div className="recipe-info">
                    <span>Cost: ₹{product.price || 0}</span>
                  </div>
                  <h4>Ingredients:</h4>
                  <ul>
                    {product.ingredients.length > 0 && (
                      <ul className="ingredients-list">
                        {product.ingredients.map((ingredient, index) => (
                          <li key={index}>{ingredient}</li>
                        ))}
                      </ul>
                    )}
                  </ul>

                  <div className="instructions-container">
                    <h4>Instructions:</h4>
                    <div className="instructions-list">
                      {product.instructions.split("\n").map((step, index) => (
                        <p key={index}>{step}</p>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="recipe-actions">
                  <button
                    className="remove-item-button"
                    onClick={() => handleRemoveItem(product._id)}
                  >
                    Remove Item
                  </button>
                </div>
              </li>
        ))}
      </ul>
        )}
      </div>
      <ToastContainer />
    </div>
  );
};

export default LikedProducts;
