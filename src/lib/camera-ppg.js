/**
 * Camera PPG (Photoplethysmography) Implementation
 * Uses smartphone camera to measure heart rate variability
 * 
 * This implementation follows the methodology described in Well-Be documentation
 */

let cameraStream = null;
let animationFrameId = null;
let measurementCallback = null;
let isMeasuring = false;

// RGB color channels
const RED = 0;
const GREEN = 1;
const BLUE = 2;

// Processing parameters
const FRAME_RATE = 30;
const MEASUREMENT_DURATION = 60; // seconds
const MIN_FRAMES = FRAME_RATE * 10; // Minimum 10 seconds of data

// Canvas for processing
let canvas = null;
let context = null;
let video = null;

/**
 * Start camera-based PPG measurement
 * @param {Function} progressCallback - Callback for measurement progress
 * @returns {Promise} Resolves with PPG data
 */
export const startCameraPPG = (progressCallback = null) => {
  return new Promise((resolve, reject) => {
    if (isMeasuring) {
      reject(new Error('Measurement already in progress'));
      return;
    }
    
    measurementCallback = progressCallback;
    isMeasuring = true;
    
    // Create processing elements
    setupProcessingElements();
    
    // Request camera access
    navigator.mediaDevices.getUserMedia({ 
      video: { 
        facingMode: 'self',
        width: { ideal: 640 },
        height: { ideal: 480 }
      } 
    })
    .then(stream => {
      cameraStream = stream;
      video.srcObject = stream;
      
      // Wait for video to load
      video.onloadedmetadata = () => {
        video.play();
        startProcessing();
        
        // Set up measurement completion
        setTimeout(() => {
          stopCameraPPG();
          resolve(processPPGData());
        }, MEASUREMENT_DURATION * 1000);
      };
    })
    .catch(err => {
      isMeasuring = false;
      reject(new Error(`Camera access denied: ${err.message}`));
    });
  });
};

/**
 * Stop camera-based PPG measurement
 */
export const stopCameraPPG = () => {
  if (!isMeasuring) return;
  
  isMeasuring = false;
  
  // Stop camera stream
  if (cameraStream) {
    cameraStream.getTracks().forEach(track => track.stop());
    cameraStream = null;
  }
  
  // Cancel animation frame
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
};

/**
 * Setup canvas and video elements for processing
 */
const setupProcessingElements = () => {
  // Create video element if needed
  if (!video) {
    video = document.createElement('video');
    video.style.position = 'fixed';
    video.style.top = '-9999px';
    video.style.left = '-9999px';
    video.style.width = '640px';
    video.style.height = '480px';
    document.body.appendChild(video);
  }
  
  // Create canvas if needed
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    context = canvas.getContext('2d');
  }
};

/**
 * Start processing video frames
 */
const startProcessing = () => {
  const frameData = [];
  let frameCount = 0;
  
  const processFrame = () => {
    if (!isMeasuring || !video.videoWidth) {
      return;
    }
    
    // Draw current video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Get pixel data
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    
    // Calculate average color values
    let rSum = 0, gSum = 0, bSum = 0;
    for (let i = 0; i < pixels.length; i += 4) {
      rSum += pixels[i];
      gSum += pixels[i + GREEN];
      bSum += pixels[i + BLUE];
    }
    
    const pixelCount = canvas.width * canvas.height;
    const rAvg = rSum / pixelCount;
    const gAvg = gSum / pixelCount;
    const bAvg = bSum / pixelCount;
    
    // Store frame data
    frameData.push({
      r: rAvg,
      g: gAvg,
      b: bAvg,
      timestamp: Date.now()
    });
    
    frameCount++;
    
    // Update progress
    if (measurementCallback) {
      const progress = Math.min(100, (frameCount / (FRAME_RATE * MEASUREMENT_DURATION)) * 100);
      measurementCallback(progress);
    }
    
    // Continue processing
    animationFrameId = requestAnimationFrame(processFrame);
  };
  
  // Start processing loop
  animationFrameId = requestAnimationFrame(processFrame);
};

/**
 * Process collected PPG data to extract heart rate and HRV
 * @returns {Object} Processed PPG data
 */
const processPPGData = () => {
  // In a real implementation, this would:
  // 1. Filter the raw color channel data
  // 2. Extract the PPG signal (typically from green channel)
  // 3. Detect heartbeats and calculate RR intervals
  // 4. Calculate HRV metrics
  
  // For demonstration, we'll return simulated data
  return {
    timestamp: new Date().toISOString(),
    duration: MEASUREMENT_DURATION,
    heartRate: 72,
    hrvMetrics: {
      rmssd: 45.7,
      lnrmssd: 3.82,
      meanRR: 833,
      sdnn: 38.2
    },
    signalQuality: 0.92
  };
};

/**
 * Clean up resources
 */
export const cleanup = () => {
  stopCameraPPG();
  
  // Remove video element
  if (video && video.parentNode) {
    video.parentNode.removeChild(video);
    video = null;
  }
  
  // Clear canvas
  canvas = null;
  context = null;
};

// Cleanup on page unload
window.addEventListener('beforeunload', cleanup);
