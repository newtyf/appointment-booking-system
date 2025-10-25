import React from 'react';
import { Type } from 'lucide-react';

const TextSizeControl = ({ textSize, setTextSize }) => {
  const handleChangeTextSize = (direction) => {
    const sizes = ['small', 'normal', 'large', 'x-large', 'xx-large'];
    const currentIndex = sizes.indexOf(textSize);
    
    if (direction === 'up') {
      const nextIndex = (currentIndex + 1) % sizes.length;
      setTextSize(sizes[nextIndex]);
    } else {
      const prevIndex = currentIndex - 1 < 0 ? sizes.length - 1 : currentIndex - 1;
      setTextSize(sizes[prevIndex]);
    }
  };

  const getTextSizeLabel = () => {
    const labels = {
      'small': 'Pequeño',
      'normal': 'Normal',
      'large': 'Grande',
      'x-large': 'Muy Grande',
      'xx-large': 'Gigante'
    };
    return labels[textSize] || labels.normal;
  };

  return (
    <div className={`px-3 py-2 rounded-lg border-2 ${
      textSize !== 'normal' 
        ? 'bg-blue-50 border-blue-300' 
        : 'border-gray-200'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Type size={18} />
          <span className="text-sm font-medium">Tamaño de Texto</span>
        </div>
        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">
          {getTextSizeLabel()}
        </span>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => handleChangeTextSize('down')}
          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-1 rounded font-bold transition-colors"
        >
          A-
        </button>
        <button
          onClick={() => setTextSize('normal')}
          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-1 rounded font-bold transition-colors"
        >
          Reset
        </button>
        <button
          onClick={() => handleChangeTextSize('up')}
          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-1 rounded font-bold transition-colors"
        >
          A+
        </button>
      </div>
    </div>
  );
};

export default TextSizeControl;