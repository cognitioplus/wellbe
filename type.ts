export interface Measurement {
  id: string;
  date: string;
  hrv: number;
  stressLevel: string;
  stressColor: string;
  analysis: string;
  tips: string[];
}

export type Screen = 'welcome' | 'measuring' | 'results' | 'history';

export interface GeminiAnalysis {
    stressLevel: string;
    analysis: string;
    tips: string[];
}

export interface TrendAnalysis {
    trendAnalysis: string;
    keyTakeaway: string;
}
