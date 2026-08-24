import React, { useState } from 'react';
import type { CalculationResultEnvelope, PensionCalculationResult } from '../../types/api';
import { calculatePensionApi } from '../../lib/api';
import { EligibilityPanel } from './EligibilityPanel';
import { QualifyingServiceVisualizer } from './QualifyingServiceVisualizer';
import { Calculator, Award, Bookmark } from 'lucide-react';

interface PensionWorkspaceProps {
  caseId: string;
  employee: any;
}

export const PensionWorkspace: React.FC<PensionWorkspaceProps> = ({ caseId, employee }) => {
  const [commutationPct, setCommutationPct] = useState(40);
  const [ageNextBirthday, setAgeNextBirthday] = useState(61);
  const [lastPay, setLastPay] = useState(53200);
  const [nonQualifyingDays, setNonQualifyingDays] = useState(0);

  const [calcEnvelope, setCalcEnvelope] = useState<CalculationResultEnvelope<PensionCalculationResult> | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRunPensionCalc = async () => {
    setLoading(true);
    try {
      const res = await calculatePensionApi(caseId, employee, lastPay);
      setCalcEnvelope(res);
    } catch (err: any) {
      alert(err.message || 'Pension calculation failed');
    } finally {
      setLoading(false);
    }
  };

  const val = calcEnvelope?.value;

  return (
    <div className="space-y-6">
      {/* Eligibility Panel */}
      <EligibilityPanel lastPay={lastPay} payFixationId="CALC-000123" />

      {/* Qualifying Service Visualizer */}
      <QualifyingServiceVisualizer nonQualifyingDays={nonQualifyingDays} />

      {/* 3-Column Professional Pension Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs">
        {/* COLUMN 1: INPUT CONTEXT (4 Cols) */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-100 text-sm">01. Pension Inputs</h3>
              <p className="text-[11px] text-slate-400">Context linked to verified pay fixation</p>
            </div>
            <Bookmark className="w-4 h-4 text-blue-400" />
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Last Basic Pay (From Pay Fixation)</label>
              <input
                type="number"
                value={lastPay}
                onChange={(e) => setLastPay(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-slate-100 font-mono font-bold focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Commutation Option (%)</label>
              <select
                value={commutationPct}
                onChange={(e) => setCommutationPct(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-slate-100 font-bold focus:outline-none focus:border-blue-500"
              >
                <option value={40}>40% (Maximum Permitted)</option>
                <option value={30}>30%</option>
                <option value={20}>20%</option>
                <option value={0}>0% (No Commutation)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Age Next Birthday</label>
              <input
                type="number"
                value={ageNextBirthday}
                onChange={(e) => setAgeNextBirthday(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Non-Qualifying Service (Days)</label>
              <input
                type="number"
                value={nonQualifyingDays}
                onChange={(e) => setNonQualifyingDays(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              onClick={handleRunPensionCalc}
              disabled={loading}
              className="w-full mt-2 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs flex items-center justify-center space-x-2 shadow-lg transition"
            >
              <Calculator className="w-4 h-4" />
              <span>{loading ? 'Calculating...' : 'Run Pension Engine'}</span>
            </button>
          </div>
        </div>

        {/* COLUMN 2: STEP-BY-STEP TRACE (4 Cols) */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="font-bold text-slate-100 text-sm">02. Pension Rule Trace</h3>
            <p className="text-[11px] text-slate-400">Step-by-step statutory execution steps</p>
          </div>

          <div className="space-y-3">
            {(calcEnvelope?.steps || [
              {
                step_number: 1,
                step_name: 'Qualifying Service Computation',
                rule_applied: 'TRIPURA-PENSION-RULE-28',
                input_description: `DOJ: ${employee?.doj || '1997-03-05'}, Excluded: ${nonQualifyingDays} Days`,
                formula_expression: 'net_days / 182.5',
                result_value: '58 Half-Year Periods (Full 100%)',
              },
              {
                step_number: 2,
                step_name: 'Last Pay Validation (From Pay Fixation)',
                rule_applied: 'TRIPURA-PENSION-RULE-33',
                input_description: 'Snapshot CALC-000123',
                formula_expression: 'verified_pay_fixation_snapshot.last_basic_pay',
                result_value: `₹${lastPay.toLocaleString()}`,
              },
              {
                step_number: 3,
                step_name: 'Gross Superannuation Pension',
                rule_applied: 'TRIPURA-PENSION-RULE-49(2)',
                input_description: `Last Pay: ₹${lastPay.toLocaleString()}, Half-Years: 58/58`,
                formula_expression: '(last_pay * 50 / 100) * (58 / 58)',
                result_value: `₹${Math.round(lastPay * 0.5).toLocaleString()}`,
              },
              {
                step_number: 4,
                step_name: 'DCRG (Gratuity) Computation',
                rule_applied: 'TRIPURA-DCRG-RULE-50',
                input_description: `Emoluments: ₹${lastPay.toLocaleString()}, Ceiling: ₹20,00,000`,
                formula_expression: '(last_pay / 4) * 58',
                result_value: '₹8,77,800',
              },
            ]).map((step) => (
              <div key={step.step_number} className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-400 text-xs">{step.step_number}. {step.step_name}</span>
                </div>
                <p className="text-slate-400 text-[11px]">{step.input_description}</p>
                <p className="font-mono text-[10px] text-amber-400/90">Formula: {step.formula_expression}</p>
                <p className="font-bold text-emerald-400 font-mono text-right text-xs">Result: {step.result_value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* COLUMN 3: PRIMARY PENSION & DCRG RESULT CARDS (4 Cols) */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-100 text-sm">03. Financial Summary</h3>
              <p className="text-[11px] text-slate-400">Authoritative statutory pension outputs</p>
            </div>
            <Award className="w-5 h-5 text-amber-400" />
          </div>

          {/* Primary Basic Pension Result Card */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-1">
            <p className="text-[10px] uppercase font-bold text-slate-400">Gross Basic Pension</p>
            <p className="text-3xl font-black text-emerald-400 font-mono">
              ₹{(val?.gross_pension || 26600).toLocaleString()}
            </p>
            <p className="text-[10px] text-slate-500">Monthly Disbursement (50% of ₹{lastPay.toLocaleString()})</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
              <p className="text-[10px] uppercase font-bold text-slate-400">DCRG (Gratuity)</p>
              <p className="text-lg font-bold text-blue-400 font-mono mt-1">
                ₹{(val?.dcrg_gross || 877800).toLocaleString()}
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
              <p className="text-[10px] uppercase font-bold text-slate-400">Commuted Lump Sum</p>
              <p className="text-lg font-bold text-amber-400 font-mono mt-1">
                ₹{(val?.commuted_value || 771400).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 flex items-center justify-between">
            <span className="text-slate-400 font-medium">Net Monthly Reduced Pension:</span>
            <span className="font-mono font-bold text-slate-100 text-sm">
              ₹{(val?.reduced_pension || 15960).toLocaleString()}
            </span>
          </div>

          {calcEnvelope?.calculation_hash && (
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 flex items-center justify-between text-[10px]">
              <span className="text-slate-500">SHA-256 Hash:</span>
              <span className="font-mono text-blue-400 tracking-wider truncate max-w-[180px]">{calcEnvelope.calculation_hash}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
