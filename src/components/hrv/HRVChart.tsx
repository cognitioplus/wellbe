import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface HRVChartProps {
  hrvScore: number;
  rmssd: number;
  lnrmssd: number;
  meanRR: number;
  sdnn: number;
  stressLevel: number;
  recoveryStatus: string;
}

const HRVChart: React.FC<HRVChartProps> = ({
  hrvScore,
  rmssd,
  lnrmssd,
  meanRR,
  sdnn,
  stressLevel,
  recoveryStatus
}) => {
  // Historical data simulation (in a real app, this would come from API)
  const historicalData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'HRV Score',
        data: [65, 68, 72, 75, 70, 78, hrvScore],
        borderColor: '#b425aa',
        backgroundColor: 'rgba(180, 37, 170, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Your HRV Trend (Last 7 Days)',
      },
    },
    scales: {
      y: {
        min: 0,
        max: 100,
        ticks: {
          callback: (value: number) => `${value}%`
        }
      }
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-cognitio-primary font-[Oswald]">
          <span className="text-2xl">📊</span> HRV Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <Line data={historicalData} options={options} />
        </div>
        
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-purple-50 rounded-lg">
            <p className="text-sm text-gray-600 font-[Roboto_Condensed]">HRV Score</p>
            <p className="text-2xl font-bold text-cognitio-primary font-[Oswald]">{hrvScore}%</p>
            <p className="text-xs text-gray-500">lnRMSSD: {lnrmssd.toFixed(2)}</p>
          </div>
          
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600 font-[Roboto_Condensed]">Stress Level</p>
            <p className="text-2xl font-bold text-blue-600 font-[Oswald]">{stressLevel}%</p>
            <div className="mt-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500" 
                style={{ width: `${stressLevel}%` }}
              ></div>
            </div>
          </div>
          
          <div className="p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600 font-[Roboto_Condensed]">Recovery Status</p>
            <p className="text-xl font-bold text-green-600 font-[Oswald] truncate">{recoveryStatus}</p>
          </div>
          
          <div className="p-3 bg-yellow-50 rounded-lg">
            <p className="text-sm text-gray-600 font-[Roboto_Condensed]">RMSSD</p>
            <p className="text-2xl font-bold text-yellow-600 font-[Oswald]">{rmssd.toFixed(1)}</p>
            <p className="text-xs text-gray-500">Mean RR: {meanRR.toFixed(1)}ms</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HRVChart;
