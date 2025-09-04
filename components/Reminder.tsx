
import React, { useState, useEffect } from 'react';
import { Icon } from './Icons';

interface ReminderProps {
    reminderTime: string | null;
    onSetReminder: (time: string) => void;
    onClearReminder: () => void;
}

const Reminder: React.FC<ReminderProps> = ({ reminderTime, onSetReminder, onClearReminder }) => {
    const [time, setTime] = useState('09:00');

    useEffect(() => {
        if (reminderTime) {
            setTime(reminderTime);
        }
    }, [reminderTime]);

    const handleSave = () => {
        onSetReminder(time);
    };

    return (
        <div className="bg-gray-100 p-4 rounded-xl">
            <h3 className="text-lg font-bold text-gray-700 flex items-center mb-3">
                <Icon name="bell" className="w-5 h-5 mr-2 text-[#b425aa]" />
                Daily Reminder
            </h3>
            {reminderTime ? (
                <div className="text-center">
                    <p className="text-gray-600">A daily reminder is set for:</p>
                    <p className="text-2xl font-bold text-gray-800 my-2">{reminderTime}</p>
                    <button
                        onClick={onClearReminder}
                        className="w-full bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                        Clear Reminder
                    </button>
                </div>
            ) : (
                <div>
                    <p className="text-gray-600 text-sm mb-2">Set a time to get a daily notification to check in.</p>
                    <input
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg mb-3 text-center"
                        aria-label="Set reminder time"
                    />
                    <button
                        onClick={handleSave}
                        className="w-full bg-[#b425aa] text-white font-bold py-2 px-4 rounded-lg hover:bg-[#a02198] transition-colors"
                    >
                        Set Reminder
                    </button>
                </div>
            )}
        </div>
    );
};

export default Reminder;
