// frontend/src/pages/Landing/LandingPage.jsx

import React from 'react';
import Header from './Header';
import HeroSection from './HeroSection';
import AboutUsSection from './AboutUsSection';
import ServicesSection from './ServicesSection';
import AISection from './AISection';
import ContactSection from './ContactSection';
import Footer from './Footer';

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <Header />
            <main className="flex-grow">
                <HeroSection />
                <AboutUsSection />
                <ServicesSection />
                <AISection />
                <ContactSection />
            </main>
            <Footer />
        </div>
    );
};

export default LandingPage;