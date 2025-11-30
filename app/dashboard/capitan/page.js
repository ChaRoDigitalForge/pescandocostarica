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

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    } else if (!authLoading && !isCapitan) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isCapitan, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated && isCapitan) {
      fetchDashboardData();
      fetchNotifications();
    }
  }, [isAuthenticated, isCapitan]);

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

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');

      const [statsResponse, bookingsResponse, toursResponse] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/captain/statistics`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/captain/bookings?limit=100`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/captain/tours`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStatistics(statsData.data);
      }

      if (bookingsResponse.ok) {
        const bookingsData = await bookingsResponse.json();
        setBookings(bookingsData.data || []);
      }

      if (toursResponse.ok) {
        const toursData = await toursResponse.json();
        setTours(toursData.data || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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
              <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors">
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
                  <button className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors">
                    Crear Tu Primer Tour
                  </button>
                </div>
              ) : (
                tours.map((tour) => (
                  <div key={tour.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    <div className="h-48 bg-gray-200">
                      {tour.main_image_url && (
                        <img src={tour.main_image_url} alt={tour.title} className="w-full h-full object-cover" />
                      )}
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

                      <div className="flex gap-2">
                        <button className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors">
                          Editar
                        </button>
                        <button className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors">
                          Ver
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
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
    </div>
  );
}
