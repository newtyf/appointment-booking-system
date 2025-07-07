

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-white py-10 text-center">
            <div className="container mx-auto px-6">
                <p className="text-lg mb-4">&copy; {new Date().getFullYear()} Monarca. Todos los derechos reservados.</p>
                <div className="flex justify-center space-x-6 mb-4">
                    <a href="#" className="text-gray-400 hover:text-white transition duration-300">Facebook</a>
                    <a href="#" className="text-gray-400 hover:text-white transition duration-300">Instagram</a>
                    <a href="#" className="text-gray-400 hover:text-white transition duration-300">TikTok</a>
                </div>
                <div className="text-sm text-gray-500">
                    <a href="#" className="hover:text-white mx-2">Política de Privacidad</a> |
                    <a href="#" className="hover:text-white mx-2">Términos de Servicio</a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;