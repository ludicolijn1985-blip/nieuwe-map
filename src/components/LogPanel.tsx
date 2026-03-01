import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, CheckCircle2, Loader2, Circle, Cpu } from 'lucide-react';
import { LogEntry } from '../types';

interface LogPanelProps {
  logs: LogEntry[];
  progress: number;
}

const LogPanel: React.FC<LogPanelProps> = ({ logs, progress }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [logs]);

  const completedCount = logs.filter(l => l.status === 'complete').length;
  const isComplete = progress >= 100;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <Terminal size={14} className="text-green-400" />
          <span className="text-xs font-semibold text-white/70 uppercase tracking-wider">Agent Log</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 text-[10px] px-2 py-1 rounded-full font-medium ${
            isComplete
              ? 'text-green-400 bg-green-400/10 border border-green-400/20'
              : 'text-cyan-400 bg-cyan-400/10 border border-cyan-400/20'
          }`}>
            {isComplete ? (
              <><CheckCircle2 size={10} /> Complete</>
            ) : (
              <>
                <Cpu size={10} className="animate-pulse" />
                {completedCount}/{logs.length}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-white/5 rounded-full mb-4 overflow-hidden relative">
        <motion.div
          className="h-full rounded-full relative overflow-hidden"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{
            background: isComplete
              ? 'linear-gradient(90deg, #22c55e, #10b981)'
              : 'linear-gradient(90deg, #22c55e, #10b981, #06b6d4)',
          }}
        >
          {!isComplete && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_1.5s_infinite]" 
              style={{ backgroundSize: '200% 100%' }}
            />
          )}
        </motion.div>
        <span className="absolute right-0 top-1/2 -translate-y-1/2 text-[9px] font-mono text-white/30 pr-1">
          {Math.round(progress)}%
        </span>
      </div>

      {/* Log entries */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-1.5 pr-1 scroll-smooth">
        <AnimatePresence>
          {logs.map((log) => (
            <motion.div
              key={`log-${log.step}`}
              initial={{ opacity: 0, x: -15, height: 0 }}
              animate={{ opacity: 1, x: 0, height: 'auto' }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className={`rounded-xl transition-all duration-300 overflow-hidden ${
                log.status === 'running'
                  ? 'bg-green-500/[0.06] border border-green-500/15 shadow-sm shadow-green-500/5'
                  : log.status === 'complete'
                  ? 'bg-white/[0.02] border border-transparent'
                  : 'bg-transparent border border-transparent opacity-40'
              }`}
            >
              <div className="flex items-start gap-2.5 py-2.5 px-3">
                {/* Status icon */}
                <div className="mt-0.5 flex-shrink-0">
                  {log.status === 'complete' ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                      <CheckCircle2 size={15} className="text-green-400" />
                    </motion.div>
                  ) : log.status === 'running' ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <Loader2 size={15} className="text-green-400" />
                    </motion.div>
                  ) : (
                    <Circle size={15} className="text-white/10" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-[10px] font-mono font-bold ${
                      log.status === 'running' ? 'text-green-400' : 'text-white/30'
                    }`}>
                      Step {log.step}/{log.total}
                    </span>
                    {log.timestamp && (
                      <span className="text-[9px] font-mono text-white/20">
                        {log.timestamp}
                      </span>
                    )}
                    {log.duration && log.status === 'complete' && (
                      <span className="text-[9px] font-mono text-green-400/40 ml-auto">
                        {log.duration}
                      </span>
                    )}
                  </div>
                  <p className={`text-xs leading-relaxed ${
                    log.status === 'running'
                      ? 'text-green-200 font-medium'
                      : log.status === 'complete'
                      ? 'text-white/55'
                      : 'text-white/20'
                  }`}>
                    {log.message}
                    {log.status === 'running' && (
                      <motion.span
                        animate={{ opacity: [1, 0, 1] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                        className="ml-1 text-green-400"
                      >
                        ▌
                      </motion.span>
                    )}
                  </p>
                  {/* Detail line - only for running and complete */}
                  {(log.status === 'running' || log.status === 'complete') && log.detail && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className={`text-[10px] mt-1 leading-relaxed ${
                        log.status === 'running' ? 'text-green-400/40' : 'text-white/25'
                      }`}
                    >
                      → {log.detail}
                    </motion.p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Completion message */}
        {isComplete && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="rounded-xl p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/5 border border-green-500/20 mt-3"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">✨</span>
              <div>
                <p className="text-green-300 text-xs font-bold">All 9 steps completed successfully!</p>
                <p className="text-white/30 text-[10px] mt-0.5">Your Flutter app is ready for deployment</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default LogPanel;
