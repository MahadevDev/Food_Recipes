const Recipe = require('./backend/Schema/recipeSchema');
const Liked = require('./backend/Schema/likedRecipe');
const mongoose = require('mongoose');

// Connect to MongoDB
const mongoURI = 'mongodb://localhost:27017/recipe-sharing';

mongoose.connect(mongoURI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Function to delete all recipes
const deleteAllRecipes = async () => {
  try {
    // Delete all recipes
    const result = await Recipe.deleteMany({});
    console.log(`Deleted ${result.deletedCount} recipes`);
    
    // Delete all liked recipes
    const likedResult = await Liked.deleteMany({});
    console.log(`Deleted ${likedResult.deletedCount} liked recipes`);
    
    console.log('All test recipes removed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error deleting recipes:', error);
    process.exit(1);
  }
};

// Function to show current recipes
const showCurrentRecipes = async () => {
  try {
    const recipes = await Recipe.find({});
    console.log(`Current recipes count: ${recipes.length}`);
    
    recipes.forEach((recipe, index) => {
      console.log(`${index + 1}. Title: ${recipe.title}`);
      console.log(`   Category: ${recipe.category}`);
      console.log(`   Description: ${recipe.description?.substring(0, 100)}...`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error fetching recipes:', error);
    process.exit(1);
  }
};

// Command line arguments
const command = process.argv[2];

if (command === 'delete-all') {
  deleteAllRecipes();
} else if (command === 'show') {
  showCurrentRecipes();
} else {
  console.log('Usage:');
  console.log('  node remove-recipes.js delete-all  # Delete all recipes');
  console.log('  node remove-recipes.js show         # Show current Recipes');
  process.exit(1);
}
