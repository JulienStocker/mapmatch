from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By

driver = webdriver.Chrome()
driver.get("https://www.homegate.ch/rent/real-estate/city-zurich/matching-list")

# Wait for JS content to load or scroll if needed
driver.implicitly_wait(10)

listings = driver.find_elements(By.CSS_SELECTOR, "article")

for listing in listings:
    try:
        title = listing.find_element(By.TAG_NAME, "h2").text
        price = listing.find_element(By.CLASS_NAME, "price").text
        address = listing.find_element(By.CLASS_NAME, "address").text
        print({"title": title, "price": price, "address": address})
    except Exception as e:
        print("Skipped one listing due to missing field")

driver.quit()
