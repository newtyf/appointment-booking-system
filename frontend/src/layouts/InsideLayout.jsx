import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import MonarcaLogo from '../assets/monarcaLogo.png';

const InsideLayout = () => {
  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    window.location.href = '/login';
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex flex-col flex-grow">
        <header className="bg-white p-4 shadow-md flex justify-between items-center text-gray-800 border-b border-gray-200">
          <div className="flex items-center">
            <img src={MonarcaLogo} alt="Monarca Logo" className="h-10 w-auto mr-4" />
            <span className="text-xl font-semibold">Bienvenido a Monarca</span>
          </div>
          <div className="flex items-center space-x-4">
            <svg className="h-8 w-8 text-gray-600 cursor-pointer" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        </header>

        <main className="flex-grow p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default InsideLayout;