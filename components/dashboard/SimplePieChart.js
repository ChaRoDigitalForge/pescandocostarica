'use client';
import { useState } from 'react';

export default function SimplePieChart({ data, title }) {
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

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const colors = [
    'bg-green-500',
    'bg-blue-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
  ];

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-bold text-gray-900 mb-6">{title}</h3>
      <div className="flex flex-col lg:flex-row items-center gap-8">
        {/* Simple donut visualization */}
        <div className="relative w-48 h-48">
          <svg viewBox="0 0 100 100" className="transform -rotate-90">
            {data.map((item, index) => {
              const percentage = (item.value / total) * 100;
              const previousPercentages = data
                .slice(0, index)
                .reduce((sum, d) => sum + (d.value / total) * 100, 0);

              const circumference = 2 * Math.PI * 40;
              const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
              const strokeDashoffset = -((previousPercentages / 100) * circumference);

              const colorMap = {
                'bg-green-500': '#10b981',
                'bg-blue-500': '#3b82f6',
                'bg-yellow-500': '#eab308',
                'bg-purple-500': '#a855f7',
                'bg-pink-500': '#ec4899',
                'bg-indigo-500': '#6366f1',
              };

              return (
                <circle
                  key={index}
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke={colorMap[colors[index % colors.length]]}
                  strokeWidth="20"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className={`transition-all ${hoveredIndex === index ? 'opacity-100' : 'opacity-80'}`}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{total}</div>
              <div className="text-xs text-gray-500">Total</div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-3">
          {data.map((item, index) => {
            const percentage = ((item.value / total) * 100).toFixed(1);
            const isHovered = hoveredIndex === index;

            return (
              <div
                key={index}
                className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                  isHovered ? 'bg-gray-50' : ''
                }`}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded ${colors[index % colors.length]}`} />
                  <span className="text-sm font-medium text-gray-700">{item.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-900">{item.value}</span>
                  <span className="text-xs text-gray-500 w-12 text-right">{percentage}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
