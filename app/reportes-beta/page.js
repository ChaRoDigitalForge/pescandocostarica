'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getReportsSummary } from '@/lib/api';

export default function ReportesBetaPage() {
  const [reportsData, setReportsData] = useState(null);
  const [reportsLoading, setReportsLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      setReportsLoading(true);
      try {
        const response = await getReportsSummary();
        if (response.success && response.data) {
          setReportsData(response.data);
        }
      } catch (error) {
        console.error('Error loading reports:', error);
      } finally {
        setReportsLoading(false);
      }
    };

    fetchReports();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="bg-yellow-500/20 text-yellow-400 text-xs font-bold px-3 py-1.5 rounded-full border border-yellow-500/30">
                  BETA
                </span>
                <h1 className="text-2xl font-bold text-white">Reportes de Pesca</h1>
              </div>
              <p className="text-gray-400 mt-1 text-sm">
                Esta sección está en construcción y solo es visible internamente
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>

      {/* Fishing Reports Section */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-green-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-12">
            <p className="text-green-400 font-semibold mb-3 uppercase tracking-wide">Información en Tiempo Real</p>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Reportes de Pesca
            </h2>
            <p className="text-blue-200 text-lg max-w-2xl mx-auto">
              Datos actualizados para planificar tu próxima aventura de pesca
            </p>
          </div>

          {reportsLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
          ) : reportsData ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Reporte Diario */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-blue-500/30 p-3 rounded-xl">
                    <svg className="w-8 h-8 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <span className="bg-green-500/20 text-green-300 text-xs font-semibold px-3 py-1 rounded-full">HOY</span>
                </div>
                <h3 className="text-2xl font-bold mb-2">Reporte Diario</h3>
                <p className="text-blue-200 text-sm mb-4">Capturas confirmadas hoy</p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-blue-200">Total Reservas</span>
                    <span className="text-2xl font-bold">{reportsData.daily_summary?.total_bookings || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-blue-200">Marinas Activas</span>
                    <span className="text-2xl font-bold">{reportsData.daily_summary?.active_locations || 0}</span>
                  </div>
                </div>
              </div>

              {/* Especies Más Activas */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-green-500/30 p-3 rounded-xl">
                    <svg className="w-8 h-8 text-green-200" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                    </svg>
                  </div>
                  <span className="bg-orange-500/20 text-orange-300 text-xs font-semibold px-3 py-1 rounded-full">MES</span>
                </div>
                <h3 className="text-2xl font-bold mb-2">Especies Activas</h3>
                <p className="text-blue-200 text-sm mb-4">Top capturas del mes</p>
                <div className="space-y-2">
                  {reportsData.top_species && reportsData.top_species.length > 0 ? (
                    reportsData.top_species.map((species, index) => (
                      <div key={index} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2">
                        <div className="flex items-center gap-2">
                          <span className="text-green-400 font-bold text-lg">{index + 1}.</span>
                          <span className="font-medium">{species.type}</span>
                        </div>
                        <span className="text-sm bg-green-500/20 text-green-300 px-2 py-1 rounded">
                          {species.catches} capturas
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-blue-300 text-sm italic">No hay datos disponibles</p>
                  )}
                </div>
              </div>

              {/* Probabilidad de Éxito */}
              <div className="bg-gradient-to-br from-green-500/20 to-blue-500/20 backdrop-blur-md rounded-2xl p-6 border border-green-400/30 hover:border-green-400/50 transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-400/10 rounded-full -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-400/10 rounded-full -ml-12 -mb-12"></div>

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="bg-green-500/30 p-3 rounded-xl">
                      <svg className="w-8 h-8 text-green-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="bg-green-400/30 text-green-200 text-xs font-semibold px-3 py-1 rounded-full animate-pulse">LIVE</span>
                  </div>

                  <h3 className="text-2xl font-bold mb-2">Probabilidad de Éxito</h3>
                  <p className="text-blue-200 text-sm mb-6">Basado en datos históricos</p>

                  <div className="text-center mb-4">
                    <div className="inline-flex items-baseline gap-2">
                      <span className="text-6xl font-bold text-green-400">
                        {reportsData.today_probability?.value || 0}
                      </span>
                      <span className="text-3xl font-bold text-green-300">%</span>
                    </div>
                    <p className="text-lg mt-3 text-white font-medium">
                      {reportsData.today_probability?.message || 'Cargando...'}
                    </p>
                  </div>

                  <div className="bg-white/10 rounded-lg p-3 mt-4">
                    <div className="flex items-center gap-2 text-sm text-blue-200">
                      <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <span>Factores: temporada, clima y actividad reciente</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-blue-200">No hay reportes disponibles en este momento</p>
            </div>
          )}

          {/* Development Notes */}
          <div className="mt-12 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="text-yellow-400 font-bold mb-2">Nota de Desarrollo</h3>
                <p className="text-yellow-200 text-sm mb-3">
                  Esta sección está en fase beta y solo es accesible mediante URL directa. No aparecerá en la navegación principal hasta que esté completamente lista.
                </p>
                <div className="text-yellow-300 text-xs space-y-1">
                  <p>• URL de acceso: <code className="bg-yellow-500/20 px-2 py-0.5 rounded">/reportes-beta</code></p>
                  <p>• Los datos son generados desde la base de datos real</p>
                  <p>• Puedes agregar más datos de prueba con: <code className="bg-yellow-500/20 px-2 py-0.5 rounded">npm run seed:reports</code></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Simple */}
      <footer className="bg-gray-800 border-t border-gray-700 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-400 text-sm">
            Pescando Costa Rica - Reportes Beta v1.0
          </p>
        </div>
      </footer>
    </div>
  );
}
