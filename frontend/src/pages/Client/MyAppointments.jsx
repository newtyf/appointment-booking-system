import React from 'react';
import InsideLayout from '../../layouts/InsideLayout'; // Importa InsideLayout

const MyAppointments = () => {
  // Datos simulados de citas, alineados directamente con los atributos de la tabla 'Citas' de tu BD.
  // Los campos _nombre serían resueltos mediante JOINs en un backend real.
  const appointments = [
    {
      id: 1,
      fecha: '2025-07-10 10:00:00', // Ejemplo de datetime
      cliente_nombre: 'Juan Pérez', // Simulado: Nombre del cliente, que vendría de Usuarios
      estilista_nombre: 'Estilista A', // Simulado: Nombre del estilista, que vendría de Usuarios
      servicio_nombre: 'Corte de Cabello y Barba', // Simulado: Nombre del servicio, que vendría de Servicios
      estado: 'Confirmada', // Coincide con el campo 'estado' de Citas
      // creado_por, modificado_por, creado_en, actualizado_en no se muestran en la tabla, pero existen en la BD
    },
    {
      id: 2,
      fecha: '2025-07-12 15:00:00',
      cliente_nombre: 'Maria López',
      estilista_nombre: 'Estilista B',
      servicio_nombre: 'Manicura y Pedicura',
      estado: 'Pendiente',
    },
    {
      id: 3,
      fecha: '2025-07-15 11:30:00',
      cliente_nombre: 'Carlos Garcia',
      estilista_nombre: 'Estilista C',
      servicio_nombre: 'Masaje Relajante (60min)',
      estado: 'Confirmada',
    },
    {
      id: 4,
      fecha: '2025-07-18 14:00:00',
      cliente_nombre: 'Ana Torres',
      estilista_nombre: 'Estilista A',
      servicio_nombre: 'Tinte de Cabello',
      estado: 'Cancelada',
    },
     {
      id: 5,
      fecha: '2025-07-20 09:00:00',
      cliente_nombre: 'Pedro Ruiz',
      estilista_nombre: 'Estilista B',
      servicio_nombre: 'Tratamiento Capilar',
      estado: 'Pendiente',
    },
  ];

  return (
    <InsideLayout>
      <div className="container mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Gestión de Citas</h1>

        {/* Barra de búsqueda y botón Agregar (como en la imagen de diseño) */}
        <div className="flex justify-between items-center mb-6">
          <div className="relative flex-grow mr-4">
            <input
              type="text"
              placeholder="Buscar por cliente, estilista o servicio..."
              className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
            <svg className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <button className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200">
            Agregar
          </button>
        </div>

        {appointments.length > 0 ? (
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
                {appointments.map((appointment) => (
                  <tr key={appointment.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 border-b border-gray-200 text-gray-700">
                      {appointment.id}
                    </td>
                    <td className="py-3 px-4 border-b border-gray-200 text-gray-700">
                      {new Date(appointment.fecha).toLocaleDateString()} <br />
                      <span className="text-sm text-gray-500">{new Date(appointment.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </td>
                    <td className="py-3 px-4 border-b border-gray-200 text-gray-700">
                      {appointment.cliente_nombre}
                    </td>
                    <td className="py-3 px-4 border-b border-gray-200 text-gray-700">
                      {appointment.estilista_nombre}
                    </td>
                    <td className="py-3 px-4 border-b border-gray-200 text-gray-700">
                      {appointment.servicio_nombre}
                    </td>
                    <td className="py-3 px-4 border-b border-gray-200">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          appointment.estado === 'Confirmada' ? 'bg-green-100 text-green-800' :
                          appointment.estado === 'Pendiente' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800' // Para 'Cancelada' u otros estados
                        }`}
                      >
                        {appointment.estado}
                      </span>
                    </td>
                    <td className="py-3 px-4 border-b border-gray-200 text-center text-sm font-medium whitespace-nowrap">
                      {/* Icono de Lupa/Ver */}
                      <button className="text-blue-600 hover:text-blue-900 mx-1">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"></path></svg>
                      </button>
                      {/* Icono de Editar */}
                      <button className="text-purple-600 hover:text-purple-900 mx-1">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                      </button>
                      {/* Icono de Eliminar */}
                      <button className="text-red-600 hover:text-red-900 mx-1">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-600">No tienes citas agendadas por el momento.</p>
        )}
      </div>
    </InsideLayout>
  );
};

export default MyAppointments;