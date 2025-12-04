'use client';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getTours, getSiteSettings } from '@/lib/api';
import { useGsapAnimations, fadeInUp, fadeInLeft, fadeInRight, scaleIn } from '@/hooks/useGsapAnimations';

export default function Home() {
  // Referencias para animaciones GSAP
  const heroContentRef = useRef(null);
  const featuresRef = useRef(null);
  const promoRef = useRef(null);
  const toursGridRef = useRef(null);
  const ctaRef = useRef(null);

  // Inicializar GSAP
  useGsapAnimations();

  const [activeFilter, setActiveFilter] = useState('all');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    hasMore: false
  });

  // Estados para configuración del sitio con valores por defecto
  const [slides, setSlides] = useState([
    {
      id: 1,
      image: '/tour-detail-02.webp',
      title: 'PESCA DEPORTIVA &',
      subtitle: 'AVENTURA EN COSTA RICA',
      description: 'Descubre las mejores experiencias de pesca deportiva en las aguas cristalinas de Costa Rica'
    },
    {
      id: 2,
      image: '/tour-detail-03.webp',
      title: 'PESCA EN RÍO Y',
      subtitle: 'MANGLAR',
      description: 'Explora los ríos y manglares de Costa Rica en una aventura única de pesca deportiva'
    },
    {
      id: 3,
      image: '/tour-detail-05.webp',
      title: 'ALTA MAR Y',
      subtitle: 'PESCA COSTERA',
      description: 'Vive la emoción de la pesca en alta mar o disfruta de la tranquilidad de la pesca costera'
    },
    {
      id: 4,
      image: '/dos-hombres-en-el-bote.jpg',
      title: 'Los mejores',
      subtitle: 'asda',
      description: 'asdas'
    }
  ]);
  const [features, setFeatures] = useState([
    { id: 1, icon: '🎣', title: 'Equipos de Primera', description: 'Todo el equipo profesional incluido en tu tour' },
    { id: 2, icon: '⚓', title: 'Capitanes Expertos', description: 'Guías locales con más de 20 años de experiencia' },
    { id: 3, icon: '🌊', title: 'Mejores Ubicaciones', description: 'Acceso a los puntos de pesca más productivos' }
  ]);
  const [filters, setFilters] = useState([
    { id: 'all', label: 'Todas' },
    { id: 'guanacaste', label: 'Guanacaste' },
    { id: 'puntarenas', label: 'Puntarenas' },
    { id: 'limon', label: 'Limón' },
    { id: 'sanJose', label: 'San José' },
    { id: 'alajuela', label: 'Alajuela' },
    { id: 'cartago', label: 'Cartago' },
    { id: 'heredia', label: 'Heredia' }
  ]);
  const [siteConfig, setSiteConfig] = useState({
    site_name: 'Pescando Costa Rica',
    site_tagline: 'Tu mejor experiencia de pesca deportiva en Costa Rica',
    contact_email: 'tours@pescandocostarica.com',
    contact_phone: '+50612345678',
    whatsapp_number: '50612345678',
    whatsapp_message: 'Hola! Estoy interesado en los tours de pesca',
    footer_text: '© 2025 Pescando Costa Rica. Todos los derechos reservados.'
  });

  // Estados para el filtro de búsqueda
  const [searchDestino, setSearchDestino] = useState('');
  const [searchTipo, setSearchTipo] = useState('');
  const [searchFecha, setSearchFecha] = useState('');
  const [searchPersonas, setSearchPersonas] = useState(1);

  // Cargar configuración del sitio
  useEffect(() => {
    const fetchSiteSettings = async () => {
      try {
        const response = await getSiteSettings();
        if (response.success && response.data) {
          const { heroSlides, features, config, provincias } = response.data;

          // Solo actualizar si tenemos datos desde la API
          if (heroSlides && heroSlides.length > 0) {
            setSlides(heroSlides.map((slide, index) => ({
              id: slide.id || index + 1,
              image: slide.image_url,
              title: slide.title,
              subtitle: slide.subtitle,
              description: slide.description
            })));
          }

          if (features && features.length > 0) {
            setFeatures(features);
          }

          if (config && Object.keys(config).length > 0) {
            setSiteConfig(config);
          }

          // Crear filtros de provincias dinámicamente
          if (provincias && provincias.length > 0) {
            const provinciaFilters = provincias.map(p => ({
              id: p.code,
              label: p.name
            }));
            setFilters([{ id: 'all', label: 'Todas' }, ...provinciaFilters]);
          }
        }
      } catch (error) {
        console.warn('Using default site settings');
      }
    };

    fetchSiteSettings();
  }, []);

  // Cargar tours desde la API
  useEffect(() => {
    const fetchTours = async () => {
      setLoading(true);
      try {
        const filters = {
          page: currentPage,
          limit: 10
        };

        if (activeFilter !== 'all') {
          filters.provincia = activeFilter;
        }

        const response = await getTours(filters);

        if (response.success) {
          setTours(response.data);
          setPagination(response.pagination);
        } else {
          setTours([]);
          setPagination({ total: 0, totalPages: 0, hasMore: false });
        }
      } catch (error) {
        console.error('Error loading tours:', error);
        setTours([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTours();
  }, [activeFilter, currentPage]);

  // Animaciones GSAP
  useEffect(() => {
    // Animación del hero cuando cambia el slide
    if (heroContentRef.current) {
      const heroElements = heroContentRef.current.querySelectorAll('.hero-animate');
      fadeInUp(heroElements, {
        duration: 0.8,
        stagger: 0.15,
        delay: 0.3
      });
    }
  }, [currentSlide]);

  useEffect(() => {
    // Animaciones con scroll trigger

    // Features section
    if (featuresRef.current) {
      const featureCards = featuresRef.current.querySelectorAll('.feature-card');
      scaleIn(featureCards, {
        stagger: 0.2,
        scrollTrigger: {
          trigger: featuresRef.current,
          start: 'top 80%'
        }
      });
    }

    // Promotional section
    if (promoRef.current) {
      const promoLeft = promoRef.current.querySelector('.promo-left');
      const promoRight = promoRef.current.querySelector('.promo-right');

      if (promoLeft) {
        fadeInLeft(promoLeft, {
          duration: 1,
          scrollTrigger: {
            trigger: promoRef.current,
            start: 'top 70%'
          }
        });
      }

      if (promoRight) {
        fadeInRight(promoRight, {
          duration: 1,
          scrollTrigger: {
            trigger: promoRef.current,
            start: 'top 70%'
          }
        });
      }
    }

    // CTA section
    if (ctaRef.current) {
      fadeInUp(ctaRef.current.children, {
        stagger: 0.2,
        scrollTrigger: {
          trigger: ctaRef.current,
          start: 'top 80%'
        }
      });
    }
  }, []);

  useEffect(() => {
    // Animar tour cards cuando se cargan
    if (!loading && toursGridRef.current) {
      const tourCards = toursGridRef.current.querySelectorAll('.tour-card');
      fadeInUp(tourCards, {
        stagger: 0.1,
        duration: 0.6,
        scrollTrigger: {
          trigger: toursGridRef.current,
          start: 'top 80%'
        }
      });
    }
  }, [tours, loading]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleFilterChange = (filterId) => {
    setActiveFilter(filterId);
    setCurrentPage(1);
  };

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    document.getElementById('tours')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Slider Section */}
      <section className="relative min-h-[700px] md:min-h-[800px] overflow-hidden">
        {/* Slides */}
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-700 ${
              index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            {/* Background Image */}
            <div className="absolute inset-0">
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                className="object-cover"
                priority={index === 0}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40"></div>
            </div>

            {/* Content - Grid Layout */}
            <div ref={heroContentRef} className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full py-8 lg:py-16">
                {/* Left Side - Hero Text */}
                <div className="flex flex-col justify-center text-white">
                  <div className="hero-animate text-green-400 italic text-lg md:text-xl mb-4 font-light">
                    Explora Costa Rica
                  </div>
                  <h1 className="hero-animate text-3xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
                    {slide.title}
                  </h1>
                  <h2 className="hero-animate text-3xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                    {slide.subtitle}
                  </h2>
                  <p className="hero-animate text-base md:text-lg mb-8 text-gray-200 max-w-xl">
                    {slide.description}
                  </p>
                  <div className="hero-animate flex flex-col sm:flex-row gap-4">
                    <a
                      href="#tours"
                      className="glass-btn-primary inline-block px-8 py-4 rounded-lg text-lg text-white font-bold text-center"
                    >
                      EMPECEMOS
                    </a>
                    <button className="glass-btn-secondary inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg text-lg text-white font-bold">
                      Quiénes Somos
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Right Side - Search Filter (Vertical) */}
                <div className="flex items-center justify-center lg:justify-end">
                  <div className="w-full max-w-md">
                    <div className="glass-card-dark rounded-2xl p-6 space-y-5">
                      <h3 className="text-white text-2xl font-bold mb-4">Buscar Tours</h3>

                      {/* Destino */}
                      <div className="relative">
                        <label className="flex items-center gap-2 text-white text-sm font-medium mb-2">
                          <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                          Destino
                        </label>
                        <select
                          value={searchDestino}
                          onChange={(e) => setSearchDestino(e.target.value)}
                          className="w-full bg-gray-700/50 text-white border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500 cursor-pointer"
                        >
                          <option value="">Todas las provincias</option>
                          <option value="guanacaste">Guanacaste</option>
                          <option value="puntarenas">Puntarenas</option>
                          <option value="limon">Limón</option>
                          <option value="sanJose">San José</option>
                          <option value="alajuela">Alajuela</option>
                          <option value="cartago">Cartago</option>
                          <option value="heredia">Heredia</option>
                        </select>
                      </div>

                      {/* Tipo de Pesca */}
                      <div className="relative">
                        <label className="flex items-center gap-2 text-white text-sm font-medium mb-2">
                          <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                          </svg>
                          Tipo
                        </label>
                        <select
                          value={searchTipo}
                          onChange={(e) => setSearchTipo(e.target.value)}
                          className="w-full bg-gray-700/50 text-white border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500 cursor-pointer"
                        >
                          <option value="">Todos los tipos</option>
                          <option value="altaMar">Alta Mar</option>
                          <option value="costera">Costera</option>
                          <option value="rio">Río y Manglar</option>
                          <option value="lago">Lago</option>
                        </select>
                      </div>

                      {/* Fecha */}
                      <div className="relative">
                        <label className="flex items-center gap-2 text-white text-sm font-medium mb-2">
                          <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                          </svg>
                          Fecha
                        </label>
                        <input
                          type="date"
                          value={searchFecha}
                          onChange={(e) => setSearchFecha(e.target.value)}
                          className="w-full bg-gray-700/50 text-white border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500"
                        />
                      </div>

                      {/* Personas */}
                      <div className="relative">
                        <label className="flex items-center gap-2 text-white text-sm font-medium mb-2">
                          <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                          </svg>
                          Personas
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="20"
                          value={searchPersonas}
                          onChange={(e) => setSearchPersonas(parseInt(e.target.value))}
                          className="w-full bg-gray-700/50 text-white border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500"
                          placeholder="Número de personas"
                        />
                      </div>

                      {/* Search Button */}
                      <button className="glass-btn-primary w-full py-4 px-6 rounded-lg text-white font-bold flex items-center justify-center gap-2 hover:scale-105 transition-transform">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        Buscar Tours
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-300 group"
          aria-label="Previous slide"
        >
          <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-300 group"
          aria-label="Next slide"
        >
          <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`transition-all duration-300 ${
                index === currentSlide
                  ? 'w-12 h-3 bg-white rounded-full'
                  : 'w-3 h-3 bg-white/50 hover:bg-white/75 rounded-full'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {features.map((feature) => (
            <div key={feature.id} className="feature-card glass-card rounded-xl p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">{feature.icon}</span>
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-800">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Promotional Announcements Section */}
      <section ref={promoRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-br from-blue-50 via-green-50 to-blue-50 rounded-3xl overflow-hidden shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Left Side - Illustration/Image */}
            <div className="promo-left relative p-8 lg:p-12">
              <div className="relative">
                {/* Decorative Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-200/30 to-green-200/30 rounded-3xl transform rotate-6"></div>

                {/* Main Visual Content */}
                <div className="relative bg-white rounded-2xl p-8 shadow-lg">
                  <div className="flex items-center justify-center mb-6">
                    <div className="relative">
                      <div className="absolute inset-0 bg-green-600/20 blur-2xl rounded-full"></div>
                      <div className="relative text-8xl">🎣</div>
                    </div>
                  </div>

                  {/* Decorative Elements */}
                  <div className="absolute top-4 right-4 bg-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-full animate-pulse">
                    ¡TEMPORADA ALTA!
                  </div>

                  <div className="absolute bottom-8 left-8 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg transform -rotate-3">
                    <div className="text-xs font-semibold">Desde</div>
                    <div className="text-2xl font-bold">$299</div>
                  </div>

                  {/* Fishing Icons */}
                  <div className="flex justify-center gap-4 mt-4">
                    <div className="bg-green-100 p-3 rounded-full">
                      <span className="text-3xl">🐟</span>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-full">
                      <span className="text-3xl">🌊</span>
                    </div>
                    <div className="bg-green-100 p-3 rounded-full">
                      <span className="text-3xl">⚓</span>
                    </div>
                  </div>

                  <div className="text-center mt-6">
                    <p className="text-green-600 font-bold text-xl italic">¡Pura Vida Fishing!</p>
                  </div>
                </div>

                {/* Location Pin Icon */}
                <div className="absolute -top-4 -right-4 bg-red-500 text-white p-3 rounded-full shadow-lg animate-bounce">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Right Side - Content */}
            <div className="promo-right p-8 lg:p-12 lg:pr-16">
              <div className="space-y-6">
                {/* Header */}
                <div>
                  <p className="text-green-600 font-semibold text-sm mb-3 uppercase tracking-wide">
                    Temporada Especial
                  </p>
                  <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                    Gran Oportunidad Para
                    <span className="block text-green-600 italic mt-2">Aventura</span>
                    <span className="text-gray-900"> & Pesca Deportiva</span>
                  </h2>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    Disfruta de la mejor temporada de pesca en Costa Rica. Captura Dorado, Pez Vela, Marlín y más especies en las aguas cristalinas del Pacífico y Caribe.
                  </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Feature 1 */}
                  <div className="flex items-start gap-3">
                    <div className="bg-green-600 text-white p-2 rounded-lg flex-shrink-0">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">Temporada de Dorado</h4>
                      <p className="text-sm text-gray-600">Mayo - Septiembre, capturas garantizadas</p>
                    </div>
                  </div>

                  {/* Feature 2 */}
                  <div className="flex items-start gap-3">
                    <div className="bg-green-600 text-white p-2 rounded-lg flex-shrink-0">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">Mejor Época del Año</h4>
                      <p className="text-sm text-gray-600">Clima perfecto y mar tranquilo</p>
                    </div>
                  </div>

                  {/* Feature 3 */}
                  <div className="flex items-start gap-3">
                    <div className="bg-green-600 text-white p-2 rounded-lg flex-shrink-0">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">Precios Especiales</h4>
                      <p className="text-sm text-gray-600">Descuentos hasta 20% en grupos</p>
                    </div>
                  </div>

                  {/* Feature 4 */}
                  <div className="flex items-start gap-3">
                    <div className="bg-green-600 text-white p-2 rounded-lg flex-shrink-0">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">Experiencia Premium</h4>
                      <p className="text-sm text-gray-600">Equipo profesional incluido</p>
                    </div>
                  </div>
                </div>

                {/* CTA Button */}
                <div className="pt-4">
                  <a
                    href="#tours"
                    className="glass-btn-primary inline-flex items-center gap-3 px-8 py-4 rounded-xl text-white font-bold transform hover:-translate-y-1"
                  >
                    <span className="text-lg">VER OFERTAS ESPECIALES</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </a>
                </div>

                {/* Bottom Info */}
                <div className="flex items-center gap-2 text-green-600 pt-4 border-t border-green-200">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm font-semibold">
                    Descubre los mejores destinos de pesca en Costa Rica
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tours Section */}
      <section id="tours" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Section Title */}
        <div className="mb-12">
          <div className="text-sm text-green-600 font-semibold mb-3">Explora Costa Rica</div>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900">
            Tours de Pesca <span className="gradient-text">Destacados</span>
          </h2>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-3 mb-10 justify-center md:justify-start">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => handleFilterChange(filter.id)}
              className={`relative px-6 py-3 rounded-md font-medium transition-all duration-300 cursor-pointer ${
                activeFilter === filter.id
                  ? 'bg-green-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-green-600 hover:text-white shadow-sm'
              }`}
            >
              {filter.label}
              {activeFilter === filter.id && (
                <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-green-600"></div>
              )}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        )}

        {/* Tour Cards Grid */}
        {!loading && tours.length > 0 && (
          <div ref={toursGridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tours.map((tour) => (
              <Link
                key={tour.id}
                href={`/tours/${tour.slug}`}
                className="tour-card glass-card rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group block"
              >
                {/* Tour Image */}
                <div className="relative h-64 bg-gray-200 overflow-hidden">
                  <Image
                    src={tour.main_image_url}
                    alt={tour.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />

                  {/* Top Meta */}
                  <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
                    {tour.is_featured && (
                      <div className="glass-badge px-3 py-1.5 rounded text-xs font-bold text-white">
                        Destacado
                      </div>
                    )}
                    <div className="ml-auto flex gap-2">
                      <div className="bg-gray-800/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                        </svg>
                        <span>{tour.image_gallery?.length || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tour Content */}
                <div className="p-5">
                  {/* Location */}
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="truncate">{tour.location_name}, {tour.provincia_name}</span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 hover:text-green-600 transition-colors cursor-pointer">
                    {tour.title}
                  </h3>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex text-orange-400">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">({tour.total_reviews} Reviews)</span>
                  </div>

                  {/* Tour Info */}
                  <div className="flex items-center gap-4 mb-5 text-sm">
                    <div className="flex items-center gap-1 text-green-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-gray-700">{tour.duration_display}</span>
                    </div>
                    <div className="flex items-center gap-1 text-green-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span className="text-gray-700">{tour.capacity} Personas</span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div>
                      <span className="text-xs text-gray-500">From</span>
                      <div className="gradient-text text-xl font-bold">
                        ${tour.price}
                      </div>
                    </div>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <svg className="w-6 h-6 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* No Tours Found */}
        {!loading && tours.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🎣</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No se encontraron tours</h3>
            <p className="text-gray-600">Intenta con otro filtro o provincia</p>
          </div>
        )}

        {/* Pagination */}
        {!loading && pagination.totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-12">
            {/* Previous Button */}
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                currentPage === 1
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-green-600 hover:text-white shadow-sm'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Page Numbers */}
            {[...Array(pagination.totalPages)].map((_, index) => {
              const pageNumber = index + 1;
              if (
                pageNumber === 1 ||
                pageNumber === pagination.totalPages ||
                (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
              ) {
                return (
                  <button
                    key={pageNumber}
                    onClick={() => paginate(pageNumber)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                      currentPage === pageNumber
                        ? 'bg-green-600 text-white shadow-lg'
                        : 'bg-white text-gray-700 hover:bg-green-600 hover:text-white shadow-sm'
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              } else if (
                pageNumber === currentPage - 2 ||
                pageNumber === currentPage + 2
              ) {
                return <span key={pageNumber} className="px-2 text-gray-400">...</span>;
              }
              return null;
            })}

            {/* Next Button */}
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === pagination.totalPages}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                currentPage === pagination.totalPages
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-green-600 hover:text-white shadow-sm'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}

        {/* View All Tours Button */}
        <div className="flex justify-center mt-12">
          <a
            href="/tours"
            className="glass-btn-primary inline-flex items-center gap-2 px-8 py-4 rounded-lg text-lg text-white font-bold"
          >
            VER TODOS LOS TOURS
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-green-600 to-green-700 text-white py-16 mt-16">
        <div ref={ctaRef} className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            ¿Listo para tu Aventura?
          </h2>
          <p className="text-xl mb-8 text-green-50">
            Contáctanos hoy y reserva tu tour de pesca en Costa Rica
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={`tel:+${siteConfig.contact_phone || '50612345678'}`}
              className="glass-btn-secondary px-8 py-4 rounded-lg text-lg font-bold text-center"
            >
              📞 Llamar Ahora
            </a>
            <a
              href={`https://wa.me/${siteConfig.whatsapp_number || '50612345678'}`}
              className="glass-btn-primary px-8 py-4 rounded-lg text-lg text-white font-bold text-center"
              target="_blank"
              rel="noopener noreferrer"
            >
              💬 WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="mb-2 text-lg font-semibold text-white">{siteConfig.site_name || 'Pescando Costa Rica'}</p>
          <p className="text-sm">{siteConfig.site_tagline || 'Tu mejor experiencia de pesca deportiva en Costa Rica'}</p>
          <p className="text-sm mt-4">{siteConfig.footer_text || '© 2025 Pescando Costa Rica. Todos los derechos reservados.'}</p>
        </div>
      </footer>

      {/* WhatsApp Floating Button */}
      <a
        href={`https://wa.me/${siteConfig.whatsapp_number || '50612345678'}?text=${encodeURIComponent(siteConfig.whatsapp_message || 'Hola! Estoy interesado en los tours de pesca')}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 group"
        aria-label="Contactar por WhatsApp"
      >
        {/* WhatsApp Icon */}
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>

        {/* Tooltip */}
        <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          ¿Necesitas ayuda? ¡Escríbenos!
        </span>

        {/* Pulse Animation */}
        <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75"></span>
      </a>
    </div>
  );
}
