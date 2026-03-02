import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Smartphone, Tablet } from 'lucide-react';
import PhonePreview from './PhonePreview';
import { BusinessFormData } from '../types';

interface DevicePreviewProps {
  data: BusinessFormData;
  currentStep: number;
  isBuilding: boolean;
  interactive?: boolean;
}

const DevicePreview: React.FC<DevicePreviewProps> = (props) => {
  const [device, setDevice] = useState<'android' | 'ios'>('android');

  return (
    <div className="flex flex-col items-center">
      {/* Device Toggle */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-1 bg-white/5 rounded-xl p-1 mb-4"
      >
        <button
          onClick={() => setDevice('android')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
            device === 'android'
              ? 'bg-green-500 text-white shadow-lg shadow-green-500/20'
              : 'text-dim hover:text-sub'
          }`}
        >
          <Smartphone size={11} /> Android
        </button>
        <button
          onClick={() => setDevice('ios')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
            device === 'ios'
              ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
              : 'text-dim hover:text-sub'
          }`}
        >
          <Tablet size={11} /> iOS
        </button>
      </motion.div>

      {/* Phone Frame with device-specific styling */}
      <div className={`relative transition-all duration-500 ${device === 'ios' ? 'ios-device' : ''}`}>
        <PhonePreview {...props} />

        {/* iOS-specific styling overlay */}
        {device === 'ios' && (
          <div className="absolute inset-0 pointer-events-none z-30">
            {/* iOS Dynamic Island instead of notch */}
            <div className="absolute top-[12px] left-1/2 -translate-x-1/2 w-[70px] h-[22px] bg-black rounded-[12px] z-30 flex items-center justify-center">
              <div className="w-[8px] h-[8px] rounded-full bg-[#1a1a28] border border-white/5" />
            </div>
          </div>
        )}
      </div>

      {/* Device label */}
      <div className="text-center mt-3">
        <p className="text-[10px] text-dim uppercase tracking-widest font-medium">
          {device === 'android' ? '📱 Android Preview' : '🍎 iOS Preview'}
        </p>
        <p className="text-[8px] text-dim mt-0.5">
          {device === 'android' ? 'Pixel 8 Pro • Android 15' : 'iPhone 16 Pro • iOS 18'}
        </p>
      </div>
    </div>
  );
};

export default DevicePreview;
