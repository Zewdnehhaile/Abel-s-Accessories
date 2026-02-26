@echo off
:: Set green text
color 0A

:: Go to project folder (optional if already in folder)
cd /d "%~dp0"

echo ==============================
echo Pulling latest changes from GitHub...
echo ==============================
git pull origin main

echo.
echo Adding all changes...
git add .

echo.
set /p commitmsg=Enter commit message (leave blank to reuse last): 

:: Use last commit message if empty
if "%commitmsg%"=="" (
    for /f "delims=" %%i in ('git log -1 --pretty=format:"%%s"') do set commitmsg=%%i
    echo Using last commit message: "%commitmsg%"
)

echo.
echo Committing changes...
git commit -m "%commitmsg%"

echo.
echo Pushing to GitHub...
git push origin main

echo.
echo ==============================
echo ✅ Done! Latest changes pulled and pushed.
echo ==============================
pause