import React from 'react';
import { Search, Eye, Edit, Trash } from 'lucide-react';

const UsersManagement = () => {
  const users = [
    {
      id: 1,
      nombre: 'Juan Pérez',
      correo: 'juan.perez@example.com',
      telefono: '987654321',
      rol: 'Administrador',
      creado_en: '2024-01-15 10:30:00',
      actualizado_en: '2024-06-20 14:00:00',
    },
    {
      id: 2,
      nombre: 'María García',
      correo: 'maria.garcia@example.com',
      telefono: '912345678',
      rol: 'Estilista',
      creado_en: '2024-02-01 09:00:00',
      actualizado_en: '2024-07-01 11:15:00',
    },
    {
      id: 3,
      nombre: 'Carlos Ruiz',
      correo: 'carlos.ruiz@example.com',
      telefono: '934567890',
      rol: 'Cliente',
      creado_en: '2024-03-10 16:45:00',
      actualizado_en: '2024-03-10 16:45:00',
    },
    {
      id: 4,
      nombre: 'Ana López',
      correo: 'ana.lopez@example.com',
      telefono: '956789012',
      rol: 'Cliente',
      creado_en: '2024-04-05 11:00:00',
      actualizado_en: '2024-05-20 10:00:00',
    },
  ];

  return (
    <div className="container mx-auto bg-white p-8 rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Gestión de Usuarios</h1>

      <div className="flex justify-between items-center mb-6">
        <div className="relative flex-grow mr-4">
          <input
            type="text"
            placeholder="Buscar por nombre, correo o teléfono..."
            className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
          <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
        </div>
        <button className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200">
          Agregar Usuario
        </button>
      </div>

      {users.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead>
              <tr>
                <th className="py-3 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="py-3 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="py-3 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Correo
                </th>
                <th className="py-3 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Teléfono
                </th>
                <th className="py-3 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol
                </th>
                <th className="py-3 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Creado En
                </th>
                <th className="py-3 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actualizado En
                </th>
                <th className="py-3 px-4 border-b border-gray-200 bg-gray-50 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 border-b border-gray-200 text-gray-700">
                    {user.id}
                  </td>
                  <td className="py-3 px-4 border-b border-gray-200 text-gray-700">
                    {user.nombre}
                  </td>
                  <td className="py-3 px-4 border-b border-gray-200 text-gray-700">
                    {user.correo}
                  </td>
                  <td className="py-3 px-4 border-b border-gray-200 text-gray-700">
                    {user.telefono}
                  </td>
                  <td className="py-3 px-4 border-b border-gray-200 text-gray-700">
                    {user.rol}
                  </td>
                  <td className="py-3 px-4 border-b border-gray-200 text-gray-700">
                    {new Date(user.creado_en).toLocaleDateString()} <br />
                    <span className="text-sm text-gray-500">{new Date(user.creado_en).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </td>
                  <td className="py-3 px-4 border-b border-gray-200 text-gray-700">
                    {new Date(user.actualizado_en).toLocaleDateString()} <br />
                    <span className="text-sm text-gray-500">{new Date(user.actualizado_en).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </td>
                  <td className="py-3 px-4 border-b border-gray-200 text-center text-sm font-medium whitespace-nowrap">
                    <button className="text-blue-600 hover:text-blue-900 mx-1">
                      <Eye className="h-5 w-5" />
                    </button>
                    <button className="text-purple-600 hover:text-purple-900 mx-1">
                      <Edit className="h-5 w-5" />
                    </button>
                    <button className="text-red-600 hover:text-red-900 mx-1">
                      <Trash className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-600">No hay usuarios registrados por el momento.</p>
      )}
    </div>
  );
};

export default UsersManagement;