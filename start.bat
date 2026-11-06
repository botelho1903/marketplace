@echo off
REM start.bat - Simple startup script for HTTP deployment on Windows
REM Usage: start.bat

echo 🚀 Starting Marketplace in HTTP mode...

REM Check if .env.production exists
if not exist .env.production (
    echo ❌ .env.production not found. Copy .env.production.example and configure it.
    pause
    exit /b 1
)

REM Load environment variables from .env.production
for /f "tokens=1* delims==" %%a in (.env.production) do (
    if not "%%a"=="" if not "%%a"=="#" (
        set "%%a=%%b"
    )
)

REM Ensure DATABASE_URL is set
if "%DATABASE_URL%"=="" (
    echo ❌ DATABASE_URL not set in .env.production
    pause
    exit /b 1
)

REM Ensure NEXTAUTH_URL is HTTP
echo %NEXTAUTH_URL% | findstr /R /C:"^https://" >nul
if not errorlevel 1 (
    echo ⚠️  NEXTAUTH_URL is HTTPS. Changing to HTTP for this deployment...
    set NEXTAUTH_URL=%NEXTAUTH_URL:https:=http:%
)

echo %NEXT_PUBLIC_APP_URL% | findstr /R /C:"^https://" >nul
if not errorlevel 1 (
    set NEXT_PUBLIC_APP_URL=%NEXT_PUBLIC_APP_URL:https:=http:%
)

echo 📦 Running database migrations...
npx prisma migrate deploy

echo 🔨 Building application...
npm run build

echo 🌐 Starting server on HTTP port 3000...
npm run start