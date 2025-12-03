'use client';
import { useState } from 'react';

export default function TourMediaManager({ media = [], onChange }) {
  const [mediaList, setMediaList] = useState(media);
  const [showMediaForm, setShowMediaForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [mediaFormData, setMediaFormData] = useState({
    media_type: 'image',
    url: '',
    title: '',
    description: '',
    is_featured: false,
    thumbnail_url: '',
    duration_seconds: ''
  });

  const handleAddMedia = () => {
    if (!mediaFormData.url) {
      alert('La URL es requerida');
      return;
    }

    let updatedMedia;
    if (editingIndex !== null) {
      // Editar media existente
      updatedMedia = [...mediaList];
      updatedMedia[editingIndex] = { ...mediaFormData };
      setEditingIndex(null);
    } else {
      // Agregar nuevo media
      updatedMedia = [...mediaList, { ...mediaFormData }];
    }

    setMediaList(updatedMedia);
    if (onChange) onChange(updatedMedia);
    resetMediaForm();
    setShowMediaForm(false);
  };

  const handleEditMedia = (index) => {
    setMediaFormData(mediaList[index]);
    setEditingIndex(index);
    setShowMediaForm(true);
  };

  const handleDeleteMedia = (index) => {
    if (confirm('¿Estás seguro de que deseas eliminar este archivo?')) {
      const updatedMedia = mediaList.filter((_, i) => i !== index);
      setMediaList(updatedMedia);
      if (onChange) onChange(updatedMedia);
    }
  };

  const handleMoveUp = (index) => {
    if (index === 0) return;
    const updatedMedia = [...mediaList];
    [updatedMedia[index - 1], updatedMedia[index]] = [updatedMedia[index], updatedMedia[index - 1]];
    setMediaList(updatedMedia);
    if (onChange) onChange(updatedMedia);
  };

  const handleMoveDown = (index) => {
    if (index === mediaList.length - 1) return;
    const updatedMedia = [...mediaList];
    [updatedMedia[index], updatedMedia[index + 1]] = [updatedMedia[index + 1], updatedMedia[index]];
    setMediaList(updatedMedia);
    if (onChange) onChange(updatedMedia);
  };

  const resetMediaForm = () => {
    setMediaFormData({
      media_type: 'image',
      url: '',
      title: '',
      description: '',
      is_featured: false,
      thumbnail_url: '',
      duration_seconds: ''
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-900">Galería de Medios (Fotos y Videos)</h4>
          <p className="text-sm text-gray-600">Agrega fotos y videos de tu tour</p>
        </div>
        <button
          onClick={() => {
            resetMediaForm();
            setEditingIndex(null);
            setShowMediaForm(true);
          }}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors text-sm"
        >
          + Agregar Foto/Video
        </button>
      </div>

      {/* Lista de Medios */}
      {mediaList.length === 0 ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-600 text-sm">No hay fotos o videos agregados</p>
          <p className="text-gray-500 text-xs mt-1">Agrega fotos y videos para mostrar tu tour</p>
        </div>
      ) : (
        <div className="space-y-3">
          {mediaList.map((item, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                {/* Miniatura/Icono */}
                <div className="flex-shrink-0">
                  {item.media_type === 'image' ? (
                    item.url ? (
                      <img
                        src={item.url}
                        alt={item.title || 'Imagen'}
                        className="w-20 h-20 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"><rect fill="%23e5e7eb"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%239ca3af" font-family="sans-serif" font-size="14">Imagen</text></svg>';
                        }}
                      />
                    ) : (
                      <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )
                  ) : (
                    <div className="w-20 h-20 bg-red-100 rounded-lg flex items-center justify-center">
                      <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Información */}
                <div className="flex-grow min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-grow">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          item.media_type === 'image' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {item.media_type === 'image' ? '📷 Foto' : '🎥 Video'}
                        </span>
                        {item.is_featured && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                            ⭐ Destacado
                          </span>
                        )}
                      </div>
                      <h5 className="text-sm font-semibold text-gray-900 truncate">
                        {item.title || 'Sin título'}
                      </h5>
                      {item.description && (
                        <p className="text-xs text-gray-600 line-clamp-2 mt-1">{item.description}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1 truncate">{item.url}</p>
                      {item.media_type === 'video' && item.duration_seconds && (
                        <p className="text-xs text-gray-500 mt-1">
                          Duración: {Math.floor(item.duration_seconds / 60)}:{(item.duration_seconds % 60).toString().padStart(2, '0')} min
                        </p>
                      )}
                    </div>

                    {/* Botones de Orden */}
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Subir"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleMoveDown(index)}
                        disabled={index === mediaList.length - 1}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Bajar"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleEditMedia(index)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteMedia(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Eliminar"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Formulario */}
      {showMediaForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">
                {editingIndex !== null ? 'Editar Medio' : 'Agregar Foto/Video'}
              </h3>
              <button
                onClick={() => {
                  setShowMediaForm(false);
                  setEditingIndex(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Medio *</label>
                <select
                  value={mediaFormData.media_type}
                  onChange={(e) => setMediaFormData({ ...mediaFormData, media_type: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="image">📷 Foto</option>
                  <option value="video">🎥 Video</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">URL *</label>
                <input
                  type="url"
                  value={mediaFormData.url}
                  onChange={(e) => setMediaFormData({ ...mediaFormData, url: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder={mediaFormData.media_type === 'image' ? 'https://ejemplo.com/imagen.jpg' : 'https://youtube.com/watch?v=...'}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Título</label>
                <input
                  type="text"
                  value={mediaFormData.title}
                  onChange={(e) => setMediaFormData({ ...mediaFormData, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Ej: Pescando un marlín"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                <textarea
                  value={mediaFormData.description}
                  onChange={(e) => setMediaFormData({ ...mediaFormData, description: e.target.value })}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Describe esta foto o video..."
                />
              </div>

              {mediaFormData.media_type === 'video' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">URL de Miniatura</label>
                    <input
                      type="url"
                      value={mediaFormData.thumbnail_url}
                      onChange={(e) => setMediaFormData({ ...mediaFormData, thumbnail_url: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="https://ejemplo.com/miniatura.jpg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Duración (segundos)</label>
                    <input
                      type="number"
                      value={mediaFormData.duration_seconds}
                      onChange={(e) => setMediaFormData({ ...mediaFormData, duration_seconds: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Ej: 180 (para 3 minutos)"
                      min="1"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={mediaFormData.is_featured}
                    onChange={(e) => setMediaFormData({ ...mediaFormData, is_featured: e.target.checked })}
                    className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">Marcar como destacado</span>
                </label>
                <p className="text-xs text-gray-500 ml-8 mt-1">Los medios destacados aparecerán primero en el tour</p>
              </div>

              {/* Vista Previa */}
              {mediaFormData.url && mediaFormData.media_type === 'image' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Vista Previa</label>
                  <img
                    src={mediaFormData.url}
                    alt="Vista previa"
                    className="w-full h-48 object-cover rounded-lg border border-gray-200"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200"><rect fill="%23e5e7eb"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%239ca3af" font-family="sans-serif" font-size="16">Error al cargar imagen</text></svg>';
                    }}
                  />
                </div>
              )}

              {/* Botones de Acción */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowMediaForm(false);
                    setEditingIndex(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddMedia}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                >
                  {editingIndex !== null ? 'Guardar Cambios' : 'Agregar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
