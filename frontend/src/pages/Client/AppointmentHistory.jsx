import InsideLayout from '../../layouts/InsideLayout';

const AppointmentHistory = () => {
  return (
    <InsideLayout>
      <div className="container mx-auto p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Historial de Citas</h1>
        <p className="text-gray-600">Esta página mostrará el historial completo de citas.</p>
      </div>
    </InsideLayout>
  );
};

export default AppointmentHistory;