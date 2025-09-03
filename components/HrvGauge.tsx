
import React from 'react';

interface HrvGaugeProps {
  hrv: number;
}

// Define the maximum value for the gauge's visual scale. 
// Scores above this will be pinned to the end.
const GAUGE_MAX_HRV = 100;

const HrvGauge: React.FC<HrvGaugeProps> = ({ hrv }) => {
  // Calculate the position of the indicator as a percentage.
  // Clamp the value between 0 and GAUGE_MAX_HRV for positioning.
  const positionPercent = Math.max(0, Math.min(hrv, GAUGE_MAX_HRV)) / GAUGE_MAX_HRV * 100;

  return (
    <div className="w-full mt-6">
      {/* Indicator showing user's score */}
      <div className="relative h-12">
        <div
          className="absolute z-10 flex flex-col items-center transition-all duration-500 ease-out"
          style={{ 
            left: `${positionPercent}%`,
            transform: 'translateX(-50%)',
            bottom: '0.75rem', // Position above the bar
          }}
        >
          <div className="bg-white px-2 py-1 rounded-md shadow-lg text-sm font-bold text-gray-800">
            {hrv.toFixed(1)}
          </div>
          <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-white -mt-1" style={{filter: 'drop-shadow(0 1px 1px rgb(0 0 0 / 0.1))'}}></div>
        </div>

        {/* The colored gauge bar */}
        <div className="absolute bottom-0 h-3 w-full flex rounded-full overflow-hidden bg-gray-200 shadow-inner">
          <div className="bg-red-500" title="Very High Stress (0-20)" style={{ width: '20%' }}></div>
          <div className="bg-orange-500" title="High Stress (20-40)" style={{ width: '20%' }}></div>
          <div className="bg-blue-500" title="Balanced (40-60)" style={{ width: '20%' }}></div>
          <div className="bg-green-500" title="Low Stress (60+)" style={{ width: '40%' }}></div>
        </div>
      </div>
      
      {/* Text labels for HRV values */}
      <div className="flex text-xs text-gray-500 mt-1 relative">
         <span style={{width: '20%'}}>0</span>
         <span style={{width: '20%'}}>20</span>
         <span style={{width: '20%'}}>40</span>
         <span>60+ ms</span>
      </div>
    </div>
  );
};

export default HrvGauge;
