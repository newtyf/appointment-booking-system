
import { Link } from 'react-router-dom';
import ServiceHair from '../../assets/service_hair.jpg';   
import ServiceFacial from '../../assets/service_facial.jpg';
import ServiceSpa from '../../assets/service_spa.jpg';

const ServicesSection = () => {
    const services = [
        {
            title: "Cuidado Capilar Exclusivo",
            description: "Desde cortes de vanguardia y coloraciones vibrantes hasta tratamientos reparadores y peinados para eventos especiales. Utilizamos las mejores marcas para proteger y embellecer tu cabello.",
            image: ServiceHair,
            alt: "Servicio de Peluquería",
        },
        {
            title: "Rituales Faciales Rejuvenecedores",
            description: "Limpiezas profundas, hidratación intensa, tratamientos antiedad y masajes que devuelven la luminosidad a tu piel. Personalizamos cada sesión para tu tipo de piel.",
            image: ServiceFacial,
            alt: "Servicio de Estética Facial",
        },
        {
            title: "Experiencias de Relajación Spa",
            description: "Masajes terapéuticos, envolturas corporales y circuitos de bienestar diseñados para revitalizar cuerpo y mente. Un escape perfecto para liberarte del estrés diario.",
            image: ServiceSpa,
            alt: "Servicio de Spa y Masajes",
        },
    ];

    return (
        <section id="services" className="py-24 bg-gradient-to-bl from-purple-50 to-pink-50 text-center">
            <div className="container mx-auto px-6">
                <h2 className="text-5xl font-serif text-purple-800 mb-12">
                    Nuestros Servicios de Lujo
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {services.map((service, index) => (
                        <div
                            key={index}
                            className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition duration-500 ease-in-out border border-purple-100 flex flex-col items-center"
                        >
                            <img src={service.image} alt={service.alt} className="w-full h-48 object-cover rounded-lg mb-6 shadow-md" />
                            <h3 className="text-3xl font-semibold text-purple-700 mb-4 font-sans">{service.title}</h3>
                            <p className="text-gray-600 leading-relaxed">{service.description}</p>
                        </div>
                    ))}
                </div>
                <div className="mt-12">
                    <Link
                        to="/agendar-cita"
                        className="inline-block px-8 py-3 bg-pink-600 text-white font-bold rounded-full text-lg shadow-lg hover:bg-pink-700 transform hover:-translate-y-1 transition duration-300"
                    >
                        Agenda Tu Cita Ahora
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default ServicesSection;