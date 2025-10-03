import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import appointmentService from '../../services/appointmentService';
import serviceService from '../../services/serviceService';

const AppointmentHistory = () => {
  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, completed, cancelled

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [appointmentsData, servicesData] = await Promise.all([
        appointmentService.listAppointments(),
        serviceService.listServices()
      ]);
      
      // Filtrar solo citas pasadas
      const pastAppointments = appointmentsData.filter(apt => 
        new Date(apt.date) < new Date()
      );
      
      setAppointments(pastAppointments);
      setServices(servicesData);
    } catch (err) {
      setError('Error al cargar el historial');
    } finally {
      setLoading(false);
    }
  };

  const getServiceName = (serviceId) => {
    const service = services.find(s => s.id === serviceId);
    return service ? service.name : `Servicio #${serviceId}`;
  };

  const getStatusConfig = (status) => {
    const configs = {
      completed: { 
        icon: CheckCircle, 
        bg: 'bg-green-100', 
        text: 'text-green-800', 
        label: 'Completada',
        iconColor: 'text-green-600'
      },
      cancelled: { 
        icon: XCircle, 
        bg: 'bg-red-100', 
        text: 'text-red-800', 
        label: 'Cancelada',
        iconColor: 'text-red-600'
      },
      pending: { 
        icon: AlertCircle, 
        bg: 'bg-yellow-100', 
        text: 'text-yellow-800', 
        label: 'No asistió',
        iconColor: 'text-yellow-600'
      }
    };
    return configs[status] || configs.pending;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredAppointments = appointments.filter(apt => {
    if (filter === 'all') return true;
    return apt.status === filter;
  });

  if (loading) {
    return (
      <div className="container mx-auto p-8 bg-white rounded-lg shadow-md">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando historial...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
        <Calendar className="mr-2 h-8 w-8 text-pink-600" />
        Historial de Citas
      </h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Filtros */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg transition ${
            filter === 'all' 
              ? 'bg-pink-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Todas ({appointments.length})
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-4 py-2 rounded-lg transition ${
            filter === 'completed' 
              ? 'bg-green-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Completadas ({appointments.filter(a => a.status === 'completed').length})
        </button>
        <button
          onClick={() => setFilter('cancelled')}
          className={`px-4 py-2 rounded-lg transition ${
            filter === 'cancelled' 
              ? 'bg-red-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Canceladas ({appointments.filter(a => a.status === 'cancelled').length})
        </button>
      </div>

      {/* Lista de citas */}
      {filteredAppointments.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No hay citas en el historial</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAppointments
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .map(appointment => {
              const statusConfig = getStatusConfig(appointment.status);
              const StatusIcon = statusConfig.icon;
              
              return (
                <div
                  key={appointment.id}
                  className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-grow">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg text-gray-800">
                          {getServiceName(appointment.service_id)}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusConfig.bg} ${statusConfig.text}`}>
                          <StatusIcon className={`h-4 w-4 ${statusConfig.iconColor}`} />
                          {statusConfig.label}
                        </span>
                      </div>
                      
                      <div className="space-y-1 text-sm text-gray-600">
                        <p className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-pink-500" />
                          {formatDate(appointment.date)}
                        </p>
                        <p className="flex items-center">
                          <User className="h-4 w-4 mr-2 text-pink-500" />
                          Estilista #{appointment.stylist_id}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
};

export default AppointmentHistory;