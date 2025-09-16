#!/bin/bash

# SomniaGames No-Code Platform Setup Script

echo "Setting up SomniaGames No-Code Platform..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
  echo "Error: package.json not found. Please run this script from the nocode-platform directory."
  exit 1
fi

# Install dependencies
echo "Installing dependencies..."
npm install

# Check if installation was successful
if [ $? -ne 0 ]; then
  echo "Error: Failed to install dependencies."
  exit 1
fi

# Build the project
echo "Building the project..."
npm run build

# Check if build was successful
if [ $? -ne 0 ]; then
  echo "Error: Failed to build the project."
  exit 1
fi

echo "Setup complete!"
echo ""
echo "To start the development server, run:"
echo "  npm run dev"
echo ""
echo "To start the production server, run:"
echo "  npm start"
echo ""
echo "The platform will be available at http://localhost:3000"