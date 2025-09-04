// src/components/HRVResults.js
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  CheckCircle2, 
  AlertTriangle,
  HeartPulse,
  TrendingUp,
  TrendingDown,
  Lightbulb
} from 'lucide-react';
import HRVChart from './HRVChart';

const HRVResults = ({ 
  measurement, 
  onRetry,
  onContinue 
}) => {
  if (!measurement) return null;
  
  const {
    hrvScore = 70,
    rmssd = 50,
    lnrmssd = 3.9,
    meanRR = 980,
    sdnn = 45,
    stressLevel = 40,
    recoveryStatus = 'Good Recovery',
    interpretation = 'Your HRV indicates a balanced nervous system. Keep up the great work with mindfulness and recovery practices.',
    recommendations = [
      'Practice deep breathing for 5 minutes daily',
      'Stay hydrated and maintain consistent sleep',
      'Incorporate mindfulness or meditation into your routine',
      'Avoid stimulants like caffeine before bedtime'
    ]
  } = measurement;
  
  // Determine visual indicators based on HRV score
  const getHRVStatus = () => {
    if (hrvScore >= 80) return { 
      icon: <CheckCircle2 className="h-5 w-5 text-green-500" />, 
      label: "Excellent", 
      color: "bg-green-100 text-green-800" 
    };
    if (hrvScore >= 60) return { 
      icon: <TrendingUp className="h-5 w-5 text-blue-500" />, 
      label: "Good", 
      color: "bg-blue-100 text-blue-800" 
    };
    if (hrvScore >= 40) return { 
      icon: <TrendingDown className="h-5 w-5 text-yellow-500" />, 
      label: "Moderate", 
      color: "bg-yellow-100 text-yellow-500" 
    };
    return { 
      icon: <AlertTriangle className="h-5 w-5 text-red-500" />, 
      label: "Needs Attention", 
      color: "bg-red-100 text-red-800" 
    };
  };
  
  const status = getHRVStatus();
  
  return (
    <div className="max-w-2xl mx-auto">
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HeartPulse className="h-6 w-6 text-cognitio-primary" />
              <CardTitle className="text-2xl font-[Oswald]">HRV Measurement Results</CardTitle>
            </div>
            <Badge className={status.color} variant="secondary">
              {status.icon}
              <span className="ml-1">{status.label}</span>
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <HRVChart 
            hrvScore={hrvScore}
            rmssd={rmssd}
            lnrmssd={lnrmssd}
            meanRR={meanRR}
            sdnn={sdnn}
            stressLevel={stressLevel}
            recoveryStatus={recoveryStatus}
          />
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-[Oswald] flex items-center gap-2 mb-2">
                <span className="text-cognitio-primary">📝</span> Interpretation
              </h3>
              <p className="text-gray-700 font-[Roboto_Condensed] leading-relaxed">
                {interpretation}
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-[Oswald] flex items-center gap-2 mb-2">
                <span className="text-cognitio-primary">💡</span> Recommendations
              </h3>
              <ScrollArea className
