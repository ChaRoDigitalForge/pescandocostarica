'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import StatCard from '@/components/dashboard/StatCard';
import SimpleBarChart from '@/components/dashboard/SimpleBarChart';
import SimplePieChart from '@/components/dashboard/SimplePieChart';
import CalendarView from '@/components/dashboard/CalendarView';
import NotificationCenter from '@/components/dashboard/NotificationCenter';
import BoatsManager from '@/components/dashboard/BoatsManager';
import TourSpeciesSelector from '@/components/dashboard/TourSpeciesSelector';
import TourFishingStylesSelector from '@/components/dashboard/TourFishingStylesSelector';
import ImageUploader from '@/components/dashboard/ImageUploader';
import { getCountries, getZonesByCountry } from '@/lib/api';

export default function CaptainDashboard() {
  const { user, isAuthenticated, isCapitan, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [statistics, setStatistics] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [bookingFilter, setBookingFilter] = useState('all');
  const [historyFilter, setHistoryFilter] = useState({ status: 'all', startDate: '', endDate: '', tourType: '' });
  const [notifications, setNotifications] = useState([]);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({});
  const [showTourForm, setShowTourForm] = useState(false);
  const [editingTourId, setEditingTourId] = useState(null);
  const [viewingTour, setViewingTour] = useState(null);
  const [tourFormData, setTourFormData] = useState({
    title: '',
    description: '',
    short_description: '',
    duration_hours: 4,
    capacity: 4,
    price: 300,
    country_id: 1, // Costa Rica by default
    zone_id: null,
    fishing_zone_id: null,
    boat_id: null,
    main_image_url: '',
    image_gallery: [],
    inclusions: [],
    services: [],
    exclusions: [],
    target_species: [],
    fishing_styles: [],
    media: []
  });
  const [countries, setCountries] = useState([]);
  const [zones, setZones] = useState([]);
  const [newInclusion, setNewInclusion] = useState('');
  const [newService, setNewService] = useState({ service_type: 'equipo', name: '', description: '', cost: '' });
  const [newExclusion, setNewExclusion] = useState('');
  const [boats, setBoats] = useState([]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    } else if (!authLoading && !isCapitan) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isCapitan, authLoading, router]);

  useEffect(() => {
    console.log('🔐 Auth Status:', {
      isAuthenticated,
      isCapitan,
      userRole: user?.role,
      userName: user?.first_name
    });

    if (isAuthenticated && isCapitan) {
      fetchDashboardData();
      fetchNotifications();
    } else if (isAuthenticated && !isCapitan) {
      console.warn('⚠️ User is authenticated but not a captain. Role:', user?.role);
    } else if (!isAuthenticated) {
      console.warn('⚠️ User is not authenticated');
    }
  }, [isAuthenticated, isCapitan, user]);

  useEffect(() => {
    if (user) {
      setProfileData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone: user.phone || '',
        license_number: user.license_number || '',
        years_of_experience: user.years_of_experience || '',
        bio: user.bio || '',
        boat_name: user.boat_name || '',
        boat_capacity: user.boat_capacity || '',
      });
    }
  }, [user]);

  // Load countries on mount
  useEffect(() => {
    loadCountries();
  }, []);

  // Load zones when country changes
  useEffect(() => {
    if (tourFormData.country_id) {
      loadZones(tourFormData.country_id);
    }
  }, [tourFormData.country_id]);

  const loadCountries = async () => {
    try {
      const response = await getCountries(true);
      if (response.success) {
        setCountries(response.data);
      }
    } catch (error) {
      console.error('Error loading countries:', error);
    }
  };

  const loadZones = async (countryId) => {
    try {
      const response = await getZonesByCountry(countryId, { popularOnly: false, activeOnly: true });
      if (response.success) {
        setZones(response.data);
      }
    } catch (error) {
      console.error('Error loading zones:', error);
    }
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      console.log('🔑 Token exists:', !!token);
      console.log('🌐 API URL:', process.env.NEXT_PUBLIC_API_URL);

      const [statsResponse, bookingsResponse, toursResponse, boatsResponse] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/captain/statistics`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/captain/bookings?limit=100`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/captain/tours`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/captain/boats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      console.log('📊 Statistics Response Status:', statsResponse.status, statsResponse.ok);
      console.log('📅 Bookings Response Status:', bookingsResponse.status, bookingsResponse.ok);
      console.log('🎣 Tours Response Status:', toursResponse.status, toursResponse.ok);

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        console.log('✅ Statistics Data:', statsData);
        setStatistics(statsData.data);
      } else {
        const errorData = await statsResponse.json();
        console.error('❌ Statistics Error:', errorData);
      }

      if (bookingsResponse.ok) {
        const bookingsData = await bookingsResponse.json();
        console.log('✅ Bookings Data:', bookingsData);
        setBookings(bookingsData.data || []);
      } else {
        const errorData = await bookingsResponse.json();
        console.error('❌ Bookings Error:', errorData);
      }

      if (toursResponse.ok) {
        const toursData = await toursResponse.json();
        console.log('✅ Tours Data:', toursData);
        setTours(toursData.data || []);
      } else {
        const errorData = await toursResponse.json();
        console.error('❌ Tours Error:', errorData);
      }

      if (boatsResponse.ok) {
        const boatsData = await boatsResponse.json();
        console.log('✅ Boats Data:', boatsData);
        setBoats(boatsData.data || []);
      } else {
        const errorData = await boatsResponse.json();
        console.error('❌ Boats Error:', errorData);
      }
    } catch (error) {
      console.error('💥 Error fetching dashboard data:', error);
      // Set fallback data for demonstration
      setStatistics({
        overview: {
          total_tours: 8,
          active_tours: 6,
          pending_bookings: 3,
          upcoming_bookings: 12,
          total_revenue: 45000,
          revenue_last_30_days: 8500
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    // Mock notifications for demonstration
    setNotifications([
      {
        id: 1,
        type: 'booking',
        title: 'Nueva Reserva',
        message: 'Juan Pérez ha reservado "Tour de Pesca Costera" para el 15 de Dic',
        timestamp: new Date().toISOString(),
        read: false
      },
      {
        id: 2,
        type: 'update',
        title: 'Reserva Modificada',
        message: 'María González cambió la fecha de su reserva al 20 de Dic',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        read: false
      },
      {
        id: 3,
        type: 'payment',
        title: 'Pago Recibido',
        message: 'Se recibió el pago de $350 de Carlos Rodríguez',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        read: true
      }
    ]);
  };

  const updateBookingStatus = async (bookingNumber, newStatus) => {
    try {
      const token = localStorage.getItem('auth_token');

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/captain/bookings/${bookingNumber}/status`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status: newStatus })
        }
      );

      if (response.ok) {
        fetchDashboardData();
        alert('Estado de reserva actualizado exitosamente');
      } else {
        alert('Error al actualizar el estado de la reserva');
      }
    } catch (error) {
      console.error('Error updating booking status:', error);
      alert('Error al actualizar el estado de la reserva');
    }
  };

  const handleProfileUpdate = async () => {
    try {
      const token = localStorage.getItem('auth_token');

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/captain/profile`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(profileData)
        }
      );

      if (response.ok) {
        alert('Perfil actualizado exitosamente');
        setIsEditingProfile(false);
      } else {
        alert('Error al actualizar el perfil');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error al actualizar el perfil');
    }
  };

  const handleCreateTour = async () => {
    try {
      const token = localStorage.getItem('auth_token');

      const tourData = {
        ...tourFormData,
        inclusions: tourFormData.inclusions.map(inc => ({ description: inc, is_included: true })),
        services: tourFormData.services || [],
        exclusions: tourFormData.exclusions || [],
        target_species: tourFormData.target_species || [],
        fishing_styles: tourFormData.fishing_styles || []
      };

      const url = editingTourId
        ? `${process.env.NEXT_PUBLIC_API_URL}/captain/tours/${editingTourId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/captain/tours`;

      const method = editingTourId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(tourData)
      });

      if (response.ok) {
        alert(editingTourId ? 'Tour actualizado exitosamente' : 'Tour creado exitosamente');
        setShowTourForm(false);
        setEditingTourId(null);
        setTourFormData({
          title: '',
          description: '',
          short_description: '',
          duration_hours: 4,
          capacity: 4,
          price: 300,
          country_id: 1,
          zone_id: null,
          fishing_zone_id: null,
          boat_id: null,
          main_image_url: '',
          image_gallery: [],
          inclusions: [],
          services: [],
          exclusions: [],
          target_species: [],
          fishing_styles: [],
          media: []
        });
        fetchDashboardData();
      } else {
        const errorData = await response.json();
        alert(`Error al ${editingTourId ? 'actualizar' : 'crear'} el tour: ${errorData.message || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error saving tour:', error);
      alert('Error al guardar el tour');
    }
  };

  const handleEditTour = async (tour) => {
    try {
      const token = localStorage.getItem('auth_token');

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/captain/tours/${tour.id}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.ok) {
        const data = await response.json();
        const tourData = data.data;

        setTourFormData({
          title: tourData.title || '',
          description: tourData.description || '',
          short_description: tourData.short_description || '',
          duration_hours: tourData.duration_hours || 4,
          capacity: tourData.capacity || 4,
          price: tourData.price || 300,
          country_id: tourData.country_id || 1,
          zone_id: tourData.zone_id || null,
          boat_id: tourData.boat_id || null,
          main_image_url: tourData.main_image_url || '',
          image_gallery: tourData.image_gallery || [],
          inclusions: tourData.inclusions?.map(inc => inc.description) || [],
          services: tourData.services || [],
          exclusions: tourData.exclusions || [],
          target_species: tourData.target_species || [],
          fishing_styles: tourData.fishing_styles || [],
          media: tourData.media || []
        });

        setEditingTourId(tour.id);
        setShowTourForm(true);
      }
    } catch (error) {
      console.error('Error loading tour:', error);
      alert('Error al cargar el tour');
    }
  };

  const handleDeleteTour = async (tourId) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este tour?')) {
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/captain/tours/${tourId}`,
        {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.ok) {
        alert('Tour eliminado exitosamente');
        fetchDashboardData();
      } else {
        alert('Error al eliminar el tour');
      }
    } catch (error) {
      console.error('Error deleting tour:', error);
      alert('Error al eliminar el tour');
    }
  };

  const handlePublishTour = async (tourId) => {
    if (!confirm('¿Deseas publicar este tour? Será visible en la página principal.')) {
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/captain/tours/${tourId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status: 'active' })
        }
      );

      if (response.ok) {
        alert('Tour publicado exitosamente');
        fetchDashboardData();
      } else {
        alert('Error al publicar el tour');
      }
    } catch (error) {
      console.error('Error publishing tour:', error);
      alert('Error al publicar el tour');
    }
  };

  const handleUnpublishTour = async (tourId) => {
    if (!confirm('¿Deseas despublicar este tour? Ya no será visible en la página principal.')) {
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/captain/tours/${tourId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status: 'draft' })
        }
      );

      if (response.ok) {
        alert('Tour despublicado exitosamente');
        fetchDashboardData();
      } else {
        alert('Error al despublicar el tour');
      }
    } catch (error) {
      console.error('Error unpublishing tour:', error);
      alert('Error al despublicar el tour');
    }
  };

  const addInclusion = () => {
    if (newInclusion.trim()) {
      setTourFormData({
        ...tourFormData,
        inclusions: [...tourFormData.inclusions, newInclusion.trim()]
      });
      setNewInclusion('');
    }
  };

  const removeInclusion = (index) => {
    setTourFormData({
      ...tourFormData,
      inclusions: tourFormData.inclusions.filter((_, i) => i !== index)
    });
  };


  const addService = () => {
    if (newService.name.trim()) {
      setTourFormData({
        ...tourFormData,
        services: [...tourFormData.services, {
          service_type: newService.service_type || 'equipo',
          name: newService.name.trim(),
          description: newService.description.trim(),
          is_included: false,
          additional_cost: parseFloat(newService.cost) || 0
        }]
      });
      setNewService({ service_type: 'equipo', name: '', description: '', cost: '' });
    }
  };

  const removeService = (index) => {
    setTourFormData({
      ...tourFormData,
      services: tourFormData.services.filter((_, i) => i !== index)
    });
  };

  const addExclusion = () => {
    if (newExclusion.trim()) {
      setTourFormData({
        ...tourFormData,
        exclusions: [...tourFormData.exclusions, newExclusion.trim()]
      });
      setNewExclusion('');
    }
  };

  const removeExclusion = (index) => {
    setTourFormData({
      ...tourFormData,
      exclusions: tourFormData.exclusions.filter((_, i) => i !== index)
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pendiente' },
      confirmed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Confirmada' },
      completed: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Completada' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelada' }
    };

    const badge = badges[status] || badges.pending;

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  const filteredBookings = bookings.filter(booking => {
    if (bookingFilter === 'all') return true;
    return booking.status === bookingFilter;
  });

  const filteredHistory = bookings.filter(booking => {
    let matches = true;

    if (historyFilter.status !== 'all' && historyFilter.status) {
      matches = matches && booking.status === historyFilter.status;
    }

    if (historyFilter.startDate) {
      matches = matches && new Date(booking.booking_date) >= new Date(historyFilter.startDate);
    }

    if (historyFilter.endDate) {
      matches = matches && new Date(booking.booking_date) <= new Date(historyFilter.endDate);
    }

    return matches;
  });

  // Prepare chart data
  const monthlyBookingsData = statistics ? [
    { label: 'Ene', value: Math.floor(Math.random() * 20) + 5 },
    { label: 'Feb', value: Math.floor(Math.random() * 20) + 5 },
    { label: 'Mar', value: Math.floor(Math.random() * 20) + 5 },
    { label: 'Abr', value: Math.floor(Math.random() * 20) + 5 },
    { label: 'May', value: Math.floor(Math.random() * 20) + 5 },
    { label: 'Jun', value: Math.floor(Math.random() * 20) + 5 },
  ] : [];

  const tourTypesData = statistics ? [
    { label: 'Alta Mar', value: 35 },
    { label: 'Costera', value: 25 },
    { label: 'Río y Manglar', value: 20 },
    { label: 'Lago', value: 15 },
  ] : [];

  const calendarEvents = bookings.map(booking => ({
    date: booking.booking_date,
    title: booking.tour_title,
    status: booking.status,
    customer: booking.customer_name
  }));

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || !isCapitan) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-2xl">🎣</Link>
              <h1 className="text-xl font-bold text-gray-900">Dashboard del Capitán</h1>
            </div>

            <div className="flex items-center gap-4">
              <NotificationCenter
                notifications={notifications}
                onMarkAsRead={(id) => {
                  setNotifications(notifications.map(n =>
                    n.id === id ? { ...n, read: true } : n
                  ));
                }}
                onMarkAllAsRead={() => {
                  setNotifications(notifications.map(n => ({ ...n, read: true })));
                }}
              />

              <div className="text-right hidden md:block">
                <div className="text-sm font-medium text-gray-900">
                  {user?.first_name} {user?.last_name}
                </div>
                <div className="text-xs text-gray-500">Capitán</div>
              </div>
              <button
                onClick={logout}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Tab Navigation */}
      <div className="bg-white border-b sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 overflow-x-auto">
            {[
              { id: 'overview', label: 'Vista General', icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z' },
              { id: 'history', label: 'Historial', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
              { id: 'statistics', label: 'Estadísticas', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
              { id: 'bookings', label: 'Reservas', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
              { id: 'calendar', label: 'Calendario', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
              { id: 'tours', label: 'Mis Tours', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
              { id: 'boats', label: 'Embarcaciones', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
              { id: 'profile', label: 'Perfil', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                </svg>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && statistics && (
          <div className="space-y-6">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">
                    ¡Bienvenido, Capitán {user?.first_name}! 🎣
                  </h2>
                  <p className="text-green-50">
                    Aquí está el resumen de tu actividad y próximos tours
                  </p>
                </div>
                <div className="hidden md:block">
                  <div className="text-right">
                    <p className="text-sm text-green-100">Fecha de hoy</p>
                    <p className="text-xl font-semibold">
                      {new Date().toLocaleDateString('es-ES', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Tours"
                value={statistics.overview.total_tours}
                subtitle={`${statistics.overview.active_tours} activos`}
                icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                bgColor="bg-green-100"
                iconColor="text-green-600"
              />

              <StatCard
                title="Reservas Pendientes"
                value={statistics.overview.pending_bookings}
                subtitle="Requieren atención"
                icon="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                bgColor="bg-yellow-100"
                iconColor="text-yellow-600"
              />

              <StatCard
                title="Próximos Tours"
                value={statistics.overview.upcoming_bookings}
                subtitle="Confirmadas"
                icon="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                bgColor="bg-blue-100"
                iconColor="text-blue-600"
              />

              <StatCard
                title="Ingresos Totales"
                value={`$${parseFloat(statistics.overview.total_revenue).toLocaleString()}`}
                subtitle={`$${parseFloat(statistics.overview.revenue_last_30_days).toLocaleString()} últimos 30 días`}
                icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                bgColor="bg-green-100"
                iconColor="text-green-600"
                trend={12.5}
                trendLabel="vs mes anterior"
              />
            </div>

            {/* Main Content Grid - 2 Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Spans 2 columns */}
              <div className="lg:col-span-2 space-y-6">
                {/* Recent Bookings */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Reservas Recientes
                    </h2>
                    <button
                      onClick={() => setActiveTab('bookings')}
                      className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1"
                    >
                      Ver todas
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                  <div className="space-y-3">
                    {bookings.slice(0, 5).map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{booking.customer_name}</h3>
                          <p className="text-sm text-gray-600">
                            {booking.tour_title} - {booking.number_of_people} persona(s)
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(booking.booking_date).toLocaleDateString('es-ES', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                        <div className="text-right">
                          {getStatusBadge(booking.status)}
                          <p className="text-sm font-bold text-gray-900 mt-2">
                            ${parseFloat(booking.total_amount).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                    {bookings.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p>No hay reservas recientes</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Stats Charts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      Reservas por Estado
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                          <span className="text-sm text-gray-600">Pendientes</span>
                        </div>
                        <span className="text-sm font-bold text-gray-900">
                          {bookings.filter(b => b.status === 'pending').length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          <span className="text-sm text-gray-600">Confirmadas</span>
                        </div>
                        <span className="text-sm font-bold text-gray-900">
                          {bookings.filter(b => b.status === 'confirmed').length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                          <span className="text-sm text-gray-600">Completadas</span>
                        </div>
                        <span className="text-sm font-bold text-gray-900">
                          {bookings.filter(b => b.status === 'completed').length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-red-500"></div>
                          <span className="text-sm text-gray-600">Canceladas</span>
                        </div>
                        <span className="text-sm font-bold text-gray-900">
                          {bookings.filter(b => b.status === 'cancelled').length}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab('statistics')}
                      className="mt-4 w-full text-sm text-green-600 hover:text-green-700 font-medium"
                    >
                      Ver estadísticas completas →
                    </button>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Ingresos del Mes
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-2xl font-bold text-green-600">
                            ${parseFloat(statistics.overview.revenue_last_30_days || 0).toLocaleString()}
                          </span>
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-semibold">
                            +12.5%
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">vs mes anterior</p>
                      </div>
                      <div className="pt-3 border-t border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600">Promedio por tour</span>
                          <span className="text-sm font-bold text-gray-900">
                            ${bookings.length > 0 ? Math.round(parseFloat(statistics.overview.revenue_last_30_days || 0) / bookings.length) : 0}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Total acumulado</span>
                          <span className="text-sm font-bold text-gray-900">
                            ${parseFloat(statistics.overview.total_revenue || 0).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab('history')}
                      className="mt-4 w-full text-sm text-green-600 hover:text-green-700 font-medium"
                    >
                      Ver historial completo →
                    </button>
                  </div>
                </div>

                {/* My Tours Summary */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Mis Tours
                    </h2>
                    <button
                      onClick={() => setActiveTab('tours')}
                      className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1"
                    >
                      Ver todos
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {tours.slice(0, 3).map((tour) => (
                      <div key={tour.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <h3 className="font-medium text-gray-900 mb-2 line-clamp-1">{tour.title}</h3>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>${tour.price}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <span>{tour.capacity} personas</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {tours.length === 0 && (
                      <div className="col-span-3 text-center py-8 text-gray-500">
                        <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p>No tienes tours creados</p>
                        <button
                          onClick={() => setActiveTab('tours')}
                          className="mt-3 text-sm text-green-600 hover:text-green-700 font-medium"
                        >
                          Crear tu primer tour →
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column - Quick Actions & Mini Calendar */}
              <div className="space-y-6">
                {/* Quick Actions */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4">Acciones Rápidas</h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => setActiveTab('bookings')}
                      className="w-full flex items-center gap-3 p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-left"
                    >
                      <div className="bg-green-600 text-white p-2 rounded-lg">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Ver Reservas</p>
                        <p className="text-xs text-gray-500">{statistics.overview.pending_bookings} pendientes</p>
                      </div>
                    </button>

                    <button
                      onClick={() => setActiveTab('calendar')}
                      className="w-full flex items-center gap-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-left"
                    >
                      <div className="bg-blue-600 text-white p-2 rounded-lg">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Calendario</p>
                        <p className="text-xs text-gray-500">{statistics.overview.upcoming_bookings} próximos</p>
                      </div>
                    </button>

                    <button
                      onClick={() => setActiveTab('tours')}
                      className="w-full flex items-center gap-3 p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-left"
                    >
                      <div className="bg-purple-600 text-white p-2 rounded-lg">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Crear Tour</p>
                        <p className="text-xs text-gray-500">Nuevo tour de pesca</p>
                      </div>
                    </button>

                    <button
                      onClick={() => setActiveTab('profile')}
                      className="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left"
                    >
                      <div className="bg-gray-600 text-white p-2 rounded-lg">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Mi Perfil</p>
                        <p className="text-xs text-gray-500">Editar información</p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Upcoming Tours Mini Calendar */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Próximos 7 Días
                  </h3>
                  <div className="space-y-2">
                    {bookings
                      .filter(b => {
                        const bookingDate = new Date(b.booking_date);
                        const today = new Date();
                        const sevenDaysFromNow = new Date();
                        sevenDaysFromNow.setDate(today.getDate() + 7);
                        return bookingDate >= today && bookingDate <= sevenDaysFromNow && b.status === 'confirmed';
                      })
                      .slice(0, 5)
                      .map((booking) => (
                        <div key={booking.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="text-center min-w-[3rem]">
                            <div className="text-xs text-gray-500">
                              {new Date(booking.booking_date).toLocaleDateString('es-ES', { month: 'short' }).toUpperCase()}
                            </div>
                            <div className="text-xl font-bold text-green-600">
                              {new Date(booking.booking_date).getDate()}
                            </div>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 line-clamp-1">{booking.tour_title}</p>
                            <p className="text-xs text-gray-500">{booking.customer_name}</p>
                            <p className="text-xs text-gray-400">{booking.number_of_people} personas</p>
                          </div>
                        </div>
                      ))}
                    {bookings.filter(b => {
                      const bookingDate = new Date(b.booking_date);
                      const today = new Date();
                      const sevenDaysFromNow = new Date();
                      sevenDaysFromNow.setDate(today.getDate() + 7);
                      return bookingDate >= today && bookingDate <= sevenDaysFromNow && b.status === 'confirmed';
                    }).length === 0 && (
                      <div className="text-center py-6 text-gray-500">
                        <p className="text-sm">No hay tours programados</p>
                        <p className="text-xs">en los próximos 7 días</p>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setActiveTab('calendar')}
                    className="mt-4 w-full text-sm text-green-600 hover:text-green-700 font-medium"
                  >
                    Ver calendario completo →
                  </button>
                </div>

                {/* Performance Summary */}
                <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl shadow-sm p-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4">Rendimiento</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Tasa de confirmación</span>
                      <span className="text-sm font-bold text-green-600">
                        {bookings.length > 0
                          ? Math.round((bookings.filter(b => b.status === 'confirmed').length / bookings.length) * 100)
                          : 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{
                          width: `${bookings.length > 0
                            ? (bookings.filter(b => b.status === 'confirmed').length / bookings.length) * 100
                            : 0}%`
                        }}
                      ></div>
                    </div>
                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Tours completados</span>
                        <span className="font-bold text-gray-900">
                          {bookings.filter(b => b.status === 'completed').length}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h2 className="text-2xl font-bold text-gray-900">Historial de Tours</h2>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Filtros</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                  <select
                    value={historyFilter.status}
                    onChange={(e) => setHistoryFilter({ ...historyFilter, status: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="all">Todos</option>
                    <option value="pending">Pendiente</option>
                    <option value="confirmed">Confirmada</option>
                    <option value="completed">Completada</option>
                    <option value="cancelled">Cancelada</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Inicio</label>
                  <input
                    type="date"
                    value={historyFilter.startDate}
                    onChange={(e) => setHistoryFilter({ ...historyFilter, startDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Fin</label>
                  <input
                    type="date"
                    value={historyFilter.endDate}
                    onChange={(e) => setHistoryFilter({ ...historyFilter, endDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    onClick={() => setHistoryFilter({ status: 'all', startDate: '', endDate: '', tourType: '' })}
                    className="w-full px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Limpiar Filtros
                  </button>
                </div>
              </div>
            </div>

            {/* History Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tour</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Personas</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredHistory.map((booking) => (
                      <tr key={booking.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(booking.booking_date).toLocaleDateString('es-ES')}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{booking.customer_name}</div>
                          <div className="text-xs text-gray-500">{booking.customer_email}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{booking.tour_title}</div>
                          <div className="text-xs text-gray-500">#{booking.booking_number}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {booking.number_of_people}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ${parseFloat(booking.total_amount).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(booking.status)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Statistics Tab */}
        {activeTab === 'statistics' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Estadísticas y Análisis</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SimpleBarChart
                data={monthlyBookingsData}
                title="Reservaciones Mensuales"
                height={300}
              />

              <SimplePieChart
                data={tourTypesData}
                title="Distribución por Tipo de Tour"
              />
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Análisis de Temporadas</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Temporada Alta</p>
                    <p className="text-sm text-gray-600">Diciembre - Abril</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">85%</p>
                    <p className="text-xs text-gray-500">Ocupación promedio</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Temporada Media</p>
                    <p className="text-sm text-gray-600">Mayo - Julio</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-yellow-600">60%</p>
                    <p className="text-xs text-gray-500">Ocupación promedio</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Temporada Baja</p>
                    <p className="text-sm text-gray-600">Agosto - Noviembre</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">35%</p>
                    <p className="text-xs text-gray-500">Ocupación promedio</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Gestión de Reservas</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setBookingFilter('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    bookingFilter === 'all'
                      ? 'bg-green-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Todas
                </button>
                <button
                  onClick={() => setBookingFilter('pending')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    bookingFilter === 'pending'
                      ? 'bg-yellow-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Pendientes
                </button>
                <button
                  onClick={() => setBookingFilter('confirmed')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    bookingFilter === 'confirmed'
                      ? 'bg-green-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Confirmadas
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tour</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Personas</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{booking.customer_name}</div>
                          <div className="text-sm text-gray-500">{booking.customer_email}</div>
                          <div className="text-sm text-gray-500">{booking.customer_phone}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{booking.tour_title}</div>
                        <div className="text-xs text-gray-500">#{booking.booking_number}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(booking.booking_date).toLocaleDateString('es-ES')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {booking.number_of_people}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ${parseFloat(booking.total_amount).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(booking.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {booking.status === 'pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => updateBookingStatus(booking.booking_number, 'confirmed')}
                              className="text-green-600 hover:text-green-900 font-medium"
                            >
                              Confirmar
                            </button>
                            <button
                              onClick={() => updateBookingStatus(booking.booking_number, 'cancelled')}
                              className="text-red-600 hover:text-red-900 font-medium"
                            >
                              Cancelar
                            </button>
                          </div>
                        )}
                        {booking.status === 'confirmed' && (
                          <button
                            onClick={() => updateBookingStatus(booking.booking_number, 'completed')}
                            className="text-blue-600 hover:text-blue-900 font-medium"
                          >
                            Marcar Completada
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Calendar Tab */}
        {activeTab === 'calendar' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Calendario de Disponibilidad</h2>

            <CalendarView
              events={calendarEvents}
              onDateClick={(date) => {
                console.log('Selected date:', date);
              }}
              onEventClick={(event) => {
                console.log('Selected event:', event);
              }}
            />
          </div>
        )}

        {/* Tours Tab */}
        {activeTab === 'tours' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Mis Tours</h2>
              <button
                onClick={() => setShowTourForm(true)}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
              >
                + Crear Nuevo Tour
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tours.length === 0 ? (
                <div className="col-span-full bg-white rounded-xl shadow-sm p-12 text-center">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes tours creados</h3>
                  <p className="text-gray-500 mb-4">Comienza creando tu primer tour de pesca</p>
                  <button
                    onClick={() => setShowTourForm(true)}
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Crear Tu Primer Tour
                  </button>
                </div>
              ) : (
                tours.map((tour) => (
                  <div key={tour.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    <div className="h-48 bg-gray-200 relative">
                      {tour.main_image_url && (
                        <img src={tour.main_image_url} alt={tour.title} className="w-full h-full object-cover" />
                      )}
                      <div className="absolute top-4 right-4">
                        {tour.status === 'active' ? (
                          <span className="px-3 py-1 bg-green-600 text-white rounded-full text-xs font-semibold">
                            Publicado
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-yellow-600 text-white rounded-full text-xs font-semibold">
                            Borrador
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{tour.title}</h3>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{tour.description}</p>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>${tour.price}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{tour.duration_display}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <span>{tour.capacity} personas</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditTour(tour)}
                            className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => setViewingTour(tour)}
                            className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors"
                          >
                            Ver
                          </button>
                        </div>
                        <div className="flex gap-2">
                          {tour.status === 'draft' ? (
                            <button
                              onClick={() => handlePublishTour(tour.id)}
                              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                            >
                              Publicar
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUnpublishTour(tour.id)}
                              className="flex-1 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm font-medium transition-colors"
                            >
                              Despublicar
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteTour(tour.id)}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Boats Tab */}
        {activeTab === 'boats' && (
          <div className="space-y-6">
            <BoatsManager onBoatCreated={fetchDashboardData} />
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Perfil del Capitán</h2>
              <button
                onClick={() => {
                  if (isEditingProfile) {
                    handleProfileUpdate();
                  } else {
                    setIsEditingProfile(true);
                  }
                }}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
              >
                {isEditingProfile ? 'Guardar Cambios' : 'Editar Perfil'}
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                  {isEditingProfile ? (
                    <input
                      type="text"
                      value={profileData.first_name}
                      onChange={(e) => setProfileData({ ...profileData, first_name: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  ) : (
                    <p className="text-gray-900">{user?.first_name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Apellido</label>
                  {isEditingProfile ? (
                    <input
                      type="text"
                      value={profileData.last_name}
                      onChange={(e) => setProfileData({ ...profileData, last_name: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  ) : (
                    <p className="text-gray-900">{user?.last_name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <p className="text-gray-900">{user?.email}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                  {isEditingProfile ? (
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  ) : (
                    <p className="text-gray-900">{user?.phone || 'No especificado'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Número de Licencia</label>
                  {isEditingProfile ? (
                    <input
                      type="text"
                      value={profileData.license_number}
                      onChange={(e) => setProfileData({ ...profileData, license_number: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  ) : (
                    <p className="text-gray-900">{user?.license_number || 'No especificado'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Años de Experiencia</label>
                  {isEditingProfile ? (
                    <input
                      type="number"
                      value={profileData.years_of_experience}
                      onChange={(e) => setProfileData({ ...profileData, years_of_experience: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  ) : (
                    <p className="text-gray-900">{user?.years_of_experience ? `${user.years_of_experience} años` : 'No especificado'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nombre de la Embarcación</label>
                  {isEditingProfile ? (
                    <input
                      type="text"
                      value={profileData.boat_name}
                      onChange={(e) => setProfileData({ ...profileData, boat_name: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  ) : (
                    <p className="text-gray-900">{user?.boat_name || 'No especificado'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Capacidad de la Embarcación</label>
                  {isEditingProfile ? (
                    <input
                      type="number"
                      value={profileData.boat_capacity}
                      onChange={(e) => setProfileData({ ...profileData, boat_capacity: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  ) : (
                    <p className="text-gray-900">{user?.boat_capacity ? `${user.boat_capacity} personas` : 'No especificado'}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Biografía</label>
                  {isEditingProfile ? (
                    <textarea
                      value={profileData.bio}
                      onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                      rows={4}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Cuéntanos sobre tu experiencia como capitán..."
                    />
                  ) : (
                    <p className="text-gray-900">{user?.bio || 'No especificado'}</p>
                  )}
                </div>
              </div>

              {isEditingProfile && (
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setIsEditingProfile(false);
                      setProfileData({
                        first_name: user?.first_name || '',
                        last_name: user?.last_name || '',
                        phone: user?.phone || '',
                        license_number: user?.license_number || '',
                        years_of_experience: user?.years_of_experience || '',
                        bio: user?.bio || '',
                        boat_name: user?.boat_name || '',
                        boat_capacity: user?.boat_capacity || '',
                      });
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal de Ver Tour */}
      {viewingTour && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Detalles del Tour</h3>
              <button
                onClick={() => setViewingTour(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">{viewingTour.title}</h4>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Estado: </span>
                    {viewingTour.status === 'active' ? (
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                        Publicado
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                        Borrador
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Descripción Corta: </span>
                    <p className="text-sm text-gray-600 mt-1">{viewingTour.short_description}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Descripción Completa: </span>
                    <p className="text-sm text-gray-600 mt-1">{viewingTour.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Duración: </span>
                      <p className="text-sm text-gray-600">{viewingTour.duration_display}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Capacidad: </span>
                      <p className="text-sm text-gray-600">{viewingTour.capacity} personas</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Precio: </span>
                      <p className="text-sm text-gray-600">${viewingTour.price}</p>
                    </div>
                  </div>
                  {viewingTour.inclusions && viewingTour.inclusions.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-gray-700">Inclusiones: </span>
                      <ul className="list-disc list-inside mt-2 text-sm text-gray-600">
                        {viewingTour.inclusions.map((inc, idx) => (
                          <li key={idx}>{inc.description}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {viewingTour.requirements && viewingTour.requirements.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-gray-700">Requisitos: </span>
                      <ul className="list-disc list-inside mt-2 text-sm text-gray-600">
                        {viewingTour.requirements.map((req, idx) => (
                          <li key={idx}>{req.requirement}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setViewingTour(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => {
                    handleEditTour(viewingTour);
                    setViewingTour(null);
                  }}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                >
                  Editar Tour
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Creación/Edición de Tour */}
      {showTourForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">
                {editingTourId ? 'Editar Tour' : 'Crear Nuevo Tour'}
              </h3>
              <button
                onClick={() => {
                  setShowTourForm(false);
                  setEditingTourId(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Información Básica */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Información Básica</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Título del Tour</label>
                    <input
                      type="text"
                      value={tourFormData.title}
                      onChange={(e) => setTourFormData({ ...tourFormData, title: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Ej: Pesca Deportiva en Alta Mar"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Descripción Corta</label>
                    <input
                      type="text"
                      value={tourFormData.short_description}
                      onChange={(e) => setTourFormData({ ...tourFormData, short_description: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Breve descripción del tour"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Descripción Completa</label>
                    <textarea
                      value={tourFormData.description}
                      onChange={(e) => setTourFormData({ ...tourFormData, description: e.target.value })}
                      rows={4}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Describe los detalles del tour..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">País</label>
                      <select
                        value={tourFormData.country_id}
                        onChange={(e) => setTourFormData({ ...tourFormData, country_id: parseInt(e.target.value), zone_id: null })}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        required
                      >
                        <option value="">Seleccionar país...</option>
                        {countries.map((country) => (
                          <option key={country.id} value={country.id}>
                            {country.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Zona de Pesca</label>
                      <select
                        value={tourFormData.zone_id || ''}
                        onChange={(e) => setTourFormData({ ...tourFormData, zone_id: e.target.value ? parseInt(e.target.value) : null })}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        disabled={!tourFormData.country_id || zones.length === 0}
                      >
                        <option value="">Seleccionar zona...</option>
                        {zones.map((zone) => (
                          <option key={zone.id} value={zone.id}>
                            {zone.name} {zone.is_popular && '⭐'}
                          </option>
                        ))}
                      </select>
                      {zones.length === 0 && tourFormData.country_id && (
                        <p className="text-xs text-gray-500 mt-1">No hay zonas disponibles para este país</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Zona de Pesca</label>
                    <select
                      value={tourFormData.fishing_zone_id || ''}
                      onChange={(e) => setTourFormData({ ...tourFormData, fishing_zone_id: e.target.value ? parseInt(e.target.value) : null })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">Seleccionar tipo de zona...</option>
                      <option value="1">Río</option>
                      <option value="2">Lago</option>
                      <option value="3">Costera</option>
                      <option value="4">Altamar</option>
                      <option value="5">Estero</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Tipo de ambiente acuático donde se realiza la pesca</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Duración (horas)</label>
                      <input
                        type="number"
                        value={tourFormData.duration_hours}
                        onChange={(e) => setTourFormData({ ...tourFormData, duration_hours: parseFloat(e.target.value) })}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        min="1"
                        step="0.5"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Capacidad (personas)</label>
                      <input
                        type="number"
                        value={tourFormData.capacity}
                        onChange={(e) => setTourFormData({ ...tourFormData, capacity: parseInt(e.target.value) })}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        min="1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Precio ($)</label>
                      <input
                        type="number"
                        value={tourFormData.price}
                        onChange={(e) => setTourFormData({ ...tourFormData, price: parseFloat(e.target.value) })}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        min="0"
                        step="10"
                      />
                    </div>
                  </div>

                </div>
              </div>

              {/* Inclusiones */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">¿Qué Incluye?</h4>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newInclusion}
                      onChange={(e) => setNewInclusion(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addInclusion()}
                      className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Ej: Equipo de pesca completo"
                    />
                    <button
                      onClick={addInclusion}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                    >
                      Agregar
                    </button>
                  </div>
                  <div className="space-y-2">
                    {tourFormData.inclusions.map((inclusion, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-2">
                        <span className="text-sm text-gray-700">{inclusion}</span>
                        <button
                          onClick={() => removeInclusion(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>


              {/* Imagen Principal */}
              <div>
                <ImageUploader
                  mode="single"
                  label="Imagen Principal del Tour"
                  value={tourFormData.main_image_url}
                  onChange={(url) => setTourFormData({ ...tourFormData, main_image_url: url })}
                  maxSize={10}
                />
              </div>

              {/* Selector de Embarcación */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Embarcación</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Seleccionar Embarcación (Opcional)</label>
                    <select
                      value={tourFormData.boat_id || ''}
                      onChange={(e) => setTourFormData({ ...tourFormData, boat_id: e.target.value ? parseInt(e.target.value) : null })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">Sin embarcación asignada</option>
                      {boats.map((boat) => (
                        <option key={boat.id} value={boat.id}>
                          {boat.name} {boat.boat_type ? `(${boat.boat_type})` : ''} {boat.capacity ? `- ${boat.capacity} personas` : ''}
                        </option>
                      ))}
                    </select>
                    {boats.length === 0 && (
                      <p className="text-sm text-gray-500 mt-2">
                        No tienes embarcaciones registradas. <button onClick={() => setActiveTab('boats')} className="text-green-600 hover:underline">Ir a Embarcaciones</button>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Galería de Imágenes */}
              <div>
                <ImageUploader
                  mode="multiple"
                  label="Galería de Imágenes del Tour"
                  value={tourFormData.image_gallery}
                  onChange={(urls) => setTourFormData({ ...tourFormData, image_gallery: urls })}
                  maxSize={10}
                  maxFiles={20}
                />
                <p className="text-xs text-gray-500 mt-2">
                  Sube hasta 20 imágenes adicionales para mostrar en la galería del tour
                </p>
              </div>

              {/* Especies Objetivo */}
              <div>
                <TourSpeciesSelector
                  selectedSpecies={tourFormData.target_species}
                  onChange={(species) => setTourFormData({ ...tourFormData, target_species: species })}
                />
              </div>

              {/* Estilos de Pesca */}
              <div>
                <TourFishingStylesSelector
                  selectedStyles={tourFormData.fishing_styles}
                  onChange={(styles) => setTourFormData({ ...tourFormData, fishing_styles: styles })}
                />
              </div>

              {/* Servicios Adicionales */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Servicios Adicionales</h4>
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <select
                      value={newService.service_type}
                      onChange={(e) => setNewService({ ...newService, service_type: e.target.value })}
                      className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="pesca">Pesca</option>
                      <option value="hospedaje">Hospedaje</option>
                      <option value="transporte">Transporte</option>
                      <option value="equipo">Equipo</option>
                      <option value="alimentacion">Alimentación</option>
                      <option value="guia">Guía</option>
                    </select>
                    <input
                      type="text"
                      value={newService.name}
                      onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                      className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Nombre del servicio"
                    />
                    <input
                      type="text"
                      value={newService.description}
                      onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                      className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Descripción"
                    />
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={newService.cost}
                        onChange={(e) => setNewService({ ...newService, cost: e.target.value })}
                        className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Costo ($)"
                        min="0"
                      />
                      <button
                        onClick={addService}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {tourFormData.services.map((service, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
                        <div className="flex-grow">
                          <span className="text-sm font-medium text-gray-900">{service.name}</span>
                          {service.description && <p className="text-xs text-gray-600">{service.description}</p>}
                          <p className="text-xs text-green-600 font-medium mt-1">+${service.additional_cost}</p>
                        </div>
                        <button
                          onClick={() => removeService(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">Servicios extra que el cliente puede agregar por un costo adicional</p>
                </div>
              </div>

              {/* Exclusiones */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Exclusiones (Qué NO Incluye)</h4>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newExclusion}
                      onChange={(e) => setNewExclusion(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addExclusion()}
                      className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Ej: Transporte al puerto"
                    />
                    <button
                      onClick={addExclusion}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                      Agregar
                    </button>
                  </div>
                  <div className="space-y-2">
                    {tourFormData.exclusions.map((exclusion, index) => (
                      <div key={index} className="flex items-center justify-between bg-red-50 rounded-lg px-4 py-2">
                        <span className="text-sm text-gray-700">{exclusion}</span>
                        <button
                          onClick={() => removeExclusion(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowTourForm(false);
                    setEditingTourId(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateTour}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                >
                  {editingTourId ? 'Guardar Cambios' : 'Crear Tour'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
