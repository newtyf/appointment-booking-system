import React, { useState, useRef, useEffect } from 'react';
import { PersonStanding } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccessibility } from './useAccessibility';
import TextSizeControl from './TextSizeControl';
import ContrastControl from './ContrastControl';
import DarkModeControl from './DarkModeControl';
import VoiceControl from './VoiceControl';

const AccessibilityButton = () => {
  const [open, setOpen] = useState(false);
  const [shouldReopen, setShouldReopen] = useState(false);
  const [position, setPosition] = useState({ vertical: 'up', horizontal: 'right' });
  const [isDragging, setIsDragging] = useState(false);
  const [hoverEnabled, setHoverEnabled] = useState(true);
  
  const {
    textSize,
    setTextSize,
    highContrast,
    setHighContrast,
    darkMode,
    setDarkMode,
    readingEnabled,
    setReadingEnabled
  } = useAccessibility();
  
  const buttonRef = useRef(null);
  const constraintsRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      if (constraintsRef.current) {
        constraintsRef.current.style.width = `${window.innerWidth}px`;
        constraintsRef.current.style.height = `${window.innerHeight}px`;
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const updatePosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const vertical = rect.top > window.innerHeight / 2 ? 'up' : 'down';
      const horizontal = rect.left > window.innerWidth / 2 ? 'left' : 'right';
      setPosition({ vertical, horizontal });
    }
  };

  const handleClick = () => {
    if (isDragging) return;
    updatePosition();
    setOpen(!open);
  };

  return (
    <div ref={constraintsRef} className="fixed inset-0 z-50 pointer-events-none">
      <motion.div
        ref={buttonRef}
        className="absolute bottom-6 right-6 pointer-events-auto"
        drag
        dragConstraints={constraintsRef}
        dragElastic={0.1}
        dragMomentum={false}
        style={{ cursor: 'grab' }}
        onDragStart={() => {
          setIsDragging(true);
          setHoverEnabled(false);
          if (open) {
            setShouldReopen(true);
            setOpen(false);
          } else {
            setShouldReopen(false);
          }
        }}
        onDragEnd={() => {
          updatePosition();
          setTimeout(() => {
            setIsDragging(false);
            setHoverEnabled(true);
          }, 200);
          if (shouldReopen) {
            setTimeout(() => setOpen(true), 200);
          }
        }}
      >
        {/* Bandeja */}
        <AnimatePresence>
          {open && (
            <motion.div
              key="tray"
              initial={{
                opacity: 0,
                y: position.vertical === 'up' ? 20 : -20,
                x: position.horizontal === 'left' ? 20 : -20,
                scale: 0.95,
              }}
              animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
              exit={{
                opacity: 0,
                y: position.vertical === 'up' ? 20 : -20,
                x: position.horizontal === 'left' ? 20 : -20,
                scale: 0.95,
              }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className={`absolute accessibility-panel
                ${position.vertical === 'up' ? 'bottom-16' : 'top-16'} 
                ${position.horizontal === 'left' ? 'right-16' : 'left-16'} 
                bg-white shadow-2xl rounded-2xl p-4 w-64`}
            >
              <h3 className="text-gray-700 font-semibold mb-3 text-center">
                Accesibilidad
              </h3>
              <div className="flex flex-col gap-2">
                <TextSizeControl textSize={textSize} setTextSize={setTextSize} />
                <DarkModeControl darkMode={darkMode} setDarkMode={setDarkMode} />
                <ContrastControl highContrast={highContrast} setHighContrast={setHighContrast} />
                <VoiceControl readingEnabled={readingEnabled} setReadingEnabled={setReadingEnabled} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Aro animado */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="absolute w-16 h-16 rounded-full border-4 border-blue-400 opacity-70"></div>
        </motion.div>

        {/* Botón principal */}
        <motion.button
          onClick={handleClick}
          whileHover={hoverEnabled ? { scale: 1.1 } : {}}
          whileTap={{ scale: 0.9 }}
          className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg focus:outline-none relative accessibility-button"
          title="Opciones de Accesibilidad"
        >
          <PersonStanding size={20} />
        </motion.button>
      </motion.div>
    </div>
  );
};

export default AccessibilityButton;