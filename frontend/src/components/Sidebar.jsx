import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  CalendarCheck,
  CalendarPlus,
  History,
  Users,
  UserCog,
  LogOut,
  BarChart3,
  Scissors,
  Clock,
  UserCheck
} from 'lucide-react';
import MonarcaLogo from '../assets/monarcaLogo.png';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    // Obtener información del usuario desde localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserRole(user.role);
        setUserName(user.name);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  // Menú para CLIENTE
  const clientMenu = [
    { name: 'Inicio', path: '/client/dashboard', icon: Home },
    { section: 'Citas' },
    { name: 'Agendar Cita', path: '/client/schedule', icon: CalendarPlus },
    { name: 'Mis Citas', path: '/client/appointments', icon: CalendarCheck },
    { name: 'Historial', path: '/client/history', icon: History },
  ];

  // Menú para ADMIN
  const adminMenu = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: BarChart3 },
    { section: 'Gestión' },
    { name: 'Citas', path: '/admin/appointments', icon: CalendarCheck },
    { name: 'Servicios', path: '/admin/servicios', icon: Scissors },
    { name: 'Clientes', path: '/admin/clientes', icon: Users },
    { name: 'Empleados', path: '/admin/empleados', icon: UserCog },
  ];

  // Menú para STYLIST
  const stylistMenu = [
    { name: 'Mi Agenda', path: '/stylist/dashboard', icon: Home },
    { section: 'Citas' },
    { name: 'Mis Citas', path: '/stylist/appointments', icon: CalendarCheck },
    { name: 'Historial', path: '/stylist/history', icon: History },
  ];

  // Menú para RECEPTIONIST
  const receptionistMenu = [
    { name: 'Dashboard', path: '/receptionist/dashboard', icon: Home },
    { section: 'Gestión de Citas' },
    { name: 'Ver Citas', path: '/receptionist/appointments', icon: CalendarCheck },
    { name: 'Agendar Cita', path: '/receptionist/schedule', icon: CalendarPlus },
    { name: 'Walk-in', path: '/receptionist/walk-in', icon: UserCheck },
    { section: 'Clientes' },
    { name: 'Ver Clientes', path: '/receptionist/clients', icon: Users },
  ];

  // Seleccionar menú según rol
  const getMenuItems = () => {
    switch (userRole) {
      case 'client':
        return clientMenu;
      case 'admin':
        return adminMenu;
      case 'stylist':
        return stylistMenu;
      case 'receptionist':
        return receptionistMenu;
      default:
        return clientMenu;
    }
  };

  const navItems = getMenuItems();

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    localStorage.removeItem('tokenType');
    navigate('/login');
  };

  const getRoleName = (role) => {
    const roleNames = {
      'client': 'Cliente',
      'admin': 'Administrador',
      'stylist': 'Estilista',
      'receptionist': 'Recepcionista'
    };
    return roleNames[role] || role;
  };

  return (
    <div className="bg-pink-700 text-white w-64 flex flex-col shadow-lg z-10">
      {/* Logo */}
      <div className="flex items-center justify-center p-6 border-b border-pink-600">
        <img src={MonarcaLogo} alt="Monarca Logo" className="h-20 w-auto object-contain" />
      </div>

      {/* Info del Usuario */}
      <div className="px-6 py-4 border-b border-pink-600 bg-pink-800">
        <p className="text-xs text-pink-300 uppercase font-semibold mb-1">
          {getRoleName(userRole)}
        </p>
        <p className="text-sm font-medium truncate">{userName}</p>
      </div>

      {/* Navegación */}
      <nav className="flex-grow p-4 overflow-y-auto">
        <ul>
          {navItems.map((item, index) => (
            item.section ? (
              <li key={index} className="text-pink-300 text-xs uppercase font-semibold mt-4 mb-2 first:mt-0 px-4">
                {item.section}
              </li>
            ) : (
              <li key={index} className="mb-2">
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
              </li>
            )
          ))}
        </ul>
      </nav>

      {/* Cerrar Sesión */}
      <div className="p-4 border-t border-pink-600">
        <button
          onClick={handleLogout}
          className="flex items-center w-full py-2 px-4 rounded-lg transition duration-200 hover:bg-red-600 text-white"
        >
          <LogOut className="h-5 w-5 mr-3" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;