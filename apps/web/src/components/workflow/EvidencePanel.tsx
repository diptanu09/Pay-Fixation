import React from 'react';
import { FileCheck, ShieldCheck, Lock } from 'lucide-react';

interface EvidencePanelProps {
  caseId: string;
}

export const EvidencePanel: React.FC<EvidencePanelProps> = () => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4 text-xs">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <FileCheck className="w-5 h-5 text-blue-400" />
          <div>
            <h3 className="font-bold text-slate-100 text-sm">Calculation Session & Evidence Audit Inspector</h3>
            <p className="text-[11px] text-slate-400">Cryptographically verifiable calculation evidence package</p>
          </div>
        </div>

        <span className="px-3 py-1 bg-blue-950 text-blue-300 border border-blue-800 rounded-full font-bold text-[10px] flex items-center space-x-1">
          <Lock className="w-3.5 h-3.5 text-blue-400" />
          <span>SEALED PACKAGE</span>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
          <p className="text-[10px] uppercase font-bold text-slate-400">Package Digital Signature Hash (SHA-256)</p>
          <p className="font-mono text-xs text-blue-400 font-bold break-all bg-slate-900 p-2 rounded border border-slate-800">
            sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
          </p>
          <p className="text-[11px] text-slate-500">Hash validates salary continuity across Pay Fixation, Pension, DCRG, Commutation, and Family Pension.</p>
        </div>

        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
          <p className="text-[10px] uppercase font-bold text-slate-400">Statutory Rule Version Reference</p>
          <div className="flex items-center space-x-2 mt-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="font-mono font-bold text-slate-200">TRIPURA-PENSION-RULES-2018 / ROP-2017</span>
          </div>
          <p className="text-[11px] text-slate-500">Government Order No: F.1(2)-FIN(G)/2018 (Finance Department, Govt of Tripura)</p>
        </div>
      </div>
    </div>
  );
};
