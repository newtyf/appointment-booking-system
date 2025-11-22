import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Button from '../../components/Button';
import MonarcaLogo from '../../assets/monarcaLogo.png';

const Register = () => {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState({
    nombre: '',
    email: '',
    telefono: '',
    password: '',
    confirmPassword: ''
  });

  const navigate = useNavigate();

  // Validaciones siguiendo ISO 25010
  const validaciones = {
    nombre: (valor) => {
      // Mínimo 3 caracteres, máximo 100
      if (!valor || valor.trim().length < 3) {
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
      // No permitir múltiples espacios consecutivos
      if (/\s{2,}/.test(valor)) {
        return 'El nombre no puede contener espacios múltiples consecutivos';
      }
      return '';
    },

    email: (valor) => {
      // Mínimo 5 caracteres (a@b.c), máximo 254 según RFC 5321
      if (!valor || valor.length < 5) {
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
      // Validar que no tenga caracteres especiales inválidos
      if (/[<>()[\]\\,;:"\s]/.test(valor.split('@')[0])) {
        return 'El email contiene caracteres no permitidos';
      }
      return '';
    },

    telefono: (valor) => {
      // Eliminar espacios y guiones para validación
      const telefonoLimpio = valor.replace(/[\s-]/g, '');
      
      // Mínimo 7 dígitos, máximo 15 según ITU-T E.164
      if (!telefonoLimpio || telefonoLimpio.length < 7) {
        return 'El teléfono debe tener al menos 7 dígitos';
      }
      if (telefonoLimpio.length > 15) {
        return 'El teléfono no puede exceder 15 dígitos';
      }
      // Solo números, espacios, guiones y paréntesis
      const regexTelefono = /^[\d\s\-()]+$/;
      if (!regexTelefono.test(valor)) {
        return 'El teléfono solo puede contener números, espacios, guiones y paréntesis';
      }
      // Debe contener al menos 7 dígitos numéricos
      const digitosCount = (telefonoLimpio.match(/\d/g) || []).length;
      if (digitosCount < 7) {
        return 'El teléfono debe contener al menos 7 dígitos';
      }
      return '';
    },

    password: (valor) => {
      // Mínimo 8 caracteres, máximo 128 por seguridad
      if (!valor || valor.length < 8) {
        return 'La contraseña debe tener al menos 8 caracteres';
      }
      if (valor.length > 128) {
        return 'La contraseña no puede exceder 128 caracteres';
      }
      // Debe contener al menos una mayúscula
      if (!/[A-Z]/.test(valor)) {
        return 'La contraseña debe contener al menos una letra mayúscula';
      }
      // Debe contener al menos una minúscula
      if (!/[a-z]/.test(valor)) {
        return 'La contraseña debe contener al menos una letra minúscula';
      }
      // Debe contener al menos un número
      if (!/\d/.test(valor)) {
        return 'La contraseña debe contener al menos un número';
      }
      // Debe contener al menos un carácter especial
      if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(valor)) {
        return 'La contraseña debe contener al menos un carácter especial (!@#$%^&*...)';
      }
      // No debe contener espacios
      if (/\s/.test(valor)) {
        return 'La contraseña no puede contener espacios';
      }
      return '';
    },

    confirmPassword: (valor, passwordOriginal) => {
      if (!valor) {
        return 'Debe confirmar su contraseña';
      }
      if (valor !== passwordOriginal) {
        return 'Las contraseñas no coinciden';
      }
      return '';
    }
  };

  // Validar un campo específico
  const validarCampo = (campo, valor, valorAdicional = null) => {
    const mensajeError = campo === 'confirmPassword' 
      ? validaciones[campo](valor, valorAdicional)
      : validaciones[campo](valor);
    
    setFieldErrors(prev => ({
      ...prev,
      [campo]: mensajeError
    }));
    
    return mensajeError === '';
  };

  // Validar todos los campos antes de enviar
  const validarFormulario = () => {
    const errores = {
      nombre: validaciones.nombre(nombre),
      email: validaciones.email(email),
      telefono: validaciones.telefono(telefono),
      password: validaciones.password(password),
      confirmPassword: validaciones.confirmPassword(confirmPassword, password)
    };

    setFieldErrors(errores);

    // Retornar true si no hay errores
    return Object.values(errores).every(error => error === '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validar todos los campos
    if (!validarFormulario()) {
      setError('Por favor, corrija los errores en el formulario');
      return;
    }

    try {
      const response = await axios.post('/api/auth/register', { 
      name: nombre,         
      email: email,        
      phone: telefono,     
      password: password,
      });

      if (response.status === 201) { 
        setSuccess('¡Registro exitoso! Ahora puedes iniciar sesión.');
        setNombre('');
        setEmail('');
        setTelefono('');
        setPassword('');
        setConfirmPassword('');
        setTimeout(() => {
          navigate('/login'); 
        }, 2000); 
      }
    } catch (err) {
      if (err.response) {
        
        let errorMessage = 'Error en el registro. Inténtalo de nuevo.'; // Mensaje por defecto

        if (err.response.data && err.response.data.detail) {
          if (Array.isArray(err.response.data.detail)) {
            // Si 'detail' es un array (errores de validación de Pydantic)
            errorMessage = err.response.data.detail.map(errItem => {
              // Intenta obtener el campo afectado si es posible
              const field = errItem.loc && errItem.loc.length > 1 ? errItem.loc[1] : 'campo';
              return `${field}: ${errItem.msg}`;
            }).join('; '); // Une los mensajes de error con punto y coma
          } else {
            // Si 'detail' es una cadena de texto (errores generales)
            errorMessage = err.response.data.detail;
          }
        }
        setError(errorMessage);
        

      } else if (err.request) {
        setError('No se pudo conectar con el servidor. Verifica que el backend esté funcionando.');
      } else {
        setError('Ocurrió un error inesperado al intentar registrarse.');
      }
      console.error('Error de registro:', err); 
    }
  };

  const fondoColor = 'bg-pink-100';

  return (
    <div className={`flex items-center justify-center min-h-screen ${fondoColor}`}>
      <div className="bg-white p-10 rounded-lg shadow-2xl w-full max-w-3xl mx-4 md:mx-auto flex flex-col md:flex-row items-center md:space-x-12">
        <div className="mb-8 md:mb-0">
          <img
            src={MonarcaLogo} 
            alt="Monarca Logo"
            className="w-64 h-64 object-contain"
          />
        </div>

        <div className="w-full md:w-auto flex-grow">
          <div className="flex flex-col items-center mb-8">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-2 text-center">Registrarse</h2>
            <p className="text-base text-gray-600 text-center">Cree su cuenta para comenzar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <span className="block sm:inline">{error}</span> {/* Aquí se renderiza la cadena de texto */}
              </div>
            )}
            {success && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                <span className="block sm:inline">{success}</span>
              </div>
            )}

            {/* Campo Nombre */}
            <div>
              <label htmlFor="nombre" className="sr-only">Nombre</label>
              <div className="relative rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  id="nombre"
                  name="nombre"
                  type="text"
                  autoComplete="name"
                  required
                  className={`block w-full rounded-md border-0 py-2 pl-10 text-gray-900 ring-1 ring-inset ${
                    fieldErrors.nombre ? 'ring-red-500 focus:ring-red-600' : 'ring-gray-300 focus:ring-pink-600'
                  } placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6`}
                  placeholder="Ingrese su nombre"
                  value={nombre}
                  onChange={(e) => {
                    setNombre(e.target.value);
                    validarCampo('nombre', e.target.value);
                  }}
                  onBlur={(e) => validarCampo('nombre', e.target.value)}
                />
              </div>
              {fieldErrors.nombre && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.nombre}</p>
              )}
            </div>

            {/* Campo Correo Electrónico */}
            <div>
              <label htmlFor="email" className="sr-only">Correo Electrónico</label>
              <div className="relative rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0018 4H2a2 2 0 00-.003 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={`block w-full rounded-md border-0 py-2 pl-10 text-gray-900 ring-1 ring-inset ${
                    fieldErrors.email ? 'ring-red-500 focus:ring-red-600' : 'ring-gray-300 focus:ring-pink-600'
                  } placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6`}
                  placeholder="Ingrese su correo electrónico"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    validarCampo('email', e.target.value);
                  }}
                  onBlur={(e) => validarCampo('email', e.target.value)}
                />
              </div>
              {fieldErrors.email && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
              )}
            </div>

            {/* Campo Teléfono */}
            <div>
              <label htmlFor="telefono" className="sr-only">Teléfono</label>
              <div className="relative rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106a1.125 1.125 0 01-.622-1.077V11.25a.75.75 0 01.75-.75h2.25c.621 0 1.125-.504 1.125-1.125V9C22.5 8.379 21.996 7.875 21.375 7.875H19.5a2.25 2.25 0 00-2.25 2.25v1.5m-8.114-10.372C11.167 4.49 13.511 4.5 15.75 4.5c1.155 0 2.308-.023 3.456-.068" />
                  </svg>
                </div>
                <input
                  id="telefono"
                  name="telefono"
                  type="tel"
                  autoComplete="tel"
                  required
                  className={`block w-full rounded-md border-0 py-2 pl-10 text-gray-900 ring-1 ring-inset ${
                    fieldErrors.telefono ? 'ring-red-500 focus:ring-red-600' : 'ring-gray-300 focus:ring-pink-600'
                  } placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6`}
                  placeholder="Ingrese su teléfono"
                  value={telefono}
                  onChange={(e) => {
                    setTelefono(e.target.value);
                    validarCampo('telefono', e.target.value);
                  }}
                  onBlur={(e) => validarCampo('telefono', e.target.value)}
                />
              </div>
              {fieldErrors.telefono && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.telefono}</p>
              )}
            </div>

            {/* Campo Contraseña */}
            <div>
              <label htmlFor="password" className="sr-only">Contraseña</label>
              <div className="relative rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className={`block w-full rounded-md border-0 py-2 pl-10 text-gray-900 ring-1 ring-inset ${
                    fieldErrors.password ? 'ring-red-500 focus:ring-red-600' : 'ring-gray-300 focus:ring-pink-600'
                  } placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6`}
                  placeholder="Ingrese su contraseña"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    validarCampo('password', e.target.value);
                    if (confirmPassword) {
                      validarCampo('confirmPassword', confirmPassword, e.target.value);
                    }
                  }}
                  onBlur={(e) => validarCampo('password', e.target.value)}
                />
              </div>
              {fieldErrors.password && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.password}</p>
              )}
            </div>

            {/* Campo Confirmar Contraseña */}
            <div>
              <label htmlFor="confirmPassword" className="sr-only">Confirmar Contraseña</label>
              <div className="relative rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  className={`block w-full rounded-md border-0 py-2 pl-10 text-gray-900 ring-1 ring-inset ${
                    fieldErrors.confirmPassword ? 'ring-red-500 focus:ring-red-600' : 'ring-gray-300 focus:ring-pink-600'
                  } placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6`}
                  placeholder="Confirme su contraseña"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    validarCampo('confirmPassword', e.target.value, password);
                  }}
                  onBlur={(e) => validarCampo('confirmPassword', e.target.value, password)}
                />
              </div>
              {fieldErrors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.confirmPassword}</p>
              )}
            </div>

            <Button type="submit" className="w-full">
              Registrarme
            </Button>
            
            {/* Enlace a la página de login */}
            <p className="mt-4 text-center text-sm text-gray-600">
              ¿Ya tienes una cuenta?{' '}
              <Link to="/login" className="font-semibold leading-6 text-pink-600 hover:text-pink-500">
                Inicia sesión aquí
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;