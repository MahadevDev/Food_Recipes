const mongoose = require("mongoose");

const LikedRecipes = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: "",
  },
  ingredients: [String],
  instructions: {
    type: String,
    required: true,
  },
  imageUrl: String,
  prepTime: {
    type: Number,
    default: 0,
  },
  servings: {
    type: Number,
    default: 1,
  },
  price: {
    type: Number,
    default: 0,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

const Liked = mongoose.model("LikedRecipe", LikedRecipes);

module.exports = Liked;
