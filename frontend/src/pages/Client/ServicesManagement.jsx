import React from 'react';
import { Search, Eye, Edit, Trash } from 'lucide-react';

const ServicesManagement = () => {
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
    <div className="container mx-auto bg-white p-8 rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Gestión de Servicios</h1>

      <div className="flex justify-between items-center mb-6">
        <div className="relative flex-grow mr-4">
          <input
            type="text"
            placeholder="Buscar por nombre o descripción..."
            className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
          <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
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
        <p className="text-gray-600">No hay servicios registrados por el momento.</p>
      )}
    </div>
  );
};

export default ServicesManagement;