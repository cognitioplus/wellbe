import React, { useState, useEffect } from 'react';

const hrvFacts = [
    "Did you know? Heart Rate Variability (HRV) is the tiny difference in time between your heartbeats.",
    "A higher HRV is often a good sign, showing your nervous system is balanced and resilient.",
    "Your HRV reflects the balance between your 'fight-or-flight' and 'rest-and-digest' systems.",
    "Deep, slow breathing can instantly boost your HRV by activating your relaxation response.",
    "Factors like sleep quality, exercise, stress, and diet all influence your daily HRV score.",
    "This measurement helps you understand your body's recovery and readiness for the day.",
    "We are measuring RMSSD, a key HRV metric that reflects your body's 'rest-and-digest' activity.",
    "Staying still helps the camera get a clear signal of the blood flow in your fingertip."
];

const HrvFacts: React.FC = () => {
    const [factIndex, setFactIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => {
            setIsVisible(false); // Start fade out
            setTimeout(() => {
                setFactIndex((prevIndex) => (prevIndex + 1) % hrvFacts.length);
                setIsVisible(true); // Start fade in
            }, 500); // Wait for fade out to complete
        }, 5000); // Change fact every 5 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="h-24 flex items-center justify-center px-4">
            <p className={`text-center text-gray-600 transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
                {hrvFacts[factIndex]}
            </p>
        </div>
    );
};

export default HrvFacts;
