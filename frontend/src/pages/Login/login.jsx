import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import Button from '../../components/Button';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(''); 

  const navigate = useNavigate(); 

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(''); 

    const MOCK_USERNAME = 'nomecaesnewtfy'; 
    const MOCK_PASSWORD = '123'; 

    if (username === MOCK_USERNAME && password === MOCK_PASSWORD) {
      console.log('Inicio de sesión exitoso (simulado)');
      localStorage.setItem('isAuthenticated', 'true'); 
      navigate('/'); 
    } else {
      setError('Usuario o contraseña incorrectos.');
      console.log('Inicio de sesión fallido (simulado)');
    }
  };

  const fondoColor = 'bg-pink-100';

  return (
    <div className={`flex items-center justify-center min-h-screen ${fondoColor}`}>
      <div className="bg-white p-10 rounded-lg shadow-2xl w-full max-w-3xl mx-4 md:mx-auto flex flex-col md:flex-row items-center md:space-x-12">
        <div className="mb-8 md:mb-0">
          <img
            src="/monarcaLogo.png"
            alt="Monarca Logo"
            className="w-64 h-64 object-contain"
          />
        </div>

        <div className="w-full md:w-auto flex-grow">
          <div className="flex flex-col items-center mb-8">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-2 text-center">Iniciar Sesión</h2>
            <p className="text-base text-gray-600 text-center">Ingrese sus credenciales para acceder</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && ( // Muestra el mensaje de error si existe
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="username" className="sr-only">Usuario</label>
              <div className="relative rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  className="block w-full rounded-md border-0 py-2 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-pink-600 sm:text-sm sm:leading-6"
                  placeholder="Ingrese su usuario"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

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
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  className="block w-full rounded-md border-0 py-2 pl-10 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-pink-600 sm:text-sm sm:leading-6"
                  placeholder="Ingrese su contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <div
                  className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.981 12H19.922a.75.75 0 00.088 1.5H4.064a.75.75 0 00-.088-1.5z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11.75 1.5a.75.75 0 00-.75.75v12a.75.75 0 001.5 0V2.25a.75.75 0 00-.75-.75z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 1.5a.75.75 0 00-.75.75v12a.75.75 0 001.5 0V2.25A.75.75 0 0012 1.5z" />
                    </svg>
                  )}
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full">
              Iniciar Sesión
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;