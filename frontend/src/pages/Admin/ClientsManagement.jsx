import React, { useState, useEffect } from "react";
import { Search, Eye, Trash, Users, Loader, Plus, Mail, Phone } from "lucide-react";
import userService from '../../services/userService';

const ClientsManagement = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [modalType, setModalType] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'client'
  });

  // Estados para errores de validación
  const [fieldErrors, setFieldErrors] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });

  // Validaciones siguiendo ISO 25010
  const validaciones = {
    name: (valor) => {
      if (!valor || valor.trim().length === 0) {
        return 'El nombre es requerido';
      }
      if (valor.trim().length < 3) {
        return 'El nombre debe tener al menos 3 caracteres';
      }
      if (valor.length > 100) {
        return 'El nombre no puede exceder 100 caracteres';
      }
      // Solo letras, espacios, tildes y ñ
      const regexNombre = /^[a-záéíóúñüA-ZÁÉÍÓÚÑÜ\s]+$/;
      if (!regexNombre.test(valor)) {
        return 'El nombre solo puede contener letras y espacios';
      }
      if (/\s{2,}/.test(valor)) {
        return 'El nombre no puede contener espacios múltiples consecutivos';
      }
      return '';
    },

    email: (valor) => {
      if (!valor || valor.trim().length === 0) {
        return 'El email es requerido';
      }
      if (valor.length < 5) {
        return 'El email debe tener al menos 5 caracteres';
      }
      if (valor.length > 254) {
        return 'El email no puede exceder 254 caracteres';
      }
      // Regex completo para validar email
      const regexEmail = /^[a-zA-Z0-9]([a-zA-Z0-9._-]{0,63})?@[a-zA-Z0-9]([a-zA-Z0-9.-]{0,253})?[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
      if (!regexEmail.test(valor)) {
        return 'Ingrese un email válido (ej: usuario@dominio.com)';
      }
      if (/[<>()[\]\\,;:"\s]/.test(valor.split('@')[0])) {
        return 'El email contiene caracteres no permitidos';
      }
      return '';
    },

    phone: (valor) => {
      // El teléfono es opcional, pero si se ingresa debe ser válido
      if (!valor || valor.trim().length === 0) {
        return ''; // Opcional, sin error si está vacío
      }
      
      const telefonoLimpio = valor.replace(/[\s-]/g, '');
      
      if (telefonoLimpio.length < 7) {
        return 'El teléfono debe tener al menos 7 dígitos';
      }
      if (telefonoLimpio.length > 15) {
        return 'El teléfono no puede exceder 15 dígitos';
      }
      const regexTelefono = /^[\d\s\-()]+$/;
      if (!regexTelefono.test(valor)) {
        return 'El teléfono solo puede contener números, espacios, guiones y paréntesis';
      }
      const digitosCount = (telefonoLimpio.match(/\d/g) || []).length;
      if (digitosCount < 7) {
        return 'El teléfono debe contener al menos 7 dígitos';
      }
      return '';
    },

    password: (valor) => {
      if (!valor || valor.length === 0) {
        return 'La contraseña es requerida';
      }
      if (valor.length < 8) {
        return 'La contraseña debe tener al menos 8 caracteres';
      }
      if (valor.length > 128) {
        return 'La contraseña no puede exceder 128 caracteres';
      }
      if (!/[A-Z]/.test(valor)) {
        return 'La contraseña debe contener al menos una letra mayúscula';
      }
      if (!/[a-z]/.test(valor)) {
        return 'La contraseña debe contener al menos una letra minúscula';
      }
      if (!/\d/.test(valor)) {
        return 'La contraseña debe contener al menos un número';
      }
      if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(valor)) {
        return 'La contraseña debe contener al menos un carácter especial';
      }
      if (/\s/.test(valor)) {
        return 'La contraseña no puede contener espacios';
      }
      return '';
    }
  };

  // Validar un campo específico
  const validarCampo = (campo, valor) => {
    const mensajeError = validaciones[campo](valor);
    setFieldErrors(prev => ({
      ...prev,
      [campo]: mensajeError
    }));
    return mensajeError === '';
  };

  // Validar todos los campos antes de enviar
  const validarFormulario = () => {
    const errores = {
      name: validaciones.name(formData.name),
      email: validaciones.email(formData.email),
      phone: validaciones.phone(formData.phone),
      password: validaciones.password(formData.password)
    };

    setFieldErrors(errores);
    return Object.values(errores).every(error => error === '');
  };

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.listUsers();
      const clientsList = data.filter(user => user.role === 'client');
      setClients(clientsList);
    } catch (err) {
      console.error('Error al cargar clientes:', err);
      setError('Error al cargar clientes');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClient = async () => {
    // Validar todos los campos
    if (!validarFormulario()) {
      alert('Por favor, corrija los errores en el formulario');
      return;
    }

    try {
      setLoading(true);
      const newClient = await userService.createUser({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || null,
        password: formData.password,
        role: 'client'
      });
      setClients([newClient, ...clients]);
      setModalType(null);
      resetForm();
      alert('Cliente creado exitosamente');
    } catch (err) {
      console.error('Error al crear cliente:', err);
      alert('Error: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClient = async () => {
    try {
      setLoading(true);
      await userService.deleteUser(selectedClient.id);
      setClients(clients.filter(c => c.id !== selectedClient.id));
      setModalType(null);
      setSelectedClient(null);
      alert('Cliente eliminado exitosamente');
    } catch (err) {
      console.error('Error al eliminar cliente:', err);
      alert('Error: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
      role: 'client'
    });
    setFieldErrors({
      name: '',
      email: '',
      phone: '',
      password: ''
    });
  };

  const filteredClients = clients.filter(client =>
    client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && clients.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mb-4"></div>
          <p className="text-gray-600">Cargando clientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-lg shadow-lg p-8 text-white mb-6">
        <h1 className="text-4xl font-bold mb-2 flex items-center">
          <Users className="h-10 w-10 mr-3" />
          Gestión de Clientes
        </h1>
        <p className="text-green-100 text-lg">Administra los clientes del salón</p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Búsqueda y Agregar */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center">
          <div className="relative flex-grow mr-4">
            <input
              type="text"
              placeholder="Buscar por nombre, email o teléfono..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>
          <button
            onClick={() => {
              setModalType('add');
              resetForm();
            }}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200 flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Agregar Cliente
          </button>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-600">
          <p className="text-gray-500 text-sm font-medium">Total Clientes</p>
          <p className="text-3xl font-bold text-gray-800">{clients.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-600">
          <p className="text-gray-500 text-sm font-medium">Nuevos Este Mes</p>
          <p className="text-3xl font-bold text-gray-800">
            {clients.filter(c => {
              const createdDate = new Date(c.created_at);
              const now = new Date();
              return createdDate.getMonth() === now.getMonth() && 
                     createdDate.getFullYear() === now.getFullYear();
            }).length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-purple-600">
          <p className="text-gray-500 text-sm font-medium">Búsqueda Activa</p>
          <p className="text-3xl font-bold text-gray-800">{filteredClients.length}</p>
        </div>
      </div>

      {/* Tabla */}
      {filteredClients.length > 0 ? (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-gray-50">
                  <th className="py-3 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="py-3 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                  <th className="py-3 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="py-3 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase">Teléfono</th>
                  <th className="py-3 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase">Registro</th>
                  <th className="py-3 px-4 border-b text-center text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 border-b text-gray-700">{client.id}</td>
                    <td className="py-3 px-4 border-b text-gray-700 font-semibold">{client.name}</td>
                    <td className="py-3 px-4 border-b text-gray-700">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        {client.email}
                      </div>
                    </td>
                    <td className="py-3 px-4 border-b text-gray-700">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        {client.phone || 'N/A'}
                      </div>
                    </td>
                    <td className="py-3 px-4 border-b text-gray-700 text-sm">
                      {client.created_at ? new Date(client.created_at).toLocaleDateString('es-ES') : 'N/A'}
                    </td>
                    <td className="py-3 px-4 border-b text-center whitespace-nowrap">
                      <button
                        onClick={() => {
                          setSelectedClient(client);
                          setModalType('view');
                        }}
                        className="text-blue-600 hover:text-blue-900 mx-1"
                        title="Ver detalles"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedClient(client);
                          setModalType('delete');
                        }}
                        className="text-red-600 hover:text-red-900 mx-1"
                        title="Eliminar"
                      >
                        <Trash className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 text-lg mb-4">
            {searchTerm ? 'No se encontraron clientes' : 'No hay clientes registrados'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => {
                setModalType('add');
                resetForm();
              }}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition duration-200"
            >
              Agregar Primer Cliente
            </button>
          )}
        </div>
      )}

      {/* Modal Ver */}
      {modalType === 'view' && selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold mb-4">Detalles del Cliente</h2>
            <div className="space-y-3">
              <p><strong>ID:</strong> {selectedClient.id}</p>
              <p><strong>Nombre:</strong> {selectedClient.name}</p>
              <p><strong>Email:</strong> {selectedClient.email}</p>
              <p><strong>Teléfono:</strong> {selectedClient.phone || 'N/A'}</p>
              {selectedClient.created_at && (
                <p><strong>Registro:</strong> {new Date(selectedClient.created_at).toLocaleDateString('es-ES')}</p>
              )}
            </div>
            <div className="mt-6 text-right">
              <button
                onClick={() => {
                  setModalType(null);
                  setSelectedClient(null);
                }}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Eliminar */}
      {modalType === 'delete' && selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-sm shadow-xl">
            <h2 className="text-xl font-bold mb-4">¿Eliminar Cliente?</h2>
            <p>¿Estás seguro de eliminar a <strong>{selectedClient.name}</strong>?</p>
            <p className="text-sm text-red-600 mt-2">Esta acción no se puede deshacer.</p>
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => {
                  setModalType(null);
                  setSelectedClient(null);
                }}
                disabled={loading}
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteClient}
                disabled={loading}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:bg-gray-400"
              >
                {loading ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Agregar */}
      {modalType === 'add' && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold mb-4">Agregar Cliente</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({...formData, name: e.target.value});
                    validarCampo('name', e.target.value);
                  }}
                  onBlur={(e) => validarCampo('name', e.target.value)}
                  className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 ${
                    fieldErrors.name ? 'border-red-500 focus:ring-red-500' : 'focus:ring-green-500'
                  }`}
                  placeholder="Nombre completo"
                />
                {fieldErrors.name && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.name}</p>
                )}
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({...formData, email: e.target.value});
                    validarCampo('email', e.target.value);
                  }}
                  onBlur={(e) => validarCampo('email', e.target.value)}
                  className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 ${
                    fieldErrors.email ? 'border-red-500 focus:ring-red-500' : 'focus:ring-green-500'
                  }`}
                  placeholder="correo@ejemplo.com"
                />
                {fieldErrors.email && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
                )}
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Teléfono (opcional)</label>
                <input
                  value={formData.phone}
                  onChange={(e) => {
                    setFormData({...formData, phone: e.target.value});
                    validarCampo('phone', e.target.value);
                  }}
                  onBlur={(e) => validarCampo('phone', e.target.value)}
                  className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 ${
                    fieldErrors.phone ? 'border-red-500 focus:ring-red-500' : 'focus:ring-green-500'
                  }`}
                  placeholder="987654321"
                />
                {fieldErrors.phone && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.phone}</p>
                )}
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Contraseña <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({...formData, password: e.target.value});
                    validarCampo('password', e.target.value);
                  }}
                  onBlur={(e) => validarCampo('password', e.target.value)}
                  className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 ${
                    fieldErrors.password ? 'border-red-500 focus:ring-red-500' : 'focus:ring-green-500'
                  }`}
                  placeholder="Mínimo 8 caracteres (mayús, minús, número, especial)"
                />
                {fieldErrors.password && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.password}</p>
                )}
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => {
                  setModalType(null);
                  resetForm();
                }}
                disabled={loading}
                className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateClient}
                disabled={loading}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400 flex items-center gap-2"
              >
                {loading && <Loader className="h-4 w-4 animate-spin" />}
                {loading ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientsManagement;