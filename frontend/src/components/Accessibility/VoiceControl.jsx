import React, { useRef, useEffect, useCallback } from 'react';
import { Volume2 } from 'lucide-react';

const VoiceControl = ({ readingEnabled, setReadingEnabled }) => {
  const isMountedRef = useRef(true);
  const utteranceRef = useRef(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      stopReading();
    };
  }, []);

  const stopReading = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    utteranceRef.current = null;
  }, []);

  // useCallback mantiene la misma referencia de la función
  const handleTextSelection = useCallback(() => {
    if (!readingEnabled || !isMountedRef.current) {
      return;
    }

    const selectedText = window.getSelection().toString().trim();
    if (selectedText && selectedText.length > 1) {
      speakText(selectedText);
    }
  }, [readingEnabled]); // Solo se recrea cuando readingEnabled cambia

  const speakText = useCallback((text) => {
    if (!readingEnabled || !isMountedRef.current) {
      return;
    }

    stopReading();
    
    setTimeout(() => {
      if (!readingEnabled || !isMountedRef.current) {
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES';
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      utterance.onend = () => {
        utteranceRef.current = null;
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }, 50);
  }, [readingEnabled, stopReading]);

  // Effect para manejar el event listener
  useEffect(() => {
    if (readingEnabled) {
      document.addEventListener('mouseup', handleTextSelection);
      
      // Mensaje de bienvenida
      setTimeout(() => {
        speakText('Modo lectura activado. Selecciona cualquier texto para escucharlo.');
      }, 100);
    } else {
      stopReading();
    }

    // Cleanup: remueve el listener cuando se desmonta o cambia readingEnabled
    return () => {
      document.removeEventListener('mouseup', handleTextSelection);
    };
  }, [readingEnabled, handleTextSelection, speakText, stopReading]);

  const handleToggle = () => {
    if (!('speechSynthesis' in window)) {
      alert('Tu navegador no soporta lectura en voz alta');
      return;
    }

    setReadingEnabled(!readingEnabled);
  };

  return (
    <button 
      onClick={handleToggle}
      className={`flex items-center justify-between gap-2 px-3 py-3 rounded-lg transition-colors border-2 ${
        readingEnabled 
          ? 'bg-green-50 border-green-300 text-green-900 hover:bg-green-100' 
          : 'border-gray-200 hover:bg-gray-50'
      }`}
    >
      <div className="flex items-center gap-2">
        <Volume2 size={18} className={readingEnabled ? 'animate-pulse' : ''} />
        <span className="text-sm font-medium">Leer en Voz Alta</span>
      </div>
      <div className={`w-12 h-6 rounded-full transition-colors ${
        readingEnabled ? 'bg-green-500' : 'bg-gray-300'
      } relative`}>
        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
          readingEnabled ? 'transform translate-x-6' : ''
        }`}></div>
      </div>
    </button>
  );
};

export default VoiceControl;