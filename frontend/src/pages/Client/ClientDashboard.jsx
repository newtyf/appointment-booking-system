import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Award, Plus, History, TrendingUp } from 'lucide-react';
import appointmentService from '../../services/appointmentService';

const ClientDashboard = () => {
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
      month: 'short',
      year: 'numeric'
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
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mb-4"></div>
          <p className="text-gray-600">Cargando tu dashboard...</p>
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
      <div className="bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg shadow-lg p-8 text-white">
        <h1 className="text-4xl font-bold mb-2">¡Hola! 👋</h1>
        <p className="text-pink-100 text-lg">Bienvenido a tu panel de cliente</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total de Citas */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-pink-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">Total de Citas</p>
              <p className="text-3xl font-bold text-gray-800">{dashboard?.total_appointments || 0}</p>
            </div>
            <div className="bg-pink-100 rounded-full p-3">
              <Calendar className="h-8 w-8 text-pink-600" />
            </div>
          </div>
        </div>

        {/* Próximas Citas */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">Próximas Citas</p>
              <p className="text-3xl font-bold text-gray-800">{dashboard?.upcoming_appointments?.length || 0}</p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <Clock className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Servicio Favorito */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-600">
          <div className="flex items-center justify-between">
            <div className="flex-grow mr-2">
              <p className="text-gray-500 text-sm font-medium mb-1">Servicio Favorito</p>
              <p className="text-lg font-bold text-gray-800 truncate">
                {dashboard?.favorite_service || 'N/A'}
              </p>
            </div>
            <div className="bg-purple-100 rounded-full p-3">
              <Award className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Próximas Citas */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <Calendar className="h-6 w-6 mr-2 text-pink-600" />
            Próximas Citas
          </h2>
          <button
            onClick={() => window.location.href = '/client/schedule'}
            className="bg-pink-600 hover:bg-pink-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Agendar Cita
          </button>
        </div>

        {dashboard?.upcoming_appointments && dashboard.upcoming_appointments.length > 0 ? (
          <div className="space-y-4">
            {dashboard.upcoming_appointments.map((appointment) => (
              <div
                key={appointment.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 hover:border-pink-300"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-grow">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {appointment.service_name}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(appointment.status)}`}>
                        {statusMap[appointment.status]}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="h-4 w-4 text-pink-600" />
                        <span>{formatDate(appointment.date)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="h-4 w-4 text-pink-600" />
                        <span>{formatTime(appointment.date)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <User className="h-4 w-4 text-pink-600" />
                        <span className="font-medium">{appointment.stylist_name}</span>
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
            <p className="text-gray-600 text-lg mb-4">No tienes citas próximas</p>
            <button
              onClick={() => window.location.href = '/client/schedule'}
              className="bg-pink-600 hover:bg-pink-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-200"
            >
              Agendar Ahora
            </button>
          </div>
        )}
      </div>

      {/* Historial de Citas */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <History className="h-6 w-6 mr-2 text-purple-600" />
          Historial Reciente
        </h2>

        {dashboard?.past_appointments && dashboard.past_appointments.length > 0 ? (
          <div className="space-y-3">
            {dashboard.past_appointments.map((appointment) => (
              <div
                key={appointment.id}
                className="border border-gray-200 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <div className="flex-grow">
                    <div className="flex items-center gap-3">
                      <h3 className="text-md font-semibold text-gray-700">
                        {appointment.service_name}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(appointment.status)}`}>
                        {statusMap[appointment.status]}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <span>{formatDate(appointment.date)}</span>
                      <span>•</span>
                      <span>{appointment.stylist_name}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <History className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p>Aún no tienes historial de citas</p>
          </div>
        )}
      </div>


      <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg shadow-lg p-8 text-white text-center">
        <TrendingUp className="h-12 w-12 mx-auto mb-4" />
        <h3 className="text-2xl font-bold mb-2">¿Listo para tu próximo cambio de look?</h3>
        <p className="text-pink-100 mb-6">Agenda tu cita y déjanos consentirte</p>
        <button
          onClick={() => window.location.href = '/client/schedule'}
          className="bg-white text-pink-600 hover:bg-pink-50 font-bold py-3 px-8 rounded-lg transition duration-200 shadow-md"
        >
          Agendar Cita Ahora
        </button>
      </div>
    </div>
  );
};

export default ClientDashboard;