'use client';
import { useState, useEffect } from 'react';

export default function BoatsManager({ onBoatCreated }) {
  const [boats, setBoats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBoatForm, setShowBoatForm] = useState(false);
  const [editingBoatId, setEditingBoatId] = useState(null);
  const [boatFormData, setBoatFormData] = useState({
    name: '',
    boat_type: '',
    length_feet: '',
    capacity: '',
    year: '',
    manufacturer: '',
    model: '',
    engine_type: '',
    engine_horsepower: '',
    has_bathroom: false,
    has_cabin: false,
    has_fishing_gear: true,
    has_gps: false,
    has_fish_finder: false,
    has_radio: false,
    has_life_jackets: true,
    description: '',
    image_url: '',
    registration_number: '',
    insurance_valid_until: ''
  });

  useEffect(() => {
    fetchBoats();
  }, []);

  const fetchBoats = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/captain/boats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setBoats(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching boats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBoat = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const url = editingBoatId
        ? `${process.env.NEXT_PUBLIC_API_URL}/captain/boats/${editingBoatId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/captain/boats`;

      const method = editingBoatId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(boatFormData)
      });

      if (response.ok) {
        alert(editingBoatId ? 'Embarcación actualizada exitosamente' : 'Embarcación creada exitosamente');
        setShowBoatForm(false);
        setEditingBoatId(null);
        resetBoatForm();
        fetchBoats();
        if (onBoatCreated) onBoatCreated();
      } else {
        const errorData = await response.json();
        alert(`Error al ${editingBoatId ? 'actualizar' : 'crear'} la embarcación: ${errorData.message || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error saving boat:', error);
      alert('Error al guardar la embarcación');
    }
  };

  const handleEditBoat = (boat) => {
    setBoatFormData(boat);
    setEditingBoatId(boat.id);
    setShowBoatForm(true);
  };

  const handleDeleteBoat = async (boatId) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta embarcación?')) return;

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/captain/boats/${boatId}`,
        {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.ok) {
        alert('Embarcación eliminada exitosamente');
        fetchBoats();
      } else {
        alert('Error al eliminar la embarcación');
      }
    } catch (error) {
      console.error('Error deleting boat:', error);
      alert('Error al eliminar la embarcación');
    }
  };

  const resetBoatForm = () => {
    setBoatFormData({
      name: '',
      boat_type: '',
      length_feet: '',
      capacity: '',
      year: '',
      manufacturer: '',
      model: '',
      engine_type: '',
      engine_horsepower: '',
      has_bathroom: false,
      has_cabin: false,
      has_fishing_gear: true,
      has_gps: false,
      has_fish_finder: false,
      has_radio: false,
      has_life_jackets: true,
      description: '',
      image_url: '',
      registration_number: '',
      insurance_valid_until: ''
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Mis Embarcaciones</h2>
        <button
          onClick={() => {
            resetBoatForm();
            setEditingBoatId(null);
            setShowBoatForm(true);
          }}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
        >
          + Nueva Embarcación
        </button>
      </div>

      {/* Lista de Embarcaciones */}
      {boats.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No tienes embarcaciones registradas</h3>
          <p className="text-gray-600 mb-6">Agrega tu primera embarcación para comenzar</p>
          <button
            onClick={() => {
              resetBoatForm();
              setEditingBoatId(null);
              setShowBoatForm(true);
            }}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
          >
            Agregar Embarcación
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {boats.map((boat) => (
            <div key={boat.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              {boat.image_url && (
                <div className="h-48 bg-gray-200">
                  <img
                    src={boat.image_url}
                    alt={boat.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{boat.name}</h3>

                {boat.boat_type && (
                  <p className="text-sm text-gray-600 mb-3">{boat.boat_type}</p>
                )}

                <div className="space-y-2 mb-4">
                  {boat.manufacturer && boat.model && (
                    <div className="flex items-center text-sm text-gray-700">
                      <span className="font-medium mr-2">Modelo:</span>
                      <span>{boat.manufacturer} {boat.model} {boat.year ? `(${boat.year})` : ''}</span>
                    </div>
                  )}

                  {boat.length_feet && (
                    <div className="flex items-center text-sm text-gray-700">
                      <span className="font-medium mr-2">Longitud:</span>
                      <span>{boat.length_feet} pies</span>
                    </div>
                  )}

                  {boat.capacity && (
                    <div className="flex items-center text-sm text-gray-700">
                      <span className="font-medium mr-2">Capacidad:</span>
                      <span>{boat.capacity} personas</span>
                    </div>
                  )}

                  {boat.engine_type && boat.engine_horsepower && (
                    <div className="flex items-center text-sm text-gray-700">
                      <span className="font-medium mr-2">Motor:</span>
                      <span>{boat.engine_type} - {boat.engine_horsepower} HP</span>
                    </div>
                  )}
                </div>

                {/* Características */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {boat.has_fishing_gear && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      🎣 Equipo de pesca
                    </span>
                  )}
                  {boat.has_gps && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      🛰️ GPS
                    </span>
                  )}
                  {boat.has_fish_finder && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      🐟 Fish Finder
                    </span>
                  )}
                  {boat.has_bathroom && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      🚽 Baño
                    </span>
                  )}
                  {boat.has_cabin && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      🏠 Cabina
                    </span>
                  )}
                </div>

                {/* Acciones */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditBoat(boat)}
                    className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeleteBoat(boat.id)}
                    className="flex-1 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-medium transition-colors"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Formulario de Embarcación */}
      {showBoatForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">
                {editingBoatId ? 'Editar Embarcación' : 'Nueva Embarcación'}
              </h3>
              <button
                onClick={() => {
                  setShowBoatForm(false);
                  setEditingBoatId(null);
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nombre de la Embarcación *</label>
                    <input
                      type="text"
                      value={boatFormData.name}
                      onChange={(e) => setBoatFormData({ ...boatFormData, name: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Ej: El Aventurero"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Embarcación</label>
                    <select
                      value={boatFormData.boat_type}
                      onChange={(e) => setBoatFormData({ ...boatFormData, boat_type: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">Seleccionar...</option>
                      <option value="Lancha">Lancha</option>
                      <option value="Yate">Yate</option>
                      <option value="Bote">Bote</option>
                      <option value="Panga">Panga</option>
                      <option value="Catamarán">Catamarán</option>
                      <option value="Velero">Velero</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Longitud (pies)</label>
                    <input
                      type="number"
                      value={boatFormData.length_feet}
                      onChange={(e) => setBoatFormData({ ...boatFormData, length_feet: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Ej: 30"
                      min="1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Capacidad (personas)</label>
                    <input
                      type="number"
                      value={boatFormData.capacity}
                      onChange={(e) => setBoatFormData({ ...boatFormData, capacity: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Ej: 6"
                      min="1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Año</label>
                    <input
                      type="number"
                      value={boatFormData.year}
                      onChange={(e) => setBoatFormData({ ...boatFormData, year: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Ej: 2020"
                      min="1900"
                      max={new Date().getFullYear() + 1}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fabricante</label>
                    <input
                      type="text"
                      value={boatFormData.manufacturer}
                      onChange={(e) => setBoatFormData({ ...boatFormData, manufacturer: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Ej: Boston Whaler"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Modelo</label>
                    <input
                      type="text"
                      value={boatFormData.model}
                      onChange={(e) => setBoatFormData({ ...boatFormData, model: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Ej: Outrage 330"
                    />
                  </div>
                </div>
              </div>

              {/* Motor */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Motor</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Motor</label>
                    <select
                      value={boatFormData.engine_type}
                      onChange={(e) => setBoatFormData({ ...boatFormData, engine_type: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">Seleccionar...</option>
                      <option value="Fuera de borda">Fuera de borda</option>
                      <option value="Intraborda">Intraborda</option>
                      <option value="Intraborda/Fuera de borda">Intraborda/Fuera de borda</option>
                      <option value="Jet">Jet</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Potencia (HP)</label>
                    <input
                      type="number"
                      value={boatFormData.engine_horsepower}
                      onChange={(e) => setBoatFormData({ ...boatFormData, engine_horsepower: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Ej: 300"
                      min="1"
                    />
                  </div>
                </div>
              </div>

              {/* Equipamiento */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Equipamiento y Características</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={boatFormData.has_fishing_gear}
                      onChange={(e) => setBoatFormData({ ...boatFormData, has_fishing_gear: e.target.checked })}
                      className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-700">Equipo de Pesca</span>
                  </label>

                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={boatFormData.has_gps}
                      onChange={(e) => setBoatFormData({ ...boatFormData, has_gps: e.target.checked })}
                      className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-700">GPS</span>
                  </label>

                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={boatFormData.has_fish_finder}
                      onChange={(e) => setBoatFormData({ ...boatFormData, has_fish_finder: e.target.checked })}
                      className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-700">Fish Finder</span>
                  </label>

                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={boatFormData.has_radio}
                      onChange={(e) => setBoatFormData({ ...boatFormData, has_radio: e.target.checked })}
                      className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-700">Radio</span>
                  </label>

                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={boatFormData.has_bathroom}
                      onChange={(e) => setBoatFormData({ ...boatFormData, has_bathroom: e.target.checked })}
                      className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-700">Baño</span>
                  </label>

                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={boatFormData.has_cabin}
                      onChange={(e) => setBoatFormData({ ...boatFormData, has_cabin: e.target.checked })}
                      className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-700">Cabina</span>
                  </label>

                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={boatFormData.has_life_jackets}
                      onChange={(e) => setBoatFormData({ ...boatFormData, has_life_jackets: e.target.checked })}
                      className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-700">Chalecos Salvavidas</span>
                  </label>
                </div>
              </div>

              {/* Información Adicional */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Información Adicional</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                    <textarea
                      value={boatFormData.description}
                      onChange={(e) => setBoatFormData({ ...boatFormData, description: e.target.value })}
                      rows={3}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Describe las características especiales de tu embarcación..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">URL de Imagen</label>
                    <input
                      type="url"
                      value={boatFormData.image_url}
                      onChange={(e) => setBoatFormData({ ...boatFormData, image_url: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="https://ejemplo.com/imagen.jpg"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Número de Registro</label>
                      <input
                        type="text"
                        value={boatFormData.registration_number}
                        onChange={(e) => setBoatFormData({ ...boatFormData, registration_number: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Ej: CR-12345"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Seguro Válido Hasta</label>
                      <input
                        type="date"
                        value={boatFormData.insurance_valid_until}
                        onChange={(e) => setBoatFormData({ ...boatFormData, insurance_valid_until: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowBoatForm(false);
                    setEditingBoatId(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveBoat}
                  disabled={!boatFormData.name}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {editingBoatId ? 'Guardar Cambios' : 'Crear Embarcación'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
