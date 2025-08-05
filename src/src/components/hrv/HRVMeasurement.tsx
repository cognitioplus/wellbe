import React, { useState, useEffect } from 'react';
import { useHRV } from '../../hooks/useHRV';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  HeartPulse, 
  Camera, 
  Bluetooth, 
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import HRVChart from './HRVChart';
import HRVResults from './HRVResults';

const HRVMeasurement = () => {
  const { 
    isMeasuring, 
    measurementProgress, 
    currentMeasurement, 
    error,
    startMeasurement 
  } = useHRV();
  
  const [measurementType, setMeasurementType] = useState<'camera' | 'bluetooth'>('camera');
  const [showResults, setShowResults] = useState(false);
  
  useEffect(() => {
    if (currentMeasurement && !error) {
      setShowResults(true);
    }
  }, [currentMeasurement, error]);
  
  const handleStartMeasurement = async () => {
    try {
      await startMeasurement(measurementType);
    } catch (err) {
      console.error('Measurement failed:', err);
    }
  };
  
  const handleRetry = () => {
    setShowResults(false);
    setError(null);
  };
  
  const renderMeasurementSetup = () => (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <HeartPulse className="h-6 w-6 text-cognitio-primary" />
          <CardTitle className="text-2xl font-[Oswald]">HRV Measurement</CardTitle>
        </div>
        <p className="text-gray-600 font-[Roboto_Condensed]">
          Measure your heart rate variability to understand your stress levels and recovery status
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card 
            className={`cursor-pointer transition-all ${measurementType === 'camera' ? 'ring-2 ring-cognitio-primary' : ''}`}
            onClick={() => !isMeasuring && setMeasurementType('camera')}
          >
            <CardHeader>
              <div className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-cognitio-primary" />
                <CardTitle className="text-lg">Camera Measurement</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 font-[Roboto_Condensed] mb-2">
                Use your phone's front camera to measure HRV through light absorption in your fingertip
              </p>
              <Badge variant="secondary" className="bg-cognitio-accent text-black">
                No additional hardware needed
              </Badge>
            </CardContent>
          </Card>
          
          <Card 
            className={`cursor-pointer transition-all opacity-50 ${measurementType === 'bluetooth' ? 'ring-2 ring-cognitio-primary' : ''}`}
            onClick={() => {
              if (!isMeasuring) {
                setMeasurementType('bluetooth');
                // In a real app, this would navigate to device connection screen
              }
            }}
          >
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bluetooth className="h-5 w-5 text-gray-400" />
                <CardTitle className="text-lg text-gray-400">Bluetooth Devices</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-400 font-[Roboto_Condensed] mb-2">
                Connect to Polar, Apple Watch, or other HR monitors for more precise measurements
              </p>
              <Badge variant="secondary" className="bg-gray-100 text-gray-500">
                Coming soon
              </Badge>
            </CardContent>
          </Card>
        </div>
        
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-2">
          <h3 className="font-[Oswald] text-lg">How It Works</h3>
          <ScrollArea className="h-40 p-3 bg-gray-50 rounded-lg">
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 font-[Roboto_Condensed]">
              <li>Place your fingertip over the camera lens, covering it completely</li>
              <li>Remain still and keep consistent pressure on the camera</li>
              <li>Our AI analyzes subtle color changes to detect your heart rate</li>
              <li>After 60 seconds, you'll see your HRV score and insights</li>
            </ol>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
              <h4 className="font-medium text-blue-800 flex items-center gap-2">
                <span className="text-blue-500">💡</span> Pro Tip
              </h4>
              <p className="text-sm text-blue-700 mt-1">
                For best results, measure in a well-lit room and avoid moving during measurement
              </p>
            </div>
          </ScrollArea>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          className="w-full h-12 text-lg bg-cognitio-button hover:bg-cognitio-button/90"
          onClick={handleStartMeasurement}
          disabled={isMeasuring}
        >
          {isMeasuring ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Measuring... {Math.round(measurementProgress)}%
            </>
          ) : (
            'Start HRV Measurement'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
  
  const renderResults = () => (
    <HRVResults 
      measurement={currentMeasurement} 
      onRetry={handleRetry}
      onContinue={() => setShowResults(false)}
    />
  );
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-[Oswald] mb-2">Heart Rate Variability Analysis</h1>
          <p className="text-gray-600 font-[Roboto_Condensed] max-w-2xl mx-auto">
            Understanding your HRV helps you manage stress, improve recovery, and enhance overall well-being
          </p>
        </div>
        
        {showResults ? renderResults() : renderMeasurementSetup()}
        
        {/* Cultural Context Section */}
        <Card className="mt-8 max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-cognitio-primary font-[Oswald]">
              <HeartPulse className="h-5 w-5" />
              Understanding HRV in Filipino Context
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4 font-[Roboto_Condensed]">
              Heart Rate Variability (HRV) is more than just a number—it's a reflection of how your body responds to the unique stresses of Filipino life.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h4 className="font-medium mb-2 text-gray-800">In Filipino Culture:</h4>
              <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                <li>"Lakas ng loob" (inner strength) is reflected in high HRV scores</li>
                <li>Traditional practices like "hilot" massage can improve HRV</li>
                <li>Social connection ("kapwa") positively impacts nervous system balance</li>
                <li>Stress from "utang na loob" can lower HRV if not managed properly</li>
              </ul>
            </div>
            <p className="text-sm text-gray-600 italic font-[Roboto_Condensed]">
              Well-Be adapts HRV interpretation to Filipino cultural context, helping you understand your body's wisdom through a local lens.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HRVMeasurement;
