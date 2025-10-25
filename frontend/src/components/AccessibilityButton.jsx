import React, { useState, useRef, useEffect, use } from "react";
import { PersonStanding, Type, Contrast, Volume2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const AccessibilityButton = () => {
  const [open, setOpen] = useState(false);
  const [shouldReopen, setShouldReopen] = useState(false);
  const [position, setPosition] = useState({
    vertical: "up",
    horizontal: "right",
  });
  const [isDragging, setIsDragging] = useState(false);
  const [hoverEnabled, setHoverEnabled] = useState(true);
  const buttonRef = useRef(null);
  const constraintsRef = useRef(null);

  const [highContrast, setHighContrast] = useState(() => {
    return localStorage.getItem("highContrast") === "true";
  });

  useEffect(() => {
    if (highContrast) {
      document.body.classList.add("high-contrast");
    } else {
      document.body.classList.remove("high-contrast");
    }
  }, [highContrast]);

  const toggleHighContrast = () => {
    const newValue = !highContrast;
    setHighContrast(newValue);
    localStorage.setItem("highContrast", String(newValue));
    if (newValue) {
      document.body.classList.add("high-contrast");
    } else {
      document.body.classList.remove("high-contrast");
    }
  };

  useEffect(() => {
    const handleResize = () => {
      if (constraintsRef.current) {
        constraintsRef.current.style.width = `${window.innerWidth}px`;
        constraintsRef.current.style.height = `${window.innerHeight}px`;
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const updatePosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const vertical = rect.top > window.innerHeight / 2 ? "up" : "down";
      const horizontal = rect.left > window.innerWidth / 2 ? "left" : "right";
      setPosition({ vertical, horizontal });
    }
  };

  const handleClick = () => {
    if (isDragging) return;
    updatePosition();
    setOpen(!open);
  };

  return (
    <div
      ref={constraintsRef}
      className="fixed inset-0 z-50 pointer-events-none"
    >
      <motion.div
        ref={buttonRef}
        className="absolute bottom-6 right-6 pointer-events-auto"
        drag
        dragConstraints={constraintsRef}
        dragElastic={0.1}
        dragMomentum={false} //true si se quiere que se mueva libremente
        style={{ cursor: "grab" }}
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
                y: position.vertical === "up" ? 20 : -20,
                x: position.horizontal === "left" ? 20 : -20,
                scale: 0.95,
              }}
              animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
              exit={{
                opacity: 0,
                y: position.vertical === "up" ? 20 : -20,
                x: position.horizontal === "left" ? 20 : -20,
                scale: 0.95,
              }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className={`absolute 
                ${position.vertical === "up" ? "bottom-16" : "top-16"} 
                ${position.horizontal === "left" ? "right-16" : "left-16"} 
                bg-white shadow-2xl rounded-2xl p-4 w-52`}
            >
              <h3 className="text-gray-700 font-semibold mb-3 text-center">
                Accesibilidad
              </h3>
              <div className="flex flex-col gap-2">
                <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100">
                  <Type size={18} /> Increase Text
                </button>
                <button
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100"
                  onClick={() => {
                    setHighContrast(!highContrast);
                    document.body.classList.toggle(
                      "high-contrast",
                      !highContrast
                    );
                  }}
                >
                  <Contrast size={18} />{" "}
                  {highContrast ? "Disable Contrast" : "High Contrast"}
                </button>
                <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100">
                  <Volume2 size={18} /> Read Aloud
                </button>
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
            ease: "easeInOut",
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
          className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg focus:outline-none relative"
          title="Opciones de Accesibilidad"
        >
          <PersonStanding size={20} />
        </motion.button>
      </motion.div>
    </div>
  );
};

export default AccessibilityButton;
