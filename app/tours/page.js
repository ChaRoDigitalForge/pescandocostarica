'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getTours } from '@/lib/api';
import { useGsapAnimations, fadeInUp, scaleIn } from '@/hooks/useGsapAnimations';

export default function ToursPage() {
  const toursGridRef = useRef(null);
  const headerRef = useRef(null);

  useGsapAnimations();

  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTours = async () => {
      try {
        const response = await getTours();
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

    fetchTours();
  }, []);

  // Animaciones GSAP
  useEffect(() => {
    // Animar header
    if (headerRef.current) {
      fadeInUp(headerRef.current.children, {
        stagger: 0.2,
        duration: 0.8
      });
    }

    // Animar tour cards cuando se cargan
    if (!loading && toursGridRef.current) {
      const tourCards = toursGridRef.current.querySelectorAll('.tour-card');
      scaleIn(tourCards, {
        stagger: 0.1,
        duration: 0.6,
        delay: 0.3
      });
    }
  }, [tours, loading]);

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
        <div ref={headerRef} className="mb-8">
          <Link href="/" className="text-green-600 hover:text-green-700 flex items-center gap-2 mb-4">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver al inicio
          </Link>
          <h1 className="text-4xl font-bold text-gray-900">Todos los <span className="gradient-text">Tours</span></h1>
          <p className="text-gray-600 mt-2">{tours.length} tours disponibles</p>
        </div>

        <div ref={toursGridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tours.map((tour) => (
            <Link
              key={tour.id}
              href={`/tours/${tour.slug}`}
              className="tour-card glass-card rounded-xl hover:shadow-lg transition-all duration-300 overflow-hidden group"
            >
              <div className="relative h-64">
                <Image
                  src={tour.main_image_url}
                  alt={tour.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {tour.is_featured && (
                  <div className="absolute top-4 left-4 glass-badge px-3 py-1 rounded-lg font-bold text-sm text-white">
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
                  <span className="text-sm">{tour.provincia_name}</span>
                </div>
                <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                  {tour.short_description || tour.description}
                </p>

                {/* Boat and Species Info */}
                {(tour.boats?.length > 0 || tour.target_species?.length > 0) && (
                  <div className="mb-4 space-y-2">
                    {tour.boats && tour.boats.length > 0 && tour.boats[0].name && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                        </svg>
                        <span className="font-medium">{tour.boats[0].name}</span>
                        {tour.boats[0].boat_type && (
                          <span className="text-gray-500">• {tour.boats[0].boat_type}</span>
                        )}
                      </div>
                    )}
                    {tour.target_species && tour.target_species.length > 0 && (
                      <div className="flex items-center gap-2 text-sm">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        <div className="flex flex-wrap gap-1">
                          {tour.target_species.slice(0, 3).map((species, idx) => (
                            <span key={idx} className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs font-medium">
                              {species.name_es}
                            </span>
                          ))}
                          {tour.target_species.length > 3 && (
                            <span className="text-gray-500 text-xs">+{tour.target_species.length - 3} más</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <span className="gradient-text text-2xl font-bold">${tour.price}</span>
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
            <p className="text-gray-500 text-lg">No hay tours disponibles en este momento</p>
          </div>
        )}
      </div>
    </div>
  );
}
