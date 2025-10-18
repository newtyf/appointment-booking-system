import React, { useState, useEffect } from 'react';
import { Users, Search, Eye, Mail, Phone } from 'lucide-react';
import userService from '../../services/userService';

const ClientsView = () => {
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    filterClients();
  }, [clients, searchTerm]);

  const loadClients = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await userService.listUsers();
      const clientsList = data.filter(user => user.role === 'client');
      setClients(clientsList);
    } catch (err) {
      console.error('Error al cargar clientes:', err);
      setError('No se pudieron cargar los clientes');
    } finally {
      setLoading(false);
    }
  };

  const filterClients = () => {
    if (!searchTerm) {
      setFilteredClients(clients);
      return;
    }

    const filtered = clients.filter(client =>
      client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredClients(filtered);
  };

  if (loading && clients.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Cargando clientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-cyan-600 rounded-lg shadow-lg p-8 text-white">
        <h1 className="text-4xl font-bold mb-2 flex items-center">
          <Users className="h-10 w-10 mr-3" />
          Directorio de Clientes
        </h1>
        <p className="text-teal-100 text-lg">Información de todos los clientes registrados</p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar por nombre, email o teléfono..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-3 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-teal-600">
        <p className="text-gray-500 text-sm font-medium">Total de Clientes Registrados</p>
        <p className="text-4xl font-bold text-gray-800">{clients.length}</p>
      </div>

      {/* Clients Grid */}
      {filteredClients.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client) => (
            <div
              key={client.id}
              className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-lg transition-all cursor-pointer"
              onClick={() => {
                setSelectedClient(client);
                setShowModal(true);
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="bg-teal-100 rounded-full p-3">
                  <Users className="h-6 w-6 text-teal-600" />
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedClient(client);
                    setShowModal(true);
                  }}
                  className="text-teal-600 hover:text-teal-800"
                >
                  <Eye className="h-5 w-5" />
                </button>
              </div>

              <h3 className="text-lg font-bold text-gray-800 mb-2">{client.name}</h3>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="h-4 w-4 text-teal-600" />
                  <span className="truncate">{client.email}</span>
                </div>
                {client.phone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="h-4 w-4 text-teal-600" />
                    <span>{client.phone}</span>
                  </div>
                )}
              </div>

              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  <strong>ID:</strong> {client.id}
                </p>
                {client.created_at && (
                  <p className="text-xs text-gray-500">
                    <strong>Registrado:</strong> {new Date(client.created_at).toLocaleDateString('es-ES')}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">
            {searchTerm ? 'No se encontraron clientes' : 'No hay clientes registrados'}
          </p>
        </div>
      )}

      {/* Modal Detalles */}
      {showModal && selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Detalles del Cliente</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-teal-50 rounded-lg p-4 text-center">
                <div className="bg-teal-600 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-3">
                  <Users className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">{selectedClient.name}</h3>
              </div>

              <div className="space-y-3">
                <div className="border-b pb-3">
                  <p className="text-sm text-gray-500 font-medium">ID del Cliente</p>
                  <p className="text-gray-800 font-semibold">{selectedClient.id}</p>
                </div>

                <div className="border-b pb-3">
                  <p className="text-sm text-gray-500 font-medium">Email</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Mail className="h-4 w-4 text-teal-600" />
                    <p className="text-gray-800">{selectedClient.email}</p>
                  </div>
                </div>

                <div className="border-b pb-3">
                  <p className="text-sm text-gray-500 font-medium">Teléfono</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Phone className="h-4 w-4 text-teal-600" />
                    <p className="text-gray-800">{selectedClient.phone || 'No registrado'}</p>
                  </div>
                </div>

                {selectedClient.created_at && (
                  <div className="border-b pb-3">
                    <p className="text-sm text-gray-500 font-medium">Fecha de Registro</p>
                    <p className="text-gray-800">
                      {new Date(selectedClient.created_at).toLocaleDateString('es-ES', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 text-right">
              <button
                onClick={() => setShowModal(false)}
                className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-6 rounded-lg transition duration-200"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientsView;