
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Measurement, Screen, GeminiAnalysis } from './types';
import { analyzeHrv } from './services/geminiService';
import { Icon } from './components/Icons';
import GreetingMessage from './components/GreetingMessage';
import HrvFacts from './components/HrvFacts';
import HrvGauge from './components/HrvGauge';
import { triggerHapticFeedback, HAPTIC_PATTERNS } from './utils/haptics';
import HrvExplanation from './components/HrvExplanation';
import HistoryChart from './components/HistoryChart';
import HistoryInsights from './components/HistoryInsights';
import Reminder from './components/Reminder';

const MEASUREMENT_DURATION_S = 30; // 30 seconds for a quicker measurement
const STABILIZATION_S = 5; // 5 seconds to ignore at the beginning
const TOTAL_DURATION_S = MEASUREMENT_DURATION_S + STABILIZATION_S;

const getStressColor = (level: string): string => {
    switch (level.toLowerCase()) {
        case 'low': return 'text-green-500';
        case 'balanced': return 'text-blue-500';
        case 'high': return 'text-orange-500';
        case 'very high': return 'text-red-500';
        default: return 'text-gray-500';
    }
};

const calculateStdDev = (arr: number[]): number => {
    const n = arr.length;
    if (n < 2) return 0;
    const mean = arr.reduce((a, b) => a + b) / n;
    const variance = arr.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / (n - 1);
    return Math.sqrt(variance);
};

export default function App() {
    const [screen, setScreen] = useState<Screen>('welcome');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [measurementResult, setMeasurementResult] = useState<Measurement | null>(null);
    const [history, setHistory] = useState<Measurement[]>([]);
    const [reminderTime, setReminderTime] = useState<string | null>(null);

    // HRV Measurement state
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const animationFrameId = useRef<number | undefined>(undefined);
    const measurementStartTime = useRef<number | null>(null);
    
    const [progress, setProgress] = useState(0);
    const [currentBPM, setCurrentBPM] = useState(0);
    const [signalStability, setSignalStability] = useState<'initializing' | 'steady' | 'unsteady'>('initializing');
    const prevSignalStability = useRef(signalStability);


    const redValues = useRef<number[]>([]);
    const timestamps = useRef<number[]>([]);
    const beats = useRef<number[]>([]);

    useEffect(() => {
        try {
            const storedHistory = localStorage.getItem('wellbe_history');
            if (storedHistory) {
                setHistory(JSON.parse(storedHistory));
            }
            const storedReminder = localStorage.getItem('wellbe_reminder');
            if(storedReminder) {
                setReminderTime(storedReminder);
            }
        } catch (e) {
            console.error("Failed to parse data from localStorage", e);
        }
    }, []);
    
    // Effect for handling haptic feedback on signal stability change
    useEffect(() => {
        if (prevSignalStability.current !== 'steady' && signalStability === 'steady') {
            triggerHapticFeedback(HAPTIC_PATTERNS.STEADY);
        }
        prevSignalStability.current = signalStability;
    }, [signalStability]);
    
    // Effect for scheduling notifications
    useEffect(() => {
        if (!reminderTime || typeof Notification === 'undefined' || Notification.permission !== 'granted') {
            return;
        }

        const checkTime = () => {
            const now = new Date();
            const [hours, minutes] = reminderTime.split(':');
            
            // Fire notification only once per day for that minute
            const lastSentKey = `wellbe_last_notif_${hours}_${minutes}`;
            const lastSentDate = localStorage.getItem(lastSentKey);
            const todayStr = now.toISOString().split('T')[0];

            if (
                now.getHours() === parseInt(hours, 10) &&
                now.getMinutes() === parseInt(minutes, 10) &&
                lastSentDate !== todayStr
            ) {
                new Notification("Time for your Well-Be check-in!", {
                    body: "Take a moment to measure your HRV and see how you're doing.",
                    icon: 'https://appimize.app/assets/apps/user_1097/images/59e4d59b8372_727_1097.png',
                    tag: 'well-be-reminder'
                });
                localStorage.setItem(lastSentKey, todayStr);
            }
        };
        
        const intervalId = setInterval(checkTime, 60000); // Check every minute

        return () => clearInterval(intervalId);
    }, [reminderTime]);

    const saveHistory = (newHistory: Measurement[]) => {
        setHistory(newHistory);
        localStorage.setItem('wellbe_history', JSON.stringify(newHistory));
    };

    const stopMeasurement = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (animationFrameId.current) {
            cancelAnimationFrame(animationFrameId.current);
            animationFrameId.current = undefined;
        }
        if(videoRef.current) {
            videoRef.current.srcObject = null;
        }
    }, []);

    const processHrvData = useCallback(async () => {
        const stabilizationCutoff = (measurementStartTime.current || 0) + (STABILIZATION_S * 1000);
        
        const validBeats = beats.current.filter(ts => ts > stabilizationCutoff);
        
        if (validBeats.length < 10) {
            setError("Measurement failed. Not enough heartbeats detected. Please try again, ensuring your finger is steady and fully covers the camera.");
            triggerHapticFeedback(HAPTIC_PATTERNS.ERROR);
            setScreen('welcome');
            return;
        }

        const ibis = [];
        for (let i = 1; i < validBeats.length; i++) {
            ibis.push(validBeats[i] - validBeats[i - 1]);
        }
        
        const meanIbi = ibis.reduce((a, b) => a + b, 0) / ibis.length;
        const filteredIbis = ibis.filter(ibi => Math.abs(ibi - meanIbi) < meanIbi * 0.3);

        if (filteredIbis.length < 5) {
             setError("Measurement quality was too low. Please try again, hold still, and apply light pressure.");
             triggerHapticFeedback(HAPTIC_PATTERNS.ERROR);
             setScreen('welcome');
             return;
        }
        
        let sumOfSquares = 0;
        for (let i = 1; i < filteredIbis.length; i++) {
            sumOfSquares += Math.pow(filteredIbis[i] - filteredIbis[i-1], 2);
        }

        const rmssd = Math.sqrt(sumOfSquares / (filteredIbis.length - 1));
        
        setIsLoading(true);
        try {
            const analysisResult = await analyzeHrv(rmssd);
            const newMeasurement: Measurement = {
                id: Date.now().toString(),
                date: new Date().toISOString(),
                hrv: rmssd,
                stressLevel: analysisResult.stressLevel,
                stressColor: getStressColor(analysisResult.stressLevel),
                analysis: analysisResult.analysis,
                tips: analysisResult.tips
            };
            setMeasurementResult(newMeasurement);
            setScreen('results');
        } catch (e: any) {
            setError(e.message || 'An unknown error occurred during analysis.');
            setScreen('welcome');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const processFrame = useCallback(() => {
        if (!videoRef.current || !canvasRef.current || videoRef.current.paused || videoRef.current.ended) {
            animationFrameId.current = requestAnimationFrame(processFrame);
            return;
        }
        
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;
    
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        let r = 0, g = 0, b = 0;
        for (let i = 0; i < data.length; i += 4) {
            r += data[i];
            g += data[i + 1];
            b += data[i + 2];
        }
        const pixelCount = data.length / 4;
        redValues.current.push(r / pixelCount);
        
        const signal = redValues.current;
        if (signal.length > 20) {
            const recentSignalSlice = signal.slice(-20);
            const stdDev = calculateStdDev(recentSignalSlice);
            const STABILITY_THRESHOLD = 0.5;
            setSignalStability(stdDev < STABILITY_THRESHOLD ? 'steady' : 'unsteady');
        } else {
            setSignalStability('initializing');
        }

        const now = Date.now();
        timestamps.current.push(now);

        if (signal.length > 60) {
            const recentSignal = signal.slice(-60);
            const threshold = recentSignal.reduce((a, b) => a + b) / recentSignal.length;
            if (signal[signal.length-2] < threshold && signal[signal.length-1] >= threshold) {
                 const lastBeat = beats.current[beats.current.length - 1];
                 if(!lastBeat || now - lastBeat > 400) {
                    beats.current.push(now);
                    if (beats.current.length > 5) {
                        const last5beats = beats.current.slice(-5);
                        const avgInterval = (last5beats[4] - last5beats[0]) / 4;
                        setCurrentBPM(Math.round(60000 / avgInterval));
                    }
                 }
            }
        }
        
        if (measurementStartTime.current) {
            const elapsed = (now - measurementStartTime.current) / 1000;
            setProgress(Math.min(100, (elapsed / TOTAL_DURATION_S) * 100));

            if (elapsed >= TOTAL_DURATION_S) {
                stopMeasurement();
                triggerHapticFeedback(HAPTIC_PATTERNS.COMPLETE);
                processHrvData();
            } else {
                animationFrameId.current = requestAnimationFrame(processFrame);
            }
        }
    }, [stopMeasurement, processHrvData]);
    
    const startMeasurement = useCallback(async () => {
        triggerHapticFeedback(HAPTIC_PATTERNS.START);
        try {
            setError(null);
            setProgress(0);
            setCurrentBPM(0);
            setSignalStability('initializing');
            redValues.current = [];
            timestamps.current = [];
            beats.current = [];
            
            const constraints = { video: { 
                facingMode: 'environment',
                width: { ideal: 640 },
                height: { ideal: 480 }
            }};
            streamRef.current = await navigator.mediaDevices.getUserMedia(constraints);
            
            if (videoRef.current) {
                videoRef.current.srcObject = streamRef.current;
                videoRef.current.play().catch(e => {
                     setError("Could not play video stream. Please ensure camera permissions are enabled.");
                     console.error("Video play error:", e);
                });
                measurementStartTime.current = Date.now();
                animationFrameId.current = requestAnimationFrame(processFrame);
            }
        } catch (err) {
            console.error("Camera access error:", err);
            setError("Could not access camera. Please check permissions and try again.");
            setScreen('welcome');
        }
    }, [processFrame]);
    
    useEffect(() => {
        if (screen === 'measuring') {
            startMeasurement();
        } else {
            stopMeasurement();
        }

        return () => stopMeasurement();
    }, [screen, startMeasurement, stopMeasurement]);


    const handleSaveAndFinish = () => {
        if (measurementResult) {
            const newHistory = [measurementResult, ...history];
            saveHistory(newHistory);
            triggerHapticFeedback(HAPTIC_PATTERNS.START);
        }
        setMeasurementResult(null);
        setScreen('history');
    };

    const handleDiscard = () => {
        setMeasurementResult(null);
        setScreen('welcome');
    };

    const handleSetReminder = async (time: string) => {
        setError(null);
        
        const setReminder = (t: string) => {
            setReminderTime(t);
            localStorage.setItem('wellbe_reminder', t);
        };

        if (typeof Notification === 'undefined') {
            setError("Notifications are not supported by your browser.");
            return;
        }

        if (Notification.permission === 'granted') {
            setReminder(time);
        } else if (Notification.permission !== 'denied') {
            try {
                const permission = await Notification.requestPermission();
                if (permission === 'granted') {
                    setReminder(time);
                } else {
                    setError("Notification permission was denied. Reminders will not be shown.");
                }
            } catch(e) {
                 console.error("Error requesting notification permission", e);
                 setError("Could not request notification permission.");
            }
        } else {
            setError("Notifications are blocked by your browser. Please enable them in your settings to set a reminder.");
        }
    };

    const handleClearReminder = () => {
        setReminderTime(null);
        localStorage.removeItem('wellbe_reminder');
    };

    const renderWelcomeScreen = () => (
        <div className="text-center p-8 flex flex-col items-center justify-center h-full">
            <GreetingMessage />
            <img src="https://appimize.app/assets/apps/user_1097/images/59e4d59b8372_727_1097.png" alt="Well-Be Logo" className="w-24 h-24 mb-6" />
            <h1 className="text-4xl text-gray-800">WELL-BE: Your Intelligent Well-Being Companion</h1>
            <p className="mt-4 text-lg text-gray-600 max-w-md mx-auto">Measure your Heart Rate Variability (HRV)—a vital sign of stress and recovery—using just your phone’s camera. WELL-BE reveals how your body is really doing, no wearables required.</p>
            {error && <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">{error}</div>}
            <div className="mt-10 space-y-4 w-full max-w-xs">
                <button onClick={() => setScreen('measuring')} className="w-full bg-[#b425aa] text-white font-bold py-3 px-6 rounded-xl hover:bg-[#a02198] transition-colors duration-300 text-lg shadow-lg">Start Measurement</button>
                <button onClick={() => setScreen('history')} className="w-full bg-gray-200 text-gray-700 font-bold py-3 px-6 rounded-xl hover:bg-gray-300 transition-colors duration-300 text-lg">View History</button>
            </div>
            <div className="mt-8 w-full max-w-xs">
                 <Reminder
                    reminderTime={reminderTime}
                    onSetReminder={handleSetReminder}
                    onClearReminder={handleClearReminder}
                />
            </div>
        </div>
    );
    
    const renderMeasuringScreen = () => {
        const stabilityConfig = {
            initializing: { text: 'Initializing Signal...', color: 'bg-gray-400', textColor: 'text-gray-600', pulse: false },
            steady: { text: 'Signal Steady', color: 'bg-green-500', textColor: 'text-green-700', pulse: false },
            unsteady: { text: 'Signal Unsteady - Hold Still', color: 'bg-red-500', textColor: 'text-red-700', pulse: true }
        };
        const currentStability = stabilityConfig[signalStability];

        return (
             <div className="text-center p-8 flex flex-col items-center justify-center h-full">
                <h2 className="text-2xl text-gray-800">Measuring...</h2>
                 <div className="relative w-64 h-64 my-4 flex items-center justify-center">
                    <div className="absolute w-full h-full rounded-full bg-[#b425aa] opacity-20 animate-ping"></div>
                    <div className="relative w-full h-full">
                        <svg className="w-full h-full" viewBox="0 0 100 100">
                            <circle className="text-gray-200" strokeWidth="8" stroke="currentColor" fill="transparent" r="45" cx="50" cy="50" />
                            <circle
                                className="text-[#b425aa]"
                                strokeWidth="8"
                                strokeDasharray="282.7"
                                strokeDashoffset={282.7 - (progress / 100) * 282.7}
                                strokeLinecap="round"
                                stroke="currentColor"
                                fill="transparent"
                                r="45"
                                cx="50"
                                cy="50"
                                style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
                            />
                        </svg>
                        <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center">
                            {currentBPM > 40 ? (
                               <>
                                <span className="text-5xl font-bold text-gray-800">{currentBPM}</span>
                                <span className="text-lg text-gray-600">BPM</span>
                               </>
                            ) : (
                                <Icon name="heart" className="w-16 h-16 text-red-500 animate-pulse" />
                            )}
                        </div>
                    </div>
                </div>
                
                <HrvFacts />
    
                <div className={`flex items-center justify-center space-x-2 p-2 rounded-lg ${currentStability.textColor} mb-2`}>
                    <span className={`w-3 h-3 rounded-full ${currentStability.color} ${currentStability.pulse ? 'animate-pulse' : ''}`}></span>
                    <span className="font-semibold text-sm">{currentStability.text}</span>
                </div>
                
                <div className="bg-purple-50 border-l-4 border-[#b425aa] text-purple-800 p-4 max-w-md mt-2" role="alert">
                    <p><span className="font-bold">Stay Still:</span> Gently cover the back camera with your index finger.</p>
                </div>
                <video ref={videoRef} className="absolute w-1 h-1 opacity-0 pointer-events-none" playsInline></video>
                <canvas ref={canvasRef} className="hidden"></canvas>
            </div>
        );
    };

    const renderResultsScreen = () => {
        if (isLoading) return <div className="flex flex-col items-center justify-center h-full"><div className="w-16 h-16 border-4 border-[#b425aa] border-dashed rounded-full animate-spin"></div><p className="mt-4 text-gray-600">AI is analyzing your results...</p></div>;
        if (!measurementResult) return <div onClick={() => setScreen('welcome')}>No result found. Go back.</div>;

        return (
            <div className="p-6 h-full overflow-y-auto">
                <h2 className="text-3xl text-center text-gray-800">Your Results</h2>
                <div className="mt-6 bg-white p-6 rounded-2xl shadow-lg text-center">
                    <p className="text-gray-500">HRV (RMSSD)</p>
                    <p className="text-5xl font-bold text-gray-800 my-2">{measurementResult.hrv.toFixed(1)} <span className="text-2xl">ms</span></p>
                    <p className={`text-2xl font-semibold ${measurementResult.stressColor}`}>{measurementResult.stressLevel} Stress</p>
                    
                    <HrvGauge hrv={measurementResult.hrv} />
                    
                    <p className="text-xs text-gray-500 mt-4">Your HRV score is shown on the gauge above, indicating your current stress level. A higher HRV is generally associated with better recovery and lower stress.</p>
                </div>

                <div className="mt-6 bg-white p-6 rounded-2xl shadow-lg">
                    <h3 className="text-xl text-gray-800 flex items-center"><Icon name="brain" className="w-6 h-6 mr-2 text-[#b425aa]"/> Analysis</h3>
                    <p className="mt-2 text-gray-600">{measurementResult.analysis}</p>
                </div>
                
                <div className="mt-6 bg-white p-6 rounded-2xl shadow-lg">
                     <h3 className="text-xl text-gray-800 flex items-center"><Icon name="lightbulb" className="w-6 h-6 mr-2 text-yellow-500"/> Well-being Tips</h3>
                     <ul className="mt-3 space-y-3">
                        {measurementResult.tips.map((tip, index) => (
                            <li key={index} className="flex items-start">
                                <Icon name="check" className="w-5 h-5 mr-3 text-green-500 flex-shrink-0 mt-1" />
                                <span className="text-gray-600">{tip}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <HrvExplanation />

                <div className="mt-8 grid grid-cols-2 gap-4">
                    <button onClick={handleDiscard} className="w-full bg-gray-200 text-gray-700 font-bold py-3 px-6 rounded-xl hover:bg-gray-300 transition-colors duration-300">Discard</button>
                    <button onClick={handleSaveAndFinish} className="w-full bg-[#b425aa] text-white font-bold py-3 px-6 rounded-xl hover:bg-[#a02198] transition-colors duration-300">Save & Finish</button>
                </div>
            </div>
        );
    };
    
    const renderHistoryScreen = () => (
        <div className="p-6 h-full flex flex-col">
            <div className="flex items-center mb-6 flex-shrink-0">
                <button onClick={() => setScreen('welcome')} className="p-2 rounded-full hover:bg-gray-200">
                    <Icon name="back" className="w-6 h-6 text-gray-700" />
                </button>
                <h2 className="text-3xl text-gray-800 ml-4">Measurement History</h2>
            </div>
            {history.length === 0 ? (
                <div className="flex-grow flex flex-col items-center justify-center text-center text-gray-500">
                    <Icon name="history" className="w-16 h-16 mb-4" />
                    <p>No measurements yet.</p>
                    <p>Start a new measurement to see your history.</p>
                </div>
            ) : (
                <div className="flex-grow overflow-y-auto">
                    {history.length > 1 && (
                        <div className="mb-6">
                             <div className="bg-white p-4 rounded-xl shadow-md">
                                <HistoryChart history={history} />
                            </div>
                            <HistoryInsights history={history} />
                        </div>
                    )}
                    {history.length === 1 && (
                         <div className="text-center text-gray-500 py-8 bg-gray-100 rounded-lg">
                            <Icon name="history" className="w-12 h-12 mx-auto mb-3" />
                            <p className="font-semibold">You've made your first measurement!</p>
                            <p>Take another one to see your trend over time.</p>
                        </div>
                    )}

                     <h3 className="text-xl text-gray-800 my-4">All Measurements</h3>
                    <div className="space-y-4">
                        {history.map(item => (
                            <div key={item.id} className="bg-white p-4 rounded-xl shadow-md flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">{new Date(item.date).toLocaleString()}</p>
                                    <p className={`text-lg font-bold ${item.stressColor}`}>{item.stressLevel}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-500">HRV</p>
                                    <p className="text-2xl font-semibold text-gray-800">{item.hrv.toFixed(1)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div className="h-screen w-screen bg-gray-50">
            <div className="container mx-auto max-w-lg h-full bg-white shadow-2xl relative">
                {screen === 'welcome' && renderWelcomeScreen()}
                {screen === 'measuring' && renderMeasuringScreen()}
                {screen === 'results' && renderResultsScreen()}
                {screen === 'history' && renderHistoryScreen()}
            </div>
        </div>
    );
}
