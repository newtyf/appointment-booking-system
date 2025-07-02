import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Importaciones de tus páginas (los nombres de los archivos/componentes se mantienen en inglés)
import Home from "./pages/Home";
import Login from "./pages/Login/login.jsx"; 
import MyAppointments from "./pages/Client/MyAppointments.jsx"; // Mis Citas
import UsersManagement from './pages/Client/UsersManagement'; // Clientes y Empleados
import ServicesManagement from './pages/Client/ServicesManagement'; // Servicios
import ScheduleAppointment from './pages/Client/ScheduleAppointment'; // Agendar Cita
import AppointmentHistory from './pages/Client/AppointmentHistory'; // Historial de Citas

const App = () => {
  const ProtectedRoute = ({ children }) => {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };
  
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      
      {/* Rutas con paths en español para coincidir con el Sidebar */}
      <Route path="/mis-citas" element={<ProtectedRoute><MyAppointments /></ProtectedRoute>} />
      <Route path="/agendar-cita" element={<ProtectedRoute><ScheduleAppointment /></ProtectedRoute>} />
      <Route path="/historial-citas" element={<ProtectedRoute><AppointmentHistory /></ProtectedRoute>} />

      <Route path="/admin/clientes" element={<ProtectedRoute><UsersManagement /></ProtectedRoute>} />
      <Route path="/admin/empleados" element={<ProtectedRoute><UsersManagement /></ProtectedRoute>} />

      <Route path="/admin/servicios" element={<ProtectedRoute><ServicesManagement /></ProtectedRoute>} />

      {/* Ruta para el logout, si es que lo manejas como una página */}
      <Route path="/logout" element={<Navigate to="/login" replace />} /> 

      {/* Ruta catch-all: Redirige a Home si la ruta no coincide y está autenticado */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;