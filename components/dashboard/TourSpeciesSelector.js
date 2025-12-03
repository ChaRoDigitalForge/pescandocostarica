'use client';
import { useState, useEffect } from 'react';

export default function TourSpeciesSelector({ selectedSpecies = [], onChange }) {
  const [allSpecies, setAllSpecies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedList, setSelectedList] = useState(selectedSpecies);

  useEffect(() => {
    fetchFishSpecies();
  }, []);

  const fetchFishSpecies = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/captain/fish-species`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setAllSpecies(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching fish species:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSpecies = (species) => {
    let updatedList;
    const existingIndex = selectedList.findIndex(s => s.species_id === species.id);

    if (existingIndex >= 0) {
      // Remover especie
      updatedList = selectedList.filter(s => s.species_id !== species.id);
    } else {
      // Agregar especie
      updatedList = [...selectedList, {
        species_id: species.id,
        is_primary: selectedList.length === 0, // Primera especie es primaria por defecto
        species_name: species.name // Guardamos el nombre para mostrar
      }];
    }

    setSelectedList(updatedList);
    if (onChange) onChange(updatedList);
  };

  const handleSetPrimary = (speciesId) => {
    const updatedList = selectedList.map(s => ({
      ...s,
      is_primary: s.species_id === speciesId
    }));
    setSelectedList(updatedList);
    if (onChange) onChange(updatedList);
  };

  const handleRemoveSpecies = (speciesId) => {
    const updatedList = selectedList.filter(s => s.species_id !== speciesId);
    // Si removemos la especie primaria, hacer que la primera sea primaria
    if (updatedList.length > 0 && !updatedList.some(s => s.is_primary)) {
      updatedList[0].is_primary = true;
    }
    setSelectedList(updatedList);
    if (onChange) onChange(updatedList);
  };

  const isSelected = (speciesId) => {
    return selectedList.some(s => s.species_id === speciesId);
  };

  const getSpeciesName = (speciesId) => {
    const species = allSpecies.find(s => s.id === speciesId);
    return species ? species.name : '';
  };

  const filteredSpecies = allSpecies.filter(species =>
    species.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (species.scientific_name && species.scientific_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-1">Especies Objetivo</h4>
        <p className="text-sm text-gray-600">Selecciona las especies de peces que se pueden capturar en este tour</p>
      </div>

      {/* Especies Seleccionadas */}
      {selectedList.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Especies Seleccionadas ({selectedList.length})
          </label>
          <div className="space-y-2">
            {selectedList.map((selected, index) => (
              <div
                key={selected.species_id}
                className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-4 py-3"
              >
                <div className="flex items-center gap-3 flex-grow">
                  <span className="text-2xl">🐟</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">
                        {getSpeciesName(selected.species_id) || selected.species_name || 'Especie desconocida'}
                      </span>
                      {selected.is_primary && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                          ⭐ Principal
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {!selected.is_primary && selectedList.length > 1 && (
                    <button
                      onClick={() => handleSetPrimary(selected.species_id)}
                      className="px-3 py-1 text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded-lg transition-colors"
                      title="Marcar como principal"
                    >
                      Marcar Principal
                    </button>
                  )}
                  <button
                    onClick={() => handleRemoveSpecies(selected.species_id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Eliminar"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Búsqueda de Especies */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Buscar y Agregar Especies</label>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 mb-3"
          placeholder="Buscar por nombre de especie..."
        />

        {/* Lista de Especies Disponibles */}
        <div className="border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
          {filteredSpecies.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {searchTerm ? 'No se encontraron especies' : 'No hay especies disponibles'}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredSpecies.map((species) => {
                const selected = isSelected(species.id);
                return (
                  <div
                    key={species.id}
                    className={`p-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                      selected ? 'bg-green-50' : ''
                    }`}
                    onClick={() => handleToggleSpecies(species)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-grow">
                        <div className="flex-shrink-0">
                          {species.image_url ? (
                            <img
                              src={species.image_url}
                              alt={species.name}
                              className="w-12 h-12 object-cover rounded-lg"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div
                            className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center"
                            style={{ display: species.image_url ? 'none' : 'flex' }}
                          >
                            <span className="text-2xl">🐟</span>
                          </div>
                        </div>
                        <div className="min-w-0 flex-grow">
                          <h5 className="text-sm font-semibold text-gray-900">
                            {species.name}
                          </h5>
                          {species.scientific_name && (
                            <p className="text-xs text-gray-500 italic">{species.scientific_name}</p>
                          )}
                          {species.common_names && species.common_names.length > 0 && (
                            <p className="text-xs text-gray-600 mt-1">
                              También: {species.common_names.join(', ')}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        {selected ? (
                          <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {allSpecies.length === 0 && !loading && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              No hay especies de peces registradas en el sistema. Contacta al administrador para agregar especies.
            </p>
          </div>
        )}
      </div>

      {/* Nota Informativa */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex gap-2">
          <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Información sobre especies:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>La <strong>especie principal</strong> será destacada en el listado del tour</li>
              <li>Puedes seleccionar múltiples especies objetivo</li>
              <li>El orden no afecta la visualización (excepto la especie principal)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
