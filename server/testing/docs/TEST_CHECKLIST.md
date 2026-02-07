# Testing Checklist

Use this checklist to ensure comprehensive testing of the Web Scraper API.

## Pre-Testing Setup

- [ ] Python 3.8+ installed
- [ ] Dependencies installed (`pip install -r requirements.txt`)
- [ ] `.env` file configured
- [ ] API server running on port 8000
- [ ] Database accessible

## Quick Smoke Tests (2 minutes)

```bash
pytest test_api_health.py -v
```

- [ ] Root endpoint responds
- [ ] Config endpoint works
- [ ] CORS headers present
- [ ] Error handling works

## Unit Tests by Category (10 minutes)

### Health & Configuration
```bash
pytest test_api_health.py -v
```
- [ ] All health checks pass
- [ ] Configuration CRUD works
- [ ] Error handling validated

### Scraper Control
```bash
pytest test_scraper_control.py -v
```
- [ ] Start scraper works
- [ ] Status endpoint works
- [ ] Stop scraper works
- [ ] Pause/resume works
- [ ] Configuration options validated

### Data Retrieval
```bash
pytest test_data_retrieval.py -v
```
- [ ] Statistics endpoint works
- [ ] Pages retrieval works
- [ ] Pagination works
- [ ] File assets retrieval works
- [ ] History endpoints work

### Analytics
```bash
pytest test_analytics.py -v
```
- [ ] Performance analytics work
- [ ] Fingerprint analytics work
- [ ] Geolocation analytics work
- [ ] Timeline works
- [ ] Domain statistics work

### Search & Filter
```bash
pytest test_search_filter.py -v
```
- [ ] Content search works
- [ ] File search works
- [ ] Page filtering works
- [ ] Domain comparison works

### Selector Finder
```bash
pytest test_selector_finder.py -v
```
- [ ] Login page analysis works
- [ ] Selector testing works
- [ ] Robust selector generation works
- [ ] Element finding works

### Change Detection
```bash
pytest test_change_detection.py -v
```
- [ ] Monitored URLs retrieval works
- [ ] Change history works
- [ ] Snapshot retrieval works
- [ ] Snapshot comparison works

### Proxy Management
```bash
pytest test_proxy.py -v
```
- [ ] Proxy listing works
- [ ] Proxy testing works
- [ ] Configuration updates work

### WebSocket
```bash
pytest test_websocket.py -v
```
- [ ] Scraper WebSocket connects
- [ ] Diff WebSocket connects
- [ ] Message format validated
- [ ] Reconnection works

## Integration Tests (15 minutes)

```bash
pytest test_integration.py -v
```

- [ ] Complete scraping workflow
- [ ] Pause/resume workflow
- [ ] Data retrieval workflow
- [ ] Search workflow
- [ ] Analytics workflow
- [ ] Change detection workflow
- [ ] Configuration workflow
- [ ] Error recovery scenarios

## Coverage Report (5 minutes)

```bash
pytest --cov=../api --cov=../scraper --cov-report=html
```

- [ ] Coverage report generated
- [ ] Coverage > 80%
- [ ] Critical paths covered
- [ ] HTML report reviewed

## Performance Tests (Optional, 10 minutes)

```bash
pytest -m slow -v
```

- [ ] Proxy testing completes
- [ ] Large dataset handling
- [ ] Concurrent requests handled
- [ ] Memory usage acceptable

## Manual API Testing (10 minutes)

Use `API_ENDPOINTS.md` for curl commands:

### Basic Operations
- [ ] Health check: `curl http://localhost:8000/`
- [ ] Get config: `curl http://localhost:8000/api/config`
- [ ] Start scraper with minimal config
- [ ] Check scraper status
- [ ] Stop scraper

### Data Operations
- [ ] Get statistics
- [ ] List pages
- [ ] Get page details
- [ ] Search content
- [ ] Filter pages

### Analytics
- [ ] Get performance analytics
- [ ] Get domain statistics
- [ ] Get timeline

### Change Detection
- [ ] List monitored URLs
- [ ] Get change history
- [ ] View snapshots

## WebSocket Testing (5 minutes)

### Browser Console Test
```javascript
// Scraper WebSocket
const ws1 = new WebSocket('ws://localhost:8000/ws/scraper');
ws1.onmessage = (e) => console.log('Scraper:', JSON.parse(e.data));

// Diff WebSocket
const ws2 = new WebSocket('ws://localhost:8000/ws/diff');
ws2.onmessage = (e) => console.log('Diff:', JSON.parse(e.data));
```

- [ ] Scraper WebSocket connects
- [ ] Receives status updates
- [ ] Diff WebSocket connects
- [ ] Receives change notifications

## Error Scenarios (5 minutes)

- [ ] Invalid URL handling
- [ ] Missing required fields
- [ ] Invalid JSON
- [ ] Non-existent resources (404)
- [ ] Server errors handled gracefully

## Documentation Review (5 minutes)

- [ ] README.md reviewed
- [ ] QUICK_START.md followed
- [ ] API_ENDPOINTS.md accurate
- [ ] All examples work

## CI/CD Integration (Optional)

- [ ] Tests run in CI pipeline
- [ ] Coverage uploaded
- [ ] Quality gates configured
- [ ] Automated on PR/commit

## Final Checklist

- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] Coverage > 80%
- [ ] No critical bugs found
- [ ] Documentation complete
- [ ] Manual testing successful
- [ ] WebSocket functionality verified
- [ ] Error handling validated

## Test Results Summary

| Category           | Status | Coverage | Notes |
|--------------------|--------|----------|-------|
| Health & Config    | ⬜     | __%      |       |
| Scraper Control    | ⬜     | __%      |       |
| Data Retrieval     | ⬜     | __%      |       |
| Analytics          | ⬜     | __%      |       |
| Search & Filter    | ⬜     | __%      |       |
| Selector Finder    | ⬜     | __%      |       |
| Change Detection   | ⬜     | __%      |       |
| Proxy              | ⬜     | __%      |       |
| WebSocket          | ⬜     | __%      |       |
| Integration        | ⬜     | __%      |       |

**Overall Status**: ⬜ Pass / ⬜ Fail

**Total Coverage**: ___%

**Issues Found**: ___

**Date Tested**: ___________

**Tested By**: ___________

## Quick Commands Reference

```bash
# Install dependencies
pip install -r requirements.txt

# Run all tests
pytest

# Run with coverage
pytest --cov=../api --cov-report=html

# Run specific category
pytest -m unit -v
pytest -m integration -v
pytest -m api -v

# Run specific file
pytest test_api_health.py -v

# Run automated suite
python run_tests.py

# View coverage
start htmlcov/index.html  # Windows
open htmlcov/index.html   # Mac
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Connection refused | Start API server: `uvicorn api:app --reload` |
| Import errors | Install dependencies: `pip install -r requirements.txt` |
| Database locked | Stop running scrapers |
| Timeout errors | Increase TEST_TIMEOUT in .env |
| WebSocket fails | Check server is running, set SKIP_WEBSOCKET_TESTS=true |

---

**Notes:**

- Check boxes as you complete each section
- Document any issues in the Notes column
- Save this checklist for each testing session
- Update coverage percentages after each run
