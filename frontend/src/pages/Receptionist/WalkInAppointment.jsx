import React, { useState, useEffect } from 'react';
import { UserCheck, Scissors, User, AlertCircle, CheckCircle } from 'lucide-react';
import appointmentService from '../../services/appointmentService';
import serviceService from '../../services/serviceService';

const WalkInAppointment = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [availability, setAvailability] = useState(null);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [selectedStylist, setSelectedStylist] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [currentDate] = useState(new Date().toISOString().split('T')[0]);

  const [formData, setFormData] = useState({
    client_name: '',
    client_phone: '',
    stylist_id: '',
    service_id: '',
    time: ''
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const servicesData = await serviceService.listServices();
      setServices(servicesData);
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('Error al cargar datos iniciales');
    } finally {
      setLoading(false);
    }
  };

  // Cargar disponibilidad cuando se selecciona un servicio
  useEffect(() => {
    if (formData.service_id) {
      fetchAvailability();
    } else {
      // Resetear disponibilidad si no hay servicio
      setAvailability(null);
      setSelectedStylist(null);
      setAvailableSlots([]);
      setFormData(prev => ({ ...prev, stylist_id: '', time: '' }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.service_id]);

  const fetchAvailability = async () => {
    setLoadingAvailability(true);
    setError('');
    setAvailability(null);
    setSelectedStylist(null);
    setAvailableSlots([]);
    setFormData(prev => ({ ...prev, stylist_id: '', time: '' }));

    try {
      const data = await appointmentService.getAvailability(
        currentDate,
        formData.service_id
      );
      setAvailability(data);
    } catch (err) {
      console.error('Error al cargar disponibilidad:', err);
      setError('No se pudo cargar la disponibilidad');
    } finally {
      setLoadingAvailability(false);
    }
  };

  const handleStylistSelect = (stylist) => {
    setSelectedStylist(stylist);
    setAvailableSlots(stylist.available_slots || []);
    setFormData(prev => ({ 
      ...prev, 
      stylist_id: stylist.stylist_id.toString(),
      time: '' // Resetear hora al cambiar estilista
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.client_name || !formData.stylist_id || !formData.service_id || !formData.time) {
      setError('Por favor completa todos los campos obligatorios');
      return;
    }

    try {
      setLoading(true);

      // Combinar fecha actual con la hora seleccionada
      const datetime = `${currentDate}T${formData.time}:00`;

      await appointmentService.createWalkInAppointment({
        client_name: formData.client_name,
        client_phone: formData.client_phone || null,
        stylist_id: parseInt(formData.stylist_id),
        service_id: parseInt(formData.service_id),
        date: datetime,
      });

      setSuccess('¡Walk-in registrado exitosamente!');
      setFormData({
        client_name: '',
        client_phone: '',
        stylist_id: '',
        service_id: '',
        time: ''
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
                  {service.name} - S/ {service.price} ({service.duration_min} min)
                </option>
              ))}
            </select>
          </div>

          {/* Estilista - mostrar solo si hay servicio seleccionado */}
          {formData.service_id && (
            <div>
              <label className="block text-gray-700 font-semibold mb-2 flex items-center">
                <User className="h-5 w-5 mr-2 text-purple-600" />
                Estilista Disponible Ahora <span className="text-red-500 ml-1">*</span>
              </label>
              
              {loadingAvailability ? (
                <div className='text-center py-6'>
                  <div className='inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-2'></div>
                  <p className='text-gray-600 text-sm'>Cargando disponibilidad...</p>
                </div>
              ) : availability && availability.stylists && availability.stylists.length > 0 ? (
                <div className='space-y-3'>
                  {availability.stylists.map((stylist) => (
                    <div
                      key={stylist.stylist_id}
                      onClick={() => stylist.available_slots.length > 0 && handleStylistSelect(stylist)}
                      className={`border-2 rounded-lg p-4 transition-all ${
                        selectedStylist?.stylist_id === stylist.stylist_id
                          ? 'border-purple-500 bg-purple-50'
                          : stylist.available_slots.length > 0
                          ? 'border-gray-300 hover:border-purple-400 cursor-pointer'
                          : 'border-gray-200 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center'>
                          <div className={`rounded-full p-2 mr-3 ${
                            selectedStylist?.stylist_id === stylist.stylist_id
                              ? 'bg-purple-500'
                              : 'bg-gray-300'
                          }`}>
                            <User className={`h-4 w-4 ${
                              selectedStylist?.stylist_id === stylist.stylist_id
                                ? 'text-white'
                                : 'text-gray-600'
                            }`} />
                          </div>
                          <div>
                            <h4 className='font-semibold text-gray-800'>{stylist.stylist_name}</h4>
                            <p className='text-sm text-gray-600'>
                              {stylist.available_slots.length > 0 
                                ? `${stylist.available_slots.length} horarios disponibles ahora`
                                : 'Sin disponibilidad'
                              }
                            </p>
                          </div>
                        </div>
                        {selectedStylist?.stylist_id === stylist.stylist_id && (
                          <CheckCircle className='h-5 w-5 text-purple-500' />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : availability ? (
                <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center'>
                  <p className='text-yellow-800 text-sm'>No hay estilistas disponibles en este momento</p>
                </div>
              ) : (
                <p className='text-gray-500 text-sm'>Selecciona un servicio para ver disponibilidad</p>
              )}
            </div>
          )}

          {/* Hora - mostrar solo si hay estilista seleccionado */}
          {selectedStylist && availableSlots.length > 0 && (
            <div>
              <label className="block text-gray-700 font-semibold mb-2 flex items-center">
                <AlertCircle className="h-5 w-5 mr-2 text-purple-600" />
                Hora de Inicio <span className="text-red-500 ml-1">*</span>
              </label>
              <div className='grid grid-cols-3 md:grid-cols-4 gap-2'>
                {availableSlots.map((timeSlot) => (
                  <button
                    key={timeSlot}
                    type='button'
                    onClick={() => setFormData(prev => ({ ...prev, time: timeSlot }))}
                    className={`py-2 px-3 rounded-lg text-sm font-semibold transition-all ${
                      formData.time === timeSlot
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-purple-100 hover:text-purple-600'
                    }`}
                  >
                    {timeSlot}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Fecha: {new Date(currentDate).toLocaleDateString('es-ES', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          )}

          {/* Info Box */}
          <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
            <p className="text-sm text-purple-800">
              <strong>Nota:</strong> Los walk-ins se registran para el día de hoy. 
              Selecciona un horario disponible y el estilista atenderá al cliente en ese momento.
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