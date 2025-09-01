@echo off
echo ========================================
echo     SISTEMA MOVIL - INICIO RAPIDO
echo ========================================
echo.
echo Iniciando Backend y Frontend...
echo.

REM Cambiar al directorio del backend
cd /d "%~dp0Backend"
echo [1/3] Iniciando Backend en puerto 5000...
start "Backend API" cmd /k "node app.js"

REM Esperar un momento
timeout /t 3 /nobreak >nul

REM Cambiar al directorio del frontend  
cd /d "%~dp0frontend"
echo [2/3] Iniciando Frontend en puerto 8082...
start "Frontend Expo" cmd /k "npx expo start --port 8082"

REM Esperar un momento
timeout /t 5 /nobreak >nul

REM Ejecutar pruebas
cd /d "%~dp0Backend"
echo [3/3] Ejecutando pruebas de evaluacion...
echo.
node test-evaluation.js

echo.
echo ========================================
echo           SISTEMA INICIADO
echo ========================================
echo.
echo Backend API: http://localhost:5000
echo Frontend Web: http://localhost:8082
echo.
echo Credenciales de prueba:
echo - Admin: admin / admin123
echo - Coordinador: coordinador / coord123  
echo - Usuario: usuario1 / user123
echo.
echo Presiona cualquier tecla para abrir el navegador...
pause >nul

start http://localhost:8082
