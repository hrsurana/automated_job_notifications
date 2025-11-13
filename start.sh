#!/bin/bash

# Job Scraper Startup Script
# This script ensures the correct Node.js environment is loaded

echo "🚀 Starting Job Scraper..."

# Load NVM
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

# Use default node version
nvm use default

# Change to script directory
cd "$(dirname "$0")"

# Run the watcher
npm run watch
