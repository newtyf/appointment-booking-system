import React, { useState, useEffect } from "react";
import { Search, Eye, Trash, UserCog, Loader, Plus, Mail, Phone } from "lucide-react";
import userService from '../../services/userService';

const EmployeesManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [modalType, setModalType] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'stylist'
  });

  const [fieldErrors, setFieldErrors] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });

  // Validaciones ISO 25010
  const validaciones = {
    name: (value) => {
      if (!value || !value.trim()) {
        return 'El nombre es requerido';
      }
      if (value.trim().length < 3) {
        return 'El nombre debe tener al menos 3 caracteres';
      }
      if (value.length > 100) {
        return 'El nombre no puede exceder 100 caracteres';
      }
      // Solo letras, espacios, tildes, ñ y diéresis
      if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(value)) {
        return 'El nombre solo puede contener letras y espacios';
      }
      // No múltiples espacios consecutivos
      if (/\s{2,}/.test(value)) {
        return 'El nombre no puede contener espacios múltiples consecutivos';
      }
      return '';
    },

    email: (value) => {
      if (!value || !value.trim()) {
        return 'El email es requerido';
      }
      if (value.length < 5) {
        return 'El email debe tener al menos 5 caracteres';
      }
      if (value.length > 254) {
        return 'El email no puede exceder 254 caracteres';
      }
      // Validación básica de formato email
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return 'Ingrese un email válido';
      }
      // Caracteres no permitidos (espacios, caracteres especiales peligrosos)
      if (/[\s<>()[\]\\,;:]/.test(value)) {
        return 'El email contiene caracteres no permitidos';
      }
      return '';
    },

    phone: (value) => {
      // El teléfono es opcional, pero si se ingresa debe ser válido (formato peruano)
      if (!value || !value.trim()) {
        return '';
      }
      
      // Eliminar espacios y guiones
      const telefonoLimpio = value.replace(/[\s-]/g, '');
      
      // Solo números
      if (!/^\d+$/.test(telefonoLimpio)) {
        return 'El teléfono solo puede contener números';
      }
      
      // Debe tener exactamente 9 dígitos
      if (telefonoLimpio.length !== 9) {
        return 'El teléfono debe tener exactamente 9 dígitos';
      }
      
      // Debe comenzar con 9 (formato peruano de celular)
      if (!telefonoLimpio.startsWith('9')) {
        return 'El teléfono debe comenzar con 9';
      }
      
      return '';
    },

    password: (value) => {
      if (!value) {
        return 'La contraseña es requerida';
      }
      if (value.length < 8) {
        return 'La contraseña debe tener al menos 8 caracteres';
      }
      if (value.length > 128) {
        return 'La contraseña no puede exceder 128 caracteres';
      }
      if (!/[A-Z]/.test(value)) {
        return 'La contraseña debe contener al menos una letra mayúscula';
      }
      if (!/[a-z]/.test(value)) {
        return 'La contraseña debe contener al menos una letra minúscula';
      }
      if (!/\d/.test(value)) {
        return 'La contraseña debe contener al menos un número';
      }
      if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(value)) {
        return 'La contraseña debe contener al menos un carácter especial';
      }
      if (/\s/.test(value)) {
        return 'La contraseña no puede contener espacios';
      }
      return '';
    }
  };

  const validarCampo = (campo, valor) => {
    const error = validaciones[campo](valor);
    setFieldErrors(prev => ({
      ...prev,
      [campo]: error
    }));
    return error === '';
  };

  const validarFormulario = () => {
    const errores = {
      name: validaciones.name(formData.name),
      email: validaciones.email(formData.email),
      phone: validaciones.phone(formData.phone),
      password: validaciones.password(formData.password)
    };

    setFieldErrors(errores);

    return !Object.values(errores).some(error => error !== '');
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.listUsers();
      const employeesList = data.filter(user => 
        ['admin', 'receptionist', 'stylist'].includes(user.role)
      );
      setEmployees(employeesList);
    } catch (err) {
      console.error('Error al cargar empleados:', err);
      setError('Error al cargar empleados');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEmployee = async () => {
    // Validar formulario completo
    if (!validarFormulario()) {
      alert('Por favor corrige los errores en el formulario');
      return;
    }

    try {
      setLoading(true);
      const newEmployee = await userService.createUser(formData);
      setEmployees([newEmployee, ...employees]);
      setModalType(null);
      resetForm();
      alert('Empleado creado exitosamente');
    } catch (err) {
      console.error('Error al crear empleado:', err);
      alert('Error: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEmployee = async () => {
    try {
      setLoading(true);
      await userService.deleteUser(selectedEmployee.id);
      setEmployees(employees.filter(e => e.id !== selectedEmployee.id));
      setModalType(null);
      setSelectedEmployee(null);
      alert('Empleado eliminado exitosamente');
    } catch (err) {
      console.error('Error al eliminar empleado:', err);
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
      role: 'stylist'
    });
    setFieldErrors({
      name: '',
      email: '',
      phone: '',
      password: ''
    });
  };

  const filteredEmployees = employees.filter(employee =>
    employee.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadgeColor = (role) => {
    const colors = {
      'admin': 'bg-red-100 text-red-800',
      'receptionist': 'bg-blue-100 text-blue-800',
      'stylist': 'bg-purple-100 text-purple-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  const getRoleLabel = (role) => {
    const labels = {
      'admin': 'Administrador',
      'receptionist': 'Recepcionista',
      'stylist': 'Estilista'
    };
    return labels[role] || role;
  };

  if (loading && employees.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
          <p className="text-gray-600">Cargando empleados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg shadow-lg p-8 text-white mb-6">
        <h1 className="text-4xl font-bold mb-2 flex items-center">
          <UserCog className="h-10 w-10 mr-3" />
          Gestión de Empleados
        </h1>
        <p className="text-purple-100 text-lg">Administra el equipo del salón</p>
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
              placeholder="Buscar por nombre, email, teléfono o rol..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>
          <button
            onClick={() => {
              setModalType('add');
              resetForm();
            }}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200 flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Agregar Empleado
          </button>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-purple-600">
          <p className="text-gray-500 text-sm font-medium">Total Empleados</p>
          <p className="text-3xl font-bold text-gray-800">{employees.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-red-600">
          <p className="text-gray-500 text-sm font-medium">Administradores</p>
          <p className="text-3xl font-bold text-gray-800">
            {employees.filter(e => e.role === 'admin').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-600">
          <p className="text-gray-500 text-sm font-medium">Recepcionistas</p>
          <p className="text-3xl font-bold text-gray-800">
            {employees.filter(e => e.role === 'receptionist').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-indigo-600">
          <p className="text-gray-500 text-sm font-medium">Estilistas</p>
          <p className="text-3xl font-bold text-gray-800">
            {employees.filter(e => e.role === 'stylist').length}
          </p>
        </div>
      </div>

      {/* Tabla */}
      {filteredEmployees.length > 0 ? (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-gray-50">
                  <th className="py-3 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="py-3 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                  <th className="py-3 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="py-3 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase">Teléfono</th>
                  <th className="py-3 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
                  <th className="py-3 px-4 border-b text-center text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 border-b text-gray-700">{employee.id}</td>
                    <td className="py-3 px-4 border-b text-gray-700 font-semibold">{employee.name}</td>
                    <td className="py-3 px-4 border-b text-gray-700">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        {employee.email}
                      </div>
                    </td>
                    <td className="py-3 px-4 border-b text-gray-700">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        {employee.phone || 'N/A'}
                      </div>
                    </td>
                    <td className="py-3 px-4 border-b text-gray-700">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(employee.role)}`}>
                        {getRoleLabel(employee.role)}
                      </span>
                    </td>
                    <td className="py-3 px-4 border-b text-center whitespace-nowrap">
                      <button
                        onClick={() => {
                          setSelectedEmployee(employee);
                          setModalType('view');
                        }}
                        className="text-blue-600 hover:text-blue-900 mx-1"
                        title="Ver detalles"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedEmployee(employee);
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
          <UserCog className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 text-lg mb-4">
            {searchTerm ? 'No se encontraron empleados' : 'No hay empleados registrados'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => {
                setModalType('add');
                resetForm();
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-lg transition duration-200"
            >
              Agregar Primer Empleado
            </button>
          )}
        </div>
      )}

      {/* Modal Ver */}
      {modalType === 'view' && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold mb-4">Detalles del Empleado</h2>
            <div className="space-y-3">
              <p><strong>ID:</strong> {selectedEmployee.id}</p>
              <p><strong>Nombre:</strong> {selectedEmployee.name}</p>
              <p><strong>Email:</strong> {selectedEmployee.email}</p>
              <p><strong>Teléfono:</strong> {selectedEmployee.phone || 'N/A'}</p>
              <p>
                <strong>Rol:</strong>{' '}
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(selectedEmployee.role)}`}>
                  {getRoleLabel(selectedEmployee.role)}
                </span>
              </p>
              {selectedEmployee.created_at && (
                <p><strong>Registro:</strong> {new Date(selectedEmployee.created_at).toLocaleDateString('es-ES')}</p>
              )}
            </div>
            <div className="mt-6 text-right">
              <button
                onClick={() => {
                  setModalType(null);
                  setSelectedEmployee(null);
                }}
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Eliminar */}
      {modalType === 'delete' && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-sm shadow-xl">
            <h2 className="text-xl font-bold mb-4">¿Eliminar Empleado?</h2>
            <p>¿Estás seguro de eliminar a <strong>{selectedEmployee.name}</strong>?</p>
            <p className="text-sm text-red-600 mt-2">Esta acción no se puede deshacer.</p>
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => {
                  setModalType(null);
                  setSelectedEmployee(null);
                }}
                disabled={loading}
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteEmployee}
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
            <h2 className="text-xl font-bold mb-4">Agregar Empleado</h2>
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
                  className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    fieldErrors.name ? 'border-red-500' : ''
                  }`}
                  placeholder="Nombre completo"
                />
                {fieldErrors.name && (
                  <p className="text-red-500 text-sm mt-1">{fieldErrors.name}</p>
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
                  className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    fieldErrors.email ? 'border-red-500' : ''
                  }`}
                  placeholder="correo@ejemplo.com"
                />
                {fieldErrors.email && (
                  <p className="text-red-500 text-sm mt-1">{fieldErrors.email}</p>
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
                  className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    fieldErrors.phone ? 'border-red-500' : ''
                  }`}
                  placeholder="9xxxxxxxx (9 dígitos)"
                  maxLength="9"
                />
                {fieldErrors.phone && (
                  <p className="text-red-500 text-sm mt-1">{fieldErrors.phone}</p>
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
                  className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    fieldErrors.password ? 'border-red-500' : ''
                  }`}
                  placeholder="Mínimo 8 caracteres (mayús, minús, número, especial)"
                />
                {fieldErrors.password && (
                  <p className="text-red-500 text-sm mt-1">{fieldErrors.password}</p>
                )}
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Rol <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="stylist">Estilista</option>
                  <option value="receptionist">Recepcionista</option>
                  <option value="admin">Administrador</option>
                </select>
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
                onClick={handleCreateEmployee}
                disabled={loading}
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:bg-gray-400 flex items-center gap-2"
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

export default EmployeesManagement;