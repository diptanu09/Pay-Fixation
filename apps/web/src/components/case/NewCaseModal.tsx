import React, { useState } from 'react';
import type { CaseType } from '../../types/api';
import { createCaseApi, lookupSaiPensionApi, type SaiPensionRecord } from '../../lib/api';
import { Shield, X, ArrowRight, Search, CheckCircle2, Database, RefreshCw } from 'lucide-react';

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

const SAMPLE_APPLICATIONS = [
  { appNo: 'APP-2026-8812', name: 'GOUTAM KUMAR PAL' },
  { appNo: 'APP-2026-1042', name: 'BIMAL CHANDRA DEBBARMA' },
  { appNo: 'APP-2026-3091', name: 'ANITA DAS GUPTA' },
  { appNo: 'APP-2026-7715', name: 'SUBHASH ROY' },
];

export const NewCaseModal: React.FC<NewCaseModalProps> = ({ isOpen, onClose, onCreated }) => {
  const [selectedType, setSelectedType] = useState<CaseType>('Superannuation');
  const [applicationNo, setApplicationNo] = useState('');
  const [name, setName] = useState('');
  const [designation, setDesignation] = useState('');
  const [prNo, setPrNo] = useState('');
  const [groupClass, setGroupClass] = useState('Group C');
  const [dob, setDob] = useState('1966-03-05');
  const [doj, setDoj] = useState('1997-03-05');
  const [dateRetirement, setDateRetirement] = useState('2026-03-31');
  const [ddoCode, setDdoCode] = useState('DDO-08122');
  
  const [fetchingSai, setFetchingSai] = useState(false);
  const [saiRecord, setSaiRecord] = useState<SaiPensionRecord | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleFetchSaiPension = async (appNoToLookup?: string) => {
    const targetAppNo = appNoToLookup || applicationNo;
    if (!targetAppNo.trim()) {
      alert('Please enter an Application No to search in SAI Pension (Oracle 12c)');
      return;
    }

    setFetchingSai(true);
    try {
      const record = await lookupSaiPensionApi(targetAppNo);
      setSaiRecord(record);
      setApplicationNo(record.application_no);
      setName(record.name);
      setDesignation(record.designation);
      setPrNo(record.pr_no);
      setGroupClass(record.group_class);
      setDob(record.dob);
      setDoj(record.doj);
      setDateRetirement(record.date_retirement_or_death);
      setDdoCode(record.ddo_code);
    } catch (err: any) {
      alert(err.message || 'Failed to fetch record from SAI Pension Oracle 12c');
    } finally {
      setFetchingSai(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const caseNo = `PEN-2026-${Math.floor(100000 + Math.random() * 900000)}`;
      const empId = window.crypto.randomUUID();
      const caseId = window.crypto.randomUUID();

      const newCase = await createCaseApi({
        case_id: caseId,
        case_no: caseNo,
        case_type: selectedType,
        employee: {
          id: empId,
          name: name || 'NEW EMPLOYEE',
          designation: designation || 'Officer',
          group_class: groupClass || 'Group C',
          dob: dob || '1966-03-05',
          doj: doj || '1997-03-05',
          date_retirement_or_death: dateRetirement || '2026-03-31',
          pr_no: prNo || `PR-${Math.floor(100000 + Math.random() * 900000)}`,
          application_no: applicationNo || `APP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          ddo_code: ddoCode || 'DDO-08122',
        },
        service_history: [],
        pay_history: [],
        recovery_details: {
          house_building_advance: 0,
          motor_car_advance: 0,
          overpayment_recovery: 0,
          other_deductions: 0,
        },
        non_qualifying_days: 0,
        commutation_percentage: 40,
        age_next_birthday: 61,
        calculation_context: {
          case_id: caseId,
          employee_id: empId,
          calculation_date: dateRetirement || '2026-03-31',
          rule_version: 'ROP 2017 v1.0',
          engine_version: '1.0.0',
          rop_version: 'Rop2017',
        },
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
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-blue-500" />
            <h3 className="text-sm font-bold text-slate-100">Create New Pay Fixation / Pension Case</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs overflow-y-auto">
          {/* Application No Input with Live SAI Pension Oracle 12c Autofill */}
          <div className="bg-slate-950 border border-blue-900/60 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-slate-200 font-bold text-xs flex items-center space-x-1.5">
                <Database className="w-4 h-4 text-blue-400" />
                <span>Application No. (SAI Pension Oracle 12c)</span>
              </label>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                192.168.0.140 • sai_agartala
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={applicationNo}
                onChange={(e) => setApplicationNo(e.target.value)}
                placeholder="e.g. APP-2026-8812"
                required
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 font-mono text-slate-100 focus:outline-none focus:border-blue-500 text-xs"
              />
              <button
                type="button"
                onClick={() => handleFetchSaiPension()}
                disabled={fetchingSai}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg flex items-center space-x-1 shadow transition disabled:opacity-50 text-xs"
              >
                {fetchingSai ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Search className="w-3.5 h-3.5" />
                )}
                <span>{fetchingSai ? 'Fetching...' : 'Autofill Data'}</span>
              </button>
            </div>

            {/* Quick Sample Application No. chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] text-slate-400 font-semibold">Sample Apps:</span>
              {SAMPLE_APPLICATIONS.map((sample) => (
                <button
                  key={sample.appNo}
                  type="button"
                  onClick={() => {
                    setApplicationNo(sample.appNo);
                    handleFetchSaiPension(sample.appNo);
                  }}
                  className="px-2 py-0.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded font-mono text-[10px] text-blue-300 transition"
                >
                  {sample.appNo}
                </button>
              ))}
            </div>

            {/* Status indicator when record fetched */}
            {saiRecord && (
              <div className="flex items-center space-x-1.5 text-[11px] text-emerald-400 pt-1 font-medium bg-emerald-950/40 p-2 rounded-lg border border-emerald-900/50">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>Autofilled from Oracle 12c: <strong className="text-slate-100">{saiRecord.name}</strong> ({saiRecord.designation})</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-2">Select Case Type</label>
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
              <label className="block text-slate-400 mb-1 font-semibold">Employee Full Name (Autofilled)</label>
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
              <label className="block text-slate-400 mb-1 font-semibold">Designation (Autofilled)</label>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">PPO / PR Number</label>
              <input
                type="text"
                value={prNo}
                onChange={(e) => setPrNo(e.target.value)}
                placeholder="e.g. PR-8820192"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 font-mono text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-semibold">DDO Code</label>
              <input
                type="text"
                value={ddoCode}
                onChange={(e) => setDdoCode(e.target.value)}
                placeholder="e.g. DDO-08122"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 font-mono text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end space-x-3 border-t border-slate-800 shrink-0">
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

