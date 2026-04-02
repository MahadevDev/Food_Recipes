const mongoose = require('mongoose');
const path = require('path');

// Connect to MongoDB
const mongoURI = 'mongodb://localhost:27017/recipe-sharing';

mongoose.connect(mongoURI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Function to delete category-based test recipes
const deleteCategoryRecipes = async () => {
  try {
    const db = mongoose.connection.db;
    
    // Find and delete specific category test recipes
    const testCategories = [
      'South Indian',
      'North Indian', 
      'Andhra',
      'Karnataka',
      'Kerala',
      'Tamil Nadu',
      'Street Food',
      'Breakfast',
      'Snacks',
      'Desserts',
      'Beverages'
    ];
    
    console.log('Deleting category-based test recipes...');
    
    let totalDeleted = 0;
    for (const category of testCategories) {
      const result = await db.collection('recipes').deleteMany({
        category: category
      });
      totalDeleted += result.deletedCount;
      console.log(`Deleted ${result.deletedCount} recipes from category: ${category}`);
    }
    
    console.log(`Total deleted: ${totalDeleted} category-based test recipes`);
    console.log('All category-based test recipes deleted successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error deleting category recipes:', error);
    process.exit(1);
  }
};

// Run the deletion
deleteCategoryRecipes();
