import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Eye, Edit, Trash, Search } from 'lucide-react';

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchAppointments = async () => {
    setLoading(true);
    setError('');
    const token = localStorage.getItem('accessToken');

    if (!token) {
      setError('No estás autenticado. Por favor, inicia sesión.');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get('/api/appointments', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setAppointments(response.data);
    } catch (err) {
      console.error('Error al obtener citas:', err);
      if (err.response) {
        setError(`Error del servidor: ${err.response.status} - ${err.response.data.detail || 'Algo salió mal'}`);
      } else if (err.request) {
        setError('No se pudo conectar con el servidor. Verifica que el backend esté funcionando.');
      } else {
        setError('Ocurrió un error inesperado al obtener las citas.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const filteredAppointments = appointments.filter(appointment =>
    appointment.cliente_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.estilista_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.servicio_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.estado?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto bg-white p-8 rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Gestión de Citas</h1>

      <div className="flex justify-between items-center mb-6">
        <div className="relative flex-grow mr-4">
          <input
            type="text"
            placeholder="Buscar por cliente, estilista o servicio..."
            className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-pink-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
        </div>
        <button className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200">
          Agregar
        </button>
      </div>

      {loading ? (
        <p className="text-gray-600">Cargando citas...</p>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      ) : filteredAppointments.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead>
              <tr>
                <th className="py-3 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="py-3 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="py-3 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="py-3 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estilista
                </th>
                <th className="py-3 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Servicio
                </th>
                <th className="py-3 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="py-3 px-4 border-b border-gray-200 bg-gray-50 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.map((appointment) => (
                <tr key={appointment.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 border-b border-gray-200 text-gray-700">
                    {appointment.id}
                  </td>
                  <td className="py-3 px-4 border-b border-gray-200 text-gray-700">
                    {new Date(appointment.fecha).toLocaleDateString()} <br />
                    <span className="text-sm text-gray-500">{new Date(appointment.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </td>
                  <td className="py-3 px-4 border-b border-gray-200 text-gray-700">
                    {appointment.cliente_nombre || appointment.client_id}
                  </td>
                  <td className="py-3 px-4 border-b border-gray-200 text-gray-700">
                    {appointment.estilista_nombre || appointment.stylist_id}
                  </td>
                  <td className="py-3 px-4 border-b border-gray-200 text-gray-700">
                    {appointment.servicio_nombre || appointment.service_id}
                  </td>
                  <td className="py-3 px-4 border-b border-gray-200">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        appointment.estado === 'Confirmada' ? 'bg-green-100 text-green-800' :
                        appointment.estado === 'Pendiente' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}
                    >
                      {appointment.estado}
                    </span>
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
        <p className="text-gray-600">No hay citas para mostrar.</p>
      )}
    </div>
  );
};

export default MyAppointments;