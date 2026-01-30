import asyncio
import time
from playwright.async_api import async_playwright
from urllib.parse import urlparse
import config

class ProxyTester:
    
    def __init__(self, proxy_file=None):
        self.proxy_file = proxy_file if proxy_file is not None else config.PROXY['proxy_file']
        self.working_proxies = []
        self.failed_proxies = []
    
    def load_proxies(self):
        proxies = []
        try:
            with open(self.proxy_file, 'r') as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith('#'):
                        proxies.append(line)
            print(f"Loaded {len(proxies)} proxies from {self.proxy_file}")
        except FileNotFoundError:
            print(f"File not found: {self.proxy_file}")
        
        return proxies
    
    async def test_proxy(self, proxy, test_url=None, timeout=None):
        test_url = test_url if test_url is not None else config.PROXY['test_url']
        timeout = timeout if timeout is not None else config.PROXY['test_timeout']
        parsed_proxy = urlparse(proxy)
        
        proxy_config = {
            "server": f"{parsed_proxy.scheme}://{parsed_proxy.hostname}:{parsed_proxy.port}"
        }
        
        if parsed_proxy.username and parsed_proxy.password:
            proxy_config["username"] = parsed_proxy.username
            proxy_config["password"] = parsed_proxy.password
        
        start_time = time.time()
        
        async with async_playwright() as p:
            browser = None
            try:
                browser = await p.chromium.launch(headless=True)
                context = await browser.new_context(
                    proxy=proxy_config,
                    user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
                )
                page = await context.new_page()
                
                response = await page.goto(test_url, wait_until="domcontentloaded", timeout=timeout)
                
                if response and response.status < 400:
                    elapsed = time.time() - start_time
                    
                    try:
                        content = await page.content()
                        if 'httpbin' in test_url:
                            ip_data = await page.inner_text('body')
                            return {
                                "proxy": proxy,
                                "status": "Working",
                                "response_time": f"{elapsed:.2f}s",
                                "response": ip_data[:100]
                            }
                    except:
                        pass
                    
                    return {
                        "proxy": proxy,
                        "status": "Working",
                        "response_time": f"{elapsed:.2f}s",
                        "response": f"Status: {response.status}"
                    }
                else:
                    return {
                        "proxy": proxy,
                        "status": f"Failed (HTTP {response.status})",
                        "response_time": f"{elapsed:.2f}s",
                        "response": ""
                    }
                    
            except asyncio.TimeoutError:
                elapsed = time.time() - start_time
                return {
                    "proxy": proxy,
                    "status": "Timeout",
                    "response_time": f"{elapsed:.2f}s",
                    "response": ""
                }
            except Exception as e:
                elapsed = time.time() - start_time
                error_msg = str(e)[:50]
                return {
                    "proxy": proxy,
                    "status": "Error",
                    "response_time": f"{elapsed:.2f}s",
                    "response": error_msg
                }
            finally:
                if browser:
                    await browser.close()
    
    async def test_all_proxies(self, concurrent_tests=None, test_url=None):
        concurrent_tests = concurrent_tests if concurrent_tests is not None else config.PROXY['concurrent_tests']
        test_url = test_url if test_url is not None else config.PROXY['test_url']
        proxies = self.load_proxies()
        
        if not proxies:
            print("No proxies to test!")
            return
        
        print(f"\n{'='*80}")
        print(f"Testing {len(proxies)} proxies with {concurrent_tests} concurrent tests...")
        print(f"Test URL: {test_url}")
        print(f"{'='*80}\n")
        
        results = []
        for i in range(0, len(proxies), concurrent_tests):
            batch = proxies[i:i+concurrent_tests]
            batch_results = await asyncio.gather(*[
                self.test_proxy(proxy, test_url) for proxy in batch
            ])
            results.extend(batch_results)
            
            print(f"Progress: {min(i+concurrent_tests, len(proxies))}/{len(proxies)} tested")
        
        self.working_proxies = [r for r in results if r["status"] == "Working"]
        self.failed_proxies = [r for r in results if r["status"] != "Working"]
        
        print(f"\n{'='*80}")
        print("TEST RESULTS")
        print(f"{'='*80}\n")
        
        print(f"Working Proxies: {len(self.working_proxies)}/{len(proxies)}\n")
        for result in self.working_proxies:
            print(f"  {result['proxy']}")
            print(f"    Time: {result['response_time']}")
            if result['response']:
                print(f"    Response: {result['response']}")
            print()
        
        print(f"Failed Proxies: {len(self.failed_proxies)}/{len(proxies)}\n")
        for result in self.failed_proxies:
            print(f"  {result['proxy']}")
            print(f"    Status: {result['status']}")
            print(f"    Time: {result['response_time']}")
            if result['response']:
                print(f"    Error: {result['response']}")
            print()
        
        print(f"{'='*80}")
        print(f"Summary: {len(self.working_proxies)} working, {len(self.failed_proxies)} failed")
        print(f"{'='*80}\n")
        
        return results
    
    def save_working_proxies(self, output_file="working_proxies.txt"):
        if not self.working_proxies:
            print("No working proxies to save!")
            return
        
        with open(output_file, 'w') as f:
            f.write("# Working Proxies - Tested and Verified\n")
            f.write(f"# Tested on: {time.strftime('%Y-%m-%d %H:%M:%S')}\n\n")
            
            for result in self.working_proxies:
                f.write(f"{result['proxy']}  # {result['response_time']}\n")
        
        print(f"Saved {len(self.working_proxies)} working proxies to {output_file}")
    
    async def test_proxy_speed(self, proxy, num_requests=5):
        print(f"\nTesting speed of: {proxy}")
        print(f"Making {num_requests} requests...\n")
        
        times = []
        for i in range(num_requests):
            result = await self.test_proxy(proxy, "https://httpbin.org/ip")
            if result["status"] == "Working":
                time_val = float(result["response_time"].replace('s', ''))
                times.append(time_val)
                print(f"  Request {i+1}: {time_val:.2f}s")
            else:
                print(f"  Request {i+1}: Failed - {result['status']}")
        
        if times:
            avg_time = sum(times) / len(times)
            min_time = min(times)
            max_time = max(times)
            
            print(f"\nSpeed Statistics:")
            print(f"  Average: {avg_time:.2f}s")
            print(f"  Minimum: {min_time:.2f}s")
            print(f"  Maximum: {max_time:.2f}s")
            print(f"  Success Rate: {len(times)}/{num_requests} ({len(times)/num_requests*100:.1f}%)")
        else:
            print("\nAll requests failed!")


