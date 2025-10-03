import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Scissors, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import appointmentService from '../../services/appointmentService';
import serviceService from '../../services/serviceService';

const Home = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    upcomingAppointments: 0,
    completedAppointments: 0,
    totalServices: 0,
    nextAppointment: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [appointments, services] = await Promise.all([
        appointmentService.listAppointments(),
        serviceService.listServices()
      ]);

      const now = new Date();
      const upcoming = appointments.filter(apt => 
        new Date(apt.date) > now && apt.status !== 'cancelled'
      );
      const completed = appointments.filter(apt => apt.status === 'completed');
      
      const nextApt = upcoming.sort((a, b) => 
        new Date(a.date) - new Date(b.date)
      )[0];

      setStats({
        upcomingAppointments: upcoming.length,
        completedAppointments: completed.length,
        totalServices: services.length,
        nextAppointment: nextApt
      });
    } catch (err) {
      console.error('Error cargando estadísticas:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('es-PE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto bg-white p-8 rounded-lg shadow-md">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">
        Bienvenido al Dashboard
      </h1>
      <p className="text-gray-600 mb-8">
        Gestiona tus citas y servicios de belleza
      </p>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-pink-500 to-pink-600 text-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-pink-100 text-sm font-medium">Próximas Citas</p>
              <p className="text-3xl font-bold mt-1">{stats.upcomingAppointments}</p>
            </div>
            <Calendar className="h-12 w-12 text-pink-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Completadas</p>
              <p className="text-3xl font-bold mt-1">{stats.completedAppointments}</p>
            </div>
            <TrendingUp className="h-12 w-12 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Servicios Disponibles</p>
              <p className="text-3xl font-bold mt-1">{stats.totalServices}</p>
            </div>
            <Scissors className="h-12 w-12 text-blue-200" />
          </div>
        </div>
      </div>

      {/* Próxima cita */}
      {stats.nextAppointment && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Clock className="mr-2 h-6 w-6 text-pink-600" />
            Tu Próxima Cita
          </h2>
          <div className="bg-pink-50 border-l-4 border-pink-600 p-4 rounded">
            <p className="font-medium text-gray-800">
              {formatDate(stats.nextAppointment.date)}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Servicio ID: {stats.nextAppointment.service_id}
            </p>
          </div>
        </div>
      )}

      {/* Accesos rápidos */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Accesos Rápidos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => navigate('/agendar-cita')}
            className="bg-pink-600 hover:bg-pink-700 text-white p-4 rounded-lg transition flex items-center justify-center"
          >
            <Calendar className="mr-2 h-5 w-5" />
            Agendar Nueva Cita
          </button>
          <button
            onClick={() => navigate('/mis-citas')}
            className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-lg transition flex items-center justify-center"
          >
            <Clock className="mr-2 h-5 w-5" />
            Ver Mis Citas
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;