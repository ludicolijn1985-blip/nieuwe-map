export interface BusinessFormData {
  name: string;
  type: string;
  city: string;
  postcode: string;
  description: string;
  features: string;
  primaryColor: string;
  secondaryColor: string;
  logoUploaded: boolean;
}

export interface LogEntry {
  step: number;
  total: number;
  message: string;
  detail: string;
  timestamp: string;
  status: 'pending' | 'running' | 'complete';
  duration?: string;
}

export interface ROIData {
  revenueBoostMin: number;
  revenueBoostMax: number;
  buildTimeMin: number;
  buildTimeMax: number;
  complexity: 'Easy' | 'Medium' | 'Advanced';
  monthlyPrice: number;
  paybackWeeks: number;
}

export type AppPhase = 'input' | 'roi' | 'building' | 'complete';
