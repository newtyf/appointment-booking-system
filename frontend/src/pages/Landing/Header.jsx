// frontend/src/pages/Landing/Header.jsx

import React from 'react';
import { Link } from 'react-router-dom';

import MonarcaLogo from '../../assets/monarcaLogo.png'; // <-- ¡CORREGIDO A .png! (y mayúscula en L si el archivo es así)

const Header = () => {
    return (
        <header className="bg-white shadow-lg py-4 fixed w-full z-50 top-0">
            <nav className="container mx-auto flex justify-between items-center px-4">
                <div className="flex items-center">
                    <Link to="/">
                        <img src={MonarcaLogo} alt="Monarca Logo" className="h-12 w-auto" /> 
                        <span className="text-3xl font-serif text-purple-800 tracking-wide">Monarca</span> 
                    </Link>
                </div>

                <ul className="flex space-x-8">
                    <li><a href="#inicio" className="text-gray-700 hover:text-pink-600 transition duration-300 font-medium">Inicio</a></li>
                    <li><a href="#about" className="text-gray-700 hover:text-pink-600 transition duration-300 font-medium">Nosotros</a></li>
                    <li><a href="#services" className="text-gray-700 hover:text-pink-600 transition duration-300 font-medium">Servicios</a></li>
                    <li><a href="#ia" className="text-gray-700 hover:text-pink-600 transition duration-300 font-medium">Asesor IA</a></li>
                    <li><a href="#contact" className="text-gray-700 hover:text-pink-600 transition duration-300 font-medium">Contacto</a></li>
                </ul>

                <div className="space-x-4">
                    <Link
                        to="/login"
                        className="px-6 py-2 border-2 border-purple-600 text-purple-600 rounded-full hover:bg-purple-600 hover:text-white transition duration-300 font-semibold"
                    >
                        Iniciar Sesión
                    </Link>
                    <Link
                        to="/registro"
                        className="px-6 py-2 bg-pink-600 text-white rounded-full hover:bg-pink-700 transition duration-300 font-semibold"
                    >
                        Registrarse
                    </Link>
                </div>
            </nav>
        </header>
    );
};

export default Header;