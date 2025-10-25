import React from 'react';
import { Moon } from 'lucide-react';

const DarkModeControl = ({ darkMode, setDarkMode }) => {
  return (
    <button 
      onClick={() => setDarkMode(!darkMode)}
      className={`flex items-center justify-between gap-2 px-3 py-3 rounded-lg transition-colors border-2 ${
        darkMode 
          ? 'bg-slate-50 border-slate-300 text-slate-900 hover:bg-slate-100' 
          : 'border-gray-200 hover:bg-gray-50'
      }`}
    >
      <div className="flex items-center gap-2">
        <Moon size={18} />
        <span className="text-sm font-medium">Modo Oscuro</span>
      </div>
      <div className={`w-12 h-6 rounded-full transition-colors ${
        darkMode ? 'bg-slate-500' : 'bg-gray-300'
      } relative`}>
        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
          darkMode ? 'transform translate-x-6' : ''
        }`}></div>
      </div>
    </button>
  );
};

export default DarkModeControl;