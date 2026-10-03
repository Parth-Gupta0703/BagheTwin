import React, { useState } from 'react';
import { Info, X } from 'lucide-react';

interface InfoTooltipProps {
  /** Short "What is this?" text */
  label: string;
  /** Longer "Why does it matter?" text */
  description?: string;
  /** Whether to show inline (small icon) or as a button */
  variant?: 'icon' | 'button';
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({
  label,
  description,
  variant = 'icon',
}) => {
  const [open, setOpen] = useState(false);

  if (variant === 'button') {
    return (
      <div className="relative inline-block">
        <button
          onClick={() => setOpen(!open)}
          className="text-xs text-blue-600 hover:text-blue-800 underline underline-offset-2 cursor-pointer"
        >
          {open ? 'Hide info' : 'What is this?'}
        </button>
        {open && (
          <div className="mt-2 p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-slate-700 leading-relaxed max-w-sm">
            <p className="font-medium text-slate-800 mb-1">{label}</p>
            {description && <p className="text-slate-600">{description}</p>}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
        aria-label="More information"
      >
        <Info className="w-3 h-3" />
      </button>
      {open && (
        <div className="absolute z-50 left-0 top-6 w-64 p-3 bg-white border border-slate-200 rounded-lg shadow-lg text-xs leading-relaxed">
          <div className="flex items-start justify-between mb-1">
            <p className="font-medium text-slate-800">{label}</p>
            <button
              onClick={() => setOpen(false)}
              className="text-slate-400 hover:text-slate-600 cursor-pointer ml-2"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          {description && <p className="text-slate-600">{description}</p>}
        </div>
      )}
    </div>
  );
};
