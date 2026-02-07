# Quick Start Guide - Testing Environment

## Prerequisites

- Python 3.8+
- pip
- Running API server on http://localhost:8000

## Setup (5 minutes)

### 1. Install Dependencies

```bash
cd server/testing
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env if needed
```

### 3. Start API Server

In a separate terminal:
```bash
cd server
uvicorn api:app --reload --port 8000
```

## Running Tests

### Quick Test (30 seconds)
```bash
pytest test_api_health.py -v
```

### All Unit Tests (2-3 minutes)
```bash
pytest -m unit -v
```

### All Tests with Coverage (5-10 minutes)
```bash
pytest --cov=../api --cov-report=html
```

### Specific Test Categories
```bash
# API endpoints only
pytest -m api -v

# Scraper functionality
pytest -m scraper -v

# Database operations
pytest -m database -v

# Change detection
pytest -m change_detection -v

# Selector finder
pytest -m selector -v

# WebSocket tests
pytest -m websocket -v
```

### Integration Tests (slower)
```bash
pytest -m integration -v
```

### Run All Tests
```bash
python run_tests.py
```

## View Coverage Report

After running tests with coverage:
```bash
# Open in browser
start htmlcov/index.html  # Windows
open htmlcov/index.html   # Mac
xdg-open htmlcov/index.html  # Linux
```

## Common Test Commands

```bash
# Run tests matching pattern
pytest -k "test_scraper" -v

# Run specific test file
pytest test_scraper_control.py -v

# Run specific test
pytest test_api_health.py::TestHealthEndpoints::test_root_endpoint -v

# Stop on first failure
pytest -x

# Show print statements
pytest -s

# Parallel execution (faster)
pytest -n auto

# Generate HTML report
pytest --html=report.html --self-contained-html
```

## Test Structure

```
testing/
├── test_api_health.py          # Basic health checks
├── test_scraper_control.py     # Start/stop/pause/resume
├── test_data_retrieval.py      # Data endpoints
├── test_analytics.py           # Analytics endpoints
├── test_search_filter.py       # Search & filter
├── test_selector_finder.py     # Selector tools
├── test_change_detection.py    # Change tracking
├── test_proxy.py               # Proxy management
├── test_websocket.py           # WebSocket connections
└── test_integration.py         # End-to-end workflows
```

## Troubleshooting

### Tests Fail with "Connection Refused"
**Solution:** Make sure API server is running on port 8000

### Database Locked Errors
**Solution:** Stop any running scrapers before tests

### Timeout Errors
**Solution:** Increase TEST_TIMEOUT in .env file

### WebSocket Tests Fail
**Solution:** Set SKIP_WEBSOCKET_TESTS=true in .env

### Import Errors
**Solution:** Install dependencies: `pip install -r requirements.txt`

## Next Steps

1. Run quick test to verify setup
2. Run all unit tests
3. Check coverage report
4. Run integration tests
5. Review API_ENDPOINTS.md for manual testing

## Manual Testing

Use the API_ENDPOINTS.md file for curl commands to test endpoints manually.

Example:
```bash
# Health check
curl http://localhost:8000/

# Get configuration
curl http://localhost:8000/api/config

# Start scraper
curl -X POST http://localhost:8000/api/scraper/start \
  -H "Content-Type: application/json" \
  -d '{"start_url": "https://example.com", "max_pages": 5}'
```

## CI/CD Integration

Add to your CI pipeline:
```yaml
- name: Install dependencies
  run: pip install -r server/testing/requirements.txt

- name: Run tests
  run: |
    cd server/testing
    pytest --cov --cov-report=xml

- name: Upload coverage
  uses: codecov/codecov-action@v3
```

## Support

- Check README.md for detailed documentation
- Review API_ENDPOINTS.md for endpoint reference
- See conftest.py for available fixtures
- Check pytest.ini for test markers
