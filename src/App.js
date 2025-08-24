// src/App.js
import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Pages
import HRVMeasurement from './pages/HRVMeasurementPage';

// Components
import Header from './components/Header';
import Footer from './components/Footer';
import Hero from './components/Hero';
import Testimonials from './components/Testimonials';
import CTA from './components/CTA';

// Styles
import './index.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <Router>
      <div className="font-[Roboto_Condensed] min-h-screen flex flex-col">
        {/* Header */}
        <Header />

        {/* Main Content */}
        <main className="flex-grow">
          <Routes>
            <Route
              path="/"
              element={
                <>
                  {/* Hero */}
                  <Hero onGetStarted={() => setActiveTab('tracker')} />

                  {/* Testimonials */}
                  <Testimonials />

                  {/* CTA */}
                  <CTA />
                </>
              }
            />

            <Route path="/hrv-measurement" element={<HRVMeasurement />} />

            {/* Add more routes here as needed */}
          </Routes>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </Router>
  );
}
