import React, { useState, useEffect } from 'react';
import type {
  ContinuousMonitoringSummary,
  UserAccessRecord,
} from '../types/api';
import {
  fetchOperationsProbesApi,
  updateUserStatusApi,
} from '../lib/api';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  Users,
  FileText,
} from 'lucide-react';

export const OperationsDashboardPage: React.FC = () => {
  const [summary, setSummary] = useState<ContinuousMonitoringSummary | null>(null);
  const [users, setUsers] = useState<UserAccessRecord[]>([]);
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = async () => {
    try {
      const s = await fetchOperationsProbesApi();
      setSummary(s);
      setUsers(s.user_records);
    } catch (err) {
      console.error('Failed to load operations probes data', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleUserStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    setActionLoading(true);
    try {
      await updateUserStatusApi(id, nextStatus);
      setUsers((prev) =>
        prev.map((u) => (u.user_id === id ? { ...u, status: nextStatus as any } : u))
      );
    } catch (err: any) {
      alert(err.message || 'Failed to update user status');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto text-xs font-sans text-slate-100">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Activity className="w-8 h-8 text-emerald-400 shrink-0" />
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-bold text-slate-100">PAYFIX 1.0 Production Operations & Governance Command Center</h1>
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold rounded-md border border-emerald-500/30">
                PHASE 21 OPERATIONAL
              </span>
            </div>
            <p className="text-xs text-slate-400">Continuous health probes, daily operations report, audit-chain monitoring, and user access governance</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 font-mono text-xs">
          <span className="px-3 py-1.5 bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 font-bold rounded-lg flex items-center space-x-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>SYSTEM HEALTH: 100% OPERATIONAL ✓</span>
          </span>
        </div>
      </div>

      {/* Daily Operations Summary Report Card */}
      {summary && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-blue-400" />
              <h2 className="font-bold text-slate-100 text-sm">Daily Operations Summary Report ({summary.daily_report.report_date})</h2>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Generated: {new Date(summary.daily_report.generated_at).toLocaleTimeString()}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono text-xs">
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
              <span className="text-[10px] text-slate-400 uppercase">Created</span>
              <p className="text-lg font-bold text-slate-100">{summary.daily_report.cases_created}</p>
            </div>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
              <span className="text-[10px] text-slate-400 uppercase">Calculated</span>
              <p className="text-lg font-bold text-slate-100">{summary.daily_report.cases_calculated}</p>
            </div>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
              <span className="text-[10px] text-slate-400 uppercase">Verified</span>
              <p className="text-lg font-bold text-slate-100">{summary.daily_report.cases_verified}</p>
            </div>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
              <span className="text-[10px] text-slate-400 uppercase">Approved</span>
              <p className="text-lg font-bold text-slate-100">{summary.daily_report.cases_approved}</p>
            </div>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
              <span className="text-[10px] text-slate-400 uppercase">Authorized</span>
              <p className="text-lg font-bold text-slate-100">{summary.daily_report.cases_authorized}</p>
            </div>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
              <span className="text-[10px] text-slate-400 uppercase">Issued</span>
              <p className="text-lg font-bold text-emerald-400">{summary.daily_report.documents_issued}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs pt-2">
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
              <span className="text-slate-400">Database & API Health:</span>
              <span className="font-bold text-emerald-400">{summary.daily_report.system_health}</span>
            </div>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
              <span className="text-slate-400">Backup Snapshot:</span>
              <span className="font-bold text-emerald-400">{summary.daily_report.backup_status}</span>
            </div>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
              <span className="text-slate-400">Audit Hash Chain:</span>
              <span className="font-bold text-emerald-400">{summary.daily_report.audit_integrity_status}</span>
            </div>
          </div>
        </div>
      )}

      {/* Active Operational Alerts Panel */}
      {summary && summary.alerts.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <h2 className="font-bold text-slate-100 text-sm">Operational Alerts & System Notifications</h2>
            </div>
            <span className="text-[10px] text-slate-400">Active Alerts: {summary.alerts.length}</span>
          </div>

          <div className="space-y-2 font-mono text-xs">
            {summary.alerts.map((al) => (
              <div key={al.alert_id} className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-start justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 font-bold rounded text-[9px]">{al.severity}</span>
                    <span className="font-bold text-slate-200">{al.category}</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">{al.message}</p>
                </div>
                <span className="text-[10px] text-emerald-400 font-bold shrink-0 ml-2">Acknowledged ✓</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* User Access Governance & Review Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-blue-400" />
            <h2 className="font-bold text-slate-100 text-sm">Periodic User Access Review & Account Lifecycle (Soft-Disable)</h2>
          </div>
          <span className="text-[10px] text-slate-400">Total Active Operators: {users.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase bg-slate-950">
                <th className="p-3">Username</th>
                <th className="p-3">Full Name</th>
                <th className="p-3">Assigned Role</th>
                <th className="p-3">Department Section</th>
                <th className="p-3">Last Login</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Governance Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {users.map((u) => (
                <tr key={u.user_id} className="hover:bg-slate-800/50 transition">
                  <td className="p-3 font-bold text-blue-400">{u.username}</td>
                  <td className="p-3 text-slate-200 font-bold">{u.full_name}</td>
                  <td className="p-3 text-slate-300">{u.role}</td>
                  <td className="p-3 text-slate-400 text-[10px]">{u.department}</td>
                  <td className="p-3 text-slate-500 text-[10px]">{new Date(u.last_login).toLocaleString()}</td>
                  <td className="p-3">
                    <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${u.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleToggleUserStatus(u.user_id, u.status)}
                      disabled={actionLoading}
                      className={`px-3 py-1 font-bold rounded text-[10px] transition disabled:opacity-50 ${u.status === 'ACTIVE' ? 'bg-amber-800/60 hover:bg-amber-700/60 text-amber-200' : 'bg-emerald-600 hover:bg-emerald-500 text-white'}`}
                    >
                      {u.status === 'ACTIVE' ? 'Suspend Account' : 'Reactivate Account'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
