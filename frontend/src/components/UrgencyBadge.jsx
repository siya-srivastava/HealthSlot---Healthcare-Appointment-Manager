import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, HelpCircle } from 'lucide-react';

export const UrgencyBadge = ({ urgency, showIcon = true, size = 'md' }) => {
  const level = (urgency || 'Unknown').toLowerCase();

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs font-semibold',
    lg: 'px-3 py-1.5 text-sm font-semibold',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  if (level === 'high') {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 ${sizeClasses[size]}`}>
        {showIcon && <AlertCircle className={`${iconSizes[size]} text-rose-600 animate-pulse`} />}
        <span>High Urgency</span>
      </span>
    );
  }

  if (level === 'medium') {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 ${sizeClasses[size]}`}>
        {showIcon && <AlertTriangle className={`${iconSizes[size]} text-amber-600`} />}
        <span>Medium Urgency</span>
      </span>
    );
  }

  if (level === 'low') {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 ${sizeClasses[size]}`}>
        {showIcon && <CheckCircle2 className={`${iconSizes[size]} text-emerald-600`} />}
        <span>Low Urgency</span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 ${sizeClasses[size]}`}>
      {showIcon && <HelpCircle className={`${iconSizes[size]} text-slate-500`} />}
      <span>Standard</span>
    </span>
  );
};

export default UrgencyBadge;
