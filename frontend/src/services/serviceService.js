// frontend/src/services/serviceService.js
import api from './api';

const serviceService = {
  // Listar todos los servicios
  listServices: async () => {
    const response = await api.get('/services/');
    return response.data;
  },

  // Obtener un servicio por ID
  getService: async (serviceId) => {
    const response = await api.get(`/services/${serviceId}`);
    return response.data;
  },

  // Crear un nuevo servicio (solo admin)
  createService: async (serviceData) => {
    const response = await api.post('/services/', serviceData);
    return response.data;
  },

  // Actualizar un servicio (solo admin)
  updateService: async (serviceId, serviceData) => {
    const response = await api.put(`/services/${serviceId}`, serviceData);
    return response.data;
  },

  // Eliminar un servicio (solo admin)
  deleteService: async (serviceId) => {
    await api.delete(`/services/${serviceId}`);
  },
};

export default serviceService;