import React from 'react';
import type { CaseStatus } from '../../types/api';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface StepperProps {
  currentStatus: CaseStatus;
}

const STEPS: { status: CaseStatus; label: string }[] = [
  { status: 'DRAFT', label: 'Draft' },
  { status: 'DATA_ENTRY', label: 'Data Entry' },
  { status: 'VALIDATION', label: 'Validation' },
  { status: 'CALCULATION', label: 'Calculation' },
  { status: 'VERIFICATION', label: 'Verification' },
  { status: 'APPROVAL', label: 'Approval' },
  { status: 'AUTHORIZATION', label: 'Authorization' },
  { status: 'ISSUED', label: 'Issued' },
];

export const WorkflowStepper: React.FC<StepperProps> = ({ currentStatus }) => {
  const currentIndex = STEPS.findIndex((s) => s.status === currentStatus);
  const isRejected = currentStatus === 'REJECTED';

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        {STEPS.map((step, idx) => {
          const isPassed = idx < currentIndex;
          const isCurrent = idx === currentIndex && !isRejected;

          return (
            <React.Fragment key={step.status}>
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isPassed
                      ? 'bg-emerald-600 text-white'
                      : isCurrent
                      ? 'bg-blue-600 text-white ring-4 ring-blue-900'
                      : isRejected && idx === currentIndex
                      ? 'bg-rose-600 text-white ring-4 ring-rose-900'
                      : 'bg-slate-800 text-slate-500 border border-slate-700'
                  }`}
                >
                  {isPassed ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : isRejected && idx === currentIndex ? (
                    <AlertCircle className="w-5 h-5" />
                  ) : (
                    idx + 1
                  )}
                </div>
                <span
                  className={`text-xs mt-2 font-medium ${
                    isCurrent || isPassed ? 'text-slate-200' : 'text-slate-500'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 ${
                    idx < currentIndex ? 'bg-emerald-600' : 'bg-slate-800'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
