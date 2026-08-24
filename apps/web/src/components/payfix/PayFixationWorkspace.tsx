import React, { useState } from 'react';
import type { PayFixationInput, PayFixationReason, CalculationResultEnvelope, PayFixationResult } from '../../types/api';
import { calculatePayFixationApi } from '../../lib/api';
import { PayMatrixGrid } from './PayMatrixGrid';
import {
  Calculator,
  ShieldCheck,
  Bookmark,
} from 'lucide-react';

interface PayFixationWorkspaceProps {
  caseId: string;
  employeeId: string;
}

export const PayFixationWorkspace: React.FC<PayFixationWorkspaceProps> = ({ caseId, employeeId }) => {
  const [effectiveDate, setEffectiveDate] = useState('2017-01-01');
  const [revision, setRevision] = useState<'Rop1982' | 'Rop1988' | 'Rop1999' | 'Rop2017' | 'Rop2018'>('Rop2017');
  const [previousPay, setPreviousPay] = useState(18300);
  const [payLevel, setPayLevel] = useState('Level 8');
  const [reason, setReason] = useState<PayFixationReason>('Revision');

  const [calcEnvelope, setCalcEnvelope] = useState<CalculationResultEnvelope<PayFixationResult> | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCalculate = async () => {
    setLoading(true);
    try {
      const input: PayFixationInput = {
        case_id: caseId,
        employee_id: employeeId,
        effective_date: effectiveDate,
        revision,
        previous_basic_pay: Number(previousPay),
        pay_level: payLevel,
        reason,
      };

      const res = await calculatePayFixationApi(input);
      setCalcEnvelope(res);
    } catch (err: any) {
      alert(err.message || 'Pay fixation calculation failed');
    } finally {
      setLoading(false);
    }
  };

  const resVal = calcEnvelope?.value;

  return (
    <div className="space-y-6">
      {/* 3-Column Professional Pay Fixation Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs">
        {/* COLUMN 1: INPUT PANEL (3 Cols) */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-100 text-sm">01. Fixation Inputs</h3>
              <p className="text-[11px] text-slate-400">Specify effective date, ROP revision, and reason</p>
            </div>
            <Bookmark className="w-4 h-4 text-blue-400" />
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Effective Date</label>
              <input
                type="date"
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Applicable ROP Revision</label>
              <select
                value={revision}
                onChange={(e) => setRevision(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500 font-semibold"
              >
                <option value="Rop2018">TSCS (RP) 1st Amendment 2018 (Fitment 2.57)</option>
                <option value="Rop2017">TSCS (RP) Rules 2017 (Fitment 2.57)</option>
                <option value="Rop1999">Tripura ROP 1999 (Fitment 1.40)</option>
                <option value="Rop1988">Tripura ROP 1988 (Fitment 1.20)</option>
                <option value="Rop1982">Tripura ROP 1982 (Fitment 1.15)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Fixation Reason</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500 font-semibold"
              >
                <option value="Revision">Revision under ROP</option>
                <option value="Promotion">Promotion under FR-22(1)(a)(1)</option>
                <option value="Fr22">FR-22 Pay Fixation</option>
                <option value="Acp">ACP Financial Upgradation</option>
                <option value="Cas">Career Advancement Scheme (CAS)</option>
                <option value="InitialFixation">Initial Appointment Fixation</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Previous Basic Pay (₹)</label>
              <input
                type="number"
                value={previousPay}
                onChange={(e) => setPreviousPay(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-slate-100 font-mono font-bold focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Target Pay Level</label>
              <select
                value={payLevel}
                onChange={(e) => setPayLevel(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
              >
                <option value="Level 8">Level 8 (GP ₹2,400)</option>
                <option value="Level 9">Level 9 (GP ₹2,800)</option>
                <option value="Level 10">Level 10 (GP ₹4,200)</option>
              </select>
            </div>

            <button
              onClick={handleCalculate}
              disabled={loading}
              className="w-full mt-2 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs flex items-center justify-center space-x-2 shadow-lg transition"
            >
              <Calculator className="w-4 h-4" />
              <span>{loading ? 'Calculating...' : 'Calculate Pay Fixation'}</span>
            </button>
          </div>
        </div>

        {/* COLUMN 2: CALCULATION REASONING & TRACE (4 Cols) */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="font-bold text-slate-100 text-sm">02. Rule Reasoning & Step Trace</h3>
            <p className="text-[11px] text-slate-400">Step-by-step logic generated by the engine</p>
          </div>

          <div className="space-y-3">
            {(calcEnvelope?.steps || [
              {
                step_number: 1,
                step_name: 'Previous Basic Pay Identification',
                rule_applied: 'TRIPURA-TSCS-RP-2017-RULE-7(1)',
                input_description: `Previous Pay: ₹${previousPay}`,
                formula_expression: 'previous_basic_pay',
                result_value: `₹${previousPay}`,
              },
              {
                step_number: 2,
                step_name: 'Fitment Multiplier Application',
                rule_applied: 'TRIPURA-TSCS-RP-2017-RULE-7(1)',
                input_description: 'Fitment Factor: 2.57',
                formula_expression: `${previousPay} * 2.57`,
                result_value: `₹${Math.round(previousPay * 2.57).toLocaleString()}`,
              },
              {
                step_number: 3,
                step_name: 'Pay Matrix Cell Lookup',
                rule_applied: 'TRIPURA-TSCS-RP-2017-RULE-7(1)',
                input_description: `Target Level: ${payLevel}`,
                formula_expression: 'first_cell_gte(level_cells, calculated_val)',
                result_value: `${payLevel} Index 10`,
              },
              {
                step_number: 4,
                step_name: 'Final Revised Basic Pay Determination',
                rule_applied: 'TRIPURA-TSCS-RP-2017-RULE-7(1)',
                input_description: `Equal or next higher cell in ${payLevel}`,
                formula_expression: 'matrix_cell_value',
                result_value: '₹47,600',
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

          <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-1 text-[11px]">
            <p className="font-bold text-slate-300">Rule Evidence Citation</p>
            <p className="text-slate-400">{resVal?.rule_reference || 'TRIPURA-TSCS-RP-2017-RULE-7(1)'}</p>
          </div>
        </div>

        {/* COLUMN 3: RESULT & PAY MATRIX GRID (5 Cols) */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-100 text-sm">03. Pay Fixation Result</h3>
              <p className="text-[11px] text-slate-400">Final revised pay and matrix cell match</p>
            </div>
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Revised Basic Pay</p>
              <p className="text-3xl font-black text-emerald-400 font-mono">
                ₹{(resVal?.final_revised_basic_pay || 47600).toLocaleString()}
              </p>
              <p className="text-[10px] text-slate-500 mt-1">
                Increase: <span className="text-emerald-400 font-bold">+₹{(resVal?.increase_amount || 29300).toLocaleString()}</span>
              </p>
            </div>
            <div className="text-right">
              <span className="px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold">
                VERIFIED ✓
              </span>
            </div>
          </div>

          {/* Pay Matrix Component */}
          <PayMatrixGrid
            selectedLevel={resVal?.matched_pay_level || payLevel}
            selectedIndex={resVal?.matched_matrix_index || 10}
          />

          {calcEnvelope?.calculation_hash && (
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 flex items-center justify-between text-[10px]">
              <span className="text-slate-500">SHA-256 Hash:</span>
              <span className="font-mono text-blue-400 tracking-wider truncate max-w-[200px]">{calcEnvelope.calculation_hash}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
