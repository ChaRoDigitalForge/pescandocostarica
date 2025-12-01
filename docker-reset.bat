@echo off
REM Script para resetear completamente Docker (eliminar volúmenes)

echo ╔══════════════════════════════════════════════════════╗
echo ║   ADVERTENCIA: Reseteo Completo de Docker           ║
echo ╚══════════════════════════════════════════════════════╝
echo.
echo Este script eliminará:
echo   - Todos los contenedores
echo   - Todos los volúmenes (incluida la base de datos)
echo   - Todas las redes
echo.

set /p confirm="¿Estás seguro? (S/N): "

if /i "%confirm%"=="S" (
    echo.
    echo [1/3] Deteniendo servicios...
    docker-compose down

    echo [2/3] Eliminando volúmenes...
    docker-compose down -v

    echo [3/3] Eliminando redes...
    docker network prune -f

    echo.
    echo ✅ Reseteo completo!
    echo Ejecuta docker-start.bat para iniciar desde cero
) else (
    echo.
    echo Operación cancelada
)

echo.
pause
