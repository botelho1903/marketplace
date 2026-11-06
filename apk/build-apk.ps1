# Marketplace APK Build Script (PowerShell)
# Run this on a machine with Android Studio installed

Write-Host "📱 Marketplace APK Build Script" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

# Check prerequisites
function Check-Command {
    param($name)
    if (Get-Command $name -ErrorAction SilentlyContinue) {
        Write-Host "✅ $name found" -ForegroundColor Green
        return $true
    } else {
        Write-Host "❌ $name is not installed" -ForegroundColor Red
        return $false
    }
}

Write-Host ""
Write-Host "🔍 Checking prerequisites..." -ForegroundColor Yellow

$allGood = $true
$allGood = (Check-Command node) -and $allGood
$allGood = (Check-Command npm) -and $allGood
$allGood = (Check-Command npx) -and $allGood

# Check Android SDK
$androidHome = $env:ANDROID_HOME ?? "$env:USERPROFILE\AppData\Local\Android\Sdk"
if (Test-Path $androidHome) {
    Write-Host "✅ Android SDK found at $androidHome" -ForegroundColor Green
} else {
    Write-Host "⚠️  Android SDK not found at $androidHome" -ForegroundColor Yellow
    Write-Host "   Make sure ANDROID_HOME is set or Android Studio is installed" -ForegroundColor Yellow
}

if (-not $allGood) {
    Write-Host "❌ Missing prerequisites. Please install them first." -ForegroundColor Red
    exit 1
}

# Get deployment URL
if (-not $env:CAPACITOR_SERVER_URL) {
    Write-Host ""
    $deployUrl = Read-Host "Enter your deployed Vercel URL (e.g., https://myapp.vercel.app)"
    $env:CAPACITOR_SERVER_URL = $deployUrl
}

Write-Host ""
Write-Host "📦 Using deployment URL: $env:CAPACITOR_SERVER_URL" -ForegroundColor Cyan

# Update capacitor.config.ts with the URL
Write-Host "🔧 Updating capacitor.config.ts..." -ForegroundColor Yellow
$configPath = "capacitor.config.ts"
$configContent = Get-Content $configPath -Raw
$configContent = $configContent -replace "url: process.env.CAPACITOR_SERVER_URL \|\| 'https://yourdomain.vercel.app'", "url: '$env:CAPACITOR_SERVER_URL'"
Set-Content $configPath $configContent

# Install dependencies
Write-Host ""
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

# Sync Capacitor
Write-Host ""
Write-Host "🔄 Syncing Capacitor..." -ForegroundColor Yellow
npx cap sync android

# Open Android Studio
Write-Host ""
Write-Host "🎯 Opening Android Studio..." -ForegroundColor Cyan
Write-Host "   In Android Studio: Build → Build Bundle(s) / APK(s) → Build APK(s)" -ForegroundColor Gray
npx cap open android

Write-Host ""
Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps in Android Studio:" -ForegroundColor Yellow
Write-Host "  1. Wait for Gradle sync to complete"
Write-Host "  2. Build → Build Bundle(s) / APK(s) → Build APK(s)"
Write-Host "  3. Find APK at: android/app/build/outputs/apk/debug/app-debug.apk"
Write-Host ""
Write-Host "For release build:" -ForegroundColor Yellow
Write-Host "  Build → Generate Signed Bundle/APK → APK"
Write-Host "  (Requires keystore for Play Store)"