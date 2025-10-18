import React, { useState, useEffect } from 'react';
import { UserCheck, Scissors, User, AlertCircle, CheckCircle } from 'lucide-react';
import appointmentService from '../../services/appointmentService';
import serviceService from '../../services/serviceService';
import userService from '../../services/userService';

const WalkInAppointment = () => {
  const [stylists, setStylists] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    client_name: '',
    client_phone: '',
    stylist_id: '',
    service_id: ''
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

      const stylistsList = usersData.filter(u => u.role === 'stylist');
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

    if (!formData.client_name || !formData.stylist_id || !formData.service_id) {
      setError('Por favor completa todos los campos obligatorios');
      return;
    }

    try {
      setLoading(true);

      await appointmentService.createWalkInAppointment({
        client_name: formData.client_name,
        client_phone: formData.client_phone || null,
        stylist_id: parseInt(formData.stylist_id),
        service_id: parseInt(formData.service_id)
      });

      setSuccess('¡Walk-in registrado exitosamente!');
      setFormData({
        client_name: '',
        client_phone: '',
        stylist_id: '',
        service_id: ''
      });

      setTimeout(() => {
        window.location.href = '/receptionist/appointments';
      }, 2000);
    } catch (err) {
      console.error('Error al crear walk-in:', err);
      setError(err.response?.data?.detail || 'Error al registrar el walk-in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg shadow-lg p-8 text-white mb-6">
        <h1 className="text-4xl font-bold mb-2 flex items-center">
          <UserCheck className="h-10 w-10 mr-3" />
          Registrar Walk-in
        </h1>
        <p className="text-purple-100 text-lg">Cliente sin cita previa</p>
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
          {/* Nombre del Cliente */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2 flex items-center">
              <User className="h-5 w-5 mr-2 text-purple-600" />
              Nombre del Cliente <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="text"
              value={formData.client_name}
              onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Ingresa el nombre del cliente"
              required
            />
          </div>

          {/* Teléfono del Cliente */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Teléfono del Cliente (Opcional)
            </label>
            <input
              type="tel"
              value={formData.client_phone}
              onChange={(e) => setFormData({ ...formData, client_phone: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="987654321"
            />
          </div>

          {/* Servicio */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2 flex items-center">
              <Scissors className="h-5 w-5 mr-2 text-purple-600" />
              Servicio <span className="text-red-500 ml-1">*</span>
            </label>
            <select
              value={formData.service_id}
              onChange={(e) => setFormData({ ...formData, service_id: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
              <User className="h-5 w-5 mr-2 text-purple-600" />
              Estilista <span className="text-red-500 ml-1">*</span>
            </label>
            <select
              value={formData.stylist_id}
              onChange={(e) => setFormData({ ...formData, stylist_id: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            >
              <option value="">Selecciona un estilista disponible</option>
              {stylists.map(stylist => (
                <option key={stylist.id} value={stylist.id}>
                  {stylist.name}
                </option>
              ))}
            </select>
          </div>

          {/* Info Box */}
          <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
            <p className="text-sm text-purple-800">
              <strong>Nota:</strong> Los walk-ins se registran con la fecha y hora actual. 
              El cliente será atendido inmediatamente por el estilista seleccionado.
            </p>
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
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Registrando...
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5" />
                  Registrar Walk-in
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WalkInAppointment;