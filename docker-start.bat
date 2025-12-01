@echo off
REM Script para iniciar los servicios Docker en Windows

echo ╔══════════════════════════════════════════════════════╗
echo ║   Pescando Costa Rica - Docker Setup                ║
echo ╚══════════════════════════════════════════════════════╝
echo.

REM Verificar si Docker está corriendo
docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker no está corriendo. Por favor inicia Docker Desktop.
    pause
    exit /b 1
)

echo [1/4] Verificando archivos de configuración...

REM Crear archivo .env.local si no existe
if not exist .env.local (
    echo [INFO] Creando archivo .env.local desde .env.docker...
    copy .env.docker .env.local
)

echo [2/4] Deteniendo contenedores existentes...
docker-compose down

echo [3/4] Construyendo imágenes...
docker-compose build

echo [4/4] Iniciando servicios...
docker-compose --env-file .env.local up -d

echo.
echo ✅ Servicios iniciados correctamente!
echo.
echo Servicios disponibles:
echo   - API Gateway:     http://localhost:8080
echo   - Backend Main:    http://localhost:5000
echo   - Auth Service:    http://localhost:5001
echo   - PostgreSQL:      localhost:5432
echo   - Redis:           localhost:6379
echo.
echo Para ver los logs: docker-compose logs -f
echo Para detener:      docker-compose down
echo.

pause
