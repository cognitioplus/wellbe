import React, { useEffect, useRef } from 'react';
import { Measurement } from '../types';

declare var Chart: any; // Using Chart.js from CDN

interface HistoryChartProps {
  history: Measurement[];
}

const HistoryChart: React.FC<HistoryChartProps> = ({ history }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // Data needs to be in chronological order for the chart
    const chartData = [...history].reverse();

    const labels = chartData.map(item =>
      new Date(item.date).toLocaleDateString([], { month: 'short', day: 'numeric' })
    );
    const dataPoints = chartData.map(item => item.hrv);

    // Destroy previous chart instance before creating a new one
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    chartInstanceRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'HRV (RMSSD)',
            data: dataPoints,
            borderColor: '#b425aa',
            backgroundColor: 'rgba(180, 37, 170, 0.1)',
            fill: true,
            tension: 0.3,
            pointBackgroundColor: '#b425aa',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: '#b425aa',
            pointRadius: 4,
            pointHoverRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: '#333',
            titleFont: { weight: 'bold' },
            bodyFont: { size: 14 },
            callbacks: {
              label: function (context: any) {
                return `HRV: ${context.raw.toFixed(1)} ms`;
              },
            },
          },
        },
        scales: {
          y: {
            beginAtZero: false,
            grid: {
              color: '#eee',
            },
            ticks: {
              font: {
                family: "'Roboto Condensed', sans-serif",
              },
            },
            title: {
              display: true,
              text: 'HRV (ms)',
              font: {
                family: "'Roboto Condensed', sans-serif",
              },
            },
          },
          x: {
            grid: {
              display: false,
            },
            ticks: {
              font: {
                family: "'Roboto Condensed', sans-serif",
              },
              maxRotation: 45,
              minRotation: 45,
            },
          },
        },
      },
    });

    // Cleanup function to destroy chart on component unmount
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [history]);

  return <div style={{ height: '250px' }}><canvas ref={chartRef}></canvas></div>;
};

export default HistoryChart;
