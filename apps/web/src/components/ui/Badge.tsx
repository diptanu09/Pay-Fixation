import React from 'react';
import type { CaseStatus } from '../../types/api';

interface BadgeProps {
  status: CaseStatus | string;
}

export const StatusBadge: React.FC<BadgeProps> = ({ status }) => {
  const getStyle = () => {
    switch (status) {
      case 'ISSUED':
      case 'APPROVAL':
        return 'bg-emerald-950 text-emerald-300 border-emerald-800';
      case 'VERIFICATION':
      case 'CALCULATION':
        return 'bg-blue-950 text-blue-300 border-blue-800';
      case 'REJECTED':
        return 'bg-rose-950 text-rose-300 border-rose-800';
      case 'DRAFT':
      case 'DATA_ENTRY':
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStyle()}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-80" />
      {status}
    </span>
  );
};
