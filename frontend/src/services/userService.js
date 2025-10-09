// frontend/src/services/userService.js
import api from './api';

const userService = {
  // Obtener un usuario por ID
  getUser: async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  // Crear un nuevo usuario
  createUser: async (userData) => {
    const response = await api.post('/users/', userData);
    return response.data;
  },
};

export default userService;