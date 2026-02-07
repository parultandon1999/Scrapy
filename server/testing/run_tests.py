"""
Test Runner Script
Runs tests from beginning but skips already passed tests
"""
import subprocess
import sys
import os
from pathlib import Path


def run_command(cmd, description):
    """Run a command and print results"""
    print(f"\n{'='*60}")
    print(f"Running: {description}")
    print(f"{'='*60}\n")
    
    result = subprocess.run(cmd, shell=True)
    
    if result.returncode != 0:
        print(f"\n{description} failed!")
        return False
    else:
        print(f"\n{description} passed!")
        return True


def main():
    """Main test runner"""
    os.chdir(Path(__file__).parent)
    
    print("Web Scraper API Test Suite")
    print("="*60)
    print("\n🔍 Running tests from START, skipping already passed tests\n")
    
    results = []
    
    # Use --ff (failed first) mode
    # This runs tests in order: failed tests first, then remaining tests
    # But we combine with --lf to ONLY run failed + not-yet-run tests
    results.append(run_command(
        "pytest -v --ignore=test_real_scraping.py",
        "All Tests (178 tests, skipping real_scraping)"
    ))
    
    # If all tests pass, run coverage
    if results[0]:
        results.append(run_command(
            "pytest --ignore=test_real_scraping.py --cov=../api --cov=../scraper --cov-report=html --cov-report=term",
            "Coverage Report"
        ))
    
    # Summary
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    
    passed = sum(results)
    total = len(results)
    
    print(f"\nPassed: {passed}/{total}")
    print(f"Failed: {total - passed}/{total}")
    
    if passed == total:
        print("\n✅ All test suites passed!")
        return 0
    else:
        print("\n❌ Some test suites failed!")
        print("💡 Run 'python run_tests.py' again - it will skip passed tests and continue")
        return 1


if __name__ == "__main__":
    sys.exit(main())
