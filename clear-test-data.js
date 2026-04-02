const mongoose = require('mongoose');

// Connect to MongoDB
const mongoURI = 'mongodb://localhost:27017/recipe-sharing';

mongoose.connect(mongoURI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Function to delete all recipes
const deleteAllTestRecipes = async () => {
  try {
    // Get all collections
    const db = mongoose.connection.db;
    const collections = await db.listCollections();
    
    console.log('Found collections:', collections.map(c => c.name));
    
    // Delete all documents from all collections
    for (const collection of collections) {
      if (collection.name.includes('recipe') || collection.name.includes('liked')) {
        const result = await db.collection(collection.name).deleteMany({});
        console.log(`Deleted ${result.deletedCount} documents from ${collection.name}`);
      }
    }
    
    console.log('All test recipes and data removed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error deleting recipes:', error);
    process.exit(1);
  }
};

// Run the deletion
deleteAllTestRecipes();
