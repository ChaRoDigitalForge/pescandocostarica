'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getTourBySlug, getTourReviews, getTourAvailability, createBooking } from '@/lib/api';

export default function TourDetail() {
  const params = useParams();
  const slug = params.slug;

  const [tour, setTour] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState('');
  const [numberOfPeople, setNumberOfPeople] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [availability, setAvailability] = useState(null);
  const [bookingError, setBookingError] = useState('');

  // Fetch tour data
  useEffect(() => {
    const fetchTourData = async () => {
      setLoading(true);
      try {
        const [tourResponse, reviewsResponse] = await Promise.all([
          getTourBySlug(slug),
          getTourReviews(slug, 1, 5)
        ]);

        if (tourResponse.success) {
          setTour(tourResponse.data);
        }

        if (reviewsResponse.success) {
          setReviews(reviewsResponse.data);
        }
      } catch (error) {
        console.error('Error loading tour:', error);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchTourData();
    }
  }, [slug]);

  const nextImage = () => {
    if (tour && tour.image_gallery) {
      setCurrentImageIndex((prev) => (prev + 1) % tour.image_gallery.length);
    }
  };

  const prevImage = () => {
    if (tour && tour.image_gallery) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? tour.image_gallery.length - 1 : prev - 1
      );
    }
  };

  // Check availability when date changes
  useEffect(() => {
    const checkAvailability = async () => {
      if (selectedDate && slug) {
        const availabilityResponse = await getTourAvailability(slug, selectedDate, selectedDate);
        if (availabilityResponse.success && availabilityResponse.data.length > 0) {
          setAvailability(availabilityResponse.data[0]);
        } else {
          setAvailability(null);
        }
      }
    };

    checkAvailability();
  }, [selectedDate, slug]);

  const handleBooking = async () => {
    setBookingError('');

    if (!selectedDate) {
      setBookingError('Por favor selecciona una fecha');
      return;
    }

    // Check availability before showing form
    if (!availability || availability.available_slots < numberOfPeople) {
      setBookingError(`Lo sentimos, solo hay ${availability?.available_slots || 0} espacios disponibles para esta fecha`);
      return;
    }

    // Show booking form for customer details
    setShowBookingForm(true);
  };

  const submitBooking = async (e) => {
    e.preventDefault();
    setBookingError('');

    if (!customerName || !customerEmail || !customerPhone) {
      setBookingError('Por favor completa todos los campos requeridos');
      return;
    }

    setBookingLoading(true);
    try {
      const bookingData = {
        tour_id: tour.id,
        booking_date: selectedDate,
        number_of_people: numberOfPeople,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        customer_notes: customerNotes
      };

      const response = await createBooking(bookingData);

      if (response.success) {
        // Redirect to booking confirmation page
        alert(`¡Reserva creada exitosamente! Número de reserva: ${response.data.booking_number}\n\nEl capitán ${tour.capitan_name} ha sido notificado y se pondrá en contacto contigo pronto.`);
        setShowBookingForm(false);
        setCustomerName('');
        setCustomerEmail('');
        setCustomerPhone('');
        setCustomerNotes('');
        setSelectedDate('');
        setNumberOfPeople(1);
      } else {
        setBookingError(response.message || 'Error al crear la reserva');
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      setBookingError(error.message || 'Error al crear la reserva. Por favor intenta nuevamente.');
    } finally {
      setBookingLoading(false);
    }
  };

  const openInGoogleMaps = () => {
    if (tour?.latitude && tour?.longitude) {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${tour.latitude},${tour.longitude}`,
        '_blank'
      );
    } else if (tour?.location_name) {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(tour.location_name + ', Costa Rica')}`,
        '_blank'
      );
    }
  };

  const shareLocation = async () => {
    if (navigator.share && tour?.location_name) {
      try {
        await navigator.share({
          title: tour.title,
          text: `Ubicación: ${tour.location_name}, ${tour.provincia_name}`,
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600"></div>
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Tour no encontrado</h1>
          <Link href="/" className="text-green-600 hover:text-green-700">
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  const totalPrice = tour.price * numberOfPeople;
  const discount = tour.original_price ? ((tour.original_price - tour.price) / tour.original_price * 100).toFixed(0) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="text-green-600 hover:text-green-700 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver a tours
          </Link>
        </div>
      </nav>

      {/* Image Gallery Section */}
      <section className="bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Main Image */}
            <div className="relative h-96 lg:h-[600px] rounded-xl overflow-hidden">
              <Image
                src={tour.image_gallery?.[currentImageIndex] || tour.main_image_url}
                alt={tour.title}
                fill
                className="object-cover"
                priority
              />

              {/* Image Navigation */}
              {tour.image_gallery && tour.image_gallery.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  {/* Image Counter */}
                  <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                    {currentImageIndex + 1} / {tour.image_gallery.length}
                  </div>
                </>
              )}

              {/* Featured Badge */}
              {tour.is_featured && (
                <div className="absolute top-4 left-4 bg-green-600 text-white px-4 py-2 rounded-lg font-bold">
                  Destacado
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            <div className="grid grid-cols-3 gap-4">
              {tour.image_gallery?.slice(0, 6).map((image, index) => (
                <div
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`relative h-32 rounded-lg overflow-hidden cursor-pointer ${
                    currentImageIndex === index ? 'ring-4 ring-green-600' : 'hover:opacity-75'
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${tour.title} - Image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Tour Details Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Title and Location */}
            <div className="bg-white rounded-xl p-8 shadow-sm mb-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">{tour.title}</h1>
                  <div className="flex items-center gap-4 text-gray-600 mb-4">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{tour.location_name ? `${tour.location_name}, ` : ''}{tour.provincia_name}</span>
                    </div>
                    <button
                      onClick={openInGoogleMaps}
                      className="text-blue-600 hover:text-blue-700 text-sm underline"
                    >
                      Ver en Maps
                    </button>
                    {navigator.share && (
                      <button
                        onClick={shareLocation}
                        className="text-green-600 hover:text-green-700 text-sm underline"
                      >
                        Compartir ubicación
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex text-orange-400">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className={`w-5 h-5 ${i < Math.floor(tour.average_rating) ? 'fill-current' : 'fill-gray-300'}`} viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>
                <span className="text-gray-700 font-medium">{tour.average_rating}</span>
                <span className="text-gray-500">({tour.total_reviews} reviews)</span>
              </div>

              {/* Quick Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <svg className="w-8 h-8 mx-auto text-green-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm text-gray-500">Duración</div>
                  <div className="font-bold text-gray-900">{tour.duration_display}</div>
                </div>
                <div className="text-center">
                  <svg className="w-8 h-8 mx-auto text-green-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <div className="text-sm text-gray-500">Capacidad</div>
                  <div className="font-bold text-gray-900">{tour.capacity} personas</div>
                </div>
                <div className="text-center">
                  <svg className="w-8 h-8 mx-auto text-green-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <div className="text-sm text-gray-500">Dificultad</div>
                  <div className="font-bold text-gray-900">Nivel {tour.difficulty_level}/5</div>
                </div>
                <div className="text-center">
                  <svg className="w-8 h-8 mx-auto text-green-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                  </svg>
                  <div className="text-sm text-gray-500">Tipo</div>
                  <div className="font-bold text-gray-900 capitalize">{tour.fishing_type}</div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm mb-6">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-8 pt-6 overflow-x-auto">
                  {['description', 'boat', 'species', 'reviews', 'location'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`pb-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                        activeTab === tab
                          ? 'border-green-600 text-green-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {tab === 'description' && 'Descripción'}
                      {tab === 'boat' && 'Bote'}
                      {tab === 'species' && 'Especies Objetivo'}
                      {tab === 'reviews' && `Reviews (${tour.total_reviews})`}
                      {tab === 'location' && 'Ubicación'}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-8">
                {/* Description Tab */}
                {activeTab === 'description' && (
                  <div>
                    <p className="text-gray-600 leading-relaxed whitespace-pre-line mb-6">{tour.description}</p>
                    {tour.short_description && (
                      <div className="p-4 bg-green-50 border-l-4 border-green-600 rounded mb-6">
                        <p className="text-green-800 font-medium">{tour.short_description}</p>
                      </div>
                    )}

                    {/* What's Included */}
                    {tour.inclusions && tour.inclusions.length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Qué incluye</h3>
                        <ul className="space-y-2">
                          {tour.inclusions.map((item, index) => (
                            <li key={index} className="flex items-start gap-3">
                              <svg className="w-5 h-5 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              <span className="text-gray-700">{item.description}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Requirements */}
                    {tour.requirements && tour.requirements.length > 0 && (
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Requerimientos</h3>
                        <ul className="space-y-2">
                          {tour.requirements.map((item, index) => (
                            <li key={index} className="flex items-start gap-3">
                              <svg className="w-5 h-5 text-orange-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                              <span className="text-gray-700">{item.requirement}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Boat Tab */}
                {activeTab === 'boat' && (
                  <div>
                    {tour.boats && tour.boats.length > 0 ? (
                      <div className="space-y-6">
                        {tour.boats.map((boat) => (
                          <div key={boat.id} className="border border-gray-200 rounded-lg p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <h3 className="text-2xl font-bold text-gray-900">{boat.name}</h3>
                                {boat.boat_type && (
                                  <p className="text-green-600 font-medium mt-1">{boat.boat_type}</p>
                                )}
                                {(boat.brand || boat.model) && (
                                  <p className="text-gray-600 mt-1">
                                    {boat.brand} {boat.model} {boat.year && `(${boat.year})`}
                                  </p>
                                )}
                              </div>
                              {boat.is_primary && (
                                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                                  Bote Principal
                                </span>
                              )}
                            </div>

                            {/* Boat specs */}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                              {boat.length_feet && (
                                <div className="text-center">
                                  <div className="text-2xl font-bold text-green-600">{boat.length_feet}'</div>
                                  <div className="text-sm text-gray-600">Longitud</div>
                                </div>
                              )}
                              {boat.capacity && (
                                <div className="text-center">
                                  <div className="text-2xl font-bold text-green-600">{boat.capacity}</div>
                                  <div className="text-sm text-gray-600">Capacidad</div>
                                </div>
                              )}
                              {boat.year && (
                                <div className="text-center">
                                  <div className="text-2xl font-bold text-green-600">{boat.year}</div>
                                  <div className="text-sm text-gray-600">Año</div>
                                </div>
                              )}
                            </div>

                            {/* Boat description */}
                            {boat.description && (
                              <p className="text-gray-700 mb-4">{boat.description}</p>
                            )}

                            {/* Boat features */}
                            {boat.features && boat.features.length > 0 && (
                              <div>
                                <h4 className="text-lg font-bold text-gray-900 mb-3">Características del Bote</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {boat.features.map((feature, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                      <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                      </svg>
                                      <span className="text-gray-700">{feature}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Boat images */}
                            {boat.images && boat.images.length > 0 && (
                              <div className="mt-4">
                                <h4 className="text-lg font-bold text-gray-900 mb-3">Fotos del Bote</h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                  {boat.images.map((img, idx) => (
                                    <div key={idx} className="relative h-32 rounded-lg overflow-hidden">
                                      <Image src={img} alt={`${boat.name} - ${idx + 1}`} fill className="object-cover" />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                        </svg>
                        <p className="text-gray-500">Información del bote no disponible</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Species Tab */}
                {activeTab === 'species' && (
                  <div>
                    {tour.target_species && tour.target_species.length > 0 ? (
                      <div>
                        <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-600 rounded">
                          <p className="text-blue-800">
                            Estas son las especies que típicamente se encuentran en este tour. Las probabilidades son estimaciones basadas en temporada y condiciones.
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {tour.target_species.map((species) => (
                            <div key={species.id} className={`border rounded-lg p-5 ${species.is_featured ? 'border-green-600 bg-green-50' : 'border-gray-200'}`}>
                              {species.is_featured && (
                                <div className="mb-3">
                                  <span className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                                    ESPECIE DESTACADA
                                  </span>
                                </div>
                              )}

                              <div className="flex items-start gap-4">
                                {species.image_url && (
                                  <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                                    <Image src={species.image_url} alt={species.name_es} fill className="object-cover" />
                                  </div>
                                )}

                                <div className="flex-1">
                                  <h4 className="text-xl font-bold text-gray-900">{species.name_es}</h4>
                                  <p className="text-green-600 italic text-sm">{species.name_en}</p>
                                  {species.scientific_name && (
                                    <p className="text-gray-500 text-xs italic">{species.scientific_name}</p>
                                  )}
                                </div>
                              </div>

                              {species.description && (
                                <p className="text-gray-700 text-sm mt-3">{species.description}</p>
                              )}

                              {/* Weight range */}
                              {(species.average_weight_lbs || species.max_weight_lbs) && (
                                <div className="mt-4 grid grid-cols-2 gap-3">
                                  {species.average_weight_lbs && (
                                    <div className="bg-white p-3 rounded border border-gray-200">
                                      <div className="text-xs text-gray-500 mb-1">Peso Promedio</div>
                                      <div className="text-lg font-bold text-gray-900">{species.average_weight_lbs} lbs</div>
                                    </div>
                                  )}
                                  {species.max_weight_lbs && (
                                    <div className="bg-white p-3 rounded border border-gray-200">
                                      <div className="text-xs text-gray-500 mb-1">Peso Máximo</div>
                                      <div className="text-lg font-bold text-gray-900">{species.max_weight_lbs} lbs</div>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Probability */}
                              {species.probability_percentage && (
                                <div className="mt-4">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-700">Probabilidad de captura</span>
                                    <span className="text-sm font-bold text-green-600">{species.probability_percentage}%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div
                                      className="bg-green-600 h-2.5 rounded-full transition-all duration-300"
                                      style={{width: `${species.probability_percentage}%`}}
                                    ></div>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        <p className="text-gray-500">Información de especies objetivo no disponible</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Reviews Tab */}
                {activeTab === 'reviews' && (
                  <div>
                    {reviews.length > 0 ? (
                      <div className="space-y-6">
                        {reviews.map((review) => (
                          <div key={review.id} className="border-b border-gray-200 pb-6 last:border-0">
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                                {review.reviewer_avatar ? (
                                  <Image src={review.reviewer_avatar} alt={review.reviewer_name} width={48} height={48} className="rounded-full" />
                                ) : (
                                  <span className="text-gray-600 font-bold">{review.reviewer_name?.[0]}</span>
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                  <div>
                                    <h4 className="font-bold text-gray-900">{review.reviewer_name}</h4>
                                    <p className="text-sm text-gray-500">
                                      {new Date(review.created_at).toLocaleDateString('es-ES', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                      })}
                                    </p>
                                  </div>
                                  <div className="flex text-orange-400">
                                    {[...Array(5)].map((_, i) => (
                                      <svg key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'fill-gray-300'}`} viewBox="0 0 20 20">
                                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                      </svg>
                                    ))}
                                  </div>
                                </div>
                                <p className="text-gray-700">{review.comment}</p>
                                {review.images && review.images.length > 0 && (
                                  <div className="grid grid-cols-4 gap-2 mt-3">
                                    {review.images.map((img, idx) => (
                                      <div key={idx} className="relative h-20 rounded overflow-hidden">
                                        <Image src={img.url} alt="Review" fill className="object-cover" />
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-gray-500">No hay reviews todavía. ¡Sé el primero en dejar uno!</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Location Tab */}
                {activeTab === 'location' && (
                  <div>
                    <div className="aspect-video bg-gray-200 rounded-lg mb-4 overflow-hidden">
                      {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY && process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY !== 'YOUR_GOOGLE_MAPS_API_KEY' ? (
                        <iframe
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          loading="lazy"
                          src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(
                            tour.location_name ? `${tour.location_name}, Costa Rica` : `${tour.provincia_name}, Costa Rica`
                          )}`}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                          <div className="text-center p-4">
                            <svg className="w-16 h-16 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <p className="text-gray-600 text-sm">
                              {tour.location_name ? `${tour.location_name}, ` : ''}{tour.provincia_name}, Costa Rica
                            </p>
                            <p className="text-gray-400 text-xs mt-2">
                              Configura GOOGLE_MAPS_API_KEY para ver el mapa
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={openInGoogleMaps}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition"
                      >
                        Abrir en Google Maps
                      </button>
                      {navigator.share && (
                        <button
                          onClick={shareLocation}
                          className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 px-4 rounded-lg transition"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Captain Info */}
            {tour.capitan_name && (
              <div className="bg-white rounded-xl p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Tu Capitán</h2>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    {tour.capitan_avatar ? (
                      <Image src={tour.capitan_avatar} alt={tour.capitan_name} width={64} height={64} className="rounded-full" />
                    ) : (
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{tour.capitan_name}</h3>
                    {tour.capitan_experience && (
                      <p className="text-gray-600">{tour.capitan_experience} años de experiencia</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-lg sticky top-4">
              <div className="mb-6">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-4xl font-bold text-green-600">${tour.price}</span>
                  {tour.original_price && (
                    <>
                      <span className="text-xl text-gray-400 line-through">${tour.original_price}</span>
                      <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-sm font-bold">
                        -{discount}%
                      </span>
                    </>
                  )}
                </div>
                <p className="text-gray-600">por persona</p>
              </div>

              {/* Error Message */}
              {bookingError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{bookingError}</p>
                </div>
              )}

              {/* Availability Info */}
              {selectedDate && availability && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-700 text-sm">
                    ✓ {availability.available_slots} espacios disponibles
                  </p>
                </div>
              )}

              {!showBookingForm ? (
                <>
                  {/* Date and People Selection */}
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha del tour
                      </label>
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Número de personas
                      </label>
                      <select
                        value={numberOfPeople}
                        onChange={(e) => setNumberOfPeople(parseInt(e.target.value))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                      >
                        {[...Array(tour.capacity)].map((_, i) => (
                          <option key={i + 1} value={i + 1}>
                            {i + 1} {i + 1 === 1 ? 'persona' : 'personas'}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Price Summary */}
                  <div className="border-t border-gray-200 pt-4 mb-6">
                    <div className="flex justify-between text-gray-600 mb-2">
                      <span>${tour.price} x {numberOfPeople} {numberOfPeople === 1 ? 'persona' : 'personas'}</span>
                      <span>${totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg text-gray-900">
                      <span>Total</span>
                      <span>${totalPrice.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Book Button */}
                  <button
                    onClick={handleBooking}
                    disabled={bookingLoading || !selectedDate}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continuar con la reserva
                  </button>

                  <button className="w-full bg-white border-2 border-green-600 text-green-600 hover:bg-green-50 font-bold py-4 rounded-lg transition-all duration-300">
                    Contactar al capitán
                  </button>

                  <p className="text-center text-sm text-gray-500 mt-4">
                    No se hará ningún cargo todavía
                  </p>
                </>
              ) : (
                <>
                  {/* Customer Information Form */}
                  <form onSubmit={submitBooking} className="space-y-4">
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-blue-700 text-sm font-medium">
                        {numberOfPeople} {numberOfPeople === 1 ? 'persona' : 'personas'} - {new Date(selectedDate).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                      <p className="text-blue-600 text-sm">Total: ${totalPrice.toFixed(2)}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre completo *
                      </label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                        placeholder="Juan Pérez"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Correo electrónico *
                      </label>
                      <input
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                        placeholder="juan@ejemplo.com"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Teléfono *
                      </label>
                      <input
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                        placeholder="+506 1234-5678"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Notas adicionales (opcional)
                      </label>
                      <textarea
                        value={customerNotes}
                        onChange={(e) => setCustomerNotes(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                        rows="3"
                        placeholder="Alergias, preferencias, preguntas especiales..."
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setShowBookingForm(false)}
                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-4 rounded-lg transition"
                      >
                        Volver
                      </button>
                      <button
                        type="submit"
                        disabled={bookingLoading}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-lg transition shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {bookingLoading ? 'Procesando...' : 'Confirmar reserva'}
                      </button>
                    </div>

                    <p className="text-center text-xs text-gray-500 mt-2">
                      Al confirmar, recibirás un correo con los detalles de tu reserva y el capitán se pondrá en contacto contigo.
                    </p>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
