import api from './api';

const appointmentService = {
  
  // Listar MIS citas (según rol)
  getMyAppointments: async () => {
    const response = await api.get('/appointments/my-appointments');
    return response.data;
  },

  // Listar TODAS las citas (solo admin/receptionist)
  listAllAppointments: async () => {
    const response = await api.get('/appointments');
    return response.data;
  },

  // Obtener una cita por ID
  getAppointment: async (appointmentId) => {
    const response = await api.get(`/appointments/${appointmentId}`);
    return response.data;
  },

  // Cliente reserva su propia cita
  bookAppointment: async (appointmentData) => {
    const response = await api.post('/appointments/book', appointmentData);
    return response.data;
  },

  // Admin/Receptionist crea cita (registrado o walk-in)
  createAppointment: async (appointmentData) => {
    const response = await api.post('/appointments/', appointmentData);
    return response.data;
  },

  // Admin/Receptionist crea cita walk-in
  createWalkInAppointment: async (appointmentData) => {
    const response = await api.post('/appointments/walk-in', appointmentData);
    return response.data;
  },

  // Actualizar cita
  updateAppointment: async (appointmentId, appointmentData) => {
    const response = await api.put(`/appointments/${appointmentId}`, appointmentData);
    return response.data;
  },

  // Cambiar estado de cita
  updateAppointmentStatus: async (appointmentId, status) => {
    const response = await api.patch(`/appointments/${appointmentId}/status?status_value=${status}`);
    return response.data;
  },

  // Cancelar cita
  cancelAppointment: async (appointmentId) => {
    await api.delete(`/appointments/${appointmentId}`);
  },

 
  // Ver disponibilidad (público)
  getAvailability: async (date, serviceId = null, stylistId = null) => {
    let url = `/appointments/availability?date=${date}`;
    if (serviceId) url += `&service_id=${serviceId}`;
    if (stylistId) url += `&stylist_id=${stylistId}`;
    const response = await api.get(url);
    return response.data;
  },

  
  // Obtener dashboard según rol
  getDashboard: async () => {
    const response = await api.get('/dashboard');
    return response.data;
  },
};

export default appointmentService;