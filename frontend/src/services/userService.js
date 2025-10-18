// frontend/src/services/userService.js
import api from './api';

const userService = {
  // Listar todos los usuarios (admin/receptionist)
  listUsers: async () => {
    const response = await api.get('/users');
    return response.data;
  },

  // Obtener un usuario por ID
  getUser: async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  // Obtener el usuario actual (me)
  getCurrentUser: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },

  // Crear un nuevo usuario
  createUser: async (userData) => {
    const response = await api.post('/users/', userData);
    return response.data;
  },

  // Actualizar un usuario
  updateUser: async (userId, userData) => {
    const response = await api.put(`/users/${userId}`, userData);
    return response.data;
  },

  // Eliminar un usuario
  deleteUser: async (userId) => {
    await api.delete(`/users/${userId}`);
  },
};

export default userService;