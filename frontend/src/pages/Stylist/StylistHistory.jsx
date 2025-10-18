import React, { useState, useEffect } from 'react';
import { History, Calendar, Clock, User, Scissors, Search } from 'lucide-react';
import appointmentService from '../../services/appointmentService';

const StylistHistory = () => {
  const [history, setHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    filterHistory();
  }, [history, searchTerm]);

  const loadHistory = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await appointmentService.getMyAppointmentHistory();
      setHistory(data);
    } catch (err) {
      console.error('Error al cargar historial:', err);
      setError('No se pudo cargar el historial');
    } finally {
      setLoading(false);
    }
  };

  const filterHistory = () => {
    if (!searchTerm) {
      setFilteredHistory(history);
      return;
    }

    const filtered = history.filter(appointment =>
      appointment.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.service_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredHistory(filtered);
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

  const stats = {
    total: history.length,
    completed: history.filter(a => a.status === 'completed').length,
    cancelled: history.filter(a => a.status === 'cancelled').length,
    noShow: history.filter(a => a.status === 'no-show').length,
  };

  if (loading && history.length === 0) {
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
      <div className="bg-gradient-to-r from-pink-600 to-rose-600 rounded-lg shadow-lg p-8 text-white">
        <h1 className="text-4xl font-bold mb-2 flex items-center">
          <History className="h-10 w-10 mr-3" />
          Mi Historial
        </h1>
        <p className="text-pink-100 text-lg">Citas pasadas completadas o canceladas</p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-pink-600">
          <p className="text-gray-500 text-sm font-medium">Total Historial</p>
          <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-600">
          <p className="text-gray-500 text-sm font-medium">Completadas</p>
          <p className="text-3xl font-bold text-gray-800">{stats.completed}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-red-600">
          <p className="text-gray-500 text-sm font-medium">Canceladas</p>
          <p className="text-3xl font-bold text-gray-800">{stats.cancelled}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-gray-600">
          <p className="text-gray-500 text-sm font-medium">No Asistieron</p>
          <p className="text-3xl font-bold text-gray-800">{stats.noShow}</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar por cliente o servicio..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-3 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
          <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
        </div>
      </div>

      {/* History List */}
      {filteredHistory.length > 0 ? (
        <div className="space-y-3">
          {filteredHistory.map((appointment) => (
            <div
              key={appointment.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all"
            >
              <div className="flex justify-between items-start">
                <div className="flex-grow">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {appointment.client_name || `Cliente #${appointment.client_id}`}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(appointment.status)}`}>
                      {statusMap[appointment.status]}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-pink-600" />
                      <span>{formatDate(appointment.date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-pink-600" />
                      <span>{formatTime(appointment.date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Scissors className="h-4 w-4 text-pink-600" />
                      <span>{appointment.service_name}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <History className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">
            {searchTerm ? 'No se encontraron citas en el historial' : 'No tienes historial de citas aún'}
          </p>
        </div>
      )}
    </div>
  );
};

export default StylistHistory;