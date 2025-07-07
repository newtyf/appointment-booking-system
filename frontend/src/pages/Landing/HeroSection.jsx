// frontend/src/pages/Landing/HeroSection.jsx

import React from 'react';
import HeroBackground from '../../assets/hero_background.jpg'; // <-- ¡VERIFICA QUE ESTE ARCHIVO EXISTA EN src/assets!

const HeroSection = () => {
    return (
        <section
            id="inicio"
            className="min-h-screen flex items-center justify-center text-center pt-20"
            style={{
                backgroundImage: `url(${HeroBackground})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed',
            }}
        >
            <div className="bg-white bg-opacity-80 p-12 rounded-xl shadow-2xl max-w-4xl transform hover:scale-105 transition-transform duration-500">
                <h1 className="text-6xl md:text-8xl font-serif font-extrabold mb-6 text-purple-900 leading-tight drop-shadow-md">
                    El Arte de Ser Tú
                </h1>
                <p className="text-xl md:text-2xl mb-10 font-light tracking-wide text-gray-800">
                    Descubre un mundo de belleza y bienestar diseñado exclusivamente para ti en Monarca.
                </p>
                <a
                    href="#services"
                    className="inline-block px-10 py-4 bg-purple-700 text-white font-bold rounded-full text-lg shadow-lg hover:bg-purple-800 transform hover:-translate-y-1 transition duration-300"
                >
                    Explora Nuestros Servicios
                </a>
            </div>
        </section>
    );
};

export default HeroSection;