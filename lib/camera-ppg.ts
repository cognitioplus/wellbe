export interface PpgReading {
  time: number;
  r: number;
  g: number;
  b: number;
  avg: number;
}

export interface PpgUpdate {
    progress: number;
    quality: number; // A score from 0 to 100
}

/**
 * Captures PPG (Photoplethysmography) data using the device camera.
 * Measures subtle color changes in a fingertip to detect heart rate.
 * @param onUpdate - Callback function that receives progress and signal quality updates.
 * @returns A promise that resolves with an array of PPG readings.
 */
export const startCameraPPG = (onUpdate: (update: PpgUpdate) => void = () => {}): Promise<PpgReading[]> => {
  return new Promise((resolve, reject) => {
    
    let stream: MediaStream | null = null;
    
    const stopAndCleanup = () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
      }
      if ((window as any).__stopCameraPPG) {
        delete (window as any).__stopCameraPPG;
      }
    };
    
    const constraints: MediaStreamConstraints = {
      video: {
        facingMode: 'environment', // Use back camera per UI instructions
        width: { ideal: 640 },
        height: { ideal: 480 }
      }
    };

    const video = document.createElement('video');
    video.setAttribute('playsinline', 'true');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (!ctx) {
      return reject(new Error('Could not get 2D context from canvas.'));
    }

    let readings: PpgReading[] = [];
    let startTime: number | null = null;
    const gBuffer: number[] = []; // Buffer for green channel values for quality calculation
    const QUALITY_WINDOW_SIZE = 15; // ~5 seconds of data at 3Hz

    const calculateSignalQuality = (buffer: number[]): number => {
        if (buffer.length < 5) return 0;

        const mean = buffer.reduce((a, b) => a + b) / buffer.length;
        const stddev = Math.sqrt(
            buffer.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / buffer.length
        );
        
        // Normalize stddev to a 0-100 quality score.
        // These min/max values are heuristic, based on typical green channel fluctuations.
        const MIN_STDDEV = 0.1;
        const MAX_STDDEV = 1.5;
        const normalized = (stddev - MIN_STDDEV) / (MAX_STDDEV - MIN_STDDEV);
        const quality = Math.max(0, Math.min(normalized, 1)) * 100;
        
        return quality;
    };

    navigator.mediaDevices.getUserMedia(constraints)
      .then(mediaStream => {
        stream = mediaStream;
        video.srcObject = stream;
        video.play();

        video.onloadedmetadata = () => {
          if (video.videoWidth === 0) {
            console.warn("Video stream started, but width is 0. This might cause issues.");
          }
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
    const TARGET_READINGS = 180; // ~3Hz sampling for 60 seconds
    const TARGET_FPS = 3;

    const captureFrame = () => {
      if (!startTime || !stream) {
        return;
      }
      const now = performance.now();
      const elapsed = now - startTime;
      const progress = Math.min((elapsed / MAX_DURATION) * 100, 100);

      if (elapsed >= MAX_DURATION || readings.length >= TARGET_READINGS) {
        stopAndCleanup();
        resolve(readings);
        return;
      }

      if (video.readyState === video.HAVE_ENOUGH_DATA && canvas.width > 0) {
        const size = Math.min(canvas.width, canvas.height) * 0.6;
        const x = (canvas.width - size) / 2;
        const y = (canvas.height - size) / 2;

        ctx.drawImage(video, x, y, size, size, 0, 0, size, size);

        const imageData = ctx.getImageData(0, 0, size, size);
        const data = imageData.data;

        let r = 0, g = 0, b = 0;
        let count = 0;

        for (let i = 0; i < data.length; i += 4) {
          // Focus on green channel (most sensitive to blood flow) & ignore very dark pixels
          if (data[i + 1] > 50) { 
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
            r, g, b, avg,
          });

          // Update signal quality buffer
          gBuffer.push(g);
          if (gBuffer.length > QUALITY_WINDOW_SIZE) {
            gBuffer.shift();
          }
        }
      }
      
      const quality = calculateSignalQuality(gBuffer);
      onUpdate({ progress: Math.round(progress), quality });

      setTimeout(() => {
        requestAnimationFrame(captureFrame);
      }, 1000 / TARGET_FPS);
    };

    (window as any).__stopCameraPPG = () => {
      stopAndCleanup();
      reject(new Error('Measurement stopped by user.'));
    };
  });
};
