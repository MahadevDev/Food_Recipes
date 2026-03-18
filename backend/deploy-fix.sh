#!/bin/bash

# Deployment Fix Script for bcrypt Issue

echo "🔧 Fixing bcrypt deployment issue..."

# Remove node_modules and package-lock.json
echo "📦 Removing existing node_modules..."
rm -rf node_modules package-lock.json

# Clean npm cache
echo "🧹 Cleaning npm cache..."
npm cache clean --force

# Set npm configuration for bcrypt
echo "⚙️ Configuring npm for bcrypt..."
npm config set target 18
npm config set target_arch x64
npm config set target_platform linux

# Install dependencies with rebuild
echo "📥 Installing dependencies with rebuild..."
npm install --build-from-source

# Rebuild bcrypt specifically
echo "🔨 Rebuilding bcrypt..."
npm rebuild bcrypt

# Verify installation
echo "✅ Verifying bcrypt installation..."
node -e "console.log('bcrypt version:', require('bcrypt').version)"

echo "🚀 Deployment fix complete!"
