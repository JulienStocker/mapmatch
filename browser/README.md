# Browser-Use Environment

This directory contains a Python virtual environment set up for using the browser-use package, which helps create browsing agents.

## Setup Instructions

### 1. Activate the virtual environment

```bash
# On macOS/Linux
source /Users/jules/Documents/Projects/mapmatch/browser/env/bin/activate

# On Windows (if applicable)
# \Users\jules\Documents\Projects\mapmatch\browser\env\Scripts\activate
```

### 2. Install required packages

```bash
# Install browser-use
pip install browser-use

# For memory functionality (requires Python<3.13 due to PyTorch compatibility)
pip install "browser-use[memory]"

# Install the browser
playwright install chromium --with-deps --no-shell

# Install other dependencies
pip install python-dotenv langchain-openai
```

### 3. Set up API keys

Create a `.env` file in your project directory with your API keys:

```
OPENAI_API_KEY=your_openai_api_key_here
# Add any other API keys as needed
```

### 4. Sample Usage

Create a Python script (e.g., `agent.py`) with the following code:

```python
import asyncio
from dotenv import load_dotenv
load_dotenv()
from browser_use import Agent
from langchain_openai import ChatOpenAI

async def main():
    agent = Agent(
        task="Compare the price of gpt-4o and DeepSeek-V3",
        llm=ChatOpenAI(model="gpt-4o"),
    )
    await agent.run()

if __name__ == "__main__":
    asyncio.run(main())
```

### 5. Run the script

```bash
python3 agent.py
```

## Deactivating the Environment

When you're done working, deactivate the virtual environment:

```bash
deactivate
``` 