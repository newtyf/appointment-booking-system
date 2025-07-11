import { ImageUpload } from "../../components/imageUpload";

const AISection = () => {
    return (
        <section id="ia" className="py-24 bg-gradient-to-tr from-pink-100 to-purple-100 text-center">
            <div className="container mx-auto px-6">
                <h2 className="text-5xl font-serif text-purple-800 mb-12">
                    Tu Asesor Personal de Belleza IA
                </h2>
                <p className="text-xl text-gray-700 mb-10 max-w-3xl mx-auto">
                    ¿Tienes dudas sobre tu rutina de belleza o el mejor tratamiento para ti? ¡Nuestra Inteligencia Artificial está aquí para ayudarte! Obtén recomendaciones personalizadas y resuelve tus preguntas al instante.
                </p>
                <div className="bg-white p-10 rounded-2xl shadow-2xl mx-auto border border-purple-200">
                    <ImageUpload />
                </div>
            </div>
        </section>
    );
};

export default AISection;