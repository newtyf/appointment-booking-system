import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Scissors, Search, Eye, CheckCircle, XCircle, Filter } from 'lucide-react';
import appointmentService from '../../services/appointmentService';

const AppointmentsManagement = () => {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [modalType, setModalType] = useState(null);

  useEffect(() => {
    loadAppointments();
  }, []);

  useEffect(() => {
    filterAppointments();
  }, [appointments, searchTerm, filterStatus]);

  const loadAppointments = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await appointmentService.listAllAppointments();
      setAppointments(data);
    } catch (err) {
      console.error('Error al cargar citas:', err);
      setError('No se pudieron cargar las citas');
    } finally {
      setLoading(false);
    }
  };

  const filterAppointments = () => {
    let filtered = [...appointments];

    if (filterStatus !== 'all') {
      filtered = filtered.filter(apt => apt.status === filterStatus);
    }

    if (searchTerm) {
      filtered = filtered.filter(apt =>
        apt.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.stylist_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.service_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    setFilteredAppointments(filtered);
  };

  const handleUpdateStatus = async (appointmentId, newStatus) => {
    try {
      setLoading(true);
      await appointmentService.updateAppointmentStatus(appointmentId, newStatus);
      await loadAppointments();
      setModalType(null);
      setSelectedAppointment(null);
      alert('Estado actualizado exitosamente');
    } catch (err) {
      console.error('Error al actualizar estado:', err);
      alert('Error: ' + (err.response?.data?.detail || err.message));
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

  const stats = {
    total: appointments.length,
    pending: appointments.filter(a => a.status === 'pending').length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    completed: appointments.filter(a => a.status === 'completed').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length,
  };

  if (loading && appointments.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mb-4"></div>
          <p className="text-gray-600">Cargando citas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg shadow-lg p-8 text-white">
        <h1 className="text-4xl font-bold mb-2 flex items-center">
          <Calendar className="h-10 w-10 mr-3" />
          Gestión de Citas
        </h1>
        <p className="text-pink-100 text-lg">Administra todas las citas del salón</p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-600">
          <p className="text-gray-500 text-sm font-medium">Total</p>
          <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-yellow-600">
          <p className="text-gray-500 text-sm font-medium">Pendientes</p>
          <p className="text-3xl font-bold text-gray-800">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-600">
          <p className="text-gray-500 text-sm font-medium">Confirmadas</p>
          <p className="text-3xl font-bold text-gray-800">{stats.confirmed}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500">
          <p className="text-gray-500 text-sm font-medium">Completadas</p>
          <p className="text-3xl font-bold text-gray-800">{stats.completed}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-red-600">
          <p className="text-gray-500 text-sm font-medium">Canceladas</p>
          <p className="text-3xl font-bold text-gray-800">{stats.cancelled}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow relative">
            <input
              type="text"
              placeholder="Buscar por cliente, estilista o servicio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
            <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>

          <div className="flex gap-2 flex-wrap">
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
              onClick={() => setFilterStatus('pending')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filterStatus === 'pending'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pendientes ({stats.pending})
            </button>
            <button
              onClick={() => setFilterStatus('confirmed')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filterStatus === 'confirmed'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Confirmadas ({stats.confirmed})
            </button>
            <button
              onClick={() => setFilterStatus('completed')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filterStatus === 'completed'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Completadas ({stats.completed})
            </button>
          </div>
        </div>
      </div>

      {/* Appointments List */}
      {filteredAppointments.length > 0 ? (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-gray-50">
                  <th className="py-3 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="py-3 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                  <th className="py-3 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                  <th className="py-3 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase">Servicio</th>
                  <th className="py-3 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase">Estilista</th>
                  <th className="py-3 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                  <th className="py-3 px-4 border-b text-center text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.map((appointment) => (
                  <tr key={appointment.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 border-b text-gray-700">{appointment.id}</td>
                    <td className="py-3 px-4 border-b text-gray-700">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="font-medium">{formatDate(appointment.date)}</p>
                          <p className="text-sm text-gray-500">{formatTime(appointment.date)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 border-b text-gray-700">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        {appointment.client_name || `Cliente #${appointment.client_id}`}
                        {appointment.is_walk_in && (
                          <span className="text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded">Walk-in</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 border-b text-gray-700">
                      <div className="flex items-center gap-2">
                        <Scissors className="h-4 w-4 text-gray-400" />
                        {appointment.service_name || `Servicio #${appointment.service_id}`}
                      </div>
                    </td>
                    <td className="py-3 px-4 border-b text-gray-700">
                      {appointment.stylist_name || `Estilista #${appointment.stylist_id}`}
                    </td>
                    <td className="py-3 px-4 border-b text-gray-700">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(appointment.status)}`}>
                        {statusMap[appointment.status]}
                      </span>
                    </td>
                    <td className="py-3 px-4 border-b text-center whitespace-nowrap">
                      <button
                        onClick={() => {
                          setSelectedAppointment(appointment);
                          setModalType('view');
                        }}
                        className="text-blue-600 hover:text-blue-900 mx-1"
                        title="Ver detalles"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      {(appointment.status === 'pending' || appointment.status === 'confirmed') && (
                        <>
                          <button
                            onClick={() => {
                              setSelectedAppointment(appointment);
                              setModalType('confirm');
                            }}
                            className="text-green-600 hover:text-green-900 mx-1"
                            title="Confirmar"
                          >
                            <CheckCircle className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedAppointment(appointment);
                              setModalType('cancel');
                            }}
                            className="text-red-600 hover:text-red-900 mx-1"
                            title="Cancelar"
                          >
                            <XCircle className="h-5 w-5" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">
            {searchTerm || filterStatus !== 'all' 
              ? 'No se encontraron citas con esos filtros'
              : 'No hay citas registradas'}
          </p>
        </div>
      )}

      {/* Modal Ver Detalles */}
      {modalType === 'view' && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold mb-4">Detalles de la Cita</h2>
            <div className="space-y-3">
              <p><strong>ID:</strong> {selectedAppointment.id}</p>
              <p><strong>Cliente:</strong> {selectedAppointment.client_name || `Cliente #${selectedAppointment.client_id}`}</p>
              <p><strong>Servicio:</strong> {selectedAppointment.service_name}</p>
              <p><strong>Estilista:</strong> {selectedAppointment.stylist_name}</p>
              <p><strong>Fecha:</strong> {formatDate(selectedAppointment.date)}</p>
              <p><strong>Hora:</strong> {formatTime(selectedAppointment.date)}</p>
              <p>
                <strong>Estado:</strong>{' '}
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedAppointment.status)}`}>
                  {statusMap[selectedAppointment.status]}
                </span>
              </p>
              <p><strong>Walk-in:</strong> {selectedAppointment.is_walk_in ? 'Sí' : 'No'}</p>
            </div>
            <div className="mt-6 text-right">
              <button
                onClick={() => {
                  setModalType(null);
                  setSelectedAppointment(null);
                }}
                className="bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-700"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmar */}
      {modalType === 'confirm' && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-sm shadow-xl">
            <h2 className="text-xl font-bold mb-4">¿Confirmar Cita?</h2>
            <p>¿Confirmar la cita de <strong>{selectedAppointment.client_name}</strong>?</p>
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setModalType(null)}
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleUpdateStatus(selectedAppointment.id, 'confirmed')}
                disabled={loading}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Cancelar */}
      {modalType === 'cancel' && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-sm shadow-xl">
            <h2 className="text-xl font-bold mb-4">¿Cancelar Cita?</h2>
            <p>¿Cancelar la cita de <strong>{selectedAppointment.client_name}</strong>?</p>
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setModalType(null)}
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
              >
                No
              </button>
              <button
                onClick={() => handleUpdateStatus(selectedAppointment.id, 'cancelled')}
                disabled={loading}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Sí, Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentsManagement;