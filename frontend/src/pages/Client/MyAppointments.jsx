import React, { useState, useEffect } from 'react';
import { Eye, Edit, Trash, Search, Calendar, Clock } from 'lucide-react';
import appointmentService from '../../services/appointmentService';

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchAppointments = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await appointmentService.getMyAppointments();
      setAppointments(data);
    } catch (err) {
      console.error('Error al obtener citas:', err);
      if (err.response) {
        setError(`Error: ${err.response.data.detail || 'No se pudieron cargar las citas'}`);
      } else if (err.request) {
        setError('No se pudo conectar con el servidor.');
      } else {
        setError('Error inesperado al obtener las citas.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCancel = async (appointmentId) => {
    if (!window.confirm('¿Estás seguro de cancelar esta cita?')) return;

    try {
      await appointmentService.cancelAppointment(appointmentId);
      alert('Cita cancelada exitosamente');
      fetchAppointments(); 
    } catch (err) {
      alert('Error al cancelar la cita: ' + (err.response?.data?.detail || 'Error desconocido'));
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Filtrar citas
  const filteredAppointments = appointments.filter(appointment =>
    appointment.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.stylist_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.service_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Mapeo de estados en español
  const statusMap = {
    'pending': 'Pendiente',
    'confirmed': 'Confirmada',
    'completed': 'Completada',
    'cancelled': 'Cancelada',
    'no-show': 'No asistió'
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'confirmed': 'bg-green-100 text-green-800',
      'completed': 'bg-blue-100 text-blue-800',
      'cancelled': 'bg-red-100 text-red-800',
      'no-show': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="container mx-auto bg-white p-8 rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Mis Citas</h1>

      <div className="flex justify-between items-center mb-6">
        <div className="relative flex-grow mr-4">
          <input
            type="text"
            placeholder="Buscar citas..."
            className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-pink-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
        </div>
        <button 
          onClick={() => window.location.href = '/client/schedule'}
          className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200 flex items-center"
        >
          <Calendar className="h-5 w-5 mr-2" />
          Agendar Cita
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
          <p className="text-gray-600 mt-2">Cargando tus citas...</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      ) : filteredAppointments.length > 0 ? (
        <div className="grid gap-4">
          {filteredAppointments.map((appointment) => (
            <div 
              key={appointment.id} 
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-grow">
                  <div className="flex items-center gap-4 mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {appointment.service_name || `Servicio #${appointment.service_id}`}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(appointment.status)}`}>
                      {statusMap[appointment.status] || appointment.status}
                    </span>
                  </div>
                  
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(appointment.date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{formatTime(appointment.date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Estilista:</span>
                      <span>{appointment.stylist_name || `ID ${appointment.stylist_id}`}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  {appointment.status === 'pending' || appointment.status === 'confirmed' ? (
                    <button 
                      onClick={() => handleCancel(appointment.id)}
                      className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition"
                      title="Cancelar cita"
                    >
                      <Trash className="h-5 w-5" />
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">No tienes citas agendadas</p>
          <button 
            onClick={() => window.location.href = '/client/schedule'}
            className="mt-4 bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-6 rounded-lg transition duration-200"
          >
            Agendar Primera Cita
          </button>
        </div>
      )}
    </div>
  );
};

export default MyAppointments;