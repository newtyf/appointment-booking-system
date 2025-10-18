import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, TrendingUp } from 'lucide-react';
import appointmentService from '../../services/appointmentService';

const StylistDashboard = () => {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-600">Cargando mi agenda...</p>
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
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg shadow-lg p-8 text-white">
        <h1 className="text-4xl font-bold mb-2">Mi Agenda</h1>
        <p className="text-indigo-100 text-lg">Gestiona tus citas del día</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Citas de Hoy */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-indigo-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">Citas de Hoy</p>
              <p className="text-3xl font-bold text-gray-800">
                {dashboard?.total_appointments_today || 0}
              </p>
            </div>
            <div className="bg-indigo-100 rounded-full p-3">
              <Calendar className="h-8 w-8 text-indigo-600" />
            </div>
          </div>
        </div>

        {/* Próximas (7 días) */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">Próximos 7 Días</p>
              <p className="text-3xl font-bold text-gray-800">
                {dashboard?.upcoming_appointments?.length || 0}
              </p>
            </div>
            <div className="bg-purple-100 rounded-full p-3">
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Completadas Este Mes */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">Completadas Este Mes</p>
              <p className="text-3xl font-bold text-gray-800">
                {dashboard?.completed_this_month || 0}
              </p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Próxima Cita */}
      {dashboard?.next_appointment && (
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg shadow-lg p-6 text-white">
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <TrendingUp className="h-6 w-6 mr-2" />
            Próxima Cita
          </h2>
          <div className="bg-white bg-opacity-20 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-yellow-100 text-sm font-medium mb-1">Cliente</p>
                <p className="text-xl font-bold">{dashboard.next_appointment.client_name}</p>
              </div>
              <div>
                <p className="text-yellow-100 text-sm font-medium mb-1">Servicio</p>
                <p className="text-xl font-bold">{dashboard.next_appointment.service_name}</p>
              </div>
              <div>
                <p className="text-yellow-100 text-sm font-medium mb-1">Hora</p>
                <p className="text-xl font-bold">{formatTime(dashboard.next_appointment.date)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Citas de Hoy */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <Calendar className="h-6 w-6 mr-2 text-indigo-600" />
          Mis Citas de Hoy
        </h2>

        {dashboard?.appointments_today && dashboard.appointments_today.length > 0 ? (
          <div className="space-y-3">
            {dashboard.appointments_today.map((appointment) => (
              <div
                key={appointment.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all hover:border-indigo-300"
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-indigo-600" />
                        <span className="font-semibold">{formatTime(appointment.date)}</span>
                      </div>
                      <div>
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
            <p className="text-gray-600 text-lg">No tienes citas agendadas para hoy</p>
            <p className="text-gray-500 text-sm mt-2">¡Disfruta tu día libre! 😊</p>
          </div>
        )}
      </div>

      {/* Próximas Citas (7 días) */}
      {dashboard?.upcoming_appointments && dashboard.upcoming_appointments.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <Clock className="h-6 w-6 mr-2 text-purple-600" />
            Próximas Citas (7 días)
          </h2>

          <div className="space-y-3">
            {dashboard.upcoming_appointments.slice(0, 5).map((appointment) => (
              <div
                key={appointment.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all"
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-purple-600" />
                        <span>{formatDate(appointment.date)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-purple-600" />
                        <span>{formatTime(appointment.date)}</span>
                      </div>
                      <div>
                        <span className="font-medium">{appointment.service_name}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StylistDashboard;