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
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      // Envía email y password como JSON al backend
      const response = await axios.post('/api/auth/login', {
        email: email,
        password: password,
      });

      const { access_token, token_type } = response.data;

      // Almacena el token y el tipo de token
      localStorage.setItem('accessToken', access_token);
      localStorage.setItem('tokenType', token_type);
      localStorage.setItem('isAuthenticated', 'true'); // Marca como autenticado

      setSuccess('¡Inicio de sesión exitoso!');
      // Redirige al dashboard o página principal después de un breve delay
      setTimeout(() => {
        navigate('/dashboard'); // Redirige a la página principal Home según tu App.jsx
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
            src={MonarcaLogo} // <-- Usando la variable importada
            alt="Monarca Logo"
            className="w-64 h-64 object-contain"
          />
        </div>

        <div className="w-full md:w-auto flex-grow">
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
                  className="block w-full rounded-md border-0 py-2 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-pink-600 sm:text-sm sm:leading-6"
                  placeholder="Ingrese su correo electrónico"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
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
                  className="block w-full rounded-md border-0 py-2 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-pink-600 sm:text-sm sm:leading-6"
                  placeholder="Ingrese su contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <Button type="submit" className="w-full">
              Iniciar Sesión
            </Button>

            {/* Enlace a la página de registro */}
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