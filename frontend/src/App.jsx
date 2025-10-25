import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Auth/Login.jsx";
import Register from "./pages/Auth/Register.jsx";

import ClientDashboard from "./pages/Client/ClientDashboard.jsx";
import MyAppointments from "./pages/Client/MyAppointments.jsx";
import ClientScheduleAppointment from "./pages/Client/ScheduleAppointment.jsx";
import AppointmentHistory from "./pages/Client/AppointmentHistory.jsx";

import AdminDashboard from "./pages/Admin/AdminDashboard.jsx";
import ServicesManagement from "./pages/Admin/ServicesManagement.jsx";
import ClientsManagement from "./pages/Admin/ClientsManagement.jsx";
import EmployeesManagement from "./pages/Admin/EmployeesManagement.jsx";
import AppointmentsManagement from "./pages/Admin/AppointmentsManagement.jsx";

import ReceptionistDashboard from "./pages/Receptionist/ReceptionistDashboard.jsx";
import AppointmentsView from "./pages/Receptionist/AppointmentsView.jsx";
import ReceptionistScheduleAppointment from "./pages/Receptionist/ScheduleAppointment.jsx";
import WalkInAppointment from "./pages/Receptionist/WalkInAppointment.jsx";
import ClientsView from "./pages/Receptionist/ClientsView.jsx";

import StylistDashboard from "./pages/Stylist/StylistDashboard.jsx";
import StylistAppointments from "./pages/Stylist/StylistAppointments.jsx";
import StylistHistory from "./pages/Stylist/StylistHistory.jsx";

import Home from "./pages/Home/index.jsx";
import InsideLayout from "./layouts/InsideLayout.jsx";
import LandingPage from "./pages/Landing/LandingPage.jsx";

import { AccessibilityButton } from './components/Accessibility';

const App = () => {
  const ProtectedRoute = () => {
    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";

    if (!isAuthenticated) {
      return <Navigate to='/login' replace />;
    }

    return <InsideLayout />;
  };

  return (
    <>
      {/* Botón de accesibilidad visible en TODA la aplicación */}
      <AccessibilityButton />
      
      <Routes>
        {/* Rutas públicas */}
        <Route path='/' element={<LandingPage />} />
        <Route path='/login' element={<Login />} />
        <Route path='/registro' element={<Register />} />

        {/* Rutas protegidas */}
        <Route element={<ProtectedRoute />}>
          {/* Dashboard general */}
          <Route path='/dashboard' element={<Home />} />

          {/* Rutas de Cliente */}
          <Route path='/client/dashboard' element={<ClientDashboard />} />
          <Route path='/client/appointments' element={<MyAppointments />} />
          <Route
            path='/client/schedule'
            element={<ClientScheduleAppointment />}
          />
          <Route path='/client/history' element={<AppointmentHistory />} />

          {/* Rutas de Admin */}
          <Route path='/admin/dashboard' element={<AdminDashboard />} />
          <Route
            path='/admin/appointments'
            element={<AppointmentsManagement />}
          />
          <Route path='/admin/clientes' element={<ClientsManagement />} />
          <Route path='/admin/empleados' element={<EmployeesManagement />} />
          <Route path='/admin/servicios' element={<ServicesManagement />} />

          {/* Rutas de Receptionist */}
          <Route
            path='/receptionist/dashboard'
            element={<ReceptionistDashboard />}
          />
          <Route
            path='/receptionist/appointments'
            element={<AppointmentsView />}
          />
          <Route
            path='/receptionist/schedule'
            element={<ReceptionistScheduleAppointment />}
          />
          <Route path='/receptionist/walk-in' element={<WalkInAppointment />} />
          <Route path='/receptionist/clients' element={<ClientsView />} />

          {/* Rutas de Stylist */}
          <Route path='/stylist/dashboard' element={<StylistDashboard />} />
          <Route
            path='/stylist/appointments'
            element={<StylistAppointments />}
          />
          <Route path='/stylist/history' element={<StylistHistory />} />
        </Route>

        {/* Redirect a home si ruta no existe */}
        <Route path='*' element={<Navigate to='/' replace />} />
      </Routes>
    </>
  );
};

export default App;