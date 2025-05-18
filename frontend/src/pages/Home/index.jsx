import InsideLayout from '../../layouts/InsideLayout';

const Home = () => {
  return (
    <InsideLayout>
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">Bienvenido a Appointment Booking System</h2>
        <p className="text-lg text-gray-700 mb-6">Gestiona tus citas de manera fácil y rápida.</p>
        <img src="/vite.svg" alt="Logo" className="mx-auto w-24 h-24 mb-4" />
      </div>
    </InsideLayout>
  );
};

export default Home;
