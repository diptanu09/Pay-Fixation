import React, { useState } from 'react';
import type { CaseType } from '../../types/api';
import { createCaseApi } from '../../lib/api';
import { Shield, X, ArrowRight } from 'lucide-react';

interface NewCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (caseId: string) => void;
}

const CASE_TYPES: { type: CaseType; label: string; desc: string }[] = [
  { type: 'Superannuation', label: 'Superannuation Pension', desc: 'Standard retirement on attaining superannuation age' },
  { type: 'RegularPension', label: 'Regular Service Pension', desc: 'Normal pension upon completing qualifying service' },
  { type: 'FamilyPension', label: 'Family Pension', desc: 'Sanction for eligible family beneficiaries upon employee demise' },
  { type: 'DrwPension', label: 'DRW / Contingent Pension', desc: 'Pension for Daily Rated Worker / Contingent staff' },
  { type: 'Vrs', label: 'Voluntary Retirement (VRS)', desc: 'Voluntary retirement under Tripura Civil Service Rules' },
  { type: 'SpecialPension', label: 'Special Pension', desc: 'Special statutory / invalid pension cases' },
];

export const NewCaseModal: React.FC<NewCaseModalProps> = ({ isOpen, onClose, onCreated }) => {
  const [selectedType, setSelectedType] = useState<CaseType>('Superannuation');
  const [name, setName] = useState('');
  const [designation, setDesignation] = useState('');
  const [prNo, setPrNo] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const caseNo = `PEN-2026-${Math.floor(100000 + Math.random() * 900000)}`;
      const empId = window.crypto.randomUUID();

      const newCase = await createCaseApi({
        case_no: caseNo,
        case_type: selectedType,
        employee: {
          id: empId,
          name: name || 'NEW EMPLOYEE',
          designation: designation || 'Officer',
          group_class: 'Group C',
          dob: '1966-03-05',
          doj: '1997-03-05',
          date_retirement_or_death: '2026-03-31',
          pr_no: prNo || `PR-${Math.floor(100000 + Math.random() * 900000)}`,
          application_no: `APP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          ddo_code: 'DDO-08122',
        },
        service_history: [],
        pay_history: [],
        non_qualifying_days: 0,
        commutation_percentage: 40,
        age_next_birthday: 61,
      });

      onCreated(newCase.case.case_id);
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to create case');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden">
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-blue-500" />
            <h3 className="text-sm font-bold text-slate-100">Create New Pay Fixation / Pension Case</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-2">Select Explicit Case Type</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {CASE_TYPES.map((item) => (
                <div
                  key={item.type}
                  onClick={() => setSelectedType(item.type)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedType === item.type
                      ? 'bg-blue-950/80 border-blue-500 text-slate-100 ring-1 ring-blue-500'
                      : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <p className="font-bold text-xs text-slate-200">{item.label}</p>
                  <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-slate-400 mb-1">Employee Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. GOUTAM KUMAR PAL"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Designation</label>
              <input
                type="text"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder="e.g. Upper Division Clerk (UDC)"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">PPO / PR Number</label>
            <input
              type="text"
              value={prNo}
              onChange={(e) => setPrNo(e.target.value)}
              placeholder="e.g. PR-8820192"
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 font-mono text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="pt-4 flex justify-end space-x-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg text-xs flex items-center space-x-1.5 shadow"
            >
              <span>{loading ? 'Creating...' : 'Create Case File'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
