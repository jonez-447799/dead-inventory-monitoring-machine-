import React, { useEffect, useState } from 'react';
import { CheckCircle2, RefreshCw, X, Sparkles, Sliders } from 'lucide-react';

export interface CalculationToastData {
  id: string;
  type?: 'success' | 'asOfDate' | 'rule' | 'item';
  title: string;
  message: string;
  timestamp?: string;
}

interface CalculationToastProps {
  toast: CalculationToastData | null;
  onClose: () => void;
  durationMs?: number;
}

export const CalculationToast: React.FC<CalculationToastProps> = ({
  toast,
  onClose,
  durationMs = 3800,
}) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!toast) return;

    setProgress(100);
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / durationMs) * 100);
      setProgress(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        onClose();
      }
    }, 40);

    return () => clearInterval(interval);
  }, [toast, durationMs, onClose]);

  if (!toast) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-5 right-5 z-50 max-w-sm sm:max-w-md w-full animate-in fade-in slide-in-from-bottom-4 duration-200 select-none"
    >
      <div className="relative overflow-hidden rounded-xl border border-emerald-400/40 dark:border-emerald-600/40 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md shadow-xl text-xs text-neutral-800 dark:text-neutral-200 p-3.5 space-y-1.5 ring-1 ring-black/5 dark:ring-white/10">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            {/* Pulsing Success Badge */}
            <div className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
              {toast.type === 'asOfDate' ? (
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-500" style={{ animationIterationCount: 2, animationDuration: '0.8s' }} />
              ) : toast.type === 'rule' ? (
                <Sliders className="w-4 h-4 text-amber-500" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-neutral-900 dark:text-neutral-100 text-xs sm:text-sm">
                  {toast.title}
                </span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  Refreshed ✓
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-neutral-600 dark:text-neutral-400 mt-0.5 leading-relaxed">
                {toast.message}
              </p>
            </div>
          </div>

          {/* Dismiss button */}
          <button
            onClick={onClose}
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors shrink-0"
            aria-label="Dismiss Notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Dynamic shrinking progress bar */}
        <div className="w-full h-1 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden mt-2">
          <div
            className="h-full bg-emerald-500 dark:bg-emerald-400 transition-all duration-75 ease-linear rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default CalculationToast;
