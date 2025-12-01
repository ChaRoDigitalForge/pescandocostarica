# 🎣 Reportes de Pesca - BETA

Esta carpeta contiene la página de reportes de pesca que está en desarrollo y no es visible públicamente.

## 📍 Acceso

La página solo es accesible mediante URL directa:

```
http://localhost:3000/reportes-beta
```

O en producción:
```
https://tudominio.com/reportes-beta
```

## 🔒 Privacidad

- **No aparece en la navegación principal**
- **No está indexada** (no hay enlaces desde otras páginas)
- **Solo accesible por URL directa**
- Ideal para pruebas internas y desarrollo

## 📊 Características

La página muestra:

1. **Reporte Diario**
   - Total de reservas del día
   - Marinas activas

2. **Especies Más Activas del Mes**
   - Top 3 tipos de pesca
   - Contador de capturas

3. **Probabilidad de Éxito**
   - Cálculo basado en datos históricos
   - Factores: temporada, clima, actividad reciente

## 🛠️ Desarrollo

### Archivos relacionados:
- **Frontend**: `app/reportes-beta/page.js`
- **API Backend**: `backendpescandocostarica/src/services/reports/`
- **Funciones API**: `lib/api.js` (getReportsSummary, etc.)

### Endpoints API disponibles:
- `GET /api/reports/summary` - Resumen para página principal
- `GET /api/reports/daily-catches` - Capturas por ubicación
- `GET /api/reports/active-species` - Especies del mes
- `GET /api/reports/seasons` - Temporadas por provincia
- `GET /api/reports/success-probability` - Probabilidad de éxito

### Datos de prueba:
Ejecuta el seed para generar datos:
```bash
cd backendpescandocostarica
npm run seed:reports
```

## 🚀 Pasar a producción

Cuando esté listo para hacerlo público:

1. Mover el contenido a la ubicación deseada (ej: `app/reportes/page.js`)
2. Agregar link en la navegación principal
3. Actualizar SEO y metadata
4. Eliminar el badge "BETA" si lo deseas

## 📝 Notas

- Los datos son reales desde la base de datos
- Se actualiza en cada carga de página
- Los cálculos de probabilidad usan datos de los últimos 12 meses
