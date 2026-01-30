import asyncio
from playwright.async_api import async_playwright
import config

class SelectorFinder:
    
    def __init__(self, login_url):
        self.login_url = login_url
    
    async def analyze_login_page(self):
        print("\n" + "="*70)
        print("LOGIN FORM ANALYZER")
        print("="*70)
        print(f"Analyzing: {self.login_url}\n")
        
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=False)
            context = await browser.new_context(
                viewport=config.SELECTOR_FINDER['viewport']
            )
            page = await context.new_page()
            
            try:
                print("-> Loading page...")
                await page.goto(self.login_url, wait_until="networkidle", timeout=config.TIMEOUTS['selector_finder'])
                await asyncio.sleep(2)
                
                print("[Success] Page loaded\n")
                
                print("="*70)
                print("INPUT FIELDS FOUND:")
                print("="*70)
                
                inputs = await page.query_selector_all("input")
                
                for i, input_elem in enumerate(inputs, 1):
                    input_type = await input_elem.get_attribute("type") or "text"
                    input_name = await input_elem.get_attribute("name") or ""
                    input_id = await input_elem.get_attribute("id") or ""
                    input_class = await input_elem.get_attribute("class") or ""
                    input_placeholder = await input_elem.get_attribute("placeholder") or ""
                    
                    print(f"\nInput #{i} - Type: {input_type}")
                    
                    selectors = []
                    
                    if input_name:
                        selectors.append(f"input[name='{input_name}']")
                        print(f"  Name:        {input_name}")
                    
                    if input_id:
                        selectors.append(f"#{input_id}")
                        print(f"  ID:          {input_id}")
                    
                    if input_class:
                        first_class = input_class.split()[0]
                        selectors.append(f".{first_class}")
                        print(f"  Class:       {input_class}")
                    
                    if input_placeholder:
                        selectors.append(f"input[placeholder='{input_placeholder}']")
                        print(f"  Placeholder: {input_placeholder}")
                    
                    if input_type:
                        selectors.append(f"input[type='{input_type}']")
                    
                    if selectors:
                        print(f"  Best Selector: {selectors[0]}")
                    
                    if input_type == "email" or "email" in input_name.lower() or "email" in input_id.lower():
                        print(f"  Tip: Likely USERNAME field")
                    elif input_type == "password":
                        print(f"  Tip: Likely PASSWORD field")
                
                print("\n" + "="*70)
                print("BUTTONS FOUND:")
                print("="*70)
                
                buttons = await page.query_selector_all("button, input[type='submit']")
                
                for i, button in enumerate(buttons, 1):
                    button_type = await button.get_attribute("type") or ""
                    button_text = await button.inner_text() or ""
                    button_id = await button.get_attribute("id") or ""
                    button_class = await button.get_attribute("class") or ""
                    
                    print(f"\nButton #{i}")
                    
                    if button_text:
                        print(f"  Text:  {button_text.strip()}")
                    
                    if button_type:
                        print(f"  Type:  {button_type}")
                    
                    if button_id:
                        print(f"  ID:    {button_id}")
                    
                    if button_class:
                        print(f"  Class: {button_class}")
                    
                    selectors = []
                    
                    if button_type == "submit":
                        selectors.append("button[type='submit']")
                    
                    if button_id:
                        selectors.append(f"#{button_id}")
                    
                    if button_class:
                        first_class = button_class.split()[0]
                        selectors.append(f".{first_class}")
                    
                    if button_text:
                        selectors.append(f"button:has-text('{button_text.strip()}')")
                    
                    if selectors:
                        print(f"  Best Selector: {selectors[0]}")
                    
                    if (button_type == "submit" or 
                        any(word in button_text.lower() for word in ["login", "sign in", "submit", "enter"])):
                        print(f"  Tip: Likely SUBMIT button")
                
                print("\n" + "="*70)
                print("FORMS FOUND:")
                print("="*70)
                
                forms = await page.query_selector_all("form")
                print(f"\nFound {len(forms)} form(s) on the page")
                
                for i, form in enumerate(forms, 1):
                    form_id = await form.get_attribute("id") or ""
                    form_class = await form.get_attribute("class") or ""
                    form_action = await form.get_attribute("action") or ""
                    
                    print(f"\nForm #{i}")
                    
                    if form_id:
                        print(f"  ID:     {form_id}")
                    
                    if form_class:
                        print(f"  Class:  {form_class}")
                    
                    if form_action:
                        print(f"  Action: {form_action}")
                
                print("\n" + "="*70)
                print("SUGGESTED CONFIGURATION:")
                print("="*70 + "\n")
                
                username_candidates = await page.query_selector_all(
                    "input[type='text'], input[type='email'], input[name*='user'], input[name*='email'], input[id*='user'], input[id*='email']"
                )
                
                username_selector = None
                if username_candidates:
                    first = username_candidates[0]
                    name = await first.get_attribute("name")
                    id_attr = await first.get_attribute("id")
                    
                    if name:
                        username_selector = f"input[name='{name}']"
                    elif id_attr:
                        username_selector = f"#{id_attr}"
                    else:
                        username_selector = "input[type='email']"
                
                password_candidates = await page.query_selector_all("input[type='password']")
                
                password_selector = None
                if password_candidates:
                    first = password_candidates[0]
                    name = await first.get_attribute("name")
                    id_attr = await first.get_attribute("id")
                    
                    if name:
                        password_selector = f"input[name='{name}']"
                    elif id_attr:
                        password_selector = f"#{id_attr}"
                    else:
                        password_selector = "input[type='password']"
                
                submit_candidates = await page.query_selector_all(
                    "button[type='submit'], input[type='submit']"
                )
                
                submit_selector = None
                if submit_candidates:
                    first = submit_candidates[0]
                    id_attr = await first.get_attribute("id")
                    class_attr = await first.get_attribute("class")
                    
                    if id_attr:
                        submit_selector = f"#{id_attr}"
                    elif class_attr:
                        first_class = class_attr.split()[0]
                        submit_selector = f".{first_class}"
                    else:
                        submit_selector = "button[type='submit']"
                
                print("```python")
                print("from scraper import Scraper")
                print("import asyncio")
                print()
                print("crawler = AuthenticatedCrawler(")
                print(f"    start_url=\"{self.login_url}\",")
                print(f"    login_url=\"{self.login_url}\",")
                print("    username=\"YOUR_USERNAME\",")
                print("    password=\"YOUR_PASSWORD\",")
                
                if username_selector:
                    print(f"    username_selector=\"{username_selector}\",")
                else:
                    print("    username_selector=\"input[name='username']\",  # [Warning] VERIFY THIS")
                
                if password_selector:
                    print(f"    password_selector=\"{password_selector}\",")
                else:
                    print("    password_selector=\"input[name='password']\",  # [Warning] VERIFY THIS")
                
                if submit_selector:
                    print(f"    submit_selector=\"{submit_selector}\",")
                else:
                    print("    submit_selector=\"button[type='submit']\",  # [Warning] VERIFY THIS")
                
                print("    success_indicator=\".user-profile\",  # [Warning] CHANGE THIS to element that appears after login")
                print("    max_pages=50,")
                print("    max_depth=2")
                print(")")
                print()
                print("asyncio.run(crawler.run())")
                print("```\n")
                
                print("="*70)
                print("INTERACTIVE TESTING")
                print("="*70)
                print("\nYou can now manually test selectors in the browser.")
                print("The page will stay open. Try these in the browser console (F12):\n")
                
                if username_selector:
                    print(f"  document.querySelector(\"{username_selector}\")")
                
                if password_selector:
                    print(f"  document.querySelector(\"{password_selector}\")")
                
                if submit_selector:
                    print(f"  document.querySelector(\"{submit_selector}\")")
                
                print("\nPress Enter when done...")
                input()
                
            except Exception as e:
                print(f"\n[Error]: {e}")
            
            finally:
                await browser.close()
    
    async def test_login(self, username, password, username_selector, 
                        password_selector, submit_selector):
        print("\n" + "="*70)
        print("TESTING LOGIN")
        print("="*70 + "\n")
        
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=False)
            context = await browser.new_context(
                viewport={"width": 1920, "height": 1080}
            )
            page = await context.new_page()
            
            try:
                print(f"-> Loading {self.login_url}")
                await page.goto(self.login_url, wait_until="networkidle", timeout=30000)
                await asyncio.sleep(2)
                
                print(f"-> Filling username: {username}")
                await page.fill(username_selector, username)
                await asyncio.sleep(0.5)
                
                print(f"-> Filling password: {'*' * len(password)}")
                await page.fill(password_selector, password)
                await asyncio.sleep(0.5)
                
                print(f"-> Clicking submit")
                await page.click(submit_selector)
                
                print(f"-> Waiting for navigation...")
                await asyncio.sleep(5)
                
                final_url = page.url
                print(f"\nFinal URL: {final_url}")
                
                if final_url != self.login_url:
                    print("[Success] URL changed - likely successful!")
                else:
                    print("[Warning] Still on login page - may have failed")
                
                print("\nCheck the browser to verify if login was successful.")
                print("Press Enter to close...")
                input()
                
            except Exception as e:
                print(f"\n[Error]: {e}")
                print("Check if selectors are correct.")
            
            finally:
                await browser.close()


async def main():
    print("|Login Form Selector Finder|")
    
    login_url = input("Enter login page URL: ").strip()
    
    if not login_url:
        print("No URL provided. Exiting.")
        return
    
    finder = SelectorFinder(login_url)
    
    while True:
        print("\n" + "="*60)
        print("Options:")
        print("  1. Analyze login page (find selectors automatically)")
        print("  2. Test login with selectors")
        print("  3. Exit")
        print("="*60)
        
        choice = input("\nEnter choice (1-3): ").strip()
        
        if choice == "1":
            await finder.analyze_login_page()
        
        elif choice == "2":
            print("\nEnter login credentials and selectors:")
            username = input("  Username: ").strip()
            password = input("  Password: ").strip()
            username_selector = input("  Username selector: ").strip()
            password_selector = input("  Password selector: ").strip()
            submit_selector = input("  Submit selector: ").strip()
            
            if all([username, password, username_selector, password_selector, submit_selector]):
                await finder.test_login(
                    username, password, 
                    username_selector, password_selector, submit_selector
                )
            else:
                print("All fields are required!")
        
        elif choice == "3":
            print("\nExiting...")
            break
        
        else:
            print("Invalid choice!")


if __name__ == "__main__":
    asyncio.run(main())