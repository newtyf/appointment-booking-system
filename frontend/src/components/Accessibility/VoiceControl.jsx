import React, { useRef, useEffect } from 'react';
import { Volume2 } from 'lucide-react';

const VoiceControl = ({ readingEnabled, setReadingEnabled }) => {
  const textSelectionHandlerRef = useRef(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      stopReading();
    };
  }, []);

  useEffect(() => {
    if (!readingEnabled) {
      stopReading();
    }
  }, [readingEnabled]);

  const stopReading = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setTimeout(() => window.speechSynthesis.cancel(), 0);
      setTimeout(() => window.speechSynthesis.cancel(), 50);
      setTimeout(() => window.speechSynthesis.cancel(), 100);
      setTimeout(() => window.speechSynthesis.cancel(), 200);
      window.speechSynthesis.pause();
    }
    
    if (textSelectionHandlerRef.current) {
      document.removeEventListener('mouseup', textSelectionHandlerRef.current);
      textSelectionHandlerRef.current = null;
    }
  };

  const speakText = (text) => {
    if (!readingEnabled || !isMountedRef.current) {
      return;
    }

    window.speechSynthesis.cancel();
    
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
        if (!readingEnabled) {
          window.speechSynthesis.cancel();
        }
      };

      if (readingEnabled && isMountedRef.current) {
        window.speechSynthesis.speak(utterance);
      }
    }, 50);
  };

  const handleTextSelection = () => {
    if (!readingEnabled || !isMountedRef.current) {
      return;
    }

    const selectedText = window.getSelection().toString().trim();
    if (selectedText && selectedText.length > 1) {
      speakText(selectedText);
    }
  };

  const handleToggle = () => {
    if (!('speechSynthesis' in window)) {
      alert('Tu navegador no soporta lectura en voz alta');
      return;
    }

    if (readingEnabled) {
      stopReading();
      setReadingEnabled(false);
    } else {
      setReadingEnabled(true);
      textSelectionHandlerRef.current = handleTextSelection;
      document.addEventListener('mouseup', textSelectionHandlerRef.current);
      
      setTimeout(() => {
        speakText('Modo lectura activado. Selecciona cualquier texto para escucharlo.');
      }, 100);
    }
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