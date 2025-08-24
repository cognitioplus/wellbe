// src/hooks/useHRV.js
import { useState, useEffect, useCallback } from 'react';
import { useSupabase } from './useSupabase';
import { hrvCalculator } from '../lib/hrv-calculator';
import { startCameraPPG, stopCameraPPG } from '../lib/camera-ppg';

export const useHRV = () => {
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [measurementProgress, setMeasurementProgress] = useState(0);
  const [currentMeasurement, setCurrentMeasurement] = useState(null);
  const [error, setError] = useState(null);
  const { supabase } = useSupabase();

  // Start camera-based PPG measurement
  const startMeasurement = useCallback(async (measurementType = 'camera') => {
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
        // Bluetooth measurement (coming soon)
        setError('Bluetooth measurement coming soon!');
      }

      setIsMeasuring(false);
      return hrvResult;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Measurement failed';
      setError(message);
      setIsMeasuring(false);
      console.error('HRV measurement error:', err);
      throw err;
    }
  }, [supabase]);

  // Save measurement to database
  const saveMeasurement = async (result) => {
    if (!supabase || !result) return;

    try {
      const { error: insertError } = await supabase
        .from('wellbe_actions')
        .insert([
          {
            action: 'hrv_measurement',
            hrv_score: result.hrvScore,
            stress_index: result.stressLevel,
            recovery_status: result.recoveryStatus,
            mood_quadrant: 'Yellow', // Placeholder – would come from user input
            journal_entry: 'Completed HRV measurement',
            timestamp: new Date().toISOString()
          }
        ]);

      if (insertError) {
        throw new Error(`Failed to save measurement: ${insertError.message}`);
      }

      // Award CarePoints for completing measurement
      await awardCarePoints();
    } catch (err) {
      console.error('Error saving HRV measurement:', err);
    }
  };

  // Award CarePoints for HRV measurement
  const awardCarePoints = async () => {
    if (!supabase) return;

    try {
      // Get current balance
      const { data: lastEntry, error: fetchError } = await supabase
        .from('carepoints_log')
        .select('balance')
        .order('awarded_at', { ascending: false })
        .limit(1);

      if (fetchError && fetchError.code !== 'PGRST116') {
        // PGRST116 = "no rows returned" – not an error
        console.error('Error fetching CarePoints balance:', fetchError);
      }

      const currentBalance = lastEntry && lastEntry.length > 0 ? lastEntry[0].balance : 0;
      const newBalance = currentBalance + 50;

      // Save new CarePoints
      const { error: insertError } = await supabase
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

      if (insertError) throw new Error(insertError.message);
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
