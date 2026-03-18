// routes/recipeRoute.js
const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/middleware");
const {
  getAllRecipes,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  LikedList,
  getAllLikedRecipes,
  removeFromLikedRecipes,
  searchRecipes,
} = require("../controllers/recipeControl");

// Protected: Get all recipes
router.get("/recipe", verifyToken, getAllRecipes);

// Protected: Create a new recipe
router.post("/recipe", verifyToken, createRecipe);

// Protected: Update a recipe by ID
router.put("/recipe/:id", verifyToken, updateRecipe);

// Protected: Get liked recipes
router.get("/likedRecipes", verifyToken, getAllLikedRecipes);

// Protected: Delete a recipe by ID
router.delete("/recipe/:id", verifyToken, deleteRecipe);

// Protected: Add to liked list
router.post("/likedRecipes/:id", verifyToken, LikedList);

// Protected: Remove from liked list
router.delete("/removeLiked/:id", verifyToken, removeFromLikedRecipes);

// Public: Search recipes by keyword
router.get("/searchRecipes/:key", searchRecipes);

module.exports = router;
