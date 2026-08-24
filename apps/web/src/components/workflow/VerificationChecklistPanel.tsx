import React, { useState } from 'react';
import { CheckSquare, Square, ShieldCheck } from 'lucide-react';

export interface ChecklistState {
  item_code: string;
  item_name: string;
  passed: boolean;
  comment: string;
}

const DEFAULT_ITEMS: ChecklistState[] = [
  { item_code: 'EMPLOYEE_IDENTITY', item_name: 'Employee Identity & PR Number Verification', passed: true, comment: 'Verified against State PR Registry' },
  { item_code: 'SERVICE_HISTORY', item_name: 'Service Book Entries & Break-in-Service Audit', passed: true, comment: 'Service Book verified up to retirement date' },
  { item_code: 'PAY_FIXATION', item_name: 'Historical Pay Fixation & ROP 2017 Matrix Lookup', passed: true, comment: 'Fitment factor 2.57 correctly applied' },
  { item_code: 'QUALIFYING_SERVICE', item_name: 'Qualifying Service & Non-Qualifying Days Deductions', passed: true, comment: '58 Half-Year Periods verified (100% full pension)' },
  { item_code: 'PENSION', item_name: 'Gross Basic Pension Calculation (50% Last Pay)', passed: true, comment: '₹26,600 / month verified' },
  { item_code: 'DCRG', item_name: 'DCRG Gratuity Math & ROP 2018 Statutory Ceiling Cap', passed: true, comment: 'Gross ₹8,57,800 within ₹20,00,000 ceiling' },
  { item_code: 'COMMUTATION', item_name: 'Commutation Age Factor Lookup (Age 61 = 8.194)', passed: true, comment: '40% fraction = ₹7,42,400 commuted lump sum' },
  { item_code: 'FAMILY_PENSION', item_name: 'Enhanced (50%) vs Normal (30%) Family Pension', passed: true, comment: 'Spouse beneficiary eligible for lifetime pension' },
  { item_code: 'DOCUMENTS', item_name: 'Service Book & Medical Fitness Certificate Evidence', passed: true, comment: 'All required physical documents uploaded' },
];

interface VerificationChecklistPanelProps {
  onChecklistChange?: (allPassed: boolean) => void;
}

export const VerificationChecklistPanel: React.FC<VerificationChecklistPanelProps> = ({ onChecklistChange }) => {
  const [items, setItems] = useState<ChecklistState[]>(DEFAULT_ITEMS);

  const toggleItem = (code: string) => {
    const updated = items.map((item) => (item.item_code === code ? { ...item, passed: !item.passed } : item));
    setItems(updated);
    if (onChecklistChange) {
      onChecklistChange(updated.every((i) => i.passed));
    }
  };

  const allPassed = items.every((i) => i.passed);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4 text-xs">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <CheckSquare className="w-5 h-5 text-blue-400" />
          <div>
            <h3 className="font-bold text-slate-100 text-sm">Statutory Verification Checklist</h3>
            <p className="text-[11px] text-slate-400">All 9 statutory audit items must be verified and passed prior to verification</p>
          </div>
        </div>

        <span
          className={`px-3 py-1 rounded-full font-bold text-[10px] flex items-center space-x-1 border ${
            allPassed
              ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
              : 'bg-amber-950 text-amber-300 border-amber-800'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{allPassed ? 'CHECKLIST COMPLETE (9/9)' : 'CHECKLIST INCOMPLETE'}</span>
        </span>
      </div>

      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.item_code}
            onClick={() => toggleItem(item.item_code)}
            className="bg-slate-950 border border-slate-800 hover:border-blue-500/50 transition cursor-pointer p-3 rounded-lg flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              {item.passed ? (
                <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <Square className="w-4 h-4 text-slate-600 shrink-0" />
              )}
              <div>
                <p className={`font-semibold ${item.passed ? 'text-slate-200' : 'text-slate-400'}`}>{item.item_name}</p>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5">{item.comment}</p>
              </div>
            </div>

            <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${item.passed ? 'bg-emerald-950 text-emerald-400 border border-emerald-900' : 'bg-slate-900 text-slate-500'}`}>
              {item.passed ? 'PASS ✓' : 'PENDING'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
