@echo off
echo Starting Web Scraper Application...
echo.

echo [1/2] Starting Backend Server...
start cmd /k "cd server && python api.py"

timeout /t 3 /nobreak > nul

echo [2/2] Starting Frontend...
start cmd /k "cd client && npm run dev"

echo.
echo ========================================
echo Application is starting!
echo ========================================
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:5173
echo API Docs: http://localhost:8000/docs
echo ========================================
echo.
echo Press any key to exit this window...
pause > nul
