import { useState, useEffect, useCallback } from 'react';
import { useSupabase } from './useSupabase';
import { hrvCalculator } from '../lib/hrv-calculator';
import { startCameraPPG, stopCameraPPG } from '../lib/camera-ppg';

export interface HRVMeasurement {
  id: string;
  timestamp: string;
  hrvScore: number;
  rmssd: number;
  lnrmssd: number;
  meanRR: number;
  sdnn: number;
  stressLevel: number;
  recoveryStatus: string;
  moodQuadrant?: string;
  journalEntry?: string;
}

export interface HRVMeasurementResult {
  hrvScore: number;
  rmssd: number;
  lnrmssd: number;
  meanRR: number;
  sdnn: number;
  stressLevel: number;
  recoveryStatus: string;
  interpretation: string;
  recommendations: string[];
}

export const useHRV = () => {
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [measurementProgress, setMeasurementProgress] = useState(0);
  const [currentMeasurement, setCurrentMeasurement] = useState<HRVMeasurementResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { supabase } = useSupabase();
  
  // Start camera-based PPG measurement
  const startMeasurement = useCallback(async (measurementType: 'camera' | 'bluetooth' = 'camera') => {
    try {
      setIsMeasuring(true);
      setError(null);
      setMeasurementProgress(0);
      
      if (measurementType === 'camera') {
        // Start camera PPG measurement
        const ppgData = await startCameraPPG((progress) => {
          setMeasurementProgress(progress);
        });
        
        // Process the PPG data to get HRV metrics
        const hrvResult = hrvCalculator.calculateFromPPG(ppgData);
        setCurrentMeasurement(hrvResult);
        
        // Save to Supabase
        if (supabase) {
          await saveMeasurement(hrvResult);
        }
      } else {
        // Bluetooth measurement would go here
        setError('Bluetooth measurement coming soon!');
      }
      
      setIsMeasuring(false);
      return currentMeasurement;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Measurement failed');
      setIsMeasuring(false);
      throw err;
    }
  }, [supabase, currentMeasurement]);
  
  // Save measurement to database
  const saveMeasurement = async (result: HRVMeasurementResult) => {
    if (!supabase) return;
    
    const { error } = await supabase
      .from('wellbe_actions')
      .insert([
        {
          action: 'hrv_measurement',
          hrv_score: result.hrvScore,
          stress_index: result.stressLevel,
          recovery_status: result.recoveryStatus,
          mood_quadrant: 'Yellow', // Would come from user input
          journal_entry: 'Completed HRV measurement',
          timestamp: new Date().toISOString()
        }
      ]);
    
    if (error) throw new Error(`Failed to save measurement: ${error.message}`);
    
    // Award CarePoints for completing measurement
    await awardCarePoints();
  };
  
  // Award CarePoints for HRV measurement
  const awardCarePoints = async () => {
    if (!supabase) return;
    
    try {
      // Get current balance
      const { data: lastEntry } = await supabase
        .from('carepoints_log')
        .select('balance')
        .order('awarded_at', { ascending: false })
        .limit(1);
      
      const currentBalance = lastEntry && lastEntry.length > 0 ? lastEntry[0].balance : 0;
      const newBalance = currentBalance + 50;
      
      // Save new CarePoints
      const { error } = await supabase
        .from('carepoints_log')
        .insert([
          { 
            user_id: 'anonymous', 
            points: 50, 
            reason: 'HRV Measurement Completed', 
            balance: newBalance,
            awarded_at: new Date().toISOString()
          }
        ]);
      
      if (error) throw new Error(error.message);
    } catch (err) {
      console.error('Error awarding CarePoints:', err);
    }
  };
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isMeasuring) {
        stopCameraPPG();
      }
    };
  }, [isMeasuring]);
  
  return {
    isMeasuring,
    measurementProgress,
    currentMeasurement,
    error,
    startMeasurement,
    saveMeasurement
  };
};
