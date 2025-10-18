import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Scissors, AlertCircle, CheckCircle } from 'lucide-react';
import appointmentService from '../../services/appointmentService';
import serviceService from '../../services/serviceService';
import userService from '../../services/userService';

const ScheduleAppointment = () => {
  const [clients, setClients] = useState([]);
  const [stylists, setStylists] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    client_id: '',
    stylist_id: '',
    service_id: '',
    date: '',
    time: ''
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [usersData, servicesData] = await Promise.all([
        userService.listUsers(),
        serviceService.listServices()
      ]);

      const clientsList = usersData.filter(u => u.role === 'client');
      const stylistsList = usersData.filter(u => u.role === 'stylist');

      setClients(clientsList);
      setStylists(stylistsList);
      setServices(servicesData);
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('Error al cargar datos iniciales');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.client_id || !formData.stylist_id || !formData.service_id || !formData.date || !formData.time) {
      setError('Por favor completa todos los campos');
      return;
    }

    try {
      setLoading(true);
      const datetime = `${formData.date}T${formData.time}:00`;

      await appointmentService.createAppointment({
        client_id: parseInt(formData.client_id),
        stylist_id: parseInt(formData.stylist_id),
        service_id: parseInt(formData.service_id),
        date: datetime
      });

      setSuccess('¡Cita agendada exitosamente!');
      setFormData({
        client_id: '',
        stylist_id: '',
        service_id: '',
        date: '',
        time: ''
      });

      setTimeout(() => {
        window.location.href = '/receptionist/appointments';
      }, 2000);
    } catch (err) {
      console.error('Error al crear cita:', err);
      setError(err.response?.data?.detail || 'Error al agendar la cita');
    } finally {
      setLoading(false);
    }
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-lg p-8 text-white mb-6">
        <h1 className="text-4xl font-bold mb-2 flex items-center">
          <Calendar className="h-10 w-10 mr-3" />
          Agendar Nueva Cita
        </h1>
        <p className="text-blue-100 text-lg">Registra una cita para un cliente</p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded flex items-start">
          <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      {/* Form */}
      <div className="bg-white rounded-lg shadow-md p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Cliente */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2 flex items-center">
              <User className="h-5 w-5 mr-2 text-blue-600" />
              Cliente <span className="text-red-500 ml-1">*</span>
            </label>
            <select
              value={formData.client_id}
              onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Selecciona un cliente</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.name} - {client.email}
                </option>
              ))}
            </select>
          </div>

          {/* Servicio */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2 flex items-center">
              <Scissors className="h-5 w-5 mr-2 text-blue-600" />
              Servicio <span className="text-red-500 ml-1">*</span>
            </label>
            <select
              value={formData.service_id}
              onChange={(e) => setFormData({ ...formData, service_id: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Selecciona un servicio</option>
              {services.map(service => (
                <option key={service.id} value={service.id}>
                  {service.name} - S/ {service.price} ({service.duration} min)
                </option>
              ))}
            </select>
          </div>

          {/* Estilista */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2 flex items-center">
              <User className="h-5 w-5 mr-2 text-blue-600" />
              Estilista <span className="text-red-500 ml-1">*</span>
            </label>
            <select
              value={formData.stylist_id}
              onChange={(e) => setFormData({ ...formData, stylist_id: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Selecciona un estilista</option>
              {stylists.map(stylist => (
                <option key={stylist.id} value={stylist.id}>
                  {stylist.name}
                </option>
              ))}
            </select>
          </div>

          {/* Fecha */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-blue-600" />
              Fecha <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              min={getTodayDate()}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Hora */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-blue-600" />
              Hora <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Botones */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => window.location.href = '/receptionist/dashboard'}
              className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 px-6 rounded-lg transition duration-200"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Agendando...
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5" />
                  Agendar Cita
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScheduleAppointment;