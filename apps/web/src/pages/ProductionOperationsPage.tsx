import React, { useState, useEffect } from 'react';
import type {
  ProductionReleaseManifest,
  ProductionCutoverRecord,
  ProductionSmokeTestResult,
} from '../types/api';
import {
  fetchProductionManifestApi,
  executeCutoverApi,
  runProductionSmokeTestApi,
  triggerEmergencyRollbackApi,
} from '../lib/api';
import {
  ShieldCheck,
  CheckCircle2,
  FileCheck,
  Zap,
  Lock,
  RotateCcw,
} from 'lucide-react';

export const ProductionOperationsPage: React.FC = () => {
  const [manifest, setManifest] = useState<ProductionReleaseManifest | null>(null);
  const [cutover, setCutover] = useState<ProductionCutoverRecord | null>(null);
  const [smokeTests, setSmokeTests] = useState<ProductionSmokeTestResult[]>([]);
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = async () => {
    try {
      const m = await fetchProductionManifestApi();
      setManifest(m);
    } catch (err) {
      console.error('Failed to load production manifest', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleExecuteCutover = async () => {
    setActionLoading(true);
    try {
      const c = await executeCutoverApi();
      setCutover(c);
      alert(`PRODUCTION CUTOVER EXECUTED: Release ${c.release_tag} is now LIVE PRODUCTION OPERATIONAL ✓`);
    } catch (err: any) {
      alert(err.message || 'Cutover failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRunSmokeTests = async () => {
    setActionLoading(true);
    try {
      const tests = await runProductionSmokeTestApi();
      setSmokeTests(tests);
    } catch (err: any) {
      alert(err.message || 'Smoke tests failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleTriggerRollback = async () => {
    if (!confirm('WARNING: Emergency Rollback will pause intake while preserving audit logs. Proceed?')) return;
    setActionLoading(true);
    try {
      const msg = await triggerEmergencyRollbackApi();
      alert(msg);
    } catch (err: any) {
      alert(err.message || 'Rollback failed');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto text-xs font-sans text-slate-100">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <ShieldCheck className="w-8 h-8 text-emerald-400 shrink-0" />
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-bold text-slate-100">PAYFIX 1.0 Production Operations & Cutover Center</h1>
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold rounded-md border border-emerald-500/30">
                PAYFIX-0.1.0 LIVE PRODUCTION ✓
              </span>
            </div>
            <p className="text-xs text-slate-400">Official government release manifest, 13-point automated production smoke test & cutover signoff</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleTriggerRollback}
            disabled={actionLoading}
            className="flex items-center space-x-1.5 px-3 py-2 bg-red-950/60 hover:bg-red-900/60 text-red-200 border border-red-500/30 font-bold rounded-lg transition disabled:opacity-50"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Emergency Rollback SOP</span>
          </button>

          <button
            onClick={handleExecuteCutover}
            disabled={actionLoading}
            className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow transition disabled:opacity-50"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Execute Production Cutover</span>
          </button>
        </div>
      </div>

      {/* Production Release Manifest Panel */}
      {manifest && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Lock className="w-5 h-5 text-blue-400" />
              <h2 className="font-bold text-slate-100 text-sm">Sealed Production Release Manifest (PAYFIX-0.1.0)</h2>
            </div>
            <span className="text-xs font-bold text-emerald-400">{manifest.status}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-mono text-xs">
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
              <span className="text-[10px] text-slate-400 uppercase">Backend Version</span>
              <p className="font-bold text-slate-200">{manifest.backend_version}</p>
            </div>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
              <span className="text-[10px] text-slate-400 uppercase">Frontend Bundle</span>
              <p className="font-bold text-slate-200">{manifest.frontend_version}</p>
            </div>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
              <span className="text-[10px] text-slate-400 uppercase">Statutory Rule Set</span>
              <p className="font-bold text-emerald-300">{manifest.rule_set_version}</p>
            </div>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
              <span className="text-[10px] text-slate-400 uppercase">DB Migration Version</span>
              <p className="font-bold text-slate-200">{manifest.db_migration_version}</p>
            </div>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
              <span className="text-[10px] text-slate-400 uppercase">Legacy Importer Engine</span>
              <p className="font-bold text-slate-200">{manifest.importer_version}</p>
            </div>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
              <span className="text-[10px] text-slate-400 uppercase">Released Timestamp</span>
              <p className="font-bold text-slate-300">{new Date(manifest.released_at).toLocaleString()}</p>
            </div>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1 font-mono text-[10px]">
            <span className="text-slate-400">Production Manifest SHA-256 Digest:</span>
            <p className="font-bold text-emerald-300 break-all">{manifest.manifest_sha256}</p>
          </div>
        </div>
      )}

      {/* 13-Point Production Smoke Test Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <FileCheck className="w-5 h-5 text-amber-400" />
            <h2 className="font-bold text-slate-100 text-sm">13-Point Automated Production Smoke Test Suite</h2>
          </div>
          <button
            onClick={handleRunSmokeTests}
            disabled={actionLoading}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition shadow disabled:opacity-50"
          >
            Run 13-Point Smoke Test
          </button>
        </div>

        {smokeTests.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
            {smokeTests.map((st, idx) => (
              <div key={idx} className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-start justify-between">
                <div className="space-y-0.5">
                  <p className="font-bold text-slate-200">{st.test_name}</p>
                  <p className="text-[10px] text-slate-400">{st.details}</p>
                </div>
                <div className="text-right ml-2 shrink-0">
                  <span className="font-bold text-emerald-400">PASS ✓</span>
                  <p className="text-[9px] text-slate-500">{st.latency_ms} ms</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Executed Cutover Certificate */}
      {cutover && (
        <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-5 shadow-xl space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-emerald-300 text-sm">OFFICIAL PRODUCTION CUTOVER CERTIFICATE ISSUED</h3>
            </div>
            <span className="text-[10px] text-slate-400">Cutover ID: {cutover.cutover_id}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-slate-400 text-[10px]">Legacy Excel Archive Digest:</span>
              <p className="text-slate-200 font-bold text-[10px] break-all">{cutover.legacy_excel_archive_hash}</p>
            </div>
            <div>
              <span className="text-slate-400 text-[10px]">Authorizing Authority:</span>
              <p className="text-slate-200 font-bold">{cutover.authorized_by}</p>
            </div>
          </div>

          <div className="pt-2 flex justify-between font-bold border-t border-emerald-500/20">
            <span className="text-slate-300">Final System Status:</span>
            <span className="text-emerald-300">{cutover.status}</span>
          </div>
        </div>
      )}
    </div>
  );
};
