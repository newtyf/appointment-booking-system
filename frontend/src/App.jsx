import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

import Login from './pages/Auth/Login.jsx';
import Register from './pages/Auth/Register.jsx';

import MyAppointments from './pages/Client/MyAppointments.jsx';
import ScheduleAppointment from './pages/Client/ScheduleAppointment.jsx';
import AppointmentHistory from './pages/Client/AppointmentHistory.jsx';

import ServicesManagement from './pages/Client/ServicesManagement.jsx';
import UsersManagement from './pages/Client/UsersManagement.jsx';
import AccessibilityButton from "./components/AccessibilityButton";

import Home from './pages/Home/index.jsx';
import InsideLayout from './layouts/InsideLayout.jsx';
import LandingPage from './pages/Landing/LandingPage.jsx';

const App = () => {
  const location = useLocation();

  // colocar las rutas donde se mostrara el boton si quieren que este en el dashboard agregar '/dashboard' y asi
  const showButtonRoutes = [
    '/',

  ];

  // 🔸 Verifica si la ruta actual está en la lista
  const shouldShowButton = showButtonRoutes.includes(location.pathname);

  const ProtectedRoute = ({ children }) => {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
    return <InsideLayout>{children}</InsideLayout>;
  };

  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Register />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Home />} />
          <Route path="/mis-citas" element={<MyAppointments />} />
          <Route path="/agendar-cita" element={<ScheduleAppointment />} />
          <Route path="/historial-citas" element={<AppointmentHistory />} />
          <Route path="/admin/clientes" element={<UsersManagement />} />
          <Route path="/admin/empleados" element={<UsersManagement />} />
          <Route path="/admin/servicios" element={<ServicesManagement />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Mostrar el botón solo en las rutas permitidas */}
      {shouldShowButton && <AccessibilityButton />}
    </>
  );
};

export default App;
