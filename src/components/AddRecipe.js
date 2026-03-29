import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { buildUrl } from "../utils/apiConfig";

const CATEGORY_OPTIONS = [
  {
    name: "South Indian",
    description: "Traditional South Indian dishes like dosa, idli, sambar",
    images: [
      "https://images.unsplash.com/photo-1586198042591-1e01951899e4?w=300&h=200&fit=crop&crop=center&auto=format",
      "https://images.unsplash.com/photo-1505252589542-88e5e848d1a5?w=300&h=200&fit=crop&crop=center&auto=format",
      "https://images.unsplash.com/photo-1621996326569-e11d875d5482?w=300&h=200&fit=crop&crop=center&auto=format"
    ]
  },
  {
    name: "North Indian",
    description: "Classic North Indian cuisine like butter chicken, paneer tikka",
    images: [
      "https://images.unsplash.com/photo-1567620905732-2be1df8e1b13?w=300&h=200&fit=crop&crop=center&auto=format",
      "https://images.unsplash.com/photo-1585033865114-f50f0e930e2?w=300&h=200&fit=crop&crop=center&auto=format",
      "https://images.unsplash.com/photo-15569090060-2ea0d616cd5a?w=300&h=200&fit=crop&crop=center&auto=format"
    ]
  },
  {
    name: "Andhra",
    description: "Spicy Andhra specialties and biryanis",
    images: [
      "https://images.unsplash.com/photo-1621996326569-e11d875d5482?w=300&h=200&fit=crop&crop=center&auto=format",
      "https://images.unsplash.com/photo-1568905110939-01b71b8b77c3?w=300&h=200&fit=crop&crop=center&auto=format",
      "https://images.unsplash.com/photo-1585033865114-f50f0e930e2?w=300&h=200&fit=crop&crop=center&auto=format"
    ]
  },
  {
    name: "Karnataka",
    description: "Karnataka cuisine and traditional dishes",
    images: [
      "https://images.unsplash.com/photo-1568905110939-01b71b8b77c3?w=300&h=200&fit=crop&crop=center&auto=format",
      "https://images.unsplash.com/photo-1585033865114-f50f0e930e2?w=300&h=200&fit=crop&crop=center&auto=format",
      "https://images.unsplash.com/photo-1505252589542-88e5e848d1a5?w=300&h=200&fit=crop&crop=center&auto=format"
    ]
  },
  {
    name: "Street Food",
    description: "Popular street food and snacks",
    images: [
      "https://images.unsplash.com/photo-1562927766784-a94b38427bfa?w=300&h=200&fit=crop&crop=center&auto=format",
      "https://images.unsplash.com/photo-1565296769-eda4af9c0f1c85?w=300&h=200&fit=crop&crop=center&auto=format",
      "https://images.unsplash.com/photo-1563379044-de8904b3f760?w=300&h=200&fit=crop&crop=center&auto=format"
    ]
  },
  {
    name: "Breakfast",
    description: "Morning breakfast items and dishes",
    images: [
      "https://images.unsplash.com/photo-1505252589542-88e5e848d1a5?w=300&h=200&fit=crop&crop=center&auto=format",
      "https://images.unsplash.com/photo-1534422278144-9e3e26a456d?w=300&h=200&fit=crop&crop=center&auto=format",
      "https://images.unsplash.com/photo-1517684633826-c9dbcefe8d2a?w=300&h=200&fit=crop&crop=center&auto=format"
    ]
  },
  {
    name: "Snacks",
    description: "Quick snacks and appetizers",
    images: [
      "https://images.unsplash.com/photo-1562927766784-a94b38427bfa?w=300&h=200&fit=crop&crop=center&auto=format",
      "https://images.unsplash.com/photo-1608140546789-21e699a624e7?w=300&h=200&fit=crop&crop=center&auto=format",
      "https://images.unsplash.com/photo-1565296769-eda4af9c0f1c85?w=300&h=200&fit=crop&crop=center&auto=format"
    ]
  },
  {
    name: "Desserts",
    description: "Sweet desserts and treats",
    images: [
      "https://images.unsplash.com/photo-1551024506-2dba5fb3ce89?w=300&h=200&fit=crop&crop=center&auto=format",
      "https://images.unsplash.com/photo-1563726618619-4d4ec0abe952?w=300&h=200&fit=crop&crop=center&auto=format",
      "https://images.unsplash.com/photo-15588056-1a68a025b87b?w=300&h=200&fit=crop&crop=center&auto=format"
    ]
  },
  {
    name: "Beverages",
    description: "Refreshing drinks and beverages",
    images: [
      "https://images.unsplash.com/photo-1544145975478-73e0ae6705e8?w=300&h=200&fit=crop&crop=center&auto=format",
      "https://images.unsplash.com/photo-1534409138602-4e69212579d84?w=300&h=200&fit=crop&crop=center&auto=format",
      "https://images.unsplash.com/photo-1544145975478-73e0ae6705e8?w=300&h=200&fit=crop&crop=center&auto=format"
    ]
  }
];

const DIETARY_TYPE_OPTIONS = ["All", "Vegetarian", "Non-Vegetarian"];

const AddRecipe = () => {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("South Indian");
  const [ingredients, setIngredients] = useState("");
  const [instructions, setInstructions] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [prepTime, setPrepTime] = useState("");
  const [price, setPrice] = useState("");
  const [recipeType, setRecipeType] = useState("All");
  
  const token = localStorage.getItem("token");

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('handleSubmit called');

    if (!title || !ingredients || !instructions) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const ingredientsArray = ingredients.split(',').map(ingredient => ingredient.trim());
      
      console.log('Sending recipe data:', {
        title,
        category,
        recipeType,
        ingredients: ingredientsArray,
        instructions,
        imageUrl,
        prepTime: prepTime ? parseInt(prepTime) : 0,
        price: price ? parseFloat(price) : 0,
      });
      
      const response = await fetch(buildUrl("/auth/recipe"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          category,
          recipeType,
          ingredients: ingredientsArray,
          instructions,
          imageUrl,
          prepTime: prepTime ? parseInt(prepTime) : 0,
          price: price ? parseFloat(price) : 0,
        }),
      });

      if (response.ok) {
        toast.success("Recipe added successfully!");
        // Refresh the page immediately to show the new recipe
        window.location.reload();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to add recipe");
      }
    } catch (error) {
      console.error("Error adding recipe:", error);
      toast.error("An error occurred while adding the recipe");
    }
  };

  return (
    <div className="main-content">
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          fontWeight: '700', 
          color: '#1a202c',  /* Dark blue-gray color */
          background: 'linear-gradient(135deg, #ff9a9e 0%, #a8edea 50%, #fed6e3 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: '0.5rem'
        }}>
          Add New Recipe
        </h1>
        <p style={{ color: '#6c757d', fontSize: '1.1rem' }}>
          Share your favorite recipe with community
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="recipe-form">
        <div className="form-group">
          <label htmlFor="title" className="form-label">
            <span className="required-indicator">Recipe Name *</span>
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Masala Maggi, Butter Chicken"
            required
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="category" className="form-label">
            <span className="required-indicator">Category *</span>
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            className="form-select"
          >
            <option value="">Choose a category...</option>
            {CATEGORY_OPTIONS.map((category) => (
              <option key={category.name} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="recipeType" className="form-label">
            <span className="label-text">Dietary Type</span>
          </label>
          <select
            id="recipeType"
            value={recipeType}
            onChange={(e) => setRecipeType(e.target.value)}
            className="form-select"
          >
            {DIETARY_TYPE_OPTIONS.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="prepTime" className="form-label">
              <span className="label-text">Preparation Time</span>
            </label>
            <input
              type="number"
              id="prepTime"
              value={prepTime}
              onChange={(e) => setPrepTime(e.target.value)}
              placeholder="30"
              min="0"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="price" className="form-label">
              <span className="label-text">Price (₹)</span>
            </label>
            <input
              type="number"
              id="price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0"
              min="0"
              step="0.01"
              className="form-input"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="ingredients" className="form-label">
            <span className="required-indicator">Ingredients *</span>
          </label>
          <textarea
            id="ingredients"
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            placeholder="e.g., 2 cups flour, 1 cup sugar, 3 eggs, 1 tsp vanilla extract"
            rows="4"
            required
            className="form-textarea"
          />
        </div>

        <div className="form-group">
          <label htmlFor="instructions" className="form-label">
            <span className="required-indicator">Instructions *</span>
          </label>
          <textarea
            id="instructions"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="e.g., 1. Mix dry ingredients in a bowl. 2. Add wet ingredients. 3. Stir until smooth. 4. Bake at 350°F for 30 minutes."
            rows="6"
            required
            className="form-textarea"
          />
        </div>

        <div className="form-group">
          <label htmlFor="imageUrl">Image URL</label>
          <input
            type="url"
            id="imageUrl"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="Enter image URL"
            className="form-input"
          />
        </div>

        <button type="submit" className="submit-btn">
          Add Recipe
        </button>
      </form>
      <ToastContainer />
    </div>
  );
};

export default AddRecipe;