async def main():
    tester = ProxyTester("proxies.txt")
    
    print("=" * 63)
    print("                   Proxy Testing Utility                   ")
    print("=" * 63 + "\n")
    
    while True:
        print("\nOptions:")
        print("  1. Test all proxies")
        print("  2. Test all proxies and save working ones")
        print("  3. Test single proxy")
        print("  4. Test proxy speed (multiple requests)")
        print("  5. Quick test (different test URLs)")
        print("  6. Exit")
        
        choice = input("\nEnter choice (1-6): ").strip()
        
        if choice == "1":
            await tester.test_all_proxies(concurrent_tests=5)
        
        elif choice == "2":
            await tester.test_all_proxies(concurrent_tests=5)
            tester.save_working_proxies("working_proxies.txt")
        
        elif choice == "3":
            proxy = input("Enter proxy (e.g., http://proxy:port): ").strip()
            result = await tester.test_proxy(proxy)
            print(f"\nResult: {result['status']}")
            print(f"Time: {result['response_time']}")
            if result['response']:
                print(f"Response: {result['response']}")
        
        elif choice == "4":
            proxy = input("Enter proxy (e.g., http://proxy:port): ").strip()
            num_requests = int(input("Number of requests (default 5): ").strip() or "5")
            await tester.test_proxy_speed(proxy, num_requests)
        
        elif choice == "5":
            print("\nTest URLs:")
            print("  1. httpbin.org/ip (shows IP)")
            print("  2. example.com (simple test)")
            print("  3. google.com (heavy site)")
            print("  4. Custom URL")
            
            url_choice = input("Choose test URL (1-4): ").strip()
            
            test_urls = {
                "1": "https://httpbin.org/ip",
                "2": "https://example.com",
                "3": "https://google.com",
            }
            
            if url_choice == "4":
                test_url = input("Enter custom URL: ").strip()
            else:
                test_url = test_urls.get(url_choice, "https://httpbin.org/ip")
            
            await tester.test_all_proxies(concurrent_tests=5, test_url=test_url)
        
        elif choice == "6":
            print("\nExiting...")
            break
        
        else:
            print("Invalid choice!")


if __name__ == "__main__":
    asyncio.run(main())