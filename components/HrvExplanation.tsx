
import React from 'react';
import { Icon } from './Icons';

const HrvExplanation: React.FC = () => {
  return (
    <div className="mt-6 bg-white p-6 rounded-2xl shadow-lg">
      <h3 className="text-xl text-gray-800 flex items-center">
        <Icon name="brain" className="w-6 h-6 mr-2 text-[#b425aa]" />
        Understanding Your Score
      </h3>
      <div className="mt-3 text-gray-600 space-y-3">
        <p>
          <strong>Heart Rate Variability (HRV)</strong> isn't about how fast your heart beats, but rather the tiny, millisecond variations in time <span className="italic">between</span> each heartbeat. These variations are a sign of a healthy, adaptable nervous system.
        </p>
        <p>
          Your HRV is controlled by your <strong>Autonomic Nervous System (ANS)</strong>, which has two main branches:
        </p>
        <ul className="list-disc list-inside space-y-2 pl-2">
          <li>
            <strong>Sympathetic ("Fight-or-Flight"):</strong> This is your body's accelerator. It kicks in during stress, exercise, or excitement, typically <span className="font-semibold">lowering</span> your HRV.
          </li>
          <li>
            <strong>Parasympathetic ("Rest-and-Digest"):</strong> This is your body's brake. It promotes relaxation, recovery, and digestion, which <span className="font-semibold">increases</span> your HRV.
          </li>
        </ul>
        <p>
          A <span className="font-semibold text-green-600">higher HRV score</span> generally means your "rest-and-digest" system is in control. This indicates good recovery, resilience to stress, and better cardiovascular health. A <span className="font-semibold text-orange-600">lower HRV score</span> suggests your "fight-or-flight" system is more active, which can be a sign of stress, fatigue, or illness.
        </p>
      </div>
    </div>
  );
};

export default HrvExplanation;
