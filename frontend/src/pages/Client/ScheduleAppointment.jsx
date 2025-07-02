import InsideLayout from '../../layouts/InsideLayout';

const ScheduleAppointment = () => {
  return (
    <InsideLayout>
      <div className="container mx-auto p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Agendar Nueva Cita</h1>
        <p className="text-gray-600">Esta página contendrá el formulario para agendar una nueva cita.</p>
      </div>
    </InsideLayout>
  );
};

export default ScheduleAppointment;