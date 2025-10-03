// frontend/src/pages/Client/ScheduleAppointment.jsx
import { useState, useEffect } from 'react';
import { Calendar, Clock, User, Scissors } from 'lucide-react';
import appointmentService from '../../services/appointmentService';
import serviceService from '../../services/serviceService';

const ScheduleAppointment = () => {
  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  // TODO: Obtener estos valores del usuario logueado
  const currentUserId = 1; // Reemplazar con el ID del usuario actual
  const currentStylistId = 1; // Reemplazar con el ID del estilista seleccionado

  const [formData, setFormData] = useState({
    client_id: currentUserId,
    stylist_id: currentStylistId,
    service_id: '',
    date: '',
    status: 'pending',
    created_by: currentUserId,
    modified_by: currentUserId
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [servicesData, appointmentsData] = await Promise.all([
        serviceService.listServices(),
        appointmentService.listAppointments()
      ]);
      setServices(servicesData);
      setAppointments(appointmentsData);
    } catch (err) {
      console.error('Error al cargar los datos:', err);
      setError('Error al cargar los datos. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Validar horario laboral (8 AM - 8 PM)
    if (name === 'date' && value) {
      const selectedDate = new Date(value);
      const hour = selectedDate.getHours();
      
      if (hour < 8 || hour >= 20) {
        setError('El horario de atención es de 8:00 AM a 8:00 PM');
        return;
      }
      
      // Validar que el servicio no termine después de las 8 PM
      if (formData.service_id) {
        const selectedService = services.find(s => s.id === formData.service_id);
        if (selectedService) {
          const endTime = new Date(selectedDate.getTime() + selectedService.duration_min * 60000);
          if (endTime.getHours() >= 20 || (endTime.getHours() === 19 && endTime.getMinutes() > 59)) {
            setError(`Este servicio dura ${selectedService.duration_min} minutos y terminaría a las ${endTime.toLocaleTimeString('es-PE', {hour: '2-digit', minute: '2-digit'})}. El horario cierra a las 8:00 PM.`);
            return;
          }
        }
      }
      
      setError(null);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'service_id' || name === 'stylist_id' ? parseInt(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage('');

    // Validar duración del servicio
    const selectedService = services.find(s => s.id === formData.service_id);
    if (selectedService && formData.date) {
      const appointmentDate = new Date(formData.date);
      const endTime = new Date(appointmentDate.getTime() + selectedService.duration_min * 60000);
      
      if (endTime.getHours() >= 20 || (endTime.getHours() === 20 && endTime.getMinutes() > 0)) {
        setError(`Este servicio dura ${selectedService.duration_min} minutos y terminaría después de las 8:00 PM. Por favor elige un horario más temprano.`);
        return;
      }
    }

    try {
      setLoading(true);
      const newAppointment = await appointmentService.createAppointment(formData);
      setAppointments(prev => [...prev, newAppointment]);
      setSuccessMessage('¡Cita agendada exitosamente!');
      
      // Limpiar formulario
      setFormData({
        ...formData,
        service_id: '',
        date: '',
        status: 'pending'
      });

      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error al crear la cita:', err);
      setError('Error al crear la cita: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm('¿Estás seguro de cancelar esta cita?')) return;

    try {
      setLoading(true);
      await appointmentService.deleteAppointment(appointmentId);
      setAppointments(prev => prev.filter(apt => apt.id !== appointmentId));
      setSuccessMessage('Cita cancelada exitosamente');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error al cancelar la cita:', err);
      setError('Error al cancelar la cita: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
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

  const getServiceName = (serviceId) => {
    const service = services.find(s => s.id === serviceId);
    return service ? service.name : `Servicio #${serviceId}`;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pendiente' },
      confirmed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Confirmada' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelada' },
      completed: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Completada' }
    };
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  if (loading && appointments.length === 0 && services.length === 0) {
    return (
      <div className="container mx-auto p-8 bg-white rounded-lg shadow-md">
        <div className="text-center text-gray-600 py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
          <p className="mt-4">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        <Calendar className="inline-block mr-2 h-8 w-8 text-pink-600" />
        Agendar Nueva Cita
      </h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 flex items-center">
          <span className="mr-2">⚠️</span>
          {error}
        </div>
      )}

      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6 flex items-center">
          <span className="mr-2">✓</span>
          {successMessage}
        </div>
      )}

      {/* Formulario de nueva cita */}
      <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-6 rounded-lg shadow-sm mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
          <Scissors className="mr-2 h-5 w-5 text-pink-600" />
          Nueva Cita
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 flex items-center">
                <Scissors className="mr-1 h-4 w-4" />
                Servicio
              </label>
              <select
                name="service_id"
                value={formData.service_id}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="">Seleccionar servicio</option>
                {services.map(service => (
                  <option key={service.id} value={service.id}>
                    {service.name} - {service.duration_min} min
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 flex items-center">
                <Clock className="mr-1 h-4 w-4" />
                Fecha y Hora
              </label>
              <input
                type="datetime-local"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
                min={new Date().toISOString().slice(0, 16)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700 transition duration-200 disabled:bg-gray-400 font-medium w-full md:w-auto"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Agendando...
              </span>
            ) : (
              '📅 Agendar Cita'
            )}
          </button>
        </form>
      </div>

      {/* Lista de citas */}
      <div className="bg-white">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800 flex items-center">
          <User className="mr-2 h-6 w-6 text-pink-600" />
          Mis Citas Agendadas
        </h2>
        
        {appointments.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No tienes citas agendadas</p>
            <p className="text-gray-400 text-sm mt-2">Agenda tu primera cita usando el formulario de arriba</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {appointments.map(appointment => (
              <div
                key={appointment.id}
                className="border border-gray-200 rounded-lg p-5 hover:shadow-lg transition duration-200 bg-white"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-lg text-gray-800">
                    {getServiceName(appointment.service_id)}
                  </h3>
                  {getStatusBadge(appointment.status)}
                </div>
                
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <p className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-pink-500" />
                    {formatDate(appointment.date)}
                  </p>
                  <p className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-pink-500" />
                    Estilista #{appointment.stylist_id}
                  </p>
                </div>
                
                <button
                  onClick={() => handleCancelAppointment(appointment.id)}
                  disabled={loading || appointment.status === 'cancelled'}
                  className="w-full bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {appointment.status === 'cancelled' ? 'Cancelada' : 'Cancelar Cita'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduleAppointment;