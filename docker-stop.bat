@echo off
REM Script para detener los servicios Docker en Windows

echo ╔══════════════════════════════════════════════════════╗
echo ║   Deteniendo Servicios Docker                        ║
echo ╚══════════════════════════════════════════════════════╝
echo.

docker-compose down

echo.
echo ✅ Todos los servicios han sido detenidos
echo.

pause
