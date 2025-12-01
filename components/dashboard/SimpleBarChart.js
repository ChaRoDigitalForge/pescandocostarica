'use client';
import { useState } from 'react';

export default function SimpleBarChart({ data, title, height = 300 }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-4">{title}</h3>
        <div className="flex items-center justify-center h-64 text-gray-400">
          <p>No hay datos disponibles</p>
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-bold text-gray-900 mb-6">{title}</h3>
      <div className="flex items-end justify-between gap-2" style={{ height: `${height}px` }}>
        {data.map((item, index) => {
          const barHeight = (item.value / maxValue) * 100;
          const isHovered = hoveredIndex === index;

          return (
            <div
              key={index}
              className="flex-1 flex flex-col items-center gap-2"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className="w-full flex flex-col items-center justify-end" style={{ height: '100%' }}>
                {isHovered && (
                  <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded mb-2 whitespace-nowrap">
                    {item.value} {item.unit || ''}
                  </div>
                )}
                <div
                  className={`w-full rounded-t-lg transition-all duration-300 ${
                    isHovered ? 'bg-green-600' : 'bg-green-500'
                  }`}
                  style={{
                    height: `${barHeight}%`,
                    minHeight: item.value > 0 ? '4px' : '0px'
                  }}
                />
              </div>
              <div className="text-xs text-gray-600 text-center font-medium mt-2">
                {item.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
