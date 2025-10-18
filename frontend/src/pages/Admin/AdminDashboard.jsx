import React, { useState, useEffect } from 'react';
import { BarChart3, Users, Calendar, Scissors, TrendingUp, Clock } from 'lucide-react';
import appointmentService from '../../services/appointmentService';

const AdminDashboard = () => {
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
      console.error('Error al cargar dashboard:', err);
      setError('No se pudo cargar el dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
          <p className="text-gray-600">Cargando dashboard administrativo...</p>
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
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg shadow-lg p-8 text-white">
        <h1 className="text-4xl font-bold mb-2">Dashboard Administrativo</h1>
        <p className="text-purple-100 text-lg">Panel de control y estadísticas del salón</p>
      </div>

      {/* Stats Cards - Fila 1 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Total Citas */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-600 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">Total Citas</p>
              <p className="text-3xl font-bold text-gray-800">
                {dashboard?.appointments_stats?.total || 0}
              </p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Total Clientes */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-600 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">Total Clientes</p>
              <p className="text-3xl font-bold text-gray-800">
                {dashboard?.total_clients || 0}
              </p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Total Estilistas */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-600 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">Estilistas</p>
              <p className="text-3xl font-bold text-gray-800">
                {dashboard?.total_stylists || 0}
              </p>
            </div>
            <div className="bg-purple-100 rounded-full p-3">
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Total Servicios */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-pink-600 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">Servicios</p>
              <p className="text-3xl font-bold text-gray-800">
                {dashboard?.total_services || 0}
              </p>
            </div>
            <div className="bg-pink-100 rounded-full p-3">
              <Scissors className="h-8 w-8 text-pink-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Estados de Citas */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <BarChart3 className="h-6 w-6 mr-2 text-purple-600" />
          Estado de Citas
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center p-4 bg-yellow-50 rounded-lg border-2 border-yellow-200 hover:border-yellow-400 transition-colors">
            <p className="text-3xl font-bold text-yellow-800 mb-1">
              {dashboard?.appointments_stats?.pending || 0}
            </p>
            <p className="text-sm text-yellow-600 font-medium">Pendientes</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg border-2 border-green-200 hover:border-green-400 transition-colors">
            <p className="text-3xl font-bold text-green-800 mb-1">
              {dashboard?.appointments_stats?.confirmed || 0}
            </p>
            <p className="text-sm text-green-600 font-medium">Confirmadas</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg border-2 border-blue-200 hover:border-blue-400 transition-colors">
            <p className="text-3xl font-bold text-blue-800 mb-1">
              {dashboard?.appointments_stats?.completed || 0}
            </p>
            <p className="text-sm text-blue-600 font-medium">Completadas</p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg border-2 border-red-200 hover:border-red-400 transition-colors">
            <p className="text-3xl font-bold text-red-800 mb-1">
              {dashboard?.appointments_stats?.cancelled || 0}
            </p>
            <p className="text-sm text-red-600 font-medium">Canceladas</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg border-2 border-gray-200 hover:border-gray-400 transition-colors">
            <p className="text-3xl font-bold text-gray-800 mb-1">
              {dashboard?.appointments_stats?.no_show || 0}
            </p>
            <p className="text-sm text-gray-600 font-medium">No Show</p>
          </div>
        </div>
      </div>

      {/* Top Estilistas y Servicios */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Estilistas */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-purple-600" />
            Top Estilistas
          </h3>
          {dashboard?.top_stylists && dashboard.top_stylists.length > 0 ? (
            <div className="space-y-3">
              {dashboard.top_stylists.slice(0, 5).map((stylist, index) => (
                <div 
                  key={stylist.stylist_id} 
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`font-bold rounded-full w-8 h-8 flex items-center justify-center text-white ${
                      index === 0 ? 'bg-yellow-500' :
                      index === 1 ? 'bg-gray-400' :
                      index === 2 ? 'bg-orange-600' :
                      'bg-purple-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{stylist.stylist_name}</p>
                      <p className="text-sm text-gray-500">
                        {stylist.completed_appointments} completadas
                      </p>
                    </div>
                  </div>
                  <p className="text-lg font-bold text-gray-700">{stylist.total_appointments}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No hay datos de estilistas</p>
          )}
        </div>

        {/* Top Servicios */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <Scissors className="h-5 w-5 mr-2 text-pink-600" />
            Servicios Populares
          </h3>
          {dashboard?.top_services && dashboard.top_services.length > 0 ? (
            <div className="space-y-3">
              {dashboard.top_services.slice(0, 5).map((service, index) => (
                <div 
                  key={service.service_id} 
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`font-bold rounded-full w-8 h-8 flex items-center justify-center text-white ${
                      index === 0 ? 'bg-pink-500' :
                      index === 1 ? 'bg-pink-400' :
                      index === 2 ? 'bg-pink-300' :
                      'bg-pink-200'
                    }`}>
                      {index + 1}
                    </div>
                    <p className="font-semibold text-gray-800">{service.service_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-700">{service.times_booked}</p>
                    <p className="text-xs text-gray-500">reservas</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No hay datos de servicios</p>
          )}
        </div>
      </div>

      {/* Walk-in Stats */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <Clock className="h-5 w-5 mr-2 text-orange-600" />
          Estadísticas Walk-in
        </h3>
        <div className="flex items-center gap-4">
          <div className="flex-grow bg-gray-200 rounded-full h-8 overflow-hidden shadow-inner">
            <div 
              className="bg-gradient-to-r from-pink-500 to-purple-600 h-full flex items-center justify-end px-3 text-white text-sm font-bold transition-all duration-500"
              style={{ width: `${dashboard?.walk_in_percentage || 0}%` }}
            >
              {dashboard?.walk_in_percentage ? `${dashboard.walk_in_percentage.toFixed(1)}%` : '0%'}
            </div>
          </div>
          <p className="text-gray-600 font-medium whitespace-nowrap">Clientes Walk-in</p>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Porcentaje de clientes que llegan sin cita previa
        </p>
      </div>

      {/* Citas Recientes */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Citas Recientes</h3>
        {dashboard?.recent_appointments && dashboard.recent_appointments.length > 0 ? (
          <div className="space-y-2">
            {dashboard.recent_appointments.map((appointment) => (
              <div 
                key={appointment.id}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-grow">
                  <p className="font-semibold text-gray-800">{appointment.client_name}</p>
                  <p className="text-sm text-gray-600">
                    {appointment.service_name} • {appointment.stylist_name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">
                    {new Date(appointment.date).toLocaleDateString('es-ES')}
                  </p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                    appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    appointment.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {appointment.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No hay citas recientes</p>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;