
import AboutUsImage from '../../assets/about_us_spa_interior.jpg'; 

const AboutUsSection = () => {
    return (
        <section id="about" className="py-24 bg-gradient-to-br from-gray-50 to-purple-50 text-center relative overflow-hidden">
            <div className="container mx-auto px-6">
                <h2 className="text-5xl font-serif text-purple-800 mb-12">
                    Nuestra Filosofía
                </h2>
                <div className="flex flex-col md:flex-row items-center justify-center gap-12">
                    <div className="md:w-1/2 text-left">
                        <p className="text-xl text-gray-700 leading-relaxed mb-6">
                            En Monarca, creemos que la belleza va más allá de la superficie. Es un reflejo de equilibrio, paz y cuidado personal. Nos dedicamos a crear un santuario donde cada visita es una oportunidad para rejuvenecer cuerpo y alma.
                        </p>
                        <p className="text-xl text-gray-700 leading-relaxed">
                            Nuestro equipo de especialistas, apasionados por el bienestar, utiliza técnicas avanzadas y productos de la más alta calidad para ofrecerte una experiencia personalizada y resultados excepcionales que realzan tu esencia natural.
                        </p>
                    </div>
                    <div className="md:w-1/2 flex justify-center">
                        <img 
                            src={AboutUsImage} 
                            alt="Interior elegante de Monarca Spa" 
                            className="rounded-xl shadow-2xl transform hover:scale-105 transition-transform duration-500 max-w-full h-auto object-cover w-full md:h-96"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AboutUsSection;