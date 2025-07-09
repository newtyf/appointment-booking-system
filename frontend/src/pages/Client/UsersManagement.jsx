import React from "react";
import { Search, Eye, Edit, Trash } from "lucide-react";

const UsersManagement = () => {
  const [modalTipo, setModalTipo] = React.useState(null); // 'ver', 'editar', 'eliminar'
  const [filtroBusqueda, setFiltroBusqueda] = React.useState("");
  const [modalEditar, setModalEditar] = React.useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = React.useState(null);
  const [nombreEditado, setNombreEditado] = React.useState("");
  const [correoEditado, setCorreoEditado] = React.useState("");
  const [telefonoEditado, setTelefonoEditado] = React.useState("");
  const [rolEditado, setRolEditado] = React.useState("");
  const [modalAgregar, setModalAgregar] = React.useState(false);
  const [nuevoNombre, setNuevoNombre] = React.useState("");
  const [nuevoCorreo, setNuevoCorreo] = React.useState("");
  const [nuevoTelefono, setNuevoTelefono] = React.useState("");
  const [nuevoRol, setNuevoRol] = React.useState("");

  const [users, setUsers] = React.useState([
    {
      id: 1,
      nombre: "Juan Pérez",
      correo: "juan.perez@example.com",
      telefono: "987654321",
      rol: "Administrador",
      creado_en: "2024-01-15 10:30:00",
      actualizado_en: "2024-06-20 14:00:00",
    },
    {
      id: 2,
      nombre: "María García",
      correo: "maria.garcia@example.com",
      telefono: "912345678",
      rol: "Estilista",
      creado_en: "2024-02-01 09:00:00",
      actualizado_en: "2024-07-01 11:15:00",
    },
    {
      id: 3,
      nombre: "Carlos Ruiz",
      correo: "carlos.ruiz@example.com",
      telefono: "934567890",
      rol: "Cliente",
      creado_en: "2024-03-10 16:45:00",
      actualizado_en: "2024-03-10 16:45:00",
    },
    {
      id: 4,
      nombre: "Ana López",
      correo: "ana.lopez@example.com",
      telefono: "956789012",
      rol: "Cliente",
      creado_en: "2024-04-05 11:00:00",
      actualizado_en: "2024-05-20 10:00:00",
    },
  ]);

  return (
    <div className='container mx-auto bg-white p-8 rounded-lg shadow-md'>
      <h1 className='text-3xl font-bold text-gray-800 mb-6'>
        Gestión de Usuarios
      </h1>

      <div className='flex justify-between items-center mb-6'>
        <div className='relative flex-grow mr-4'>
          <input
            type='text'
            placeholder='Buscar por nombre, correo o teléfono...'
            value={filtroBusqueda}
            onChange={(e) => setFiltroBusqueda(e.target.value.toLowerCase())}
            className='pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-pink-500'
          />

          <Search className='h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2' />
        </div>
        <button
          className='bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200'
          onClick={() => setModalAgregar(true)}
        >
          Agregar Usuario
        </button>
      </div>

      {users.length > 0 ? (
        <div className='overflow-x-auto'>
          <table className='min-w-full bg-white border border-gray-200 rounded-lg'>
            <thead>
              <tr>
                <th className='py-3 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  ID
                </th>
                <th className='py-3 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Nombre
                </th>
                <th className='py-3 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Correo
                </th>
                <th className='py-3 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Teléfono
                </th>
                <th className='py-3 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Rol
                </th>
                <th className='py-3 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Creado En
                </th>
                <th className='py-3 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Actualizado En
                </th>
                <th className='py-3 px-4 border-b border-gray-200 bg-gray-50 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {users
                .filter(
                  (u) =>
                    u.nombre.toLowerCase().includes(filtroBusqueda) ||
                    u.correo.toLowerCase().includes(filtroBusqueda) ||
                    u.telefono.includes(filtroBusqueda)
                )
                .map((user) => (
                  <tr key={user.id} className='hover:bg-gray-50'>
                    <td className='py-3 px-4 border-b border-gray-200 text-gray-700'>
                      {user.id}
                    </td>
                    <td className='py-3 px-4 border-b border-gray-200 text-gray-700'>
                      {user.nombre}
                    </td>
                    <td className='py-3 px-4 border-b border-gray-200 text-gray-700'>
                      {user.correo}
                    </td>
                    <td className='py-3 px-4 border-b border-gray-200 text-gray-700'>
                      {user.telefono}
                    </td>
                    <td className='py-3 px-4 border-b border-gray-200 text-gray-700'>
                      {user.rol}
                    </td>
                    <td className='py-3 px-4 border-b border-gray-200 text-gray-700'>
                      {new Date(user.creado_en).toLocaleDateString()} <br />
                      <span className='text-sm text-gray-500'>
                        {new Date(user.creado_en).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </td>
                    <td className='py-3 px-4 border-b border-gray-200 text-gray-700'>
                      {new Date(user.actualizado_en).toLocaleDateString()}{" "}
                      <br />
                      <span className='text-sm text-gray-500'>
                        {new Date(user.actualizado_en).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </td>
                    <td className='py-3 px-4 border-b border-gray-200 text-center text-sm font-medium whitespace-nowrap'>
                      <button
                        onClick={() => {
                          setModalTipo("ver");
                          setUsuarioSeleccionado(user);
                        }}
                        className='text-blue-600 hover:text-blue-900 mx-1'
                      >
                        <Eye className='h-5 w-5' />
                      </button>

                      <button
                        onClick={() => {
                          setUsuarioSeleccionado(user);
                          setNombreEditado(user.nombre);
                          setCorreoEditado(user.correo);
                          setTelefonoEditado(user.telefono);
                          setRolEditado(user.rol);
                          setModalEditar(true);
                        }}
                        className='text-purple-600 hover:text-purple-900 mx-1'
                      >
                        <Edit className='h-5 w-5' />
                      </button>

                      <button
                        onClick={() => {
                          setUsuarioSeleccionado(user);
                          setModalTipo("eliminar");
                        }}
                        className='text-red-600 hover:text-red-900 mx-1'
                      >
                        <Trash className='h-5 w-5' />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className='text-gray-600'>
          No hay usuarios registrados por el momento.
        </p>
      )}

      {modalEditar && usuarioSeleccionado && (
        <div className='fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50'>
          <div className='bg-white p-6 rounded-lg w-full max-w-md shadow-xl'>
            <h2 className='text-xl font-bold mb-4'>Editar Usuario</h2>

            <label className='block mb-2 font-medium'>Nombre</label>
            <input
              className='w-full mb-4 border px-3 py-2 rounded'
              value={nombreEditado}
              onChange={(e) => setNombreEditado(e.target.value)}
            />

            <label className='block mb-2 font-medium'>Correo</label>
            <input
              className='w-full mb-4 border px-3 py-2 rounded'
              value={correoEditado}
              onChange={(e) => setCorreoEditado(e.target.value)}
            />

            <label className='block mb-2 font-medium'>Teléfono</label>
            <input
              className='w-full mb-4 border px-3 py-2 rounded'
              value={telefonoEditado}
              onChange={(e) => setTelefonoEditado(e.target.value)}
            />

            <label className='block mb-2 font-medium'>Rol</label>
            <input
              className='w-full mb-4 border px-3 py-2 rounded'
              value={rolEditado}
              onChange={(e) => setRolEditado(e.target.value)}
            />

            <div className='flex justify-end gap-2 mt-6'>
              <button
                onClick={() => {
                  setModalEditar(false);
                  setUsuarioSeleccionado(null);
                }}
                className='bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500'
              >
                Cancelar
              </button>

              <button
                onClick={() => {
                  // Simular actualización
                  const actualizado = {
                    ...usuarioSeleccionado,
                    nombre: nombreEditado,
                    correo: correoEditado,
                    telefono: telefonoEditado,
                    rol: rolEditado,
                    actualizado_en: new Date().toISOString(),
                  };

                  const nuevosUsuarios = users.map((u) =>
                    u.id === usuarioSeleccionado.id ? actualizado : u
                  );

                  setUsers(nuevosUsuarios); // 👈 Actualiza el array con cambios
                  setUsuarioSeleccionado(null);
                  setModalEditar(false);

                  // Aquí deberías tener setUsers(...) si fuera editable
                  console.log("Usuario actualizado:", actualizado);
                }}
                className='bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-700'
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}
      {modalTipo === "ver" && usuarioSeleccionado && (
        <div className='fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50'>
          <div className='bg-white p-6 rounded-lg w-full max-w-md shadow-xl'>
            <h2 className='text-xl font-bold mb-4'>Detalles del Usuario</h2>

            <p>
              <strong>ID:</strong> {usuarioSeleccionado.id}
            </p>
            <p>
              <strong>Nombre:</strong> {usuarioSeleccionado.nombre}
            </p>
            <p>
              <strong>Correo:</strong> {usuarioSeleccionado.correo}
            </p>
            <p>
              <strong>Teléfono:</strong> {usuarioSeleccionado.telefono}
            </p>
            <p>
              <strong>Rol:</strong> {usuarioSeleccionado.rol}
            </p>
            <p>
              <strong>Creado En:</strong> {usuarioSeleccionado.creado_en}
            </p>
            <p>
              <strong>Actualizado En:</strong>{" "}
              {usuarioSeleccionado.actualizado_en}
            </p>

            <div className='mt-6 text-right'>
              <button
                onClick={() => {
                  setModalTipo(null);
                  setUsuarioSeleccionado(null);
                }}
                className='bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-700'
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
      {modalTipo === "eliminar" && usuarioSeleccionado && (
        <div className='fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50'>
          <div className='bg-white p-6 rounded-lg w-full max-w-sm shadow-xl'>
            <h2 className='text-xl font-bold mb-4'>¿Eliminar Usuario?</h2>
            <p>
              ¿Estás seguro de que deseas eliminar{" "}
              <strong>{usuarioSeleccionado.nombre}</strong>?
            </p>

            <div className='flex justify-end space-x-2 mt-6'>
              <button
                className='bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500'
                onClick={() => {
                  setModalTipo(null);
                  setUsuarioSeleccionado(null);
                }}
              >
                Cancelar
              </button>
              <button
                className='bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700'
                onClick={() => {
                  setUsers(
                    users.filter((u) => u.id !== usuarioSeleccionado.id)
                  );
                  setModalTipo(null);
                  setUsuarioSeleccionado(null);
                }}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
      {modalAgregar && (
        <div className='fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50'>
          <div className='bg-white p-6 rounded-lg w-full max-w-md shadow-xl'>
            <h2 className='text-xl font-bold mb-4'>Agregar Nuevo Usuario</h2>

            <label className='block mb-2 font-medium'>Nombre</label>
            <input
              className='w-full mb-4 border px-3 py-2 rounded'
              value={nuevoNombre}
              onChange={(e) => setNuevoNombre(e.target.value)}
            />

            <label className='block mb-2 font-medium'>Correo</label>
            <input
              className='w-full mb-4 border px-3 py-2 rounded'
              value={nuevoCorreo}
              onChange={(e) => setNuevoCorreo(e.target.value)}
            />

            <label className='block mb-2 font-medium'>Teléfono</label>
            <input
              className='w-full mb-4 border px-3 py-2 rounded'
              value={nuevoTelefono}
              onChange={(e) => setNuevoTelefono(e.target.value)}
            />

            <label className='block mb-2 font-medium'>Rol</label>
            <input
              className='w-full mb-4 border px-3 py-2 rounded'
              value={nuevoRol}
              onChange={(e) => setNuevoRol(e.target.value)}
            />

            <div className='flex justify-end gap-2 mt-6'>
              <button
                onClick={() => {
                  setModalAgregar(false);
                  setNuevoNombre("");
                  setNuevoCorreo("");
                  setNuevoTelefono("");
                  setNuevoRol("");
                }}
                className='bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500'
              >
                Cancelar
              </button>

              <button
                onClick={() => {
                  const nuevoUsuario = {
                    id: users.length + 1,
                    nombre: nuevoNombre,
                    correo: nuevoCorreo,
                    telefono: nuevoTelefono,
                    rol: nuevoRol,
                    creado_en: new Date().toISOString(),
                    actualizado_en: new Date().toISOString(),
                  };

                  setUsers([...users, nuevoUsuario]);

                  // Limpiar y cerrar
                  setModalAgregar(false);
                  setNuevoNombre("");
                  setNuevoCorreo("");
                  setNuevoTelefono("");
                  setNuevoRol("");
                }}
                className='bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-700'
              >
                Guardar Usuario
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManagement;
