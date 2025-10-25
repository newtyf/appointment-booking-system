import { useState, useEffect } from 'react';

export const useAccessibility = () => {
  const [textSize, setTextSize] = useState(() => {
    return localStorage.getItem('textSize') || 'normal';
  });

  const [highContrast, setHighContrast] = useState(() => {
    return localStorage.getItem('highContrast') === 'true';
  });

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });

  const [readingEnabled, setReadingEnabled] = useState(false);

  // Aplicar tamaño de texto
  useEffect(() => {
    const root = document.documentElement;
    localStorage.setItem('textSize', textSize);
    
    const sizes = {
      'small': '14px',
      'normal': '16px',
      'large': '18px',
      'x-large': '21px',
      'xx-large': '24px'
    };
    
    root.style.fontSize = sizes[textSize] || sizes.normal;
  }, [textSize]);

  // Aplicar alto contraste
  useEffect(() => {
    localStorage.setItem('highContrast', highContrast);
    
    if (highContrast) {
      document.documentElement.setAttribute('data-high-contrast', 'true');
    } else {
      document.documentElement.removeAttribute('data-high-contrast');
    }
  }, [highContrast]);

  // Aplicar modo oscuro
  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
    
    if (darkMode) {
      document.documentElement.setAttribute('data-dark-mode', 'true');
    } else {
      document.documentElement.removeAttribute('data-dark-mode');
    }
  }, [darkMode]);

  return {
    textSize,
    setTextSize,
    highContrast,
    setHighContrast,
    darkMode,
    setDarkMode,
    readingEnabled,
    setReadingEnabled
  };
};