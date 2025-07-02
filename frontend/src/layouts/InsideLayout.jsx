import React from 'react';
import Sidebar from '../components/Sidebar'; // Importa el Sidebar

const InsideLayout = ({ children }) => {
  // Función para manejar el logout si decides mantenerlo en el topbar del contenido
  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    window.location.href = '/login'; // O navigate('/login') si es preferible
  };

  return (
    <div className="flex min-h-screen bg-gray-100"> {/* Un flex principal para Sidebar y Contenido */}
      <Sidebar /> {/* El Sidebar fijo a la izquierda */}

      <div className="flex flex-col flex-grow"> {/* Este div crecerá para ocupar el resto del ancho */}
        {/* Aquí la "mini-topbar" dentro del área de contenido principal, como en el ejemplo */}
        <header className="bg-white p-4 shadow-md flex justify-between items-center text-gray-800 border-b border-gray-200">
          <div className="flex items-center">
            {/* Si quieres el logo "DYNASTY" como en el ejemplo en la barra de contenido */}
            <img src="/monarcaLogo.png" alt="Dynasty Logo" className="h-10 w-auto mr-4" /> {/* Ajusta tamaño */}
            {/* Opcional: Título o nombre de la sección actual */}
            <span className="text-xl font-semibold">Citas - lista</span> {/* Ejemplo según la imagen */}
          </div>
          <div className="flex items-center space-x-4">
            {/* Icono de usuario */}
            <svg className="h-8 w-8 text-gray-600 cursor-pointer" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {/* Si quieres un botón de Cerrar Sesión aquí, como en la discusión anterior, podrías ponerlo */}
            {/* <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md"
            >
                Cerrar Sesión
            </button> */}
          </div>
        </header>

        <main className="flex-grow p-6 overflow-y-auto"> {/* El contenido de la página */}
          {children}
        </main>
      </div>
    </div>
  );
};

export default InsideLayout;