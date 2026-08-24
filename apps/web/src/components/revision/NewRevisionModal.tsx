import React, { useState } from 'react';
import type { RevisionReason } from '../../types/api';
import { X, ArrowRight, ShieldCheck } from 'lucide-react';

interface NewRevisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: RevisionReason, effectiveDate: string) => void;
}

const REVISION_REASONS: { value: RevisionReason; label: string }[] = [
  { value: 'PayRevision', label: 'Pay Revision (State ROP Amendment)' },
  { value: 'NotionalIncrement', label: 'Notional Increment Order' },
  { value: 'ServiceCorrection', label: 'Service Record / Regularization Correction' },
  { value: 'QualifyingServiceCorrection', label: 'Qualifying Service Period Correction' },
  { value: 'PensionRevision', label: 'Pension Revision Order' },
  { value: 'FamilyPensionRevision', label: 'Family Pension Eligibility Revision' },
  { value: 'DcrgRevision', label: 'DCRG Ceiling / Gratuity Revision' },
  { value: 'CommutationRevision', label: 'Commutation Factor / Fraction Revision' },
  { value: 'RecoveryCorrection', label: 'Government Recovery Adjustment' },
  { value: 'AdministrativeCorrection', label: 'Administrative Order Correction' },
  { value: 'Other', label: 'Other Statutory Cause' },
];

export const NewRevisionModal: React.FC<NewRevisionModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const [reason, setReason] = useState<RevisionReason>('PayRevision');
  const [effectiveDate, setEffectiveDate] = useState('2024-04-01');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(reason, effectiveDate);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 text-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-slate-100 text-sm">Initiate Non-Destructive Revision Case</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Statutory Revision Reason</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as RevisionReason)}
              className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-slate-100 font-bold focus:outline-none focus:border-blue-500"
            >
              {REVISION_REASONS.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Effective Date of Revision</label>
            <input
              type="date"
              value={effectiveDate}
              onChange={(e) => setEffectiveDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-[11px] text-slate-400">
            <p className="font-bold text-slate-300">Preservation Notice:</p>
            <p className="mt-0.5">Creating a revision creates a new linked revision case (<span className="font-mono text-blue-400 font-bold">R01</span>). The original calculation snapshot remains immutably frozen.</p>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold transition shadow"
            >
              <span>Initiate Revision</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
