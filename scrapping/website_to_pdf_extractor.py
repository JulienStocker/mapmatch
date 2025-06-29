#!/usr/bin/env python3
"""
Website to PDF Property Data Extractor
Converts a real estate website to PDF and extracts property information using OpenAI API
"""

import os
import sys
import json
import csv
import time
import logging
from datetime import datetime
from typing import List, Dict, Any
import argparse

import requests
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, WebDriverException

# For PDF conversion
from selenium.webdriver.common.print_page_options import PrintOptions
import base64

# OpenAI integration
import openai

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('pdf_extractor.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

class WebsiteToPDFExtractor:
    def __init__(self, openai_api_key: str, headless: bool = True):
        """
        Initialize the extractor with OpenAI API key
        
        Args:
            openai_api_key: OpenAI API key for text extraction
            headless: Whether to run browser in headless mode
        """
        self.openai_client = openai.OpenAI(api_key=openai_api_key)
        self.headless = headless
        self.driver = None
        
    def setup_driver(self):
        """Setup Chrome driver with appropriate options"""
        chrome_options = Options()
        
        if self.headless:
            chrome_options.add_argument("--headless")
        
        # Additional options for better PDF generation
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--window-size=1920,1080")
        chrome_options.add_argument("--disable-web-security")
        chrome_options.add_argument("--allow-running-insecure-content")
        
        # Enable print to PDF
        chrome_options.add_argument("--enable-print-browser")
        chrome_options.add_argument("--disable-background-printing")
        
        try:
            self.driver = webdriver.Chrome(options=chrome_options)
            self.driver.set_window_size(1920, 1080)
            logger.info("Chrome driver initialized successfully")
        except WebDriverException as e:
            logger.error(f"Failed to initialize Chrome driver: {e}")
            raise
    
    def convert_to_pdf(self, url: str, output_path: str) -> str:
        """
        Convert website to PDF
        
        Args:
            url: Website URL to convert
            output_path: Path to save the PDF file
            
        Returns:
            Path to the generated PDF file
        """
        if not self.driver:
            self.setup_driver()
        
        try:
            logger.info(f"Loading website: {url}")
            self.driver.get(url)
            
            # Wait for page to load completely
            WebDriverWait(self.driver, 30).until(
                EC.presence_of_element_located((By.TAG_NAME, "body"))
            )
            
            # Additional wait for dynamic content
            time.sleep(5)
            
            # Scroll to bottom to load all content
            self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
            time.sleep(3)
            
            # Generate PDF
            logger.info("Converting to PDF...")
            
            # Use Chrome's print to PDF functionality
            print_options = PrintOptions()
            print_options.page_ranges = []  # Print all pages
            
            pdf_data = self.driver.print_page(print_options)
            
            # Save PDF to file
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            with open(output_path, 'wb') as f:
                f.write(base64.b64decode(pdf_data))
            
            logger.info(f"PDF saved to: {output_path}")
            return output_path
            
        except TimeoutException:
            logger.error("Timeout waiting for page to load")
            raise
        except Exception as e:
            logger.error(f"Error converting to PDF: {e}")
            raise
    
    def extract_text_from_website(self, url: str) -> str:
        """
        Extract text content from website for analysis
        
        Args:
            url: Website URL
            
        Returns:
            Extracted text content
        """
        if not self.driver:
            self.setup_driver()
        
        try:
            self.driver.get(url)
            WebDriverWait(self.driver, 30).until(
                EC.presence_of_element_located((By.TAG_NAME, "body"))
            )
            
            # Remove script and style elements
            self.driver.execute_script("""
                var scripts = document.getElementsByTagName('script');
                for(var i = scripts.length - 1; i >= 0; i--) {
                    scripts[i].parentNode.removeChild(scripts[i]);
                }
                var styles = document.getElementsByTagName('style');
                for(var i = styles.length - 1; i >= 0; i--) {
                    styles[i].parentNode.removeChild(styles[i]);
                }
            """)
            
            # Get clean text content
            text_content = self.driver.find_element(By.TAG_NAME, "body").text
            
            # Also get page title and URL for context
            page_title = self.driver.title
            current_url = self.driver.current_url
            
            full_content = f"Page Title: {page_title}\nURL: {current_url}\n\nContent:\n{text_content}"
            
            return full_content
            
        except Exception as e:
            logger.error(f"Error extracting text: {e}")
            raise
    
    def extract_property_data_with_openai(self, text_content: str, url: str) -> List[Dict[str, Any]]:
        """
        Use OpenAI to extract structured property data from text
        
        Args:
            text_content: Raw text content from website
            url: Original URL for reference
            
        Returns:
            List of property dictionaries
        """
        prompt = f"""
        Please analyze the following real estate website content and extract property information. 
        Return the data as a JSON array of objects, where each object represents a property with these fields:
        
        - Address (string): Full property address
        - Price (string): Property price (keep original format/currency)
        - Rooms (string): Number of rooms
        - Bathrooms (string): Number of bathrooms  
        - Area_m2 (string): Area in square meters
        - Zip_Code (string): Postal/ZIP code
        - Latitude (string): Latitude coordinate (if available, otherwise empty string)
        - Longitude (string): Longitude coordinate (if available, otherwise empty string)
        - URL (string): Property listing URL (if available, otherwise use the main URL: {url})
        
        If any field is not available, use an empty string "".
        
        Website content:
        {text_content[:8000]}  # Limit content to avoid token limits
        
        Please return ONLY the JSON array, no additional text or formatting.
        """
        
        try:
            logger.info("Sending request to OpenAI for property data extraction...")
            
            response = self.openai_client.chat.completions.create(
                model="gpt-4o-mini",  # Using a more cost-effective model
                messages=[
                    {"role": "system", "content": "You are a specialized real estate data extraction assistant. Extract property information and return it as clean JSON."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0,  # Deterministic output
                max_tokens=4000
            )
            
            content = response.choices[0].message.content.strip()
            logger.info("Received response from OpenAI")
            
            # Try to parse the JSON response
            try:
                # Remove any markdown code block formatting if present
                if content.startswith("```json"):
                    content = content.replace("```json", "").replace("```", "").strip()
                elif content.startswith("```"):
                    content = content.replace("```", "").strip()
                
                properties_data = json.loads(content)
                
                # Ensure it's a list
                if not isinstance(properties_data, list):
                    properties_data = [properties_data]
                
                logger.info(f"Successfully extracted {len(properties_data)} properties")
                return properties_data
                
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse JSON response: {e}")
                logger.error(f"Raw response: {content}")
                return []
                
        except Exception as e:
            logger.error(f"Error with OpenAI API: {e}")
            return []
    
    def save_to_csv(self, properties_data: List[Dict[str, Any]], output_path: str):
        """
        Save property data to CSV file
        
        Args:
            properties_data: List of property dictionaries
            output_path: Path to save CSV file
        """
        if not properties_data:
            logger.warning("No property data to save")
            return
        
        fieldnames = ['Address', 'Price', 'Rooms', 'Bathrooms', 'Area_m2', 'Zip_Code', 'Latitude', 'Longitude', 'URL']
        
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        with open(output_path, 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            writer.writeheader()
            
            for prop in properties_data:
                # Ensure all required fields exist
                row = {}
                for field in fieldnames:
                    row[field] = prop.get(field, "")
                writer.writerow(row)
        
        logger.info(f"Property data saved to CSV: {output_path}")
    
    def save_to_json(self, properties_data: List[Dict[str, Any]], output_path: str):
        """
        Save property data to JSON file
        
        Args:
            properties_data: List of property dictionaries
            output_path: Path to save JSON file
        """
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        with open(output_path, 'w', encoding='utf-8') as jsonfile:
            json.dump(properties_data, jsonfile, indent=2, ensure_ascii=False)
        
        logger.info(f"Property data saved to JSON: {output_path}")
    
    def process_website(self, url: str, output_dir: str = "outputs") -> Dict[str, str]:
        """
        Complete workflow: Convert website to PDF and extract property data
        
        Args:
            url: Website URL to process
            output_dir: Directory to save outputs
            
        Returns:
            Dictionary with paths to generated files
        """
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Create output directory
        os.makedirs(output_dir, exist_ok=True)
        
        # File paths
        pdf_path = os.path.join(output_dir, f"website_{timestamp}.pdf")
        text_path = os.path.join(output_dir, f"extracted_text_{timestamp}.txt")
        csv_path = os.path.join(output_dir, f"property_data_{timestamp}.csv")
        json_path = os.path.join(output_dir, f"property_data_{timestamp}.json")
        
        results = {}
        
        try:
            # Step 1: Convert to PDF
            logger.info("Step 1: Converting website to PDF...")
            pdf_file = self.convert_to_pdf(url, pdf_path)
            results['pdf'] = pdf_file
            
            # Step 2: Extract text content
            logger.info("Step 2: Extracting text content...")
            text_content = self.extract_text_from_website(url)
            
            # Save extracted text for reference
            with open(text_path, 'w', encoding='utf-8') as f:
                f.write(text_content)
            results['text'] = text_path
            
            # Step 3: Extract property data using OpenAI
            logger.info("Step 3: Extracting property data with OpenAI...")
            properties_data = self.extract_property_data_with_openai(text_content, url)
            
            if properties_data:
                # Step 4: Save to CSV and JSON
                logger.info("Step 4: Saving extracted data...")
                self.save_to_csv(properties_data, csv_path)
                self.save_to_json(properties_data, json_path)
                results['csv'] = csv_path
                results['json'] = json_path
                
                logger.info(f"Successfully processed {len(properties_data)} properties")
            else:
                logger.warning("No property data was extracted")
            
            return results
            
        except Exception as e:
            logger.error(f"Error in processing workflow: {e}")
            raise
        finally:
            if self.driver:
                self.driver.quit()
                logger.info("Browser driver closed")


def main():
    parser = argparse.ArgumentParser(description='Convert real estate website to PDF and extract property data')
    parser.add_argument('url', help='Website URL to process')
    parser.add_argument('--openai-key', required=True, help='OpenAI API key')
    parser.add_argument('--output-dir', default='outputs', help='Output directory (default: outputs)')
    parser.add_argument('--headless', action='store_true', help='Run browser in headless mode')
    
    args = parser.parse_args()
    
    # Initialize extractor
    extractor = WebsiteToPDFExtractor(
        openai_api_key=args.openai_key,
        headless=args.headless
    )
    
    try:
        # Process the website
        results = extractor.process_website(args.url, args.output_dir)
        
        print("\n" + "="*50)
        print("PROCESSING COMPLETE!")
        print("="*50)
        
        for file_type, path in results.items():
            print(f"{file_type.upper()}: {path}")
        
        print("\nCheck the generated files for your property data!")
        
    except Exception as e:
        logger.error(f"Failed to process website: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main() 