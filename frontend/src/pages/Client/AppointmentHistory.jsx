import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Scissors, Search, TrendingUp, Award, History as HistoryIcon } from 'lucide-react';
import appointmentService from '../../services/appointmentService';

const AppointmentHistory = () => {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Estadísticas
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    cancelled: 0,
    noShow: 0,
    favoriteService: '',
    favoriteStylist: ''
  });

  useEffect(() => {
    fetchAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    filterAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appointments, searchTerm, filterStatus]);

  const fetchAppointments = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await appointmentService.getMyAppointments();
      
      // Filtrar solo citas pasadas (por fecha o por status final)
      const now = new Date();
      const pastAppointments = data.filter(apt => {
        const appointmentDate = new Date(apt.date);
        return appointmentDate < now || ['completed', 'cancelled', 'no-show'].includes(apt.status);
      });
      
      setAppointments(pastAppointments);
      calculateStats(pastAppointments);
    } catch (err) {
      console.error('Error al obtener historial:', err);
      setError('No se pudo cargar el historial de citas');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (appointments) => {
    const completed = appointments.filter(a => a.status === 'completed').length;
    const cancelled = appointments.filter(a => a.status === 'cancelled').length;
    const noShow = appointments.filter(a => a.status === 'no-show').length;

    // Servicio más usado
    const serviceCount = {};
    appointments.forEach(apt => {
      const serviceName = apt.service_name || 'Desconocido';
      serviceCount[serviceName] = (serviceCount[serviceName] || 0) + 1;
    });
    const favoriteService = Object.keys(serviceCount).reduce((a, b) => 
      serviceCount[a] > serviceCount[b] ? a : b, ''
    );

    // Estilista favorito
    const stylistCount = {};
    appointments.forEach(apt => {
      const stylistName = apt.stylist_name || 'Desconocido';
      stylistCount[stylistName] = (stylistCount[stylistName] || 0) + 1;
    });
    const favoriteStylist = Object.keys(stylistCount).reduce((a, b) => 
      stylistCount[a] > stylistCount[b] ? a : b, ''
    );

    setStats({
      total: appointments.length,
      completed,
      cancelled,
      noShow,
      favoriteService,
      favoriteStylist
    });
  };

  const filterAppointments = () => {
    let filtered = [...appointments];

    // Filtrar por estado
    if (filterStatus !== 'all') {
      filtered = filtered.filter(apt => apt.status === filterStatus);
    }

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(apt =>
        apt.service_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.stylist_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Ordenar por fecha (más reciente primero)
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

    setFilteredAppointments(filtered);
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
    'completed': 'Completada',
    'cancelled': 'Cancelada',
    'no-show': 'No asistió'
  };

  const getStatusColor = (status) => {
    const colors = {
      'completed': 'bg-green-100 text-green-800 border-green-200',
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
          <p className="text-gray-600">Cargando historial...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg shadow-lg p-8 text-white">
        <h1 className="text-4xl font-bold mb-2 flex items-center">
          <HistoryIcon className="h-10 w-10 mr-3" />
          Historial de Citas
        </h1>
        <p className="text-purple-100 text-lg">Revisa todas tus citas anteriores</p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">Total Citas</p>
              <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">Completadas</p>
              <p className="text-3xl font-bold text-gray-800">{stats.completed}</p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-600">
          <div className="flex items-center justify-between">
            <div className="flex-grow mr-2">
              <p className="text-gray-500 text-sm font-medium mb-1">Servicio Favorito</p>
              <p className="text-lg font-bold text-gray-800 truncate">
                {stats.favoriteService || 'N/A'}
              </p>
            </div>
            <div className="bg-purple-100 rounded-full p-3">
              <Award className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-pink-600">
          <div className="flex items-center justify-between">
            <div className="flex-grow mr-2">
              <p className="text-gray-500 text-sm font-medium mb-1">Estilista Favorito</p>
              <p className="text-lg font-bold text-gray-800 truncate">
                {stats.favoriteStylist || 'N/A'}
              </p>
            </div>
            <div className="bg-pink-100 rounded-full p-3">
              <User className="h-8 w-8 text-pink-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Búsqueda */}
          <div className="flex-grow relative">
            <input
              type="text"
              placeholder="Buscar por servicio o estilista..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>

          {/* Filtro por Estado */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filterStatus === 'all'
                  ? 'bg-pink-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todas ({stats.total})
            </button>
            <button
              onClick={() => setFilterStatus('completed')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filterStatus === 'completed'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Completadas ({stats.completed})
            </button>
            <button
              onClick={() => setFilterStatus('cancelled')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filterStatus === 'cancelled'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Canceladas ({stats.cancelled})
            </button>
          </div>
        </div>
      </div>

      {/* Lista de Citas */}
      {error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      ) : filteredAppointments.length > 0 ? (
        <div className="space-y-4">
          {filteredAppointments.map((appointment) => (
            <div
              key={appointment.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div className="flex-grow">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {appointment.service_name}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(appointment.status)}`}>
                      {statusMap[appointment.status] || appointment.status}
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
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <HistoryIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 text-lg mb-2">No hay citas en el historial</p>
          <p className="text-gray-500 text-sm">
            {searchTerm || filterStatus !== 'all' 
              ? 'Intenta cambiar los filtros de búsqueda'
              : 'Tus citas completadas aparecerán aquí'}
          </p>
        </div>
      )}
    </div>
  );
};

export default AppointmentHistory;