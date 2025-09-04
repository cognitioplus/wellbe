
let audioContext: AudioContext | null = null;

/**
 * Lazily creates and returns a single AudioContext instance.
 * Must be called after a user interaction (e.g., a click).
 */
const getAudioContext = (): AudioContext | null => {
    if (typeof window !== 'undefined' && !audioContext && (window.AudioContext || (window as any).webkitAudioContext)) {
        try {
            audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        } catch (e) {
            console.error("Web Audio API is not supported in this browser.", e);
            return null;
        }
    }
    return audioContext;
};

/**
 * Plays a simple tone with a given frequency and duration.
 * @param frequency - The frequency of the tone in Hz.
 * @param duration - The duration of the tone in milliseconds.
 * @param type - The oscillator type (e.g., 'sine', 'square').
 * @param startTime - Delay before the tone starts (in seconds from now).
 */
const playTone = (frequency: number, duration: number, type: OscillatorType = 'sine', startTime = 0) => {
    const context = getAudioContext();
    if (!context) return;
    
    // Resume context if it's suspended, which can happen on page load
    if (context.state === 'suspended') {
        context.resume();
    }

    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    // Set oscillator properties
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, context.currentTime + startTime);

    // Fade out sound to avoid "clicking"
    gainNode.gain.setValueAtTime(0.2, context.currentTime + startTime); // Start with a gentle volume
    gainNode.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + startTime + (duration / 1000));

    // Connect nodes
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    // Start and stop the oscillator
    oscillator.start(context.currentTime + startTime);
    oscillator.stop(context.currentTime + startTime + (duration / 1000));
};

/**
 * Plays a gentle tone to indicate the start of a measurement.
 * Initializes the AudioContext if it's the first time.
 */
export const playStartSound = () => {
    getAudioContext(); // Ensure context is created on user gesture
    playTone(200, 150, 'sine');
};

/**
 * Plays a short tone to indicate the signal is steady.
 */
export const playSteadySound = () => {
    playTone(440, 100, 'sine');
};

/**
 * Plays a positive, ascending chime to indicate measurement completion.
 */
export const playCompleteSound = () => {
    playTone(523.25, 120, 'sine', 0);     // C5
    playTone(659.25, 120, 'sine', 0.15);  // E5
    playTone(783.99, 150, 'sine', 0.3);   // G5
};
