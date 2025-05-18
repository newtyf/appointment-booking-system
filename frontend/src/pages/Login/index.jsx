import Button from '../../components/Button';

const Login = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-80">
        <h2 className="text-2xl font-bold mb-6 text-center">Iniciar Sesión</h2>
        {/* Aquí podrías agregar inputs para usuario y contraseña */}
        <Button className="w-full mt-4">Entrar</Button>
      </div>
    </div>
  );
};

export default Login;
