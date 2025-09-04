/**
 * Triggers haptic feedback if the browser supports it.
 * @param pattern - A number or an array of numbers representing the vibration pattern.
 * See: https://developer.mozilla.org/en-US/docs/Web/API/Vibration_API
 */
export const triggerHapticFeedback = (pattern: VibratePattern): void => {
  if (typeof window !== 'undefined' && 'vibrate' in navigator && navigator.vibrate) {
    try {
      // Some browsers may not support the API, or it might be disabled by the user.
      navigator.vibrate(pattern);
    } catch (error) {
      console.warn("Haptic feedback failed:", error);
    }
  }
};

/**
 * A collection of standard vibration patterns for different app events.
 */
export const HAPTIC_PATTERNS = {
  /** A short, crisp buzz for starting an action or simple confirmation. */
  START: 50,
  /** A clear, double pulse to confirm a steady state has been achieved. */
  STEADY: [40, 60, 40],
  /** A distinct, longer buzz to signal the completion of a process. */
  COMPLETE: 150,
  /** A stuttering pattern to indicate an error or failed action. */
  ERROR: [75, 50, 75],
};
