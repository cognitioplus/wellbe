// src/lib/camera-ppg.js

/**
 * Captures PPG (Photoplethysmography) data using the device camera
 * Measures subtle color changes in fingertip to detect heart rate
 * @param {Function} onProgress - Callback with progress (0-100)
 * @returns {Promise<Array>} - Array of { time, r, g, b, avg } readings
 */
export const startCameraPPG = (onProgress = () => {}) => {
  return new Promise((resolve, reject) => {
    const constraints = {
      video: {
        facingMode: 'self', // Use front camera
        width: { ideal: 640 },
        height: { ideal: 480 }
      }
    };

    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    let stream;
    let readings = [];
    let startTime = null;
    let animationId;

    // Request camera access
    navigator.mediaDevices.getUserMedia(constraints)
      .then(mediaStream => {
        stream = mediaStream;
        video.srcObject = stream;
        video.play();

        video.onloadedmetadata = () => {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          startTime = performance.now();
          captureFrame();
        };
      })
      .catch(err => {
        reject(new Error(`Camera access denied: ${err.message}`));
      });

    const MAX_DURATION = 60000; // 60 seconds
    const TARGET_READINGS = 180; // ~3Hz sampling
    const TARGET_FPS = 3;

    const captureFrame = () => {
      const now = performance.now();
      const elapsed = now - startTime;
      const progress = Math.min((elapsed / MAX_DURATION) * 100, 100);
      
      onProgress(Math.round(progress));

      if (elapsed >= MAX_DURATION || readings.length >= TARGET_READINGS) {
        stopCameraPPG(stream);
        resolve(readings);
        return;
      }

      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        // Center crop on fingertip area
        const size = Math.min(canvas.width, canvas.height) * 0.6;
        const x = (canvas.width - size) / 2;
        const y = (canvas.height - size) / 2;

        ctx.drawImage(video, x, y, size, size, 0, 0, size, size);

        const imageData = ctx.getImageData(0, 0, size, size);
        const data = imageData.data;

        // Average RGB values from center region
        let r = 0, g = 0, b = 0;
        let count = 0;

        for (let i = 0; i < data.length; i += 4) {
          // Focus on green channel (most sensitive to blood flow)
          if (data[i + 1] > 50) { // Ignore very dark pixels
            r += data[i];
            g += data[i + 1];
            b += data[i + 2];
            count++;
          }
        }

        if (count > 0) {
          r /= count;
          g /= count;
          b /= count;
          const avg = (r + g + b) / 3;

          readings.push({
            time: elapsed,
            r, g, b,
            avg,
            raw: data
          });
        }
      }

      // Control frame rate for performance
      setTimeout(() => {
        animationId = requestAnimationFrame(captureFrame);
      }, 1000 / TARGET_FPS);
    };

    // Cleanup function
    window.__stopCameraPPG = () => {
      stopCameraPPG(stream);
      reject(new Error('Measurement stopped'));
    };
  });
};

/**
 * Stops the camera stream
 * Call this when measurement ends or component unmounts
 */
export const stopCameraPPG = (stream) => {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
  }
  if (window.__stopCameraPPG) {
    delete window.__stopCameraPPG;
  }
};
