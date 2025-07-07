import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  CalendarCheck,
  CalendarPlus,
  History,
  Users,
  UserCog,
  Settings,
  LogOut
} from 'lucide-react';
import MonarcaLogo from '../assets/monarcaLogo.png';

const Sidebar = () => {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'Mis Citas', path: '/mis-citas', icon: CalendarCheck },
    { section: 'Gestión de Citas' },
    { name: 'Agendar Cita', path: '/agendar-cita', icon: CalendarPlus },
    { name: 'Historial de Citas', path: '/historial-citas', icon: History },
    { section: 'Gestión de Usuarios' },
    { name: 'Clientes', path: '/admin/clientes', icon: Users },
    { name: 'Empleados', path: '/admin/empleados', icon: UserCog },
    { section: 'Configuración' },
    { name: 'Servicios', path: '/admin/servicios', icon: Settings },
    { name: 'Cerrar Sesión', path: '/logout', icon: LogOut, isLogout: true },
  ];

  return (
    <div className="bg-pink-700 text-white w-64 flex flex-col shadow-lg z-10">
      <div className="flex items-center justify-center p-6 border-b border-pink-600">
        <img src={MonarcaLogo} alt="Monarca Logo" className="h-20 w-auto object-contain" />
      </div>

      <nav className="flex-grow p-4">
        <ul>
          {navItems.map((item, index) => (
            item.section ? (
              <li key={index} className="text-pink-300 text-xs uppercase font-semibold mt-4 mb-2 first:mt-0 px-4">
                {item.section}
              </li>
            ) : (
              <li key={index} className="mb-2">
                {item.isLogout ? (
                  <button
                    onClick={() => {
                      localStorage.removeItem('isAuthenticated');
                      window.location.href = '/login';
                    }}
                    className="flex items-center w-full py-2 px-4 rounded-lg transition duration-200 hover:bg-red-600 text-white"
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    <span>{item.name}</span>
                  </button>
                ) : (
                  <Link
                    to={item.path}
                    className={`flex items-center py-2 px-4 rounded-lg transition duration-200 ${
                      location.pathname === item.path
                        ? 'bg-pink-800 text-white shadow-inner'
                        : 'hover:bg-pink-600 text-white'
                    }`}
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    <span>{item.name}</span>
                  </Link>
                )}
              </li>
            )
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;