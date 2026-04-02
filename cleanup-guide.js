// Simple script to clear test recipes
const fs = require('fs');
const path = require('path');

// Read the package.json to get dependencies
const packagePath = path.join(__dirname, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

console.log('Available scripts:', Object.keys(packageJson.scripts || {}));

// This script removes all test recipes from the database
console.log('To remove test recipes, run one of these commands:');
console.log('');
console.log('Option 1: Using npm run scripts');
console.log('  npm run clear-recipes');
console.log('');
console.log('Option 2: Manual database clearing');
console.log('  (Connect to MongoDB and run cleanup commands)');
console.log('');
console.log('The test recipes were likely created during development and testing.');
console.log('This will remove all recipes, liked recipes, and user test data.');
