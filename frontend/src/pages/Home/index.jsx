import React from 'react';

const Home = () => {
  return (
    <div className="container mx-auto bg-white p-8 rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">
        ¡Bienvenido al Dashboard!
      </h1>
      <p className="text-gray-600 mb-6">
        Aquí podrás gestionar tus citas y ver la información relevante.
      </p>
      <p className="text-gray-500 text-sm">
        Este es un dashboard básico. Próximamente añadiremos más funcionalidades.
      </p>
    </div>
  );
};

export default Home;