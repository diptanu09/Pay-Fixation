import React, { useState, useEffect } from 'react';
import type {
  PilotOperationsSummary,
  PilotIncident,
  GoNoGoEvaluation,
} from '../types/api';
import {
  fetchPilotOperationsApi,
  fetchPilotIncidentsApi,
  createPilotIncidentApi,
  resolvePilotIncidentApi,
  evaluateGoNoGoApi,
} from '../lib/api';
import {
  CheckCircle2,
  AlertTriangle,
  Play,
  FileCheck,
  ShieldCheck,
  Activity,
  Users,
  PlusCircle,
} from 'lucide-react';

export const PilotOperationsPage: React.FC = () => {
  const [summary, setSummary] = useState<PilotOperationsSummary | null>(null);
  const [incidents, setIncidents] = useState<PilotIncident[]>([]);
  const [readiness, setReadiness] = useState<GoNoGoEvaluation | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form states for incident reporting
  const [showReportModal, setShowReportModal] = useState(false);
  const [severity, setSeverity] = useState<'P1Critical' | 'P2High' | 'P3Medium' | 'P4Low'>('P3Medium');
  const [category, setCategory] = useState('UI / Workflow');
  const [description, setDescription] = useState('');

  // Form states for incident resolution
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [resolutionText, setResolutionText] = useState('');

  const loadData = async () => {
    try {
      const s = await fetchPilotOperationsApi();
      const inc = await fetchPilotIncidentsApi();
      const r = await evaluateGoNoGoApi();
      setSummary(s);
      setIncidents(inc);
      setReadiness(r);
    } catch (err) {
      console.error('Failed to load pilot operations data', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleReportIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description) return;
    setActionLoading(true);
    try {
      await createPilotIncidentApi({
        severity,
        category,
        description,
        case_no: 'PEN-2026-000123',
      });
      setDescription('');
      setShowReportModal(false);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to report incident');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResolveIncident = async (id: string) => {
    if (!resolutionText) {
      alert('Please enter resolution notes');
      return;
    }
    setActionLoading(true);
    try {
      await resolvePilotIncidentApi(id, resolutionText);
      setResolutionText('');
      setSelectedIncidentId(null);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to resolve incident');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEvaluateReadiness = async () => {
    setActionLoading(true);
    try {
      const r = await evaluateGoNoGoApi();
      setReadiness(r);
    } catch (err: any) {
      alert(err.message || 'Readiness evaluation failed');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto text-xs font-sans text-slate-100">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Activity className="w-7 h-7 text-emerald-400 shrink-0" />
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-bold text-slate-100">Pilot Operations & Go-Live Control Center</h1>
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold rounded-md border border-emerald-500/30">
                PHASE 19 DEPLOYED
              </span>
            </div>
            <p className="text-xs text-slate-400">Live pilot metrics, incident management queue, and 10-point production cutover readiness evaluation</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowReportModal(true)}
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg transition"
          >
            <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>Report Pilot Incident</span>
          </button>

          <button
            onClick={handleEvaluateReadiness}
            disabled={actionLoading}
            className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow transition disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Evaluate Go/No-Go Decision</span>
          </button>
        </div>
      </div>

      {/* Pilot Operations Metrics Banner */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2 shadow-md">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Active Pilot Users</span>
              <Users className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-xl font-extrabold text-slate-100">{summary.metrics.active_pilot_users}</p>
            <p className="text-[10px] text-slate-500">Live office operators onboarded</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2 shadow-md">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Processed Cases</span>
              <FileCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-xl font-extrabold text-slate-100">{summary.metrics.total_cases_processed}</p>
            <p className="text-[10px] text-slate-500">Draft $\rightarrow$ Issued lifecycle completed</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2 shadow-md">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Open Incidents</span>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-xl font-extrabold text-amber-300">{summary.open_incidents_count}</p>
            <p className="text-[10px] text-slate-500">Active P1–P4 issue queue</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2 shadow-md">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Go/No-Go Decision Status</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-base font-bold text-emerald-300">{summary.go_no_go_status}</p>
            <p className="text-[10px] text-slate-500">Ready for Phase 20 Production Cutover</p>
          </div>
        </div>
      )}

      {/* 10-Point Go/No-Go Decision Readiness Grid */}
      {readiness && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h2 className="font-bold text-slate-100 text-sm">10-Point Production Cutover Readiness Matrix</h2>
            </div>
            <div className="flex items-center space-x-2 font-mono text-xs">
              <span className="text-slate-400">Readiness Score:</span>
              <span className="font-bold text-emerald-400">{readiness.passed_items_count} / {readiness.total_items_count} PASSED</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
            {readiness.items.map((item) => (
              <div
                key={item.item_code}
                className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1 flex items-start justify-between"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-blue-400">{item.item_code}</span>
                    <span className="text-slate-300 font-bold">{item.category}:</span>
                    <span className="text-slate-400">{item.requirement}</span>
                  </div>
                  <p className="text-[10px] text-slate-500">{item.evidence}</p>
                </div>
                <span className={`font-bold shrink-0 ml-2 ${item.passed ? 'text-emerald-400' : 'text-red-400'}`}>
                  {item.passed ? 'PASS ✓' : 'FAIL ✗'}
                </span>
              </div>
            ))}
          </div>

          <div className="p-4 bg-emerald-950/40 border border-emerald-500/30 rounded-xl flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider">Official Go-Live Board Evaluation</p>
              <p className="text-sm font-extrabold text-slate-100">DECISION: {readiness.decision.toUpperCase()} FOR PRODUCTION CUTOVER ✓</p>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Evaluated by: {readiness.evaluated_by}</span>
          </div>
        </div>
      )}

      {/* Incident Management Queue */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <h2 className="font-bold text-slate-100 text-sm">Pilot Incident Management Queue</h2>
          </div>
          <span className="text-[10px] text-slate-400">Total Incidents: {incidents.length}</span>
        </div>

        {incidents.length === 0 ? (
          <div className="p-8 text-center text-slate-500 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <p className="font-bold text-slate-300">No Open Pilot Incidents</p>
            <p className="text-xs text-slate-500">All reported issues resolved by system administrators.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-mono text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase bg-slate-950">
                  <th className="p-3">Severity</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Description</th>
                  <th className="p-3">Reported By</th>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {incidents.map((inc) => (
                  <tr key={inc.incident_id} className="hover:bg-slate-800/50 transition">
                    <td className="p-3">
                      <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${inc.severity === 'P1Critical' ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'}`}>
                        {inc.severity}
                      </span>
                    </td>
                    <td className="p-3 text-slate-200 font-bold">{inc.category}</td>
                    <td className="p-3 text-slate-300">{inc.description}</td>
                    <td className="p-3 text-slate-400">{inc.reported_by}</td>
                    <td className="p-3 text-slate-500 text-[10px]">{new Date(inc.reported_at).toLocaleString()}</td>
                    <td className="p-3 font-bold text-emerald-400">{inc.status}</td>
                    <td className="p-3 text-right">
                      {inc.status !== 'Resolved' ? (
                        <button
                          onClick={() => setSelectedIncidentId(inc.incident_id)}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded text-[10px]"
                        >
                          Resolve
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

        {selectedIncidentId && (
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3 mt-4">
            <h3 className="font-bold text-slate-200">Resolve Incident & Log Patch Details</h3>
            <textarea
              value={resolutionText}
              onChange={(e) => setResolutionText(e.target.value)}
              placeholder="Enter technical resolution or configuration patch details..."
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-slate-100 font-mono text-xs focus:outline-none focus:border-blue-500"
              rows={3}
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setSelectedIncidentId(null)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-bold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleResolveIncident(selectedIncidentId)}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold shadow"
              >
                Save Resolution
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Report Incident Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="font-bold text-slate-100 text-sm">Report Pilot Operational Incident</h3>
            <form onSubmit={handleReportIncident} className="space-y-3 font-mono text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Severity *</label>
                <select
                  value={severity}
                  onChange={(e: any) => setSeverity(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100 focus:outline-none focus:border-blue-500"
                >
                  <option value="P1Critical">P1 Critical (Blocker / Data Error)</option>
                  <option value="P2High">P2 High (Major Feature Issue)</option>
                  <option value="P3Medium">P3 Medium (UI / Workflow Warning)</option>
                  <option value="P4Low">P4 Low (Cosmetic / Suggestion)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Category *</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Description *</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe exact operational steps and observed behavior..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100 focus:outline-none focus:border-blue-500"
                  rows={3}
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold shadow"
                >
                  Submit Incident
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
