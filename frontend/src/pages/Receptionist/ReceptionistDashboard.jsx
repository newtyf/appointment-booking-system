import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, UserCheck, AlertCircle, Plus, CheckCircle } from 'lucide-react';
import appointmentService from '../../services/appointmentService';

const ReceptionistDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await appointmentService.getDashboard();
      setDashboard(data);
    } catch (err) {
      console.error('Error al obtener dashboard:', err);
      setError('No se pudo cargar el dashboard');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const statusMap = {
    'pending': 'Pendiente',
    'confirmed': 'Confirmada',
    'completed': 'Completada',
    'cancelled': 'Cancelada',
    'no-show': 'No asistió'
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'confirmed': 'bg-green-100 text-green-800 border-green-200',
      'completed': 'bg-blue-100 text-blue-800 border-blue-200',
      'cancelled': 'bg-red-100 text-red-800 border-red-200',
      'no-show': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const handleConfirmAppointment = async (appointmentId) => {
    try {
      await appointmentService.updateAppointmentStatus(appointmentId, 'confirmed');
      await fetchDashboard();
      alert('Cita confirmada exitosamente');
    } catch (err) {
      console.error('Error al confirmar cita:', err);
      alert('Error al confirmar la cita');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-lg p-8 text-white">
        <h1 className="text-4xl font-bold mb-2">Panel de Recepción</h1>
        <p className="text-blue-100 text-lg">Gestiona las citas y la atención del día</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Citas de Hoy */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">Citas de Hoy</p>
              <p className="text-3xl font-bold text-gray-800">
                {dashboard?.total_appointments_today || 0}
              </p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Pendientes de Confirmar */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">Por Confirmar</p>
              <p className="text-3xl font-bold text-gray-800">
                {dashboard?.pending_confirmations?.length || 0}
              </p>
            </div>
            <div className="bg-yellow-100 rounded-full p-3">
              <AlertCircle className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Walk-ins de Hoy */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">Walk-ins Hoy</p>
              <p className="text-3xl font-bold text-gray-800">
                {dashboard?.walk_ins_today || 0}
              </p>
            </div>
            <div className="bg-purple-100 rounded-full p-3">
              <UserCheck className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Acciones Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => window.location.href = '/receptionist/schedule'}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 px-6 rounded-lg transition duration-200 flex items-center justify-center gap-3 shadow-md"
        >
          <Plus className="h-6 w-6" />
          <span>Agendar Nueva Cita</span>
        </button>
        <button
          onClick={() => window.location.href = '/receptionist/walk-in'}
          className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold py-4 px-6 rounded-lg transition duration-200 flex items-center justify-center gap-3 shadow-md"
        >
          <UserCheck className="h-6 w-6" />
          <span>Registrar Walk-in</span>
        </button>
      </div>

      {/* Citas Pendientes de Confirmar */}
      {dashboard?.pending_confirmations && dashboard.pending_confirmations.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <AlertCircle className="h-6 w-6 mr-2 text-yellow-600" />
              Citas por Confirmar
            </h2>
            <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold">
              {dashboard.pending_confirmations.length} pendientes
            </span>
          </div>

          <div className="space-y-3">
            {dashboard.pending_confirmations.map((appointment) => (
              <div
                key={appointment.id}
                className="border-2 border-yellow-200 bg-yellow-50 rounded-lg p-4 hover:shadow-md transition-all"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-grow">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {appointment.client_name}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(appointment.status)}`}>
                        {statusMap[appointment.status]}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-yellow-600" />
                        <span>{formatDate(appointment.date)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-yellow-600" />
                        <span>{formatTime(appointment.date)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-yellow-600" />
                        <span>{appointment.stylist_name}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      <strong>Servicio:</strong> {appointment.service_name}
                    </p>
                  </div>
                  <button
                    onClick={() => handleConfirmAppointment(appointment.id)}
                    className="ml-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition duration-200 flex items-center gap-2"
                  >
                    <CheckCircle className="h-5 w-5" />
                    Confirmar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Citas de Hoy */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <Calendar className="h-6 w-6 mr-2 text-blue-600" />
          Agenda de Hoy
        </h2>

        {dashboard?.appointments_today && dashboard.appointments_today.length > 0 ? (
          <div className="space-y-3">
            {dashboard.appointments_today.map((appointment) => (
              <div
                key={appointment.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all hover:border-blue-300"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-grow">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {appointment.client_name}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(appointment.status)}`}>
                        {statusMap[appointment.status]}
                      </span>
                      {appointment.is_walk_in && (
                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-semibold">
                          Walk-in
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <span className="font-semibold">{formatTime(appointment.date)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-blue-600" />
                        <span>{appointment.stylist_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{appointment.service_name}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No hay citas agendadas para hoy</p>
          </div>
        )}
      </div>

      {/* Disponibilidad de Estilistas */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <Users className="h-6 w-6 mr-2 text-indigo-600" />
          Disponibilidad de Estilistas Hoy
        </h2>

        {dashboard?.stylists_availability && dashboard.stylists_availability.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dashboard.stylists_availability.map((stylist) => (
              <div
                key={stylist.stylist_id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-indigo-100 rounded-full p-2">
                    <Users className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-semibold text-gray-800">{stylist.stylist_name}</h3>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Citas hoy:</span>
                    <span className="font-semibold text-gray-800">{stylist.appointments_today}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Estado:</span>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      stylist.appointments_today < 5 
                        ? 'bg-green-100 text-green-800' 
                        : stylist.appointments_today < 8
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {stylist.appointments_today < 5 ? 'Disponible' : 
                       stylist.appointments_today < 8 ? 'Ocupado' : 'Completo'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 text-center py-8">No hay información de estilistas</p>
        )}
      </div>
    </div>
  );
};

export default ReceptionistDashboard;