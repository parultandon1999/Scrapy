# Testing Environment Setup

This directory contains comprehensive tests for the Web Scraper API.

## Directory Structure

```
testing/
├── README.md                    # This file
├── requirements.txt             # Testing dependencies
├── pytest.ini                   # Pytest configuration
├── conftest.py                  # Shared fixtures and setup
├── test_api_health.py          # Health check and basic tests
├── test_scraper_control.py     # Scraper start/stop/pause/resume
├── test_data_retrieval.py      # Data retrieval endpoints
├── test_analytics.py           # Analytics endpoints
├── test_search_filter.py       # Search and filter endpoints
├── test_selector_finder.py     # Selector finder tools
├── test_change_detection.py    # Change detection endpoints
├── test_proxy.py               # Proxy testing endpoints
├── test_file_operations.py     # File download and operations
├── test_websocket.py           # WebSocket connections
├── test_integration.py         # End-to-end integration tests
├── test_performance.py         # Performance and load tests
└── postman/
    └── Web_Scraper_API.postman_collection.json

```

## Setup Instructions

### 1. Install Dependencies

```bash
cd server/testing
pip install -r requirements.txt
```

### 2. Configure Environment

Create a `.env` file in the testing directory:

```env
API_BASE_URL=http://localhost:8000
TEST_DATABASE_PATH=test_scraped_data.db
TEST_TIMEOUT=30
```

### 3. Start the API Server

```bash
cd server
uvicorn api:app --reload --port 8000
```

### 4. Run Tests

**Run all tests:**
```bash
pytest
```

**Run specific test file:**
```bash
pytest test_api_health.py
```

**Run with coverage:**
```bash
pytest --cov=../api --cov-report=html
```

**Run with verbose output:**
```bash
pytest -v
```

**Run specific test:**
```bash
pytest test_api_health.py::test_root_endpoint
```

## Test Categories

### Unit Tests
- Individual endpoint testing
- Input validation
- Error handling
- Response format verification

### Integration Tests
- Complete scraping workflows
- Multi-endpoint interactions
- Database operations
- WebSocket communication

### Performance Tests
- Load testing
- Concurrent request handling
- Response time benchmarks
- Memory usage monitoring

## Test Coverage Goals

- **Minimum Coverage:** 80%
- **Target Coverage:** 90%+
- **Critical Paths:** 100%

## CI/CD Integration

Tests are designed to run in CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Run Tests
  run: |
    cd server/testing
    pytest --cov --cov-report=xml
```

## Troubleshooting

**Issue:** Tests fail with "Connection refused"
**Solution:** Ensure API server is running on port 8000

**Issue:** Database locked errors
**Solution:** Use separate test database, clean up after tests

**Issue:** Timeout errors
**Solution:** Increase TEST_TIMEOUT in .env file

## Contributing

When adding new endpoints:
1. Add corresponding test file
2. Update this README
3. Ensure 80%+ coverage
4. Add integration test if needed
