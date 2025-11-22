import { Search, Eye, Edit, Trash, Scissors } from "lucide-react";
import { useState, useEffect } from "react";
import serviceService from "../../services/serviceService";

const ServicesManagement = () => {
  const [modalTipo, setModalTipo] = useState(null);
  const [servicioSeleccionado, setServicioSeleccionado] = useState(null);

  const [nombreEditado, setNombreEditado] = useState("");
  const [duracionEditada, setDuracionEditada] = useState("");
  const [descripcionEditada, setDescripcionEditada] = useState("");
  const [precioEditado, setPrecioEditado] = useState("");

  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevaDuracion, setNuevaDuracion] = useState("");
  const [nuevaDescripcion, setNuevaDescripcion] = useState("");
  const [nuevoPrecio, setNuevoPrecio] = useState("");

  const [filtroBusqueda, setFiltroBusqueda] = useState("");
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Estados para errores de validación
  const [fieldErrors, setFieldErrors] = useState({
    nombre: '',
    duracion: '',
    descripcion: '',
    precio: ''
  });

  const [editFieldErrors, setEditFieldErrors] = useState({
    nombre: '',
    duracion: '',
    descripcion: '',
    precio: ''
  });

  // Validaciones siguiendo ISO 25010
  const validaciones = {
    nombre: (valor) => {
      if (!valor || valor.trim().length === 0) {
        return 'El nombre del servicio es requerido';
      }
      if (valor.trim().length < 3) {
        return 'El nombre debe tener al menos 3 caracteres';
      }
      if (valor.length > 100) {
        return 'El nombre no puede exceder 100 caracteres';
      }
      // Solo letras, números, espacios y algunos caracteres especiales permitidos
      const regexNombre = /^[a-záéíóúñüA-ZÁÉÍÓÚÑÜ0-9\s\-.,()]+$/;
      if (!regexNombre.test(valor)) {
        return 'El nombre solo puede contener letras, números, espacios y caracteres básicos (-, ., (, ))';
      }
      if (/\s{2,}/.test(valor)) {
        return 'El nombre no puede contener espacios múltiples consecutivos';
      }
      return '';
    },

    duracion: (valor) => {
      if (!valor || valor === '') {
        return 'La duración es requerida';
      }
      const duracionNum = parseInt(valor);
      if (isNaN(duracionNum)) {
        return 'La duración debe ser un número válido';
      }
      if (duracionNum < 5) {
        return 'La duración mínima es 5 minutos';
      }
      if (duracionNum > 480) {
        return 'La duración máxima es 480 minutos (8 horas)';
      }
      if (duracionNum % 5 !== 0) {
        return 'La duración debe ser múltiplo de 5 minutos';
      }
      return '';
    },

    descripcion: (valor) => {
      if (!valor || valor.trim().length === 0) {
        return 'La descripción es requerida';
      }
      if (valor.trim().length < 10) {
        return 'La descripción debe tener al menos 10 caracteres';
      }
      if (valor.length > 500) {
        return 'La descripción no puede exceder 500 caracteres';
      }
      return '';
    },

    precio: (valor) => {
      if (!valor || valor === '') {
        return 'El precio es requerido';
      }
      const precioNum = parseFloat(valor);
      if (isNaN(precioNum)) {
        return 'El precio debe ser un número válido';
      }
      if (precioNum < 0) {
        return 'El precio no puede ser negativo';
      }
      if (precioNum === 0) {
        return 'El precio debe ser mayor a 0';
      }
      if (precioNum > 9999.99) {
        return 'El precio máximo es S/ 9,999.99';
      }
      // Validar que tenga máximo 2 decimales
      if (!/^\d+(\.\d{1,2})?$/.test(valor)) {
        return 'El precio solo puede tener hasta 2 decimales';
      }
      return '';
    }
  };

  // Validar campo específico (para crear)
  const validarCampo = (campo, valor) => {
    const mensajeError = validaciones[campo](valor);
    setFieldErrors(prev => ({
      ...prev,
      [campo]: mensajeError
    }));
    return mensajeError === '';
  };

  // Validar campo específico (para editar)
  const validarCampoEditar = (campo, valor) => {
    const mensajeError = validaciones[campo](valor);
    setEditFieldErrors(prev => ({
      ...prev,
      [campo]: mensajeError
    }));
    return mensajeError === '';
  };

  // Validar formulario completo (crear)
  const validarFormularioAgregar = () => {
    const errores = {
      nombre: validaciones.nombre(nuevoNombre),
      duracion: validaciones.duracion(nuevaDuracion),
      descripcion: validaciones.descripcion(nuevaDescripcion),
      precio: validaciones.precio(nuevoPrecio)
    };

    setFieldErrors(errores);
    return Object.values(errores).every(error => error === '');
  };

  // Validar formulario completo (editar)
  const validarFormularioEditar = () => {
    const errores = {
      nombre: validaciones.nombre(nombreEditado),
      duracion: validaciones.duracion(duracionEditada),
      descripcion: validaciones.descripcion(descripcionEditada),
      precio: validaciones.precio(precioEditado)
    };

    setEditFieldErrors(errores);
    return Object.values(errores).every(error => error === '');
  };

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
    // Validar todos los campos
    if (!validarFormularioAgregar()) {
      alert('Por favor, corrija los errores en el formulario');
      return;
    }

    try {
      setLoading(true);
      const nuevoServicio = {
        name: nuevoNombre.trim(),
        duration_min: parseInt(nuevaDuracion),
        description: nuevaDescripcion.trim(),
        price: parseFloat(nuevoPrecio),
      };

      const servicioCreado = await serviceService.createService(nuevoServicio);
      setServices((prev) => [...prev, servicioCreado]);
      setModalTipo(null);
      
      // Limpiar campos y errores
      setNuevoNombre("");
      setNuevaDuracion("");
      setNuevaDescripcion("");
      setNuevoPrecio("");
      setFieldErrors({ nombre: '', duracion: '', descripcion: '', precio: '' });
      
      alert('Servicio creado exitosamente');
    } catch (err) {
      console.error('Error al crear servicio:', err);
      alert('Error al crear el servicio: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleEditarServicio = async () => {
    // Validar todos los campos
    if (!validarFormularioEditar()) {
      alert('Por favor, corrija los errores en el formulario');
      return;
    }

    try {
      setLoading(true);
      const servicioActualizado = {
        name: nombreEditado.trim(),
        duration_min: parseInt(duracionEditada),
        description: descripcionEditada.trim(),
        price: parseFloat(precioEditado),
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
      setEditFieldErrors({ nombre: '', duracion: '', descripcion: '', precio: '' });
      
      alert('Servicio actualizado exitosamente');
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
      
      alert('Servicio eliminado exitosamente');
    } catch (err) {
      console.error('Error al eliminar servicio:', err);
      alert('Error al eliminar el servicio: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  if (loading && services.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mb-4"></div>
          <p className="text-gray-600">Cargando servicios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto p-6'>
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg shadow-lg p-8 text-white mb-6">
        <h1 className="text-4xl font-bold mb-2 flex items-center">
          <Scissors className="h-10 w-10 mr-3" />
          Gestión de Servicios
        </h1>
        <p className="text-pink-100 text-lg">Administra los servicios del salón</p>
      </div>

      {error && (
        <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4'>
          {error}
        </div>
      )}

      {/* Búsqueda y Agregar */}
      <div className='bg-white rounded-lg shadow-md p-6 mb-6'>
        <div className='flex justify-between items-center'>
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
              setNuevoPrecio("");
              setFieldErrors({ nombre: '', duracion: '', descripcion: '', precio: '' });
            }}
            disabled={loading}
            className='bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200 disabled:bg-gray-400'
          >
            Agregar Servicio
          </button>
        </div>
      </div>

      {/* Tabla de Servicios */}
      {services.length > 0 ? (
        <div className='bg-white rounded-lg shadow-md overflow-hidden'>
          <div className='overflow-x-auto'>
            <table className='min-w-full bg-white'>
              <thead>
                <tr className="bg-gray-50">
                  <th className='py-3 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase'>
                    ID
                  </th>
                  <th className='py-3 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase'>
                    Nombre
                  </th>
                  <th className='py-3 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase'>
                    Duración (min)
                  </th>
                  <th className='py-3 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase'>
                    Precio
                  </th>
                  <th className='py-3 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase'>
                    Descripción
                  </th>
                  <th className='py-3 px-4 border-b text-center text-xs font-medium text-gray-500 uppercase'>
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
                      <td className='py-3 px-4 border-b text-gray-700'>
                        {service.id}
                      </td>
                      <td className='py-3 px-4 border-b text-gray-700 font-semibold'>
                        {service.name}
                      </td>
                      <td className='py-3 px-4 border-b text-gray-700'>
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                          {service.duration_min} min
                        </span>
                      </td>
                      <td className='py-3 px-4 border-b text-gray-700'>
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">
                          S/ {service.price ? service.price.toFixed(2) : '0.00'}
                        </span>
                      </td>
                      <td className='py-3 px-4 border-b text-gray-700'>
                        {service.description}
                      </td>
                      <td className='py-3 px-4 border-b text-center text-sm font-medium whitespace-nowrap'>
                        <button
                          onClick={() => {
                            setModalTipo("ver");
                            setServicioSeleccionado(service);
                          }}
                          className='text-blue-600 hover:text-blue-900 mx-1'
                          title="Ver detalles"
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
                            setPrecioEditado(service.price || 0);
                            setEditFieldErrors({ nombre: '', duracion: '', descripcion: '', precio: '' });
                          }}
                          className='text-purple-600 hover:text-purple-900 mx-1'
                          title="Editar"
                        >
                          <Edit className='h-5 w-5' />
                        </button>
                        <button
                          onClick={() => {
                            setModalTipo("eliminar");
                            setServicioSeleccionado(service);
                          }}
                          className='text-red-600 hover:text-red-900 mx-1'
                          title="Eliminar"
                        >
                          <Trash className='h-5 w-5' />
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
          <Scissors className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className='text-gray-600 text-lg mb-4'>No hay servicios registrados</p>
          <button
            onClick={() => {
              setModalTipo("agregar");
              setFieldErrors({ nombre: '', duracion: '', descripcion: '', precio: '' });
            }}
            className='bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-6 rounded-lg transition duration-200'
          >
            Crear Primer Servicio
          </button>
        </div>
      )}

      {/* Modal Ver */}
      {modalTipo === "ver" && servicioSeleccionado && (
        <div className='fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50'>
          <div className='bg-white p-6 rounded-lg w-full max-w-md shadow-xl'>
            <h2 className='text-xl font-bold mb-4'>Detalles del Servicio</h2>
            <div className="space-y-3">
              <p><strong>ID:</strong> {servicioSeleccionado.id}</p>
              <p><strong>Nombre:</strong> {servicioSeleccionado.name}</p>
              <p><strong>Duración:</strong> {servicioSeleccionado.duration_min} min</p>
              <p><strong>Precio:</strong> S/ {servicioSeleccionado.price ? servicioSeleccionado.price.toFixed(2) : '0.00'}</p>
              <p><strong>Descripción:</strong> {servicioSeleccionado.description}</p>
            </div>
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

      {/* Modal Editar */}
      {modalTipo === "editar" && servicioSeleccionado && (
        <div className='fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50'>
          <div className='bg-white p-6 rounded-lg w-full max-w-md shadow-xl'>
            <h2 className='text-xl font-bold mb-4'>Editar Servicio</h2>
            <div className='mb-4'>
              <label className='block text-gray-700 font-medium mb-2'>Nombre</label>
              <input
                value={nombreEditado}
                onChange={(e) => {
                  setNombreEditado(e.target.value);
                  validarCampoEditar('nombre', e.target.value);
                }}
                onBlur={(e) => validarCampoEditar('nombre', e.target.value)}
                className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 ${
                  editFieldErrors.nombre ? 'border-red-500 focus:ring-red-500' : 'focus:ring-pink-500'
                }`}
              />
              {editFieldErrors.nombre && (
                <p className="mt-1 text-sm text-red-600">{editFieldErrors.nombre}</p>
              )}
            </div>

            <div className='mb-4'>
              <label className='block text-gray-700 font-medium mb-2'>Duración (min)</label>
              <input
                type='number'
                value={duracionEditada}
                onChange={(e) => {
                  setDuracionEditada(e.target.value);
                  validarCampoEditar('duracion', e.target.value);
                }}
                onBlur={(e) => validarCampoEditar('duracion', e.target.value)}
                className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 ${
                  editFieldErrors.duracion ? 'border-red-500 focus:ring-red-500' : 'focus:ring-pink-500'
                }`}
                min="5"
                step="5"
              />
              {editFieldErrors.duracion && (
                <p className="mt-1 text-sm text-red-600">{editFieldErrors.duracion}</p>
              )}
            </div>

            <div className='mb-4'>
              <label className='block text-gray-700 font-medium mb-2'>Precio (S/)</label>
              <input
                type='number'
                step='0.01'
                value={precioEditado}
                onChange={(e) => {
                  setPrecioEditado(e.target.value);
                  validarCampoEditar('precio', e.target.value);
                }}
                onBlur={(e) => validarCampoEditar('precio', e.target.value)}
                className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 ${
                  editFieldErrors.precio ? 'border-red-500 focus:ring-red-500' : 'focus:ring-pink-500'
                }`}
                placeholder='Ej: 50.00'
                min="0.01"
              />
              {editFieldErrors.precio && (
                <p className="mt-1 text-sm text-red-600">{editFieldErrors.precio}</p>
              )}
            </div>

            <div className='mb-4'>
              <label className='block text-gray-700 font-medium mb-2'>Descripción</label>
              <textarea
                value={descripcionEditada}
                onChange={(e) => {
                  setDescripcionEditada(e.target.value);
                  validarCampoEditar('descripcion', e.target.value);
                }}
                onBlur={(e) => validarCampoEditar('descripcion', e.target.value)}
                className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 ${
                  editFieldErrors.descripcion ? 'border-red-500 focus:ring-red-500' : 'focus:ring-pink-500'
                }`}
                rows="3"
              />
              {editFieldErrors.descripcion && (
                <p className="mt-1 text-sm text-red-600">{editFieldErrors.descripcion}</p>
              )}
            </div>

            <div className='mt-6 flex gap-3 justify-end'>
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

      {/* Modal Eliminar */}
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
                onClick={() => {
                  setModalTipo(null);
                  setServicioSeleccionado(null);
                }}
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

      {/* Modal Agregar */}
      {modalTipo === "agregar" && (
        <div className='fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50'>
          <div className='bg-white p-6 rounded-lg w-full max-w-md shadow-xl'>
            <h2 className='text-xl font-bold mb-4'>Agregar Servicio</h2>

            <div className='mb-4'>
              <label className='block text-gray-700 font-medium mb-2'>Nombre</label>
              <input
                value={nuevoNombre}
                onChange={(e) => {
                  setNuevoNombre(e.target.value);
                  validarCampo('nombre', e.target.value);
                }}
                onBlur={(e) => validarCampo('nombre', e.target.value)}
                className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 ${
                  fieldErrors.nombre ? 'border-red-500 focus:ring-red-500' : 'focus:ring-pink-500'
                }`}
                placeholder='Ej: Corte de cabello'
              />
              {fieldErrors.nombre && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.nombre}</p>
              )}
            </div>

            <div className='mb-4'>
              <label className='block text-gray-700 font-medium mb-2'>Duración (min)</label>
              <input
                type='number'
                value={nuevaDuracion}
                onChange={(e) => {
                  setNuevaDuracion(e.target.value);
                  validarCampo('duracion', e.target.value);
                }}
                onBlur={(e) => validarCampo('duracion', e.target.value)}
                className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 ${
                  fieldErrors.duracion ? 'border-red-500 focus:ring-red-500' : 'focus:ring-pink-500'
                }`}
                placeholder='Ej: 30'
                min="5"
                step="5"
              />
              {fieldErrors.duracion && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.duracion}</p>
              )}
            </div>

            <div className='mb-4'>
              <label className='block text-gray-700 font-medium mb-2'>Precio (S/)</label>
              <input
                type='number'
                step='0.01'
                value={nuevoPrecio}
                onChange={(e) => {
                  setNuevoPrecio(e.target.value);
                  validarCampo('precio', e.target.value);
                }}
                onBlur={(e) => validarCampo('precio', e.target.value)}
                className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 ${
                  fieldErrors.precio ? 'border-red-500 focus:ring-red-500' : 'focus:ring-pink-500'
                }`}
                placeholder='Ej: 50.00'
                min="0.01"
              />
              {fieldErrors.precio && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.precio}</p>
              )}
            </div>

            <div className='mb-4'>
              <label className='block text-gray-700 font-medium mb-2'>Descripción</label>
              <textarea
                value={nuevaDescripcion}
                onChange={(e) => {
                  setNuevaDescripcion(e.target.value);
                  validarCampo('descripcion', e.target.value);
                }}
                onBlur={(e) => validarCampo('descripcion', e.target.value)}
                className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 ${
                  fieldErrors.descripcion ? 'border-red-500 focus:ring-red-500' : 'focus:ring-pink-500'
                }`}
                placeholder='Describe el servicio...'
                rows="3"
              />
              {fieldErrors.descripcion && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.descripcion}</p>
              )}
            </div>

            <div className='mt-6 flex gap-3 justify-end'>
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