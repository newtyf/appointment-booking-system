import React from 'react';
import InsideLayout from '../../layouts/InsideLayout';

const ServicesManagement = () => {
  // Datos simulados de servicios, alineados con los atributos de la tabla 'Servicios'.
  const services = [
    {
      id: 101,
      nombre: 'Corte de Cabello Hombre',
      duracion_min: 30,
      descripcion: 'Corte de cabello masculino con lavado incluido.',
    },
    {
      id: 102,
      nombre: 'Corte de Cabello Mujer',
      duracion_min: 45,
      descripcion: 'Corte, lavado y secado de cabello femenino.',
    },
    {
      id: 103,
      nombre: 'Manicura Clásica',
      duracion_min: 60,
      descripcion: 'Limpieza, limado, pulido y esmaltado de uñas de las manos.',
    },
    {
      id: 104,
      nombre: 'Pedicura Spa',
      duracion_min: 90,
      descripcion: 'Pedicura completa con exfoliación, masaje y mascarilla.',
    },
    {
      id: 105,
      nombre: 'Tinte de Cabello',
      duracion_min: 120,
      descripcion: 'Aplicación de tinte completo o retoque de raíz.',
    },
  ];

  return (
    <InsideLayout>
      <div className="container mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Gestión de Servicios</h1>

        <div className="flex justify-between items-center mb-6">
          <div className="relative flex-grow mr-4">
            <input
              type="text"
              placeholder="Buscar por nombre o descripción..."
              className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
            <svg className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <button className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200">
            Agregar Servicio
          </button>
        </div>

        {services.length > 0 ? (
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
                    Duración (min)
                  </th>
                  <th className="py-3 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descripción
                  </th>
                  <th className="py-3 px-4 border-b border-gray-200 bg-gray-50 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {services.map((service) => (
                  <tr key={service.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 border-b border-gray-200 text-gray-700">
                      {service.id}
                    </td>
                    <td className="py-3 px-4 border-b border-gray-200 text-gray-700">
                      {service.nombre}
                    </td>
                    <td className="py-3 px-4 border-b border-gray-200 text-gray-700">
                      {service.duracion_min}
                    </td>
                    <td className="py-3 px-4 border-b border-gray-200 text-gray-700">
                      {service.descripcion}
                    </td>
                    <td className="py-3 px-4 border-b border-gray-200 text-center text-sm font-medium whitespace-nowrap">
                      <button className="text-blue-600 hover:text-blue-900 mx-1">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"></path></svg>
                      </button>
                      <button className="text-purple-600 hover:text-purple-900 mx-1">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                      </button>
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
          <p className="text-gray-600">No hay servicios registrados por el momento.</p>
        )}
      </div>
    </InsideLayout>
  );
};

export default ServicesManagement;