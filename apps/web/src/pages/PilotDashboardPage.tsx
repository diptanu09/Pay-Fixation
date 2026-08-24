import React, { useState, useEffect } from 'react';
import type { ParityDiscrepancy, PilotMetrics } from '../types/api';
import {
  fetchPilotMetricsApi,
  fetchDiscrepanciesApi,
  resolveDiscrepancyApi,
  fetchReleaseCertificationApi,
} from '../lib/api';
import {
  Award,
  Users,
  CheckCircle2,
  AlertOctagon,
  Clock,
  FileCheck,
  ShieldCheck,
} from 'lucide-react';

export const PilotDashboardPage: React.FC = () => {
  const [metrics, setMetrics] = useState<PilotMetrics | null>(null);
  const [discrepancies, setDiscrepancies] = useState<ParityDiscrepancy[]>([]);
  const [cert, setCert] = useState<any>(null);
  const [resolveNotes, setResolveNotes] = useState('');
  const [selectedDiscId, setSelectedDiscId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const m = await fetchPilotMetricsApi();
      const d = await fetchDiscrepanciesApi();
      const c = await fetchReleaseCertificationApi();
      setMetrics(m);
      setDiscrepancies(d);
      setCert(c);
    } catch (err) {
      console.error('Failed to load pilot metrics', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleResolve = async (discId: string) => {
    if (!resolveNotes) {
      alert('Please enter investigation notes to resolve this discrepancy');
      return;
    }
    try {
      await resolveDiscrepancyApi(discId, resolveNotes);
      setResolveNotes('');
      setSelectedDiscId(null);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to resolve discrepancy');
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto text-xs font-sans text-slate-100">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Award className="w-7 h-7 text-amber-400 shrink-0" />
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-bold text-slate-100">UAT & Controlled Pilot Monitoring Dashboard</h1>
              <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold rounded-md border border-amber-500/30">
                PAYFIX-0.1.0-RC1
              </span>
            </div>
            <p className="text-xs text-slate-400">Real office user acceptance monitoring, 12-component parity verification & discrepancy investigation</p>
          </div>
        </div>

        {cert && (
          <div className="bg-emerald-950/60 border border-emerald-500/30 px-4 py-2.5 rounded-xl flex items-center space-x-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <p className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider">Release Certification</p>
              <p className="text-xs font-bold text-slate-100">{cert.certification_status}</p>
            </div>
          </div>
        )}
      </div>

      {/* Metrics Grid */}
      {metrics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2 shadow-md">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Active Pilot Users</span>
              <Users className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-xl font-extrabold text-slate-100">{metrics.active_pilot_users}</p>
            <p className="text-[10px] text-slate-500">Data Entry, Verifiers & Approvers</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2 shadow-md">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Cases Processed</span>
              <FileCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-xl font-extrabold text-slate-100">{metrics.total_cases_processed}</p>
            <p className="text-[10px] text-slate-500">Full lifecycle Draft $\rightarrow$ Issued</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2 shadow-md">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">12-Component Parity Rate</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-xl font-extrabold text-emerald-400">{metrics.exact_match_percentage.toFixed(1)}%</p>
            <p className="text-[10px] text-slate-500">No material calculation differences</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2 shadow-md">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Avg Calculation Latency</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-xl font-extrabold text-slate-100">{metrics.average_calc_time_ms} ms</p>
            <p className="text-[10px] text-slate-500">p95 &lt; 50ms engine speed</p>
          </div>
        </div>
      )}

      {/* Discrepancy Investigation Workspace */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <AlertOctagon className="w-5 h-5 text-amber-400" />
            <h2 className="font-bold text-slate-100 text-sm">Discrepancy Investigation Queue</h2>
          </div>
          <span className="text-[10px] text-slate-400">Total Discrepancies: {discrepancies.length}</span>
        </div>

        {discrepancies.length === 0 ? (
          <div className="p-8 text-center text-slate-500 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <p className="font-bold text-slate-300">No Unresolved Calculation Discrepancies</p>
            <p className="text-xs text-slate-500">All pilot cases match legacy Excel baseline or have accepted rule classifications.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-mono text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase bg-slate-950">
                  <th className="p-3">Case No</th>
                  <th className="p-3">Employee</th>
                  <th className="p-3">Component</th>
                  <th className="p-3">Excel Value</th>
                  <th className="p-3">PAYFIX Value</th>
                  <th className="p-3">Classification</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {discrepancies.map((d) => (
                  <tr key={d.discrepancy_id} className="hover:bg-slate-800/50 transition">
                    <td className="p-3 font-bold text-blue-400">{d.case_no}</td>
                    <td className="p-3 text-slate-200">{d.employee_name}</td>
                    <td className="p-3 text-slate-300 font-bold">{d.component}</td>
                    <td className="p-3 text-amber-300">{d.excel_value}</td>
                    <td className="p-3 text-emerald-300">{d.payfix_value}</td>
                    <td className="p-3 text-slate-300 font-bold">{d.classification}</td>
                    <td className="p-3 font-bold text-emerald-400">{d.status}</td>
                    <td className="p-3 text-right">
                      {d.status !== 'Accepted' ? (
                        <button
                          onClick={() => setSelectedDiscId(d.discrepancy_id)}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded text-[10px]"
                        >
                          Investigate
                        </button>
                      ) : (
                        <span className="text-slate-500 text-[10px]">Resolved ✓</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {selectedDiscId && (
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3 mt-4">
            <h3 className="font-bold text-slate-200">Resolve Discrepancy & Add Investigation Note</h3>
            <textarea
              value={resolveNotes}
              onChange={(e) => setResolveNotes(e.target.value)}
              placeholder="Enter official rule reference or justification for difference..."
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-slate-100 font-mono text-xs focus:outline-none focus:border-blue-500"
              rows={3}
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setSelectedDiscId(null)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-bold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleResolve(selectedDiscId)}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold shadow"
              >
                Accept & Resolve
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
