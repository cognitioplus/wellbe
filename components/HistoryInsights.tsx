import React, { useState, useEffect } from 'react';
import { Measurement, TrendAnalysis } from '../types';
import { analyzeHrvTrend } from '../services/geminiService';
import { Icon } from './Icons';

interface HistoryInsightsProps {
  history: Measurement[];
}

const HistoryInsights: React.FC<HistoryInsightsProps> = ({ history }) => {
  const [insights, setInsights] = useState<TrendAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInsights = async () => {
      if (history.length < 2) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const result = await analyzeHrvTrend(history);
        setInsights(result);
      } catch (e: any) {
        setError(e.message || 'Could not load insights.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInsights();
  }, [history]);

  if (isLoading) {
    return (
      <div className="mt-4 flex items-center justify-center p-4 bg-gray-100 rounded-lg">
        <div className="w-6 h-6 border-2 border-[#b425aa] border-dashed rounded-full animate-spin"></div>
        <p className="ml-3 text-gray-600">AI is analyzing your trend...</p>
      </div>
    );
  }
  
  if (error) {
     return (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg">
            <p><span className="font-semibold">Error:</span> {error}</p>
        </div>
    );
  }

  if (!insights) return null;

  return (
    <div className="mt-4 bg-white p-5 rounded-2xl shadow-lg">
      <h3 className="text-lg text-gray-800 flex items-center mb-2">
        <Icon name="trending-up" className="w-5 h-5 mr-2 text-[#b425aa]" />
        AI Trend Analysis
      </h3>
      <p className="text-gray-600 mb-3">{insights.trendAnalysis}</p>
      <div className="bg-purple-50 border-l-4 border-[#b425aa] text-purple-800 p-3">
        <p><span className="font-bold">Key Takeaway:</span> {insights.keyTakeaway}</p>
      </div>
    </div>
  );
};

export default HistoryInsights;
