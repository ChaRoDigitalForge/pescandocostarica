'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import StatCard from '@/components/dashboard/StatCard';
import SimpleBarChart from '@/components/dashboard/SimpleBarChart';
import NotificationCenter from '@/components/dashboard/NotificationCenter';

export default function PescadorDashboard() {
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [statistics, setStatistics] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [points, setPoints] = useState(0);
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [notifications, setNotifications] = useState([]);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({});

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchDashboardData();
      fetchNotifications();
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (user) {
      setProfileData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone: user.phone || '',
        bio: user.bio || '',
      });
    }
  }, [user]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');

      // Mock data - Replace with actual API calls
      setStatistics({
        overview: {
          total_bookings: 15,
          completed_bookings: 12,
          upcoming_bookings: 3,
          total_spent: 4500,
          points: 1250,
          level: 'Gold'
        }
      });

      setBookings([
        {
          id: 1,
          booking_number: 'BK001',
          tour_title: 'Tour de Pesca Deportiva',
          captain_name: 'Carlos Rodríguez',
          booking_date: '2025-12-15',
          status: 'confirmed',
          number_of_people: 2,
          total_amount: 350,
          points_earned: 70
        },
        {
          id: 2,
          booking_number: 'BK002',
          tour_title: 'Pesca Costera',
          captain_name: 'Juan Pérez',
          booking_date: '2025-12-20',
          status: 'pending',
          number_of_people: 4,
          total_amount: 600,
          points_earned: 120
        }
      ]);

      setPoints(1250);

      setRewards([
        {
          id: 1,
          name: 'Caña de Pescar Premium',
          description: 'Caña de pescar profesional de alta calidad',
          points_cost: 2000,
          image_url: null,
          category: 'Equipo',
          available: true
        },
        {
          id: 2,
          name: '10% Descuento en Próximo Tour',
          description: 'Descuento del 10% en tu próxima reservación',
          points_cost: 500,
          image_url: null,
          category: 'Descuentos',
          available: true
        },
        {
          id: 3,
          name: 'Kit de Señuelos',
          description: 'Set de 10 señuelos variados para diferentes especies',
          points_cost: 800,
          image_url: null,
          category: 'Equipo',
          available: true
        },
        {
          id: 4,
          name: 'Gorra Pescando Costa Rica',
          description: 'Gorra oficial con protección UV',
          points_cost: 300,
          image_url: null,
          category: 'Merchandising',
          available: true
        },
        {
          id: 5,
          name: 'Tour Gratis',
          description: 'Un tour de pesca completamente gratis',
          points_cost: 3000,
          image_url: null,
          category: 'Tours',
          available: true
        }
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    setNotifications([
      {
        id: 1,
        type: 'booking',
        title: 'Reserva Confirmada',
        message: 'Tu reserva para "Tour de Pesca Deportiva" ha sido confirmada',
        timestamp: new Date().toISOString(),
        read: false
      },
      {
        id: 2,
        type: 'points',
        title: 'Puntos Ganados',
        message: 'Has ganado 70 puntos por completar tu último tour',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        read: false
      }
    ]);
  };

  const handleProfileUpdate = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      // Add API call here
      alert('Perfil actualizado exitosamente');
      setIsEditingProfile(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error al actualizar el perfil');
    }
  };

  const redeemReward = async (rewardId, pointsCost) => {
    if (points >= pointsCost) {
      if (window.confirm('¿Estás seguro de que quieres canjear esta recompensa?')) {
        try {
          // Add API call here
          setPoints(points - pointsCost);
          alert('¡Recompensa canjeada exitosamente!');
        } catch (error) {
          console.error('Error redeeming reward:', error);
          alert('Error al canjear la recompensa');
        }
      }
    } else {
      alert('No tienes suficientes puntos para esta recompensa');
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

  const getLevelBadge = (level) => {
    const badges = {
      Bronze: { bg: 'bg-orange-100', text: 'text-orange-800', icon: '🥉' },
      Silver: { bg: 'bg-gray-100', text: 'text-gray-800', icon: '🥈' },
      Gold: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: '🥇' },
      Platinum: { bg: 'bg-purple-100', text: 'text-purple-800', icon: '💎' }
    };

    const badge = badges[level] || badges.Bronze;

    return (
      <span className={`px-4 py-2 rounded-full text-sm font-semibold ${badge.bg} ${badge.text} flex items-center gap-2`}>
        <span>{badge.icon}</span>
        {level}
      </span>
    );
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
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
              <h1 className="text-xl font-bold text-gray-900">Mi Dashboard</h1>
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
                <div className="text-xs text-gray-500">{points} puntos</div>
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
              { id: 'bookings', label: 'Mis Reservas', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
              { id: 'points', label: 'Mis Puntos', icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' },
              { id: 'rewards', label: 'Recompensas', icon: 'M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7' },
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
                    ¡Bienvenido, {user?.first_name}! 🎣
                  </h2>
                  <p className="text-green-50">
                    Aquí está el resumen de tu actividad y próximas aventuras
                  </p>
                </div>
                <div className="hidden md:block">
                  <div className="text-right">
                    <p className="text-sm text-green-100">Tu nivel</p>
                    <div className="mt-2">
                      {getLevelBadge(statistics.overview.level)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Reservas"
                value={statistics.overview.total_bookings}
                subtitle={`${statistics.overview.completed_bookings} completadas`}
                icon="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                bgColor="bg-green-100"
                iconColor="text-green-600"
              />

              <StatCard
                title="Próximas Reservas"
                value={statistics.overview.upcoming_bookings}
                subtitle="Confirmadas"
                icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                bgColor="bg-blue-100"
                iconColor="text-blue-600"
              />

              <StatCard
                title="Mis Puntos"
                value={statistics.overview.points}
                subtitle="Puntos disponibles"
                icon="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                bgColor="bg-yellow-100"
                iconColor="text-yellow-600"
              />

              <StatCard
                title="Total Gastado"
                value={`$${parseFloat(statistics.overview.total_spent).toLocaleString()}`}
                subtitle="En tours de pesca"
                icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                bgColor="bg-green-100"
                iconColor="text-green-600"
              />
            </div>

            {/* Main Content Grid */}
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
                      Próximas Reservas
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
                          <h3 className="font-medium text-gray-900">{booking.tour_title}</h3>
                          <p className="text-sm text-gray-600">
                            Capitán: {booking.captain_name} - {booking.number_of_people} persona(s)
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
                          {booking.status === 'completed' && (
                            <p className="text-xs text-yellow-600 mt-1">
                              +{booking.points_earned} puntos
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                    {bookings.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p>No tienes reservas próximas</p>
                        <Link href="/tours" className="mt-3 inline-block text-sm text-green-600 hover:text-green-700 font-medium">
                          Explorar tours →
                        </Link>
                      </div>
                    )}
                  </div>
                </div>

                {/* Points Progress */}
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Progreso de Puntos</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-3xl font-bold text-yellow-600">{points}</p>
                        <p className="text-sm text-gray-600">Puntos disponibles</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Próximo nivel</p>
                        <p className="text-lg font-bold text-gray-900">2000 puntos</p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${(points / 2000) * 100}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Nivel {statistics.overview.level}</span>
                      <span>{2000 - points} puntos para Platinum</span>
                    </div>
                  </div>
                </div>

                {/* Top Rewards Preview */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                      </svg>
                      Recompensas Destacadas
                    </h2>
                    <button
                      onClick={() => setActiveTab('rewards')}
                      className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1"
                    >
                      Ver todas
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {rewards.slice(0, 3).map((reward) => (
                      <div key={reward.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="bg-gray-100 rounded-lg h-24 mb-3 flex items-center justify-center">
                          <span className="text-4xl">🎁</span>
                        </div>
                        <h3 className="font-medium text-gray-900 mb-1 line-clamp-1">{reward.name}</h3>
                        <p className="text-xs text-gray-500 mb-2 line-clamp-2">{reward.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-yellow-600">{reward.points_cost} pts</span>
                          <button
                            onClick={() => redeemReward(reward.id, reward.points_cost)}
                            disabled={points < reward.points_cost}
                            className={`text-xs px-3 py-1 rounded-lg font-medium ${
                              points >= reward.points_cost
                                ? 'bg-green-600 text-white hover:bg-green-700'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            Canjear
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column - Quick Actions */}
              <div className="space-y-6">
                {/* Quick Actions */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4">Acciones Rápidas</h3>
                  <div className="space-y-3">
                    <Link
                      href="/tours"
                      className="w-full flex items-center gap-3 p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                    >
                      <div className="bg-green-600 text-white p-2 rounded-lg">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium text-gray-900">Buscar Tours</p>
                        <p className="text-xs text-gray-500">Encuentra tu próxima aventura</p>
                      </div>
                    </Link>

                    <button
                      onClick={() => setActiveTab('bookings')}
                      className="w-full flex items-center gap-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-left"
                    >
                      <div className="bg-blue-600 text-white p-2 rounded-lg">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Mis Reservas</p>
                        <p className="text-xs text-gray-500">{statistics.overview.upcoming_bookings} próximas</p>
                      </div>
                    </button>

                    <button
                      onClick={() => setActiveTab('points')}
                      className="w-full flex items-center gap-3 p-3 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors text-left"
                    >
                      <div className="bg-yellow-600 text-white p-2 rounded-lg">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Mis Puntos</p>
                        <p className="text-xs text-gray-500">{points} disponibles</p>
                      </div>
                    </button>

                    <button
                      onClick={() => setActiveTab('rewards')}
                      className="w-full flex items-center gap-3 p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-left"
                    >
                      <div className="bg-purple-600 text-white p-2 rounded-lg">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Recompensas</p>
                        <p className="text-xs text-gray-500">Canjea tus puntos</p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Points Earning Info */}
                <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl shadow-sm p-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4">¿Cómo Ganar Puntos?</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="bg-green-600 text-white p-1.5 rounded-lg mt-0.5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Completa un Tour</p>
                        <p className="text-xs text-gray-500">20% del valor en puntos</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-green-600 text-white p-1.5 rounded-lg mt-0.5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Deja una Reseña</p>
                        <p className="text-xs text-gray-500">50 puntos por reseña</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-green-600 text-white p-1.5 rounded-lg mt-0.5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Refiere un Amigo</p>
                        <p className="text-xs text-gray-500">200 puntos por referido</p>
                      </div>
                    </div>
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
              <h2 className="text-2xl font-bold text-gray-900">Mis Reservas</h2>
              <Link
                href="/tours"
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
              >
                + Nueva Reserva
              </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tour</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capitán</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Personas</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Puntos</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{booking.tour_title}</div>
                        <div className="text-xs text-gray-500">#{booking.booking_number}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {booking.captain_name}
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
                        {booking.status === 'completed' ? (
                          <span className="text-yellow-600 font-medium">+{booking.points_earned}</span>
                        ) : (
                          <span className="text-gray-400">Pendiente</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Points Tab */}
        {activeTab === 'points' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Sistema de Puntos</h2>

            {/* Points Balance */}
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl shadow-lg p-8 text-white">
              <div className="text-center">
                <p className="text-sm text-yellow-100 mb-2">Balance Total de Puntos</p>
                <p className="text-5xl font-bold mb-4">{points}</p>
                <div className="flex items-center justify-center gap-2">
                  {getLevelBadge(statistics?.overview.level || 'Bronze')}
                </div>
              </div>
            </div>

            {/* Points History */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Historial de Puntos</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Tour Completado</p>
                      <p className="text-sm text-gray-500">Tour de Pesca Deportiva</p>
                      <p className="text-xs text-gray-400">15 de Dic, 2025</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-green-600">+70</span>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Reseña Publicada</p>
                      <p className="text-sm text-gray-500">Tour de Pesca Costera</p>
                      <p className="text-xs text-gray-400">10 de Dic, 2025</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-green-600">+50</span>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="bg-red-100 p-2 rounded-lg">
                      <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Recompensa Canjeada</p>
                      <p className="text-sm text-gray-500">Gorra Pescando Costa Rica</p>
                      <p className="text-xs text-gray-400">5 de Dic, 2025</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-red-600">-300</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Rewards Tab */}
        {activeTab === 'rewards' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Catálogo de Recompensas</h2>
                <p className="text-gray-600 mt-1">Tienes {points} puntos disponibles</p>
              </div>
            </div>

            {/* Rewards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rewards.map((reward) => (
                <div key={reward.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <div className="bg-gradient-to-br from-green-100 to-blue-100 h-48 flex items-center justify-center">
                    <span className="text-6xl">🎁</span>
                  </div>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{reward.name}</h3>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-semibold">
                        {reward.category}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">{reward.description}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-xl font-bold text-gray-900">{reward.points_cost}</span>
                        <span className="text-sm text-gray-500">puntos</span>
                      </div>
                      <button
                        onClick={() => redeemReward(reward.id, reward.points_cost)}
                        disabled={points < reward.points_cost}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          points >= reward.points_cost
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {points >= reward.points_cost ? 'Canjear' : 'Insuficiente'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Mi Perfil</h2>
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

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sobre mí</label>
                  {isEditingProfile ? (
                    <textarea
                      value={profileData.bio}
                      onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                      rows={4}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Cuéntanos sobre ti y tu pasión por la pesca..."
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
                        bio: user?.bio || '',
                      });
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>

            {/* Account Stats */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Estadísticas de la Cuenta</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-3xl font-bold text-green-600">{statistics?.overview.total_bookings || 0}</p>
                  <p className="text-sm text-gray-600 mt-1">Total Reservas</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-3xl font-bold text-blue-600">{statistics?.overview.completed_bookings || 0}</p>
                  <p className="text-sm text-gray-600 mt-1">Completadas</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <p className="text-3xl font-bold text-yellow-600">{points}</p>
                  <p className="text-sm text-gray-600 mt-1">Puntos</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-3xl font-bold text-purple-600">{statistics?.overview.level || 'Bronze'}</p>
                  <p className="text-sm text-gray-600 mt-1">Nivel</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
