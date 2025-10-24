import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  User,
  Scissors,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import appointmentService from "../../services/appointmentService";
import serviceService from "../../services/serviceService";
import { useCulqiCheckout } from "../../hooks/useCulqiCheckout.js";

const ScheduleAppointment = () => {
  const navigate = useNavigate();

  const { openCheckout } = useCulqiCheckout({
    onSuccess: async () => {
      setLoading(true);
      await handleConfirm();
    },
    onError: async (error) => {
      setError(
        `Error en el pago: ${error}, contacta al soporte para más información.`
      );
      setLoading(false);
    },
  });

  // Estados del formulario
  const [step, setStep] = useState(1); // Paso actual del wizard
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [availability, setAvailability] = useState(null);
  const [selectedStylist, setSelectedStylist] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");

  // Estados de UI
  const [loading, setLoading] = useState(false);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Cargar servicios al montar
  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const data = await serviceService.listServices();
      setServices(data);
    } catch (err) {
      console.error("Error al cargar servicios:", err);
      setError("No se pudieron cargar los servicios");
    }
  };

  // Cargar disponibilidad cuando se selecciona fecha
  useEffect(() => {
    if (selectedDate && selectedService) {
      fetchAvailability();
    }
  }, [selectedDate, selectedService]);

  const fetchAvailability = async () => {
    setLoadingAvailability(true);
    setError("");

    try {
      const data = await appointmentService.getAvailability(
        selectedDate,
        selectedService.id
      );
      setAvailability(data);
    } catch (err) {
      console.error("Error al cargar disponibilidad:", err);
      setError("No se pudo cargar la disponibilidad");
    } finally {
      setLoadingAvailability(false);
    }
  };

  const handleServiceSelect = (service) => {
    setSelectedService(service);
    setStep(2);
    // Reset selections
    setSelectedDate("");
    setSelectedStylist(null);
    setSelectedTime("");
    setAvailability(null);
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setStep(3);
    // Reset selections
    setSelectedStylist(null);
    setSelectedTime("");
  };

  const handleStylistSelect = (stylist) => {
    setSelectedStylist(stylist);
    setStep(4);
    // Reset time
    setSelectedTime("");
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
  };

  const handleConfirm = async () => {
    if (
      !selectedService ||
      !selectedDate ||
      !selectedStylist ||
      !selectedTime
    ) {
      setError("Por favor completa todos los campos");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Combinar fecha y hora
      const appointmentDateTime = `${selectedDate}T${selectedTime}:00`;

      await appointmentService.bookAppointment({
        service_id: selectedService.id,
        stylist_id: selectedStylist.stylist_id,
        date: appointmentDateTime,
      });

      setSuccess(true);
      setTimeout(() => {
        navigate("/client/appointments");
      }, 2000);
      setLoading(false);
    } catch (err) {
      console.error("Error al agendar cita:", err);
      setError(err.response?.data?.detail || "No se pudo agendar la cita");
    } finally {
      setLoading(false);
    }
  };

  // Calcular fecha mínima (hoy)
  const today = new Date().toISOString().split("T")[0];

  if (success) {
    return (
      <div className='container mx-auto p-6 flex items-center justify-center min-h-screen'>
        <div className='bg-white rounded-lg shadow-lg p-8 max-w-md text-center'>
          <CheckCircle className='h-16 w-16 text-green-500 mx-auto mb-4' />
          <h2 className='text-2xl font-bold text-gray-800 mb-2'>
            ¡Cita Agendada!
          </h2>
          <p className='text-gray-600 mb-6'>
            Tu cita ha sido registrada exitosamente
          </p>
          <div className='bg-gray-50 rounded-lg p-4 mb-6 text-left'>
            <p className='text-sm text-gray-600 mb-1'>Servicio:</p>
            <p className='font-semibold text-gray-800 mb-3'>
              {selectedService?.name}
            </p>

            <p className='text-sm text-gray-600 mb-1'>Estilista:</p>
            <p className='font-semibold text-gray-800 mb-3'>
              {selectedStylist?.stylist_name}
            </p>

            <p className='text-sm text-gray-600 mb-1'>Fecha y Hora:</p>
            <p className='font-semibold text-gray-800'>
              {new Date(selectedDate).toLocaleDateString("es-ES", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}{" "}
              - {selectedTime}
            </p>
          </div>
          <p className='text-sm text-gray-500'>Redirigiendo a Mis Citas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto p-6'>
      {/* Header */}
      <div className='mb-6'>
        <button
          onClick={() => navigate("/client/dashboard")}
          className='flex items-center text-pink-600 hover:text-pink-700 mb-4'
        >
          <ArrowLeft className='h-5 w-5 mr-2' />
          Volver al Dashboard
        </button>
        <h1 className='text-3xl font-bold text-gray-800'>Agendar Nueva Cita</h1>
        <p className='text-gray-600 mt-2'>
          Selecciona el servicio, fecha y horario de tu preferencia
        </p>
      </div>

      {/* Progress Steps */}
      <div className='mb-8'>
        <div className='flex items-center justify-between max-w-3xl mx-auto'>
          {[
            { num: 1, label: "Servicio", icon: Scissors },
            { num: 2, label: "Fecha", icon: Calendar },
            { num: 3, label: "Estilista", icon: User },
            { num: 4, label: "Horario", icon: Clock },
          ].map((s, idx) => (
            <React.Fragment key={s.num}>
              <div className='flex flex-col items-center'>
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    step >= s.num
                      ? "bg-pink-600 text-white"
                      : "bg-gray-200 text-gray-400"
                  } transition-colors`}
                >
                  <s.icon className='h-6 w-6' />
                </div>
                <p
                  className={`text-sm mt-2 ${
                    step >= s.num
                      ? "text-pink-600 font-semibold"
                      : "text-gray-400"
                  }`}
                >
                  {s.label}
                </p>
              </div>
              {idx < 3 && (
                <div
                  className={`flex-1 h-1 ${
                    step > s.num ? "bg-pink-600" : "bg-gray-200"
                  } transition-colors mx-2`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 max-w-3xl mx-auto'>
          {error}
        </div>
      )}

      {/* Step 1: Seleccionar Servicio */}
      {step === 1 && (
        <div className='max-w-4xl mx-auto'>
          <h2 className='text-2xl font-bold text-gray-800 mb-6'>
            Selecciona un Servicio
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {services.map((service) => (
              <div
                key={service.id}
                onClick={() => handleServiceSelect(service)}
                className='bg-white border-2 border-gray-200 rounded-lg p-6 cursor-pointer hover:border-pink-500 hover:shadow-lg transition-all'
              >
                <div className='flex items-start justify-between mb-3'>
                  <Scissors className='h-8 w-8 text-pink-600' />
                  <span className='text-xs font-semibold text-pink-600 bg-pink-100 px-2 py-1 rounded'>
                    {service.duration_min} min
                  </span>
                </div>
                <h3 className='text-lg font-bold text-gray-800 mb-2'>
                  {service.name}
                </h3>
                <p className='text-sm text-gray-600 mb-3'>
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Seleccionar Fecha */}
      {step === 2 && selectedService && (
        <div className='max-w-2xl mx-auto'>
          <h2 className='text-2xl font-bold text-gray-800 mb-2'>
            Selecciona una Fecha
          </h2>
          <p className='text-gray-600 mb-6'>
            Servicio:{" "}
            <span className='font-semibold'>{selectedService.name}</span> (
            {selectedService.duration_min} minutos)
          </p>

          <div className='bg-white rounded-lg shadow-md p-6'>
            <label className='block text-gray-700 font-semibold mb-2'>
              Fecha:
            </label>
            <input
              type='date'
              min={today}
              value={selectedDate}
              onChange={(e) => handleDateSelect(e.target.value)}
              className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-lg'
            />
            <p className='text-sm text-gray-500 mt-2'>
              Selecciona una fecha para ver la disponibilidad de estilistas
            </p>
          </div>

          <button
            onClick={() => setStep(1)}
            className='mt-4 text-pink-600 hover:text-pink-700 flex items-center'
          >
            <ArrowLeft className='h-5 w-5 mr-2' />
            Cambiar servicio
          </button>
        </div>
      )}

      {/* Step 3: Seleccionar Estilista */}
      {step === 3 && selectedDate && (
        <div className='max-w-4xl mx-auto'>
          <h2 className='text-2xl font-bold text-gray-800 mb-2'>
            Selecciona un Estilista
          </h2>
          <p className='text-gray-600 mb-6'>
            {new Date(selectedDate).toLocaleDateString("es-ES", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>

          {loadingAvailability ? (
            <div className='text-center py-12'>
              <div className='inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mb-4'></div>
              <p className='text-gray-600'>Cargando disponibilidad...</p>
            </div>
          ) : availability && availability.stylists.length > 0 ? (
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {availability.stylists.map((stylist) => (
                <div
                  key={stylist.stylist_id}
                  onClick={() =>
                    stylist.available_slots.length > 0 &&
                    handleStylistSelect(stylist)
                  }
                  className={`bg-white border-2 rounded-lg p-6 ${
                    stylist.available_slots.length > 0
                      ? "border-gray-200 cursor-pointer hover:border-pink-500 hover:shadow-lg"
                      : "border-gray-100 opacity-50 cursor-not-allowed"
                  } transition-all`}
                >
                  <div className='flex items-center mb-4'>
                    <div className='bg-pink-100 rounded-full p-3 mr-4'>
                      <User className='h-6 w-6 text-pink-600' />
                    </div>
                    <div>
                      <h3 className='text-lg font-bold text-gray-800'>
                        {stylist.stylist_name}
                      </h3>
                      <p className='text-sm text-gray-600'>
                        {stylist.available_slots.length} horarios disponibles
                      </p>
                    </div>
                  </div>
                  {stylist.available_slots.length === 0 && (
                    <p className='text-sm text-red-600'>
                      Sin disponibilidad para este día
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center'>
              <p className='text-yellow-800'>
                No hay disponibilidad para esta fecha
              </p>
            </div>
          )}

          <button
            onClick={() => setStep(2)}
            className='mt-4 text-pink-600 hover:text-pink-700 flex items-center'
          >
            <ArrowLeft className='h-5 w-5 mr-2' />
            Cambiar fecha
          </button>
        </div>
      )}

      {/* Step 4: Seleccionar Horario */}
      {step === 4 && selectedStylist && (
        <div className='max-w-3xl mx-auto'>
          <h2 className='text-2xl font-bold text-gray-800 mb-2'>
            Selecciona un Horario
          </h2>
          <p className='text-gray-600 mb-6'>
            Estilista:{" "}
            <span className='font-semibold'>
              {selectedStylist.stylist_name}
            </span>
          </p>

          <div className='bg-white rounded-lg shadow-md p-6 mb-6'>
            <h3 className='font-semibold text-gray-700 mb-4'>
              Horarios Disponibles:
            </h3>
            <div className='grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3'>
              {selectedStylist.available_slots.map((time) => (
                <button
                  key={time}
                  onClick={() => handleTimeSelect(time)}
                  className={`py-3 px-4 rounded-lg font-semibold transition-all ${
                    selectedTime === time
                      ? "bg-pink-600 text-white shadow-lg"
                      : "bg-gray-100 text-gray-700 hover:bg-pink-100 hover:text-pink-600"
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>

          {selectedTime && (
            <div className='bg-white rounded-lg shadow-md p-6 mb-6'>
              <h3 className='font-semibold text-gray-700 mb-4'>
                Resumen de tu Cita:
              </h3>
              <div className='space-y-3'>
                <div className='flex items-center'>
                  <Scissors className='h-5 w-5 text-pink-600 mr-3' />
                  <span className='text-gray-700'>
                    {selectedService.name} ({selectedService.duration_min} min)
                  </span>
                </div>
                <div className='flex items-center'>
                  <User className='h-5 w-5 text-pink-600 mr-3' />
                  <span className='text-gray-700'>
                    {selectedStylist.stylist_name}
                  </span>
                </div>
                <div className='flex items-center'>
                  <Calendar className='h-5 w-5 text-pink-600 mr-3' />
                  <span className='text-gray-700'>
                    {new Date(selectedDate).toLocaleDateString("es-ES", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className='flex items-center'>
                  <Clock className='h-5 w-5 text-pink-600 mr-3' />
                  <span className='text-gray-700'>{selectedTime}</span>
                </div>
              </div>
            </div>
          )}

          <div className='flex gap-4'>
            <button
              onClick={() => setStep(3)}
              className='flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 px-6 rounded-lg transition duration-200'
            >
              Volver
            </button>
            <button
              onClick={() => {
                openCheckout({
                  amount: selectedService.price * 100, // Monto en centavos
                  description: `Pago por servicio: ${selectedService.name}`,
                  currency: "PEN",
                  email: JSON.parse(localStorage.getItem("user")).email || "",
                  metadata: {
                    first_name:
                      JSON.parse(localStorage.getItem("user")).name || "",
                  },
                });
              }}
              disabled={!selectedTime || loading}
              className='flex-1 bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {loading ? "Agendando..." : "Confirmar Cita"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleAppointment;
