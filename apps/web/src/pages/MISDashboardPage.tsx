import React, { useState, useEffect } from 'react';
import type {
  MisOverviewMetrics,
  WorkflowPipelineStage,
  AgingBucket,
  FinancialLiabilitySummary,
  RevisionAnalyticsSummary,
  MigrationAnalyticsSummary,
  ReportExportRecord,
} from '../types/api';
import {
  fetchMisOverviewApi,
  fetchMisWorkflowApi,
  fetchMisAgingApi,
  fetchMisFinancialApi,
  fetchMisRevisionsApi,
  fetchMisMigrationApi,
  exportMisReportApi,
} from '../lib/api';
import {
  BarChart3,
  TrendingUp,
  Clock,
  IndianRupee,
  FileCheck,
  Download,
  CheckCircle2,
} from 'lucide-react';

export const MISDashboardPage: React.FC = () => {
  const [overview, setOverview] = useState<MisOverviewMetrics | null>(null);
  const [pipeline, setPipeline] = useState<WorkflowPipelineStage[]>([]);
  const [aging, setAging] = useState<AgingBucket[]>([]);
  const [financial, setFinancial] = useState<FinancialLiabilitySummary | null>(null);
  const [revisions, setRevisions] = useState<RevisionAnalyticsSummary | null>(null);
  const [migration, setMigration] = useState<MigrationAnalyticsSummary | null>(null);
  const [exportRecord, setExportRecord] = useState<ReportExportRecord | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form states for Report Builder
  const [reportType, setReportType] = useState('Monthly Pension MIS');
  const [financialYear, setFinancialYear] = useState('2026-2027');
  const [exportFormat, setExportFormat] = useState('PDF');

  const loadData = async () => {
    try {
      const o = await fetchMisOverviewApi();
      const p = await fetchMisWorkflowApi();
      const a = await fetchMisAgingApi();
      const f = await fetchMisFinancialApi();
      const r = await fetchMisRevisionsApi();
      const m = await fetchMisMigrationApi();
      setOverview(o);
      setPipeline(p);
      setAging(a);
      setFinancial(f);
      setRevisions(r);
      setMigration(m);
    } catch (err) {
      console.error('Failed to load MIS dashboard data', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleExportReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const rec = await exportMisReportApi(reportType, financialYear, exportFormat);
      setExportRecord(rec);
      alert(`REPORT GENERATED & AUDITED: Digest Hash ${rec.export_hash.slice(0, 16)}... ✓`);
    } catch (err: any) {
      alert(err.message || 'Report export failed');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto text-xs font-sans text-slate-100">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <BarChart3 className="w-8 h-8 text-emerald-400 shrink-0" />
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-bold text-slate-100">PAYFIX 1.0 Executive MIS & Management Intelligence Command Center</h1>
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold rounded-md border border-emerald-500/30">
                PHASE 23 OPERATIONAL
              </span>
            </div>
            <p className="text-xs text-slate-400">Financial liability analytics, workflow bottleneck aging, revision & migration trends, and report builder</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 font-mono text-xs">
          <span className="px-3 py-1.5 bg-slate-950 text-slate-300 border border-slate-800 font-bold rounded-lg flex items-center space-x-1">
            <span>Reporting Period: FY 2026-27 (Apr–Mar)</span>
          </span>
        </div>
      </div>

      {/* Executive Overview KPI Grid */}
      {overview && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2 shadow-md">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Total Cases Processed</span>
              <FileCheck className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-2xl font-extrabold text-slate-100">{overview.total_cases}</p>
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>Authorized: {overview.authorized_cases}</span>
              <span>Pending: {overview.pending_cases}</span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2 shadow-md">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Pension Authorized</span>
              <IndianRupee className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-extrabold text-emerald-400">₹{(overview.pension_authorized / 100000).toFixed(2)} Lakhs</p>
            <p className="text-[10px] text-slate-500 font-mono">Monthly recurring commitment</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2 shadow-md">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">DCRG Lump-Sum Authorized</span>
              <IndianRupee className="w-4 h-4 text-indigo-400" />
            </div>
            <p className="text-2xl font-extrabold text-indigo-300">₹{(overview.dcrg_authorized / 10000000).toFixed(2)} Cr</p>
            <p className="text-[10px] text-slate-500 font-mono">Statutory ceiling cap ₹15.0L enforced</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2 shadow-md">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Avg Processing Time</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl font-extrabold text-amber-300">{overview.avg_processing_days} days</p>
            <p className="text-[10px] text-slate-500 font-mono">Draft $\rightarrow$ Authorized SLA</p>
          </div>
        </div>
      )}

      {/* Workflow Bottleneck Pipeline & Aging Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              <h2 className="font-bold text-slate-100 text-sm">Workflow Pipeline & Stage Latency</h2>
            </div>
            <span className="text-[10px] text-slate-400">Live Queue Latency</span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {pipeline.map((stage, idx) => (
              <div key={idx} className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-slate-200">{stage.stage_name}</span>
                  <span className="text-blue-400">{stage.pending_count} pending</span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>Avg Latency: {stage.avg_days_in_stage} days</span>
                  <span>Oldest Case: {stage.oldest_case_no} ({stage.oldest_days}d)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-amber-400" />
              <h2 className="font-bold text-slate-100 text-sm">Case Verification & Approval Aging Buckets</h2>
            </div>
            <span className="text-[10px] text-slate-400">Aging Distribution</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs">
            {aging.map((b, idx) => (
              <div key={idx} className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
                <span className="text-[10px] text-slate-400 uppercase">{b.bucket_range}</span>
                <p className="text-lg font-extrabold text-amber-300">{b.count} cases</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Financial Liability & Revision Breakdown */}
      {financial && revisions && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="font-bold text-slate-100 text-sm">Financial Liabilities Summary ({financial.period_name})</h2>
              <span className="text-[10px] text-emerald-400 font-bold">FY 2026-27</span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between p-2.5 bg-slate-950 border border-slate-800 rounded-lg">
                <span className="text-slate-400">Commutation Lump-Sum Authorized:</span>
                <span className="font-bold text-slate-100">₹{financial.commutation_authorized.toLocaleString()}</span>
              </div>
              <div className="flex justify-between p-2.5 bg-slate-950 border border-slate-800 rounded-lg">
                <span className="text-slate-400">Arrears Authorized:</span>
                <span className="font-bold text-slate-100">₹{financial.arrears_authorized.toLocaleString()}</span>
              </div>
              <div className="flex justify-between p-2.5 bg-slate-950 border border-slate-800 rounded-lg">
                <span className="text-slate-400">Pending Pipeline Pension Liability:</span>
                <span className="font-bold text-amber-300">₹{financial.pending_pension_liability.toLocaleString()} / mo</span>
              </div>
              <div className="flex justify-between p-2.5 bg-slate-950 border border-slate-800 rounded-lg">
                <span className="text-slate-400">Pending Pipeline DCRG Liability:</span>
                <span className="font-bold text-amber-300">₹{financial.pending_dcrg_liability.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="font-bold text-slate-100 text-sm">Revision & Migration Discrepancy Analytics</h2>
              <span className="text-[10px] text-blue-400 font-bold">Total Revisions: {revisions.total_revisions}</span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between p-2.5 bg-slate-950 border border-slate-800 rounded-lg">
                <span className="text-slate-400">Pay Fixation Revisions:</span>
                <span className="font-bold text-slate-100">{revisions.pay_revision_count} cases</span>
              </div>
              <div className="flex justify-between p-2.5 bg-slate-950 border border-slate-800 rounded-lg">
                <span className="text-slate-400">Additional Pension Liability:</span>
                <span className="font-bold text-emerald-400">₹{revisions.additional_pension_liability.toLocaleString()} / mo</span>
              </div>
              {migration && (
                <div className="flex justify-between p-2.5 bg-slate-950 border border-slate-800 rounded-lg">
                  <span className="text-slate-400">Legacy Excel Exact Parity Match:</span>
                  <span className="font-bold text-emerald-400">{migration.match_percentage}% ({migration.exact_matches}/{migration.imported_cases})</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Management Report Builder & Controlled Export Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Download className="w-5 h-5 text-blue-400" />
            <h2 className="font-bold text-slate-100 text-sm">Management Report Builder & Audit Export Controls</h2>
          </div>
          <span className="text-[10px] text-slate-400">Role-Aware Export Audit Trail</span>
        </div>

        <form onSubmit={handleExportReport} className="grid grid-cols-1 sm:grid-cols-4 gap-3 font-mono text-xs items-end">
          <div>
            <label className="block text-slate-400 mb-1">Report Type *</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100 focus:outline-none focus:border-blue-500"
            >
              <option value="Monthly Pension MIS">Monthly Pension MIS</option>
              <option value="Weekly Verification Backlog">Weekly Verification Backlog</option>
              <option value="Revision & Arrear Summary">Revision & Arrear Summary</option>
              <option value="DCRG Authorization Summary">DCRG Authorization Summary</option>
              <option value="Migration Parity Exception Report">Migration Parity Exception Report</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Financial Year *</label>
            <select
              value={financialYear}
              onChange={(e) => setFinancialYear(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100 focus:outline-none focus:border-blue-500"
            >
              <option value="2026-2027">FY 2026-2027</option>
              <option value="2025-2026">FY 2025-2026</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Format *</label>
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100 focus:outline-none focus:border-blue-500"
            >
              <option value="PDF">PDF (Official Document)</option>
              <option value="Excel">Excel (.xlsx)</option>
              <option value="CSV">CSV (Data Digest)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={actionLoading}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow transition disabled:opacity-50 flex items-center justify-center space-x-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Generate & Audit Export</span>
          </button>
        </form>

        {exportRecord && (
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2 font-mono text-xs mt-3">
            <div className="flex items-center justify-between text-emerald-400 font-bold border-b border-slate-800 pb-2">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>OFFICIAL MANAGEMENT REPORT EXPORT LOGGED & SEALED</span>
              </div>
              <span className="text-[10px] text-slate-400">Export ID: {exportRecord.export_id}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-slate-400">Exported By: </span>
                <span className="text-slate-200 font-bold">{exportRecord.exported_by}</span>
              </div>
              <div>
                <span className="text-slate-400">Record Count: </span>
                <span className="text-slate-200 font-bold">{exportRecord.record_count} cases</span>
              </div>
            </div>
            <div className="text-[10px] text-slate-400">
              <span>SHA-256 Digest: </span>
              <span className="text-emerald-300 font-bold break-all">{exportRecord.export_hash}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
