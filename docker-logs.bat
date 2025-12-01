@echo off
REM Script para ver logs de los servicios Docker

echo ╔══════════════════════════════════════════════════════╗
echo ║   Logs de Servicios Docker                           ║
echo ╚══════════════════════════════════════════════════════╝
echo.

if "%1"=="" (
    echo Ver logs de todos los servicios...
    echo Presiona Ctrl+C para salir
    echo.
    docker-compose logs -f
) else (
    echo Ver logs de %1...
    echo Presiona Ctrl+C para salir
    echo.
    docker-compose logs -f %1
)
