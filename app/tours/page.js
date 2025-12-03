'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getTours, getFishingStyles } from '@/lib/api';

export default function ToursPage() {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fishingStyles, setFishingStyles] = useState([]);

  // Filters state
  const [filters, setFilters] = useState({
    fishing_style_id: '',
    fishing_type: '',
    min_price: '',
    max_price: '',
    min_rating: '',
    sort: 'created_at',
    order: 'DESC'
  });

  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchFishingStyles();
  }, []);

  useEffect(() => {
    fetchTours();
  }, [filters]);

  const fetchFishingStyles = async () => {
    try {
      const response = await getFishingStyles(true);
      if (response.success) {
        setFishingStyles(response.data);
      }
    } catch (err) {
      console.error('Error fetching fishing styles:', err);
    }
  };

  const fetchTours = async () => {
    setLoading(true);
    try {
      const response = await getTours(filters);
      if (response.success) {
        setTours(response.data);
      } else {
        setError(response.message || 'Error al cargar los tours');
      }
    } catch (err) {
      console.error('Error fetching tours:', err);
      setError('Error al cargar los tours');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      fishing_style_id: '',
      fishing_type: '',
      min_price: '',
      max_price: '',
      min_rating: '',
      sort: 'created_at',
      order: 'DESC'
    });
  };

  const hasActiveFilters = () => {
    return filters.fishing_style_id || filters.fishing_type || filters.min_price ||
           filters.max_price || filters.min_rating;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link href="/" className="text-green-600 hover:text-green-700">
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <Link href="/" className="text-green-600 hover:text-green-700 flex items-center gap-2 mb-4">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver al inicio
          </Link>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Todos los Tours</h1>
              <p className="text-gray-600 mt-2">{tours.length} tours disponibles</p>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              Filtros
              {hasActiveFilters() && (
                <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded-full">●</span>
              )}
            </button>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <aside className={`w-full lg:w-64 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Filtros</h3>
                {hasActiveFilters() && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-green-600 hover:text-green-700 font-medium"
                  >
                    Limpiar
                  </button>
                )}
              </div>

              <div className="space-y-6">
                {/* Estilo de Pesca Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estilo de Pesca
                  </label>
                  <select
                    value={filters.fishing_style_id}
                    onChange={(e) => handleFilterChange('fishing_style_id', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Todos los estilos</option>
                    {fishingStyles.map((style) => (
                      <option key={style.id} value={style.id}>
                        {style.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tipo de Pesca Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Pesca
                  </label>
                  <select
                    value={filters.fishing_type}
                    onChange={(e) => handleFilterChange('fishing_type', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Todos los tipos</option>
                    <option value="altaMar">Alta Mar</option>
                    <option value="costera">Costera</option>
                    <option value="rio">Río</option>
                    <option value="lago">Lago</option>
                    <option value="manglar">Manglar</option>
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rango de Precio
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="Mín"
                      value={filters.min_price}
                      onChange={(e) => handleFilterChange('min_price', e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <input
                      type="number"
                      placeholder="Máx"
                      value={filters.max_price}
                      onChange={(e) => handleFilterChange('max_price', e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>

                {/* Rating Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Calificación Mínima
                  </label>
                  <select
                    value={filters.min_rating}
                    onChange={(e) => handleFilterChange('min_rating', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Todas</option>
                    <option value="4">4+ estrellas</option>
                    <option value="4.5">4.5+ estrellas</option>
                    <option value="5">5 estrellas</option>
                  </select>
                </div>

                {/* Sort Order */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ordenar por
                  </label>
                  <select
                    value={filters.sort}
                    onChange={(e) => handleFilterChange('sort', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="created_at">Más recientes</option>
                    <option value="price">Precio</option>
                    <option value="average_rating">Calificación</option>
                    <option value="total_bookings">Popularidad</option>
                  </select>
                </div>
              </div>
            </div>
          </aside>

          {/* Tours Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600"></div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tours.map((tour) => (
                    <Link
                      key={tour.id}
                      href={`/tours/${tour.slug}`}
                      className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group"
                    >
                      <div className="relative h-64">
                        <Image
                          src={tour.main_image_url}
                          alt={tour.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {tour.is_featured && (
                          <div className="absolute top-4 left-4 bg-green-600 text-white px-3 py-1 rounded-lg font-bold text-sm">
                            Destacado
                          </div>
                        )}
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                          {tour.title}
                        </h3>
                        <div className="flex items-center gap-2 text-gray-600 mb-3">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="text-sm">{tour.fishing_zone_name}</span>
                        </div>
                        <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                          {tour.short_description || tour.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-2xl font-bold text-green-600">${tour.price}</span>
                            <span className="text-gray-500 text-sm"> / persona</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <svg className="w-5 h-5 fill-orange-400" viewBox="0 0 20 20">
                              <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                            </svg>
                            <span className="text-gray-700 font-medium">{tour.average_rating}</span>
                            <span className="text-gray-500 text-sm">({tour.total_reviews})</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {tours.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No hay tours disponibles con estos filtros</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
