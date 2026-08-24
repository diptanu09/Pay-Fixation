import React, { useState } from 'react';
import { Users, ShieldCheck } from 'lucide-react';

interface FamilyPensionWorkspaceProps {
  lastPay: number;
}

export const FamilyPensionWorkspace: React.FC<FamilyPensionWorkspaceProps> = ({ lastPay = 53200 }) => {
  const [members] = useState([
    { id: '1', name: 'Smt. Anjali Debbarma', relationship: 'Spouse', dob: '1968-05-14', isEligible: true },
    { id: '2', name: 'Sri Bikram Debbarma', relationship: 'Son', dob: '2004-11-20', isEligible: false },
  ]);

  const enhancedPension = Math.round(lastPay * 0.5);
  const normalPension = Math.round(lastPay * 0.3);

  return (
    <div className="space-y-6 text-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="font-bold text-slate-100 text-sm">Family Pension & Beneficiary Eligibility Timeline</h3>
            <p className="text-[11px] text-slate-400">Rule 54 Enhanced (50%) vs Normal (30%) Family Pension transition timeline</p>
          </div>
          <span className="px-2.5 py-1 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded font-bold text-[10px] flex items-center space-x-1">
            <ShieldCheck className="w-3 h-3" />
            <span>SPOUSE ELIGIBLE ✓</span>
          </span>
        </div>

        {/* Family Beneficiaries Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-200 text-xs flex items-center space-x-2">
              <Users className="w-4 h-4 text-blue-400" />
              <span>Registered Family Beneficiaries</span>
            </h4>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/80 text-slate-400 text-[10px] uppercase border-b border-slate-800 font-semibold">
                  <th className="py-2.5 px-3">Name</th>
                  <th className="py-2.5 px-3">Relationship</th>
                  <th className="py-2.5 px-3">Date of Birth</th>
                  <th className="py-2.5 px-3 text-right">Eligibility Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {members.map((m: { id: string; name: string; relationship: string; dob: string; isEligible: boolean }) => (
                  <tr key={m.id} className="hover:bg-slate-900/40 transition">
                    <td className="py-2.5 px-3 font-semibold text-slate-100">{m.name}</td>
                    <td className="py-2.5 px-3 text-slate-300">{m.relationship}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-400">{m.dob}</td>
                    <td className="py-2.5 px-3 text-right">
                      {m.isEligible ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                          Eligible (Primary Beneficiary)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 text-slate-500 border border-slate-800">
                          Ineligible (Age &gt; 25)
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Enhanced vs Normal Family Pension Timeline */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="bg-slate-950 border border-blue-800/60 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-blue-400 text-xs">Phase 1: Enhanced Family Pension</span>
              <span className="text-[10px] font-mono text-slate-400">10 Years / Age 67</span>
            </div>
            <p className="text-[11px] text-slate-400">Payable at 50% of Last Basic Pay for 10 years following death of employee/pensioner.</p>
            <p className="text-2xl font-black text-blue-400 font-mono mt-1">₹{enhancedPension.toLocaleString()} <span className="text-xs text-slate-400 font-normal">/ month</span></p>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-300 text-xs">Phase 2: Normal Family Pension</span>
              <span className="text-[10px] font-mono text-slate-400">After 10 Years</span>
            </div>
            <p className="text-[11px] text-slate-400">Payable at 30% of Last Basic Pay for life of eligible spouse or until remarriage.</p>
            <p className="text-2xl font-black text-emerald-400 font-mono mt-1">₹{normalPension.toLocaleString()} <span className="text-xs text-slate-400 font-normal">/ month</span></p>
          </div>
        </div>
      </div>
    </div>
  );
};
