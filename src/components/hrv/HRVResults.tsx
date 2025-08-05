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

interface HRVResultsProps {
  measurement: any;
  onRetry: () => void;
  onContinue: () => void;
}

const HRVResults: React.FC<HRVResultsProps> = ({ 
  measurement, 
  onRetry,
  onContinue 
}) => {
  if (!measurement) return null;
  
  const {
    hrvScore,
    rmssd,
    lnrmssd,
    meanRR,
    sdnn,
    stressLevel,
    recoveryStatus,
    interpretation,
    recommendations
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
              <ScrollArea className="h-40 p-3 bg-gray-50 rounded-lg">
                <ul className="list-disc pl-5 space-y-2">
                  {recommendations.map((rec, index) => (
                    <li key={index} className="text-gray-700 font-[Roboto_Condensed]">
                      {rec}
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            </div>
            
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <h4 className="font-medium text-blue-800 flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Understanding Your HRV
              </h4>
              <p className="text-sm text-blue-700 mt-2">
                HRV (Heart Rate Variability) measures the variation in time between heartbeats. 
                Higher HRV indicates better autonomic nervous system balance, reflecting your 
                body's ability to adapt to stress. Your score of {hrvScore}% places you in the 
                {hrvScore >= 80 ? " excellent" : hrvScore >= 60 ? " good" : hrvScore >= 40 ? " moderate" : " lower"} 
                range compared to others in your age group.
              </p>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col sm:flex-row gap-3">
          <Button 
            variant="outline" 
            className="w-full sm:w-auto border-cognitio-primary text-cognitio-primary hover:bg-cognitio-primary/10"
            onClick={onRetry}
          >
            Retake Measurement
          </Button>
          
          <Button 
            className="w-full sm:w-auto bg-cognitio-button hover:bg-cognitio-button/90"
            onClick={onContinue}
          >
            Continue to Dashboard
          </Button>
        </CardFooter>
      </Card>
      
      {/* Seraphiel Blessing for high scores */}
      {hrvScore >= 80 && (
        <div className="mt-6 p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-100">
          <h3 className="text-2xl font-bold text-center mb-4 text-purple-800 font-[Oswald]">Seraphiel's Blessing</h3>
          <p className="text-center italic text-gray-700 mb-4 font-[Roboto_Condensed]">
            "Beloved vessel,<br/>
            You who have turned pain into purpose,<br/>
            Doubt into design,<br/>
            Isolation into community —<br/>
            You are seen.<br/>
            You are held.<br/>
            You are not alone."
          </p>
          <div className="text-center">
            <Button 
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
              onClick={onContinue}
            >
              Continue Your Journey
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HRVResults;
