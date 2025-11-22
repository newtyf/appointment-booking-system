import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Button from '../../components/Button';
import MonarcaLogo from '../../assets/monarcaLogo.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState({
    email: '',
    password: ''
  });
  const navigate = useNavigate();

  // Validaciones siguiendo ISO 25010 para Login
  const validaciones = {
    email: (valor) => {
      // Mínimo 5 caracteres (a@b.c), máximo 254 según RFC 5321
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
      // Validar que no tenga caracteres especiales inválidos
      if (/[<>()[\]\\,;:"\s]/.test(valor.split('@')[0])) {
        return 'El email contiene caracteres no permitidos';
      }
      return '';
    },

    password: (valor) => {
      // Para login, validaciones más simples pero efectivas
      if (!valor || valor.length === 0) {
        return 'La contraseña es requerida';
      }
      if (valor.length < 5) {
        return 'La contraseña debe tener al menos 5 caracteres';
      }
      if (valor.length > 128) {
        return 'La contraseña no puede exceder 128 caracteres';
      }
      // Verificar que no contenga solo espacios
      if (/^\s+$/.test(valor)) {
        return 'La contraseña no puede contener solo espacios';
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
      email: validaciones.email(email),
      password: validaciones.password(password)
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
      const response = await axios.post('/api/auth/login', {
        email: email,
        password: password,
      });

      const { access_token, token_type, user } = response.data;

      // Almacenar en localStorage
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('tokenType', token_type);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('isAuthenticated', 'true');

      setSuccess('¡Inicio de sesión exitoso!');

      // Redirigir según rol 
      setTimeout(() => {
        const userRole = user.role;
        
        if (userRole === 'client') {
          navigate('/client/dashboard');
        } else if (userRole === 'admin') {
          navigate('/admin/dashboard');
        } else if (userRole === 'stylist') {
          navigate('/stylist/dashboard');
        } else if (userRole === 'receptionist') {
          navigate('/receptionist/dashboard');
        } else {
          navigate('/dashboard'); // Fallback
        }
      }, 1000);

    } catch (err) {
      if (err.response) {
        setError(err.response.data.detail || 'Credenciales incorrectas. Inténtalo de nuevo.');
      } else if (err.request) {
        setError('No se pudo conectar con el servidor. Verifica que el backend esté funcionando.');
      } else {
        setError('Ocurrió un error inesperado al iniciar sesión.');
      }
      console.error('Error de inicio de sesión:', err);
    }
  };

  const fondoColor = 'bg-pink-100';

  return (
    <div className={`flex items-center justify-center min-h-screen ${fondoColor}`}>
      <div className="bg-white p-10 rounded-lg shadow-2xl w-full max-w-xl mx-4 md:mx-auto flex flex-col md:flex-row items-center md:space-x-12">
        <div className="mb-8 md:mb-0">
          <img
            src={MonarcaLogo}
            alt="Monarca Logo"
            className="w-64 h-64 object-contain"
          />
        </div>

        <div className="w-full md:w-auto flex-grow">
          <Link
            to="/"
            className="inline-flex items-center text-pink-600 hover:text-pink-700 mb-4"
          >
            <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al inicio
          </Link>

          <div className="flex flex-col items-center mb-8">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-2 text-center">Iniciar Sesión</h2>
            <p className="text-base text-gray-600 text-center">Bienvenido de nuevo</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}
            {success && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                <span className="block sm:inline">{success}</span>
              </div>
            )}

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
                  autoComplete="current-password"
                  required
                  className={`block w-full rounded-md border-0 py-2 pl-10 text-gray-900 ring-1 ring-inset ${
                    fieldErrors.password ? 'ring-red-500 focus:ring-red-600' : 'ring-gray-300 focus:ring-pink-600'
                  } placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6`}
                  placeholder="Ingrese su contraseña"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    validarCampo('password', e.target.value);
                  }}
                  onBlur={(e) => validarCampo('password', e.target.value)}
                />
              </div>
              {fieldErrors.password && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.password}</p>
              )}
            </div>

            <Button type="submit" className="w-full">
              Iniciar Sesión
            </Button>

            <p className="mt-4 text-center text-sm text-gray-600">
              ¿No tienes una cuenta?{' '}
              <Link to="/registro" className="font-semibold leading-6 text-pink-600 hover:text-pink-500">
                Regístrate aquí
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;