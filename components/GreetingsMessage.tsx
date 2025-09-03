import React from 'react';

const GreetingMessage = () => {
    const getTimeBasedGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 6) {
            return {
                greeting: "Good night",
                message: "Rest is crucial for recovery. Consider winding down for better sleep.",
                icon: "🌙"
            };
        } else if (hour < 12) {
            return {
                greeting: "Good morning",
                message: "Start your day with mindful breathing and stay hydrated.",
                icon: "🌅"
            };
        } else if (hour < 17) {
            return {
                greeting: "Good afternoon",
                message: "Take a moment to check your posture and stretch your body.",
                icon: "☀️"
            };
        } else if (hour < 21) {
            return {
                greeting: "Good evening",
                message: "Wind down gently and prepare your mind for restful sleep.",
                icon: "🌆"
            };
        } else {
            return {
                greeting: "Good night",
                message: "Your body needs rest to heal and recharge. Sweet dreams!",
                icon: "🌙"
            };
        }
    };

    const { greeting, message, icon } = getTimeBasedGreeting();

    return (
        <div className="mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
                <h2 className="text-2xl">{greeting}! {icon}</h2>
            </div>
            <p className="text-gray-600">
                {message}
            </p>
        </div>
    );
};

export default GreetingMessage;
