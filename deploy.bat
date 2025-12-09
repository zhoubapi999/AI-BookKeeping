@echo off
echo Starting deployment...

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo Docker is not running or not installed. Please start Docker Desktop and try again.
    pause
    exit /b 1
)

echo Building and starting containers...
docker-compose up -d --build

if %errorlevel% neq 0 (
    echo Failed to start containers.
    pause
    exit /b 1
)

echo.
echo Deployment successful!
echo Frontend: http://localhost
echo Backend: http://localhost:3000
echo.
pause