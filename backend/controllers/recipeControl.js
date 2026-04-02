const Recipe = require("../Schema/recipeSchema");
const Liked = require("../Schema/likedRecipe");
const User = require("../Schema/User");

const VALID_RECIPE_TYPES = ["All", "Vegetarian", "Non-Vegetarian", "Other"];

const normalizeRecipeType = (recipeType) => {
  const normalized = String(recipeType || "Other").trim();
  return VALID_RECIPE_TYPES.includes(normalized) ? normalized : "Other";
};

const attachFavoriteCounts = async (recipes) => {
  const likedCounts = await Liked.aggregate([
    { $group: { _id: "$title", count: { $sum: 1 } } },
  ]);

  const likedCountMap = likedCounts.reduce((acc, item) => {
    acc[item._id] = item.count;
    return acc;
  }, {});

  return recipes.map((recipeDoc) => {
    const recipe = recipeDoc.toObject ? recipeDoc.toObject() : recipeDoc;
    return {
      ...recipe,
      favoriteCount: likedCountMap[recipe.title] || 0,
    };
  });
};

const createRecipe = async (req, res) => {
  try {
    console.log('Received recipe data:', req.body);
    const { title, category, recipeType, description, ingredients, instructions, imageUrl, prepTime, price } = req.body;
    const userId = req.token.id; // Get user ID from JWT token

    const newRecipe = await Recipe.create({
      title,
      category: String(category || "Other").trim() || "Other",
      recipeType: normalizeRecipeType(recipeType),
      description,
      ingredients,
      instructions,
      imageUrl,
      prepTime,
      price,
      userId,
    });

    console.log('Created recipe:', newRecipe);
    res.status(201).json(newRecipe);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getAllRecipes = async (req, res) => {
  try {
    const allRecipes = await Recipe.find().populate("userId", "name email phone");
    const recipesWithFavorites = await attachFavoriteCounts(allRecipes);

    res.status(200).json(recipesWithFavorites);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const deleteRecipe = async (req, res) => {
  try {
    const recipeId = req.params.id;

    const deletedRecipe = await Recipe.deleteOne({ _id: recipeId });

    if (!deletedRecipe.deletedCount) {
      return res.status(404).json({ error: "Recipe not found" });
    }

    const recipes = await Recipe.find();

    res.status(200).json({ message: "Recipe deleted successfully", recipes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const updateRecipe = async (req, res) => {
  try {
    const recipeId = req.params.id;
    const { title, category, recipeType, description, ingredients, instructions, imageUrl, prepTime, servings, price } = req.body;

    const updatedRecipe = await Recipe.findByIdAndUpdate(
      recipeId,
      {
        title,
        category: String(category || "Other").trim() || "Other",
        recipeType: normalizeRecipeType(recipeType),
        description,
        ingredients,
        instructions,
        imageUrl,
        prepTime,
        servings,
        price,
      },
      { new: true }
    ).populate("userId", "name email phone");

    if (!updatedRecipe) {
      return res.status(404).json({ error: "Recipe not found" });
    }

    const [recipeWithFavoriteCount] = await attachFavoriteCounts([updatedRecipe]);
    res.status(200).json(recipeWithFavoriteCount);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const addRecipeReview = async (req, res) => {
  try {
    const recipeId = req.params.id;
    const rating = Number(req.body.rating);
    const comment = String(req.body.comment || "").trim();

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    if (!comment) {
      return res.status(400).json({ error: "Comment is required" });
    }

    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ error: "Recipe not found" });
    }

    const user = await User.findById(req.token.id).select("name");

    recipe.reviews.push({
      userId: req.token.id,
      userName: user?.name || "User",
      rating,
      comment,
    });

    recipe.reviewCount = recipe.reviews.length;
    const totalRating = recipe.reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0);
    recipe.averageRating = recipe.reviewCount ? Number((totalRating / recipe.reviewCount).toFixed(1)) : 0;

    await recipe.save();

    const populatedRecipe = await Recipe.findById(recipeId).populate("userId", "name email phone");
    const [recipeWithFavoriteCount] = await attachFavoriteCounts([populatedRecipe]);

    return res.status(201).json(recipeWithFavoriteCount);
  } catch (error) {
    console.error("Error adding recipe review:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const LikedList = async (req, res) => {
  try {
    // Find the recipe by ID in the database
    let recipe = await Recipe.findOne({ _id: req.params.id });

    // Check if the recipe exists in the user's favorites
    const existingFavorite = await Liked.findOne({
      title: recipe.title,
      userId: req.token.id
    });

    if (existingFavorite) {
      // Recipe already exists in favorites
      return res
        .status(400)
        .json({ error: "Recipe already exists in your favorites" });
    } else {
      // Create a new favorite recipe entry
      const { title, category, recipeType, description, instructions, imageUrl, ingredients, prepTime, servings, price } = recipe;
      const newFavorite = await Liked.create({
        title,
        category,
        recipeType,
        description,
        instructions,
        imageUrl,
        ingredients,
        prepTime,
        servings,
        price,
        userId: req.token.id,
      });

      // Respond with the newly added favorite recipe
      return res.status(201).json({ favoriteRecipe: newFavorite });
    }
  } catch (error) {
    // Handle any errors that occur during the process
    console.error("Error in Liked:", error);
    return res.status(500).json({ error: "An internal server error occurred" });
  }
};

const getAllLikedRecipes = async (req, res) => {
  try {
    const allLikedRecipes = await Liked.find({ userId: req.token.id });

    res.status(200).json(allLikedRecipes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const removeFromLikedRecipes = async (req, res) => {
  try {
    const recipeId = req.params.id;

    // Find and delete the liked recipe by ID and userId
    const deletedLikedRecipe = await Liked.deleteOne({
      _id: recipeId,
      userId: req.token.id
    });

    if (!deletedLikedRecipe.deletedCount) {
      return res.status(404).json({ error: "Liked recipe not found" });
    }

    res.status(200).json({ message: "Recipe removed from liked recipes" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const searchRecipes = async (req, res) => {
  const searchKey = req.params.key;

  try {
    // Use a case-insensitive regular expression to search for recipes by title and category
    const recipes = await Recipe.find({
      $or: [
        { title: { $regex: new RegExp(searchKey, "i") } },
        { category: { $regex: new RegExp(searchKey, "i") } },
      ],
    }).populate("userId", "name email phone");

    // If no matching recipes found, return a meaningful message
    if (recipes.length === 0) {
      return res.status(404).json({ message: "No recipes found" });
    }

    // If matching recipes found, return them in the response
    const recipesWithFavorites = await attachFavoriteCounts(recipes);
    res.status(200).json(recipesWithFavorites);
  } catch (error) {
    // Handle any server error and return a proper error response
    console.error("Error searching recipes:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getAllRecipes,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  getAllLikedRecipes,
  LikedList,
  removeFromLikedRecipes,
  searchRecipes,
  addRecipeReview,
};
