'use client';
import { useState, useEffect } from 'react';
import { getFishingStyles } from '@/lib/api';

export default function TourFishingStylesSelector({ selectedStyles = [], onChange }) {
  const [allStyles, setAllStyles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedList, setSelectedList] = useState(selectedStyles);

  useEffect(() => {
    fetchFishingStyles();
  }, []);

  useEffect(() => {
    setSelectedList(selectedStyles);
  }, [selectedStyles]);

  const fetchFishingStyles = async () => {
    setLoading(true);
    try {
      const response = await getFishingStyles(true);
      if (response.success) {
        setAllStyles(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching fishing styles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStyle = (styleId) => {
    let updatedList;
    if (selectedList.includes(styleId)) {
      // Remover estilo
      updatedList = selectedList.filter(id => id !== styleId);
    } else {
      // Agregar estilo
      updatedList = [...selectedList, styleId];
    }

    setSelectedList(updatedList);
    if (onChange) onChange(updatedList);
  };

  const handleRemoveStyle = (styleId) => {
    const updatedList = selectedList.filter(id => id !== styleId);
    setSelectedList(updatedList);
    if (onChange) onChange(updatedList);
  };

  const isSelected = (styleId) => {
    return selectedList.includes(styleId);
  };

  const getStyleName = (styleId) => {
    const style = allStyles.find(s => s.id === styleId);
    return style ? style.name : '';
  };

  const getStyleIcon = (styleId) => {
    const style = allStyles.find(s => s.id === styleId);
    return style?.icon || '🎣';
  };

  const filteredStyles = allStyles.filter(style =>
    style.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (style.description && style.description.toLowerCase().includes(searchTerm.toLowerCase()))
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
        <h4 className="text-lg font-semibold text-gray-900 mb-1">Estilos de Pesca</h4>
        <p className="text-sm text-gray-600">Selecciona los estilos de pesca que se practican en este tour</p>
      </div>

      {/* Estilos Seleccionados */}
      {selectedList.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Estilos Seleccionados ({selectedList.length})
          </label>
          <div className="flex flex-wrap gap-2">
            {selectedList.map((styleId) => (
              <div
                key={styleId}
                className="inline-flex items-center gap-2 bg-green-100 border border-green-300 rounded-full px-4 py-2"
              >
                <span className="text-lg">{getStyleIcon(styleId)}</span>
                <span className="text-sm font-medium text-gray-900">
                  {getStyleName(styleId) || 'Estilo desconocido'}
                </span>
                <button
                  onClick={() => handleRemoveStyle(styleId)}
                  className="ml-1 text-green-700 hover:text-green-900 transition-colors"
                  title="Eliminar"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Búsqueda de Estilos */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Buscar y Agregar Estilos</label>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 mb-3"
          placeholder="Buscar por nombre de estilo..."
        />

        {/* Lista de Estilos Disponibles */}
        <div className="border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
          {filteredStyles.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {searchTerm ? 'No se encontraron estilos de pesca' : 'No hay estilos de pesca disponibles'}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2">
              {filteredStyles.map((style) => {
                const selected = isSelected(style.id);
                return (
                  <div
                    key={style.id}
                    className={`p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-all border-2 ${
                      selected ? 'bg-green-50 border-green-500' : 'bg-white border-gray-200'
                    }`}
                    onClick={() => handleToggleStyle(style.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-grow">
                        <div className="flex-shrink-0 text-2xl">
                          {style.icon || '🎣'}
                        </div>
                        <div className="min-w-0 flex-grow">
                          <h5 className="text-sm font-semibold text-gray-900">
                            {style.name}
                          </h5>
                          {style.description && (
                            <p className="text-xs text-gray-600 mt-0.5 line-clamp-1">
                              {style.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex-shrink-0 ml-2">
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

        {allStyles.length === 0 && !loading && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              No hay estilos de pesca registrados en el sistema. Contacta al administrador para agregar estilos.
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
            <p className="font-medium mb-1">Información sobre estilos de pesca:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Puedes seleccionar <strong>múltiples estilos</strong> de pesca para tu tour</li>
              <li>Los estilos seleccionados aparecerán en los filtros de búsqueda</li>
              <li>Esto ayuda a los clientes a encontrar el tipo de experiencia que buscan</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
