import React from 'react';
import { Contrast } from 'lucide-react';

const ContrastControl = ({ highContrast, setHighContrast }) => {
  return (
    <button 
      onClick={() => setHighContrast(!highContrast)}
      className={`flex items-center justify-between gap-2 px-3 py-3 rounded-lg transition-colors border-2 ${
        highContrast 
          ? 'bg-yellow-50 border-yellow-300 text-yellow-900 hover:bg-yellow-100' 
          : 'border-gray-200 hover:bg-gray-50'
      }`}
    >
      <div className="flex items-center gap-2">
        <Contrast size={18} />
        <span className="text-sm font-medium">Alto Contraste</span>
      </div>
      <div className={`w-12 h-6 rounded-full transition-colors ${
        highContrast ? 'bg-yellow-500' : 'bg-gray-300'
      } relative`}>
        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
          highContrast ? 'transform translate-x-6' : ''
        }`}></div>
      </div>
    </button>
  );
};

export default ContrastControl;