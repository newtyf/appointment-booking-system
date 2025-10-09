import React from "react";
import { Search, Eye, Trash, Briefcase, Loader, Plus } from "lucide-react";
import userService from '../../services/userService';

const EmpleadosManagement = () => {
  const [modalTipo, setModalTipo] = React.useState(null);
  const [filtroBusqueda, setFiltroBusqueda] = React.useState("");
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = React.useState(null);
  const [modalAgregar, setModalAgregar] = React.useState(false);
  const [nuevoNombre, setNuevoNombre] = React.useState("");
  const [nuevoApellido, setNuevoApellido] = React.useState("");
  const [nuevoCorreo, setNuevoCorreo] = React.useState("");
  const [nuevoTelefono, setNuevoTelefono] = React.useState("");
  const [nuevoRol, setNuevoRol] = React.useState("user");
  const [nuevoPassword, setNuevoPassword] = React.useState("");
  const [empleados, setEmpleados] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [procesando, setProcesando] = React.useState(false);

  const roles = [
    "admin",
    "user",
    "Estilista Senior",
    "Estilista Junior",
    "Barbero",
    "Manicurista",
    "Maquillador(a)",
    "Recepcionista",
  ];

  const handleAgregarEmpleado = async () => {
    if (!nuevoNombre || !nuevoApellido || !nuevoCorreo || !nuevoPassword) {
      alert("Por favor completa todos los campos obligatorios (Nombre, Apellido, Correo y Contraseña)");
      return;
    }

    try {
      setProcesando(true);
      const nuevoEmpleado = {
        nombre: nuevoNombre,
        apellido: nuevoApellido,
        email: nuevoCorreo,
        telefono: nuevoTelefono || "",
        rol: nuevoRol,
        password: nuevoPassword,
      };

      const empleadoCreado = await userService.createUser(nuevoEmpleado);
      
      // Agregar a la lista local
      setEmpleados([empleadoCreado, ...empleados]);

      // Limpiar formulario y cerrar modal
      setModalAgregar(false);
      setNuevoNombre("");
      setNuevoApellido("");
      setNuevoCorreo("");
      setNuevoTelefono("");
      setNuevoRol("user");
      setNuevoPassword("");

      alert("Empleado agregado exitosamente");
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message;
      alert("Error al agregar empleado: " + errorMsg);
      console.error("Error al agregar:", err);
    } finally {
      setProcesando(false);
    }
  };

  const handleVerDetalles = async (empleado) => {
    try {
      setProcesando(true);
      // Obtener detalles completos del usuario
      const detalles = await userService.getUser(empleado.id);
      setEmpleadoSeleccionado(detalles);
      setModalTipo("ver");
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message;
      alert("Error al cargar detalles: " + errorMsg);
      console.error("Error:", err);
    } finally {
      setProcesando(false);
    }
  };

  const empleadosFiltrados = empleados.filter(
    (e) =>
      e.nombre?.toLowerCase().includes(filtroBusqueda) ||
      e.apellido?.toLowerCase().includes(filtroBusqueda) ||
      e.email?.toLowerCase().includes(filtroBusqueda) ||
      e.rol?.toLowerCase().includes(filtroBusqueda)
  );

  if (loading) {
    return (
      <div className="container mx-auto bg-white p-8 rounded-lg shadow-md">
        <div className="flex items-center justify-center h-64">
          <Loader className="h-8 w-8 animate-spin text-pink-600" />
          <span className="ml-3 text-gray-600">Cargando empleados...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto bg-white p-8 rounded-lg shadow-md">
      <div className="flex items-center gap-3 mb-6">
        <Briefcase className="h-8 w-8 text-pink-600" />
        <h1 className="text-3xl font-bold text-gray-800">
          Gestión de Empleados
        </h1>
      </div>

      <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded mb-4">
        <p className="text-sm">
          ℹ️ <strong>Nota:</strong> En esta versión solo puedes crear y ver empleados. 
          Las funciones de editar y eliminar requieren actualización del backend.
        </p>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="relative flex-grow mr-4">
          <input
            type="text"
            placeholder="Buscar por nombre, apellido, correo o rol..."
            value={filtroBusqueda}
            onChange={(e) => setFiltroBusqueda(e.target.value.toLowerCase())}
            className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
          <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
        </div>
        <button
          className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200 flex items-center gap-2"
          onClick={() => setModalAgregar(true)}
        >
          <Plus className="h-5 w-5" />
          Agregar Empleado
        </button>
      </div>

      {empleadosFiltrados.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead>
              <tr>
                <th className="py-3 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="py-3 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre Completo
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
                <th className="py-3 px-4 border-b border-gray-200 bg-gray-50 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {empleadosFiltrados.map((empleado) => (
                <tr key={empleado.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 border-b border-gray-200 text-gray-700">
                    {empleado.id}
                  </td>
                  <td className="py-3 px-4 border-b border-gray-200 text-gray-700">
                    {empleado.nombre} {empleado.apellido}
                  </td>
                  <td className="py-3 px-4 border-b border-gray-200 text-gray-700">
                    {empleado.email}
                  </td>
                  <td className="py-3 px-4 border-b border-gray-200 text-gray-700">
                    {empleado.telefono || "N/A"}
                  </td>
                  <td className="py-3 px-4 border-b border-gray-200 text-gray-700">
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">
                      {empleado.rol}
                    </span>
                  </td>
                  <td className="py-3 px-4 border-b border-gray-200 text-center text-sm font-medium whitespace-nowrap">
                    <button
                      onClick={() => handleVerDetalles(empleado)}
                      className="text-blue-600 hover:text-blue-900 mx-1"
                      title="Ver detalles"
                      disabled={procesando}
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg mb-2">
            {filtroBusqueda ? "No se encontraron empleados con ese criterio" : "No hay empleados registrados"}
          </p>
          {!filtroBusqueda && (
            <button
              onClick={() => setModalAgregar(true)}
              className="mt-4 bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-6 rounded-lg transition duration-200"
            >
              Agregar Primer Empleado
            </button>
          )}
        </div>
      )}

      {modalAgregar && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Agregar Nuevo Empleado</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 font-medium">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-pink-500"
                  value={nuevoNombre}
                  onChange={(e) => setNuevoNombre(e.target.value)}
                  placeholder="Ej: María"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium">
                  Apellido <span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-pink-500"
                  value={nuevoApellido}
                  onChange={(e) => setNuevoApellido(e.target.value)}
                  placeholder="Ej: González"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium">
                  Correo <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-pink-500"
                  value={nuevoCorreo}
                  onChange={(e) => setNuevoCorreo(e.target.value)}
                  placeholder="correo@ejemplo.com"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium">
                  Contraseña <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-pink-500"
                  value={nuevoPassword}
                  onChange={(e) => setNuevoPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium">Teléfono</label>
                <input
                  className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-pink-500"
                  value={nuevoTelefono}
                  onChange={(e) => setNuevoTelefono(e.target.value)}
                  placeholder="987654321"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium">
                  Rol <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-pink-500"
                  value={nuevoRol}
                  onChange={(e) => setNuevoRol(e.target.value)}
                >
                  {roles.map((rol) => (
                    <option key={rol} value={rol}>
                      {rol}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => {
                  setModalAgregar(false);
                  setNuevoNombre("");
                  setNuevoApellido("");
                  setNuevoCorreo("");
                  setNuevoTelefono("");
                  setNuevoRol("user");
                  setNuevoPassword("");
                }}
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                disabled={procesando}
              >
                Cancelar
              </button>

              <button
                onClick={handleAgregarEmpleado}
                className="bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-700 flex items-center gap-2"
                disabled={procesando}
              >
                {procesando && <Loader className="h-4 w-4 animate-spin" />}
                {procesando ? "Guardando..." : "Guardar Empleado"}
              </button>
            </div>
          </div>
        </div>
      )}

      {modalTipo === "ver" && empleadoSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold mb-4">Detalles del Empleado</h2>

            <div className="space-y-3">
              <p>
                <strong>ID:</strong> {empleadoSeleccionado.id}
              </p>
              <p>
                <strong>Nombre Completo:</strong> {empleadoSeleccionado.nombre}{" "}
                {empleadoSeleccionado.apellido}
              </p>
              <p>
                <strong>Correo:</strong> {empleadoSeleccionado.email}
              </p>
              <p>
                <strong>Teléfono:</strong>{" "}
                {empleadoSeleccionado.telefono || "N/A"}
              </p>
              <p>
                <strong>Rol:</strong>{" "}
                <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">
                  {empleadoSeleccionado.rol}
                </span>
              </p>
              {empleadoSeleccionado.created_at && (
                <p>
                  <strong>Creado En:</strong>{" "}
                  {new Date(empleadoSeleccionado.created_at).toLocaleString('es-PE', {
                    dateStyle: 'medium',
                    timeStyle: 'short'
                  })}
                </p>
              )}
              {empleadoSeleccionado.updated_at && (
                <p>
                  <strong>Actualizado En:</strong>{" "}
                  {new Date(empleadoSeleccionado.updated_at).toLocaleString('es-PE', {
                    dateStyle: 'medium',
                    timeStyle: 'short'
                  })}
                </p>
              )}
            </div>

            <div className="mt-6 text-right">
              <button
                onClick={() => {
                  setModalTipo(null);
                  setEmpleadoSeleccionado(null);
                }}
                className="bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-700"
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

export default EmpleadosManagement;