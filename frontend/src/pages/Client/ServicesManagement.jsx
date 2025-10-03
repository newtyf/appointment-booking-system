import { Search, Eye, Edit, Trash } from "lucide-react";
import { useState, useEffect } from "react";
import serviceService from "../../services/serviceService";

const ServicesManagement = () => {
  const [modalTipo, setModalTipo] = useState(null);
  const [servicioSeleccionado, setServicioSeleccionado] = useState(null);

  const [nombreEditado, setNombreEditado] = useState("");
  const [duracionEditada, setDuracionEditada] = useState("");
  const [descripcionEditada, setDescripcionEditada] = useState("");

  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevaDuracion, setNuevaDuracion] = useState("");
  const [nuevaDescripcion, setNuevaDescripcion] = useState("");

  const [filtroBusqueda, setFiltroBusqueda] = useState("");
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  
  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await serviceService.listServices();
      setServices(data);
    } catch (err) {
      console.error('Error al cargar servicios:', err);
      setError('Error al cargar servicios. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleAgregarServicio = async () => {
    if (!nuevoNombre || !nuevaDuracion || !nuevaDescripcion) {
      alert('Por favor completa todos los campos');
      return;
    }

    try {
      setLoading(true);
      const nuevoServicio = {
        name: nuevoNombre,
        duration_min: parseInt(nuevaDuracion),
        description: nuevaDescripcion,
      };

      const servicioCreado = await serviceService.createService(nuevoServicio);
      setServices((prev) => [...prev, servicioCreado]);
      setModalTipo(null);
      
      // Limpiar formulario
      setNuevoNombre("");
      setNuevaDuracion("");
      setNuevaDescripcion("");
    } catch (err) {
      console.error('Error al crear servicio:', err);
      alert('Error al crear el servicio: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleEditarServicio = async () => {
    if (!nombreEditado || !duracionEditada || !descripcionEditada) {
      alert('Por favor completa todos los campos');
      return;
    }

    try {
      setLoading(true);
      const servicioActualizado = {
        name: nombreEditado,
        duration_min: parseInt(duracionEditada),
        description: descripcionEditada,
      };

      const resultado = await serviceService.updateService(
        servicioSeleccionado.id,
        servicioActualizado
      );

      setServices((prev) =>
        prev.map((servicio) =>
          servicio.id === servicioSeleccionado.id ? resultado : servicio
        )
      );

      setModalTipo(null);
      setServicioSeleccionado(null);
    } catch (err) {
      console.error('Error al actualizar servicio:', err);
      alert('Error al actualizar el servicio: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleEliminarServicio = async () => {
    try {
      setLoading(true);
      await serviceService.deleteService(servicioSeleccionado.id);
      
      setServices((prev) =>
        prev.filter((servicio) => servicio.id !== servicioSeleccionado.id)
      );
      
      setModalTipo(null);
      setServicioSeleccionado(null);
    } catch (err) {
      console.error('Error al eliminar servicio:', err);
      alert('Error al eliminar el servicio: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='container mx-auto bg-white p-8 rounded-lg shadow-md'>
      <h1 className='text-3xl font-bold text-gray-800 mb-6'>
        Gestión de Servicios
      </h1>

      {error && (
        <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4'>
          {error}
        </div>
      )}

      <div className='flex justify-between items-center mb-6'>
        <div className='relative flex-grow mr-4'>
          <input
            type='text'
            placeholder='Buscar por nombre o descripción...'
            value={filtroBusqueda}
            onChange={(e) => setFiltroBusqueda(e.target.value.toLowerCase())}
            className='pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-pink-500'
          />

          <Search className='h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2' />
        </div>
        <button
          onClick={() => {
            setModalTipo("agregar");
            setNuevoNombre("");
            setNuevaDuracion("");
            setNuevaDescripcion("");
          }}
          disabled={loading}
          className='bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200 disabled:bg-gray-400'
        >
          Agregar Servicio
        </button>
      </div>

      {loading && services.length === 0 ? (
        <p className='text-center text-gray-600 py-4'>Cargando servicios...</p>
      ) : services.length > 0 ? (
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
                  Duración (min)
                </th>
                <th className='py-3 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Descripción
                </th>
                <th className='py-3 px-4 border-b border-gray-200 bg-gray-50 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {services
                .filter(
                  (s) =>
                    s.name.toLowerCase().includes(filtroBusqueda) ||
                    s.description.toLowerCase().includes(filtroBusqueda)
                )
                .map((service) => (
                  <tr key={service.id} className='hover:bg-gray-50'>
                    <td className='py-3 px-4 border-b border-gray-200 text-gray-700'>
                      {service.id}
                    </td>
                    <td className='py-3 px-4 border-b border-gray-200 text-gray-700'>
                      {service.name}
                    </td>
                    <td className='py-3 px-4 border-b border-gray-200 text-gray-700'>
                      {service.duration_min}
                    </td>
                    <td className='py-3 px-4 border-b border-gray-200 text-gray-700'>
                      {service.description}
                    </td>
                    <td className='py-3 px-4 border-b border-gray-200 text-center text-sm font-medium whitespace-nowrap'>
                      <button
                        onClick={() => {
                          setModalTipo("ver");
                          setServicioSeleccionado(service);
                        }}
                        className='text-blue-600 hover:text-blue-900 mx-1'
                      >
                        <Eye className='h-5 w-5' />
                      </button>
                      <button
                        onClick={() => {
                          setModalTipo("editar");
                          setServicioSeleccionado(service);
                          setNombreEditado(service.name);
                          setDuracionEditada(service.duration_min);
                          setDescripcionEditada(service.description);
                        }}
                        className='text-purple-600 hover:text-purple-900 mx-1'
                      >
                        <Edit className='h-5 w-5' />
                      </button>
                      <button
                        onClick={() => {
                          setModalTipo("eliminar");
                          setServicioSeleccionado(service);
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
          No hay servicios registrados por el momento.
        </p>
      )}
      {modalTipo === "ver" && servicioSeleccionado && (
        <div className='fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50'>
          <div className='bg-white p-6 rounded-lg w-full max-w-md shadow-xl'>
            <h2 className='text-xl font-bold mb-4'>Detalles del Servicio</h2>
            <p><strong>ID:</strong> {servicioSeleccionado.id}</p>
            <p><strong>Nombre:</strong> {servicioSeleccionado.name}</p>
            <p><strong>Duración:</strong> {servicioSeleccionado.duration_min} min</p>
            <p><strong>Descripción:</strong> {servicioSeleccionado.description}</p>
            <div className='mt-6 text-right'>
              <button
                onClick={() => {
                  setModalTipo(null);
                  setServicioSeleccionado(null);
                }}
                className='bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-700'
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
      {modalTipo === "editar" && servicioSeleccionado && (
        <div className='fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50'>
          <div className='bg-white p-6 rounded-lg w-full max-w-md shadow-xl'>
            <h2 className='text-xl font-bold mb-4'>Editar Servicio</h2>
            <div className='mb-4'>
              <label className='block text-gray-700 font-medium mb-2'>Nombre</label>
              <input
                value={nombreEditado}
                onChange={(e) => setNombreEditado(e.target.value)}
                className='w-full px-4 py-2 border rounded'
              />
            </div>

            <div className='mb-4'>
              <label className='block text-gray-700 font-medium mb-2'>Duración (min)</label>
              <input
                type='number'
                value={duracionEditada}
                onChange={(e) => setDuracionEditada(e.target.value)}
                className='w-full px-4 py-2 border rounded'
              />
            </div>

            <div className='mb-4'>
              <label className='block text-gray-700 font-medium mb-2'>Descripción</label>
              <textarea
                value={descripcionEditada}
                onChange={(e) => setDescripcionEditada(e.target.value)}
                className='w-full px-4 py-2 border rounded'
              />
            </div>

            <div className='mt-6 text-right flex gap-3 justify-end'>
              <button
                onClick={() => {
                  setModalTipo(null);
                  setServicioSeleccionado(null);
                }}
                disabled={loading}
                className='px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 disabled:bg-gray-300'
              >
                Cancelar
              </button>
              <button
                onClick={handleEditarServicio}
                disabled={loading}
                className='bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-700 disabled:bg-gray-400'
              >
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>
      )}

      {modalTipo === "eliminar" && servicioSeleccionado && (
        <div className='fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50'>
          <div className='bg-white p-6 rounded-lg w-full max-w-sm shadow-xl'>
            <h2 className='text-xl font-bold mb-4'>¿Eliminar Servicio?</h2>
            <p>
              ¿Estás seguro de que deseas eliminar{" "}
              <strong>{servicioSeleccionado.name}</strong>?
            </p>

            <div className='flex justify-end space-x-2 mt-6'>
              <button
                className='bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500'
                onClick={() => setModalTipo(null)}
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                className='bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:bg-gray-400'
                onClick={handleEliminarServicio}
                disabled={loading}
              >
                {loading ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
      {modalTipo === "agregar" && (
        <div className='fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50'>
          <div className='bg-white p-6 rounded-lg w-full max-w-md shadow-xl'>
            <h2 className='text-xl font-bold mb-4'>Agregar Servicio</h2>

            <div className='mb-4'>
              <label className='block text-gray-700 font-medium mb-2'>Nombre</label>
              <input
                value={nuevoNombre}
                onChange={(e) => setNuevoNombre(e.target.value)}
                className='w-full px-4 py-2 border rounded'
                placeholder='Ej: Corte de cabello'
              />
            </div>

            <div className='mb-4'>
              <label className='block text-gray-700 font-medium mb-2'>Duración (min)</label>
              <input
                type='number'
                value={nuevaDuracion}
                onChange={(e) => setNuevaDuracion(e.target.value)}
                className='w-full px-4 py-2 border rounded'
                placeholder='Ej: 30'
              />
            </div>

            <div className='mb-4'>
              <label className='block text-gray-700 font-medium mb-2'>Descripción</label>
              <textarea
                value={nuevaDescripcion}
                onChange={(e) => setNuevaDescripcion(e.target.value)}
                className='w-full px-4 py-2 border rounded'
                placeholder='Describe el servicio...'
              />
            </div>

            <div className='mt-6 text-right flex gap-3 justify-end'>
              <button
                onClick={() => setModalTipo(null)}
                disabled={loading}
                className='px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 disabled:bg-gray-300'
              >
                Cancelar
              </button>

              <button
                onClick={handleAgregarServicio}
                disabled={loading}
                className='bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-700 disabled:bg-gray-400'
              >
                {loading ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicesManagement;