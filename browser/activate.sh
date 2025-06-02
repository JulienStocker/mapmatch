#!/bin/bash
# Script to activate the browser-use virtual environment

# Activate virtual environment
source /Users/jules/Documents/Projects/mapmatch/browser/env/bin/activate

echo "Browser-use virtual environment activated."
echo "To install required packages, run:"
echo "  pip install browser-use"
echo "  pip install \"browser-use[memory]\""
echo "  playwright install chromium --with-deps --no-shell"
echo "  pip install python-dotenv langchain-openai"
echo ""
echo "To run the sample agent, run:"
echo "  python agent.py"
echo ""
echo "To deactivate the environment when done, simply type:"
echo "  deactivate" 