// frontend/src/services/appointmentService.js
import api from './api';

const appointmentService = {
  // Listar todas las citas (admin)
  listAppointments: async () => {
    const response = await api.get('/appointments');
    return response.data;
  },

  // Obtener una cita por ID
  getAppointment: async (appointmentId) => {
    const response = await api.get(`/appointments/${appointmentId}`);
    return response.data;
  },

  // Crear una nueva cita
  createAppointment: async (appointmentData) => {
    const response = await api.post('/appointments/', appointmentData);
    return response.data;
  },

  // Actualizar una cita
  updateAppointment: async (appointmentId, appointmentData) => {
    const response = await api.put(`/appointments/${appointmentId}`, appointmentData);
    return response.data;
  },

  // Eliminar una cita
  deleteAppointment: async (appointmentId) => {
    await api.delete(`/appointments/${appointmentId}`);
  },
};

export default appointmentService;