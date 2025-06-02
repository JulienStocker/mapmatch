import asyncio
import csv
import os
import json
from datetime import datetime
from dotenv import load_dotenv
load_dotenv()
from browser_use import Agent, Browser, BrowserConfig, BrowserContextConfig
from langchain_openai import ChatOpenAI

async def main():
    # Define the location
    location = "Luzern-Stadt"
    
    # Generate filename with current date
    today = datetime.now().strftime("%Y-%m-%d")
    filename = f"{location}-{today}_Homegate.csv"
    csv_path = os.path.join(os.getcwd(), filename)
    
    # Configure the browser - make it visible and disable security restrictions
    browser = Browser(
        config=BrowserConfig(
            headless=False,  # Make the browser visible
            disable_security=False,
            keep_alive=True,
            new_context_config=BrowserContextConfig(
                keep_alive=True,
                disable_security=False,
            ),
        )
    )
    
    # Create the agent with the configured browser
    agent = Agent(
        task=f"""
        Search for property listings in {location} on Homegate.ch

        1. Navigate to https://www.homegate.ch/en
        2. Ask me to fill the location and search 
        3. Record the top 10 listings, including:
           - Property name/title
           - Price
           - Zip code
           - Living space (m²)
           - Number of rooms
        
        4. Format the results in a clear, tabular format.
        """,
        llm=ChatOpenAI(model="gpt-4o"),
        browser=browser,  # Use our configured browser
    )
    
    # Run the agent
    result = await agent.run()
    
    # Extract data from the agent's result text
    property_data = []
    
    # Check the final result from the agent
    if hasattr(result, 'all_results') and result.all_results:
        final_result = result.all_results[-1]
        if hasattr(final_result, 'extracted_content'):
            content = final_result.extracted_content
            print(f"Final result content: {content[:200]}...")
            
            # Try to extract the property data from the table
            if '|' in content:
                lines = content.split('\n')
                header_line = None
                data_lines = []
                
                for line in lines:
                    line = line.strip()
                    if line and '|' in line:
                        if '---' in line:
                            continue  # Skip separator line
                        elif header_line is None:
                            header_line = line  # Capture the header
                        else:
                            data_lines.append(line)  # Capture the data lines
                
                if header_line and data_lines:
                    # Parse header
                    headers = [h.strip() for h in header_line.split('|')[1:-1]]
                    
                    # Parse data
                    for data_line in data_lines:
                        values = [v.strip() for v in data_line.split('|')[1:-1]]
                        if len(values) == len(headers):
                            item = {}
                            for i, header in enumerate(headers):
                                item[header] = values[i]
                            property_data.append(item)
    
    # If we found property data, save it to CSV
    if property_data:
        print(f"\nFound {len(property_data)} properties to export to CSV")
        try:
            with open(csv_path, 'w', newline='', encoding='utf-8') as csvfile:
                # Get fieldnames from the first property
                fieldnames = property_data[0].keys()
                writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
                writer.writeheader()
                for prop in property_data:
                    writer.writerow(prop)
            print(f"CSV file successfully created: {csv_path}")
        except Exception as e:
            print(f"Error writing CSV file: {e}")
    else:
        print("No property data found to export to CSV")
        
        # Create fallback data
        fallback_data = [
            {"Property Name": "Sonnige Residenz in der Stadt Luzern", "Price": "CHF 3,460,860", "Zip Code": "6006", "Living Space": "210m²", "Rooms": "8.5"},
            {"Property Name": "7.5-Zimmerwohnung an zentraler Lage", "Price": "CHF 1,405,050", "Zip Code": "6005", "Living Space": "168m²", "Rooms": "7.5"},
            {"Property Name": "Exklusive Stadtwohnung", "Price": "CHF 2,736,150", "Zip Code": "6004", "Living Space": "140m²", "Rooms": "7.5"},
            {"Property Name": "Ruhige Wohnung mit Aussicht", "Price": "CHF 1,078,190", "Zip Code": "6014", "Living Space": "140m²", "Rooms": "7.5"},
            {"Property Name": "Urbane 5.5-Zimmer-Wohnung", "Price": "CHF 1,833,960", "Zip Code": "6005", "Living Space": "168m²", "Rooms": "5.5"}
        ]
        
        # Save fallback data
        fallback_path = os.path.join(os.getcwd(), f"fallback_{filename}")
        with open(fallback_path, 'w', newline='', encoding='utf-8') as csvfile:
            fieldnames = fallback_data[0].keys()
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            writer.writeheader()
            for prop in fallback_data:
                writer.writerow(prop)
        print(f"Fallback CSV created with sample data: {fallback_path}")
    
    # Close the browser
    await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
    # filter by publication date and add to living data base