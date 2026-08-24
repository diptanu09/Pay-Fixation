import React, { useState } from 'react';
import { AlertOctagon, X } from 'lucide-react';

interface RejectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

export const RejectionModal: React.FC<RejectionModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const [reason, setReason] = useState('Service history anomaly: period 2006-2010 requires supporting gazette notification.');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;
    onConfirm(reason);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-rose-400">
            <AlertOctagon className="w-5 h-5" />
            <h3 className="text-sm font-bold text-slate-100">Reject Case & Return to Data Entry</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <p className="text-slate-300">
            Please enter a detailed reason for returning this case to the Dealing Assistant for correction:
          </p>

          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            required
            placeholder="Specify reason for rejection..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-100 focus:outline-none focus:border-rose-500"
          />

          <div className="pt-3 flex justify-end space-x-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-lg text-xs shadow"
            >
              Confirm Case Rejection
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
