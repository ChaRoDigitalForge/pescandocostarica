import express from 'express';
import {
  getDailyCatchesByLocation,
  getActiveSpeciesByMonth,
  getSeasonsByProvince,
  getSuccessProbability,
  getReportsSummary
} from './controller.js';

const router = express.Router();

// Resumen general de reportes (para la página principal)
router.get('/summary', getReportsSummary);

// Reporte diario de capturas por marina/ubicación
router.get('/daily-catches', getDailyCatchesByLocation);

// Especies más activas del mes
router.get('/active-species', getActiveSpeciesByMonth);

// Temporadas por provincia
router.get('/seasons', getSeasonsByProvince);

// Calcular probabilidad de éxito
router.get('/success-probability', getSuccessProbability);

export default router;
