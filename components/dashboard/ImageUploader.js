'use client';
import { useState, useRef } from 'react';
import Image from 'next/image';

export default function ImageUploader({
  mode = 'single', // 'single' or 'multiple'
  value = null, // For single: URL string, For multiple: array of URLs
  onChange,
  label = 'Subir Imagen',
  accept = 'image/jpeg,image/jpg,image/png,image/gif,image/webp',
  maxSize = 10, // MB
  maxFiles = 10
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (files) => {
    setError(null);

    // Validate files
    const fileArray = Array.from(files);

    // Check file count
    if (mode === 'multiple' && fileArray.length > maxFiles) {
      setError(`Máximo ${maxFiles} archivos permitidos`);
      return;
    }

    // Check file sizes
    for (const file of fileArray) {
      if (file.size > maxSize * 1024 * 1024) {
        setError(`El archivo ${file.name} excede el tamaño máximo de ${maxSize}MB`);
        return;
      }

      // Check file type
      if (!accept.split(',').some(type => file.type === type.trim())) {
        setError(`El archivo ${file.name} no es un formato válido`);
        return;
      }
    }

    setUploading(true);

    try {
      const token = localStorage.getItem('auth_token');

      if (mode === 'single') {
        // Upload single file
        const formData = new FormData();
        formData.append('image', fileArray[0]);

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload/single`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        const data = await response.json();

        if (response.ok && data.success) {
          onChange(data.data.url);
        } else {
          throw new Error(data.message || 'Error al subir la imagen');
        }

      } else {
        // Upload multiple files
        const formData = new FormData();
        fileArray.forEach(file => {
          formData.append('images', file);
        });

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload/multiple`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        const data = await response.json();

        if (response.ok && data.success) {
          const newUrls = data.data.map(img => img.url);
          const currentUrls = Array.isArray(value) ? value : [];
          onChange([...currentUrls, ...newUrls]);
        } else {
          throw new Error(data.message || 'Error al subir las imágenes');
        }
      }

    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'Error al subir archivos');
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files);
    }
  };

  const handleRemove = (urlToRemove) => {
    if (mode === 'single') {
      onChange(null);
    } else {
      const currentUrls = Array.isArray(value) ? value : [];
      onChange(currentUrls.filter(url => url !== urlToRemove));
    }
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  // Render for single mode
  if (mode === 'single') {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">{label}</label>

        {value ? (
          <div className="relative w-full h-64 rounded-lg overflow-hidden border-2 border-gray-200">
            <Image
              src={value}
              alt="Preview"
              fill
              className="object-cover"
            />
            <button
              type="button"
              onClick={() => handleRemove(value)}
              className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors shadow-lg"
              title="Eliminar imagen"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              dragActive ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-gray-400'
            } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={openFilePicker}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept={accept}
              onChange={handleChange}
              disabled={uploading}
            />

            {uploading ? (
              <div className="space-y-2">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                <p className="text-sm text-gray-600">Subiendo imagen...</p>
              </div>
            ) : (
              <div className="space-y-2">
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="text-sm text-gray-600">
                  <p className="font-medium">Haz clic para subir o arrastra aquí</p>
                  <p className="text-xs mt-1">PNG, JPG, GIF, WEBP hasta {maxSize}MB</p>
                </div>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
            {error}
          </div>
        )}
      </div>
    );
  }

  // Render for multiple mode
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">{label}</label>

      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          dragActive ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-gray-400'
        } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFilePicker}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={accept}
          onChange={handleChange}
          disabled={uploading}
          multiple
        />

        {uploading ? (
          <div className="space-y-2">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600 mx-auto"></div>
            <p className="text-sm text-gray-600">Subiendo imágenes...</p>
          </div>
        ) : (
          <div className="space-y-2">
            <svg className="mx-auto h-10 w-10 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="text-sm text-gray-600">
              <p className="font-medium">Agregar más imágenes</p>
              <p className="text-xs mt-1">Hasta {maxFiles} imágenes, {maxSize}MB cada una</p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
          {error}
        </div>
      )}

      {/* Image Grid */}
      {Array.isArray(value) && value.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {value.map((url, index) => (
            <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border-2 border-gray-200">
              <Image
                src={url}
                alt={`Image ${index + 1}`}
                fill
                className="object-cover"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(url);
                }}
                className="absolute top-1 right-1 bg-red-600 text-white p-1.5 rounded-full hover:bg-red-700 transition-colors opacity-0 group-hover:opacity-100 shadow-lg"
                title="Eliminar"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
