import React from 'react';
import { Helmet } from 'react-helmet';
import HRVMeasurement from '../components/hrv/HRVMeasurement';

const HRVMeasurementPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Helmet>
        <title>HRV Measurement | Well-Be by Cognitio+</title>
        <meta name="description" content="Measure your heart rate variability with Well-Be's AI-powered tool. Understand your stress levels and recovery status." />
        <meta name="keywords" content="HRV, heart rate variability, stress measurement, mental health, wellness, Cognitio+, Well-Be" />
        
        {/* Open Graph */}
        <meta property="og:title" content="HRV Measurement | Well-Be by Cognitio+" />
        <meta property="og:description" content="Measure your heart rate variability with Well-Be's AI-powered tool." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://wellbe.cognitio-plus.com/hrv-measurement" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="HRV Measurement | Well-Be by Cognitio+" />
        <meta name="twitter:description" content="Measure your heart rate variability with Well-Be's AI-powered tool." />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        <HRVMeasurement />
      </div>
    </div>
  );
};

export default HRVMeasurementPage;
