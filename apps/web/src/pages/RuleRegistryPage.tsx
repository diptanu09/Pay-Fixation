import React, { useState, useEffect } from 'react';
import type {
  RuleRegistryEntry,
  RuleVersionDetail,
  RuleImpactAnalysis,
  RuleRegressionReport,
  RuleSimulationResult,
} from '../types/api';
import {
  fetchRuleRegistryApi,
  fetchRuleDetailsApi,
  runImpactAnalysisApi,
  runRuleRegressionApi,
  approveRuleProposalApi,
  activateRuleApi,
  simulateRuleChangeApi,
} from '../lib/api';
import {
  BookOpen,
  FileCheck,
  Sliders,
  Layers,
} from 'lucide-react';

export const RuleRegistryPage: React.FC = () => {
  const [rules, setRules] = useState<RuleRegistryEntry[]>([]);
  const [selectedRule, setSelectedRule] = useState<RuleRegistryEntry | null>(null);
  const [versions, setVersions] = useState<RuleVersionDetail[]>([]);
  const [impact, setImpact] = useState<RuleImpactAnalysis | null>(null);
  const [regression, setRegression] = useState<RuleRegressionReport | null>(null);
  const [simulation, setSimulation] = useState<RuleSimulationResult | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = async () => {
    try {
      const list = await fetchRuleRegistryApi();
      setRules(list);
      if (list.length > 0) {
        setSelectedRule(list[0]);
        const v = await fetchRuleDetailsApi(list[0].rule_id);
        setVersions(v);
      }
    } catch (err) {
      console.error('Failed to load rule registry data', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectRule = async (rule: RuleRegistryEntry) => {
    setSelectedRule(rule);
    setImpact(null);
    setRegression(null);
    setSimulation(null);
    try {
      const v = await fetchRuleDetailsApi(rule.rule_id);
      setVersions(v);
    } catch (err) {
      console.error('Failed to load rule details', err);
    }
  };

  const handleRunImpactAnalysis = async () => {
    if (!selectedRule) return;
    setActionLoading(true);
    try {
      const imp = await runImpactAnalysisApi(selectedRule.rule_id);
      setImpact(imp);
    } catch (err: any) {
      alert(err.message || 'Impact analysis failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRunRegression = async () => {
    if (!selectedRule) return;
    setActionLoading(true);
    try {
      const reg = await runRuleRegressionApi(selectedRule.rule_id);
      setRegression(reg);
    } catch (err: any) {
      alert(err.message || 'Regression test suite failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveProposal = async () => {
    if (!selectedRule) return;
    setActionLoading(true);
    try {
      const msg = await approveRuleProposalApi(selectedRule.rule_id);
      alert(msg);
      await handleSelectRule(selectedRule);
    } catch (err: any) {
      alert(err.message || 'Approval failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleActivateRule = async () => {
    if (!selectedRule) return;
    setActionLoading(true);
    try {
      const msg = await activateRuleApi(selectedRule.rule_id);
      alert(msg);
      await handleSelectRule(selectedRule);
    } catch (err: any) {
      alert(err.message || 'Rule activation failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSimulateRule = async () => {
    setActionLoading(true);
    try {
      const sim = await simulateRuleChangeApi('PEN-2026-000123');
      setSimulation(sim);
    } catch (err: any) {
      alert(err.message || 'Rule simulation failed');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto text-xs font-sans text-slate-100">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <BookOpen className="w-8 h-8 text-blue-400 shrink-0" />
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-bold text-slate-100">Statutory Rule Registry & Regulatory Change Workspace</h1>
              <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 font-mono text-[10px] font-bold rounded-md border border-blue-500/30">
                PHASE 22 DEPLOYED
              </span>
            </div>
            <p className="text-xs text-slate-400">Versioned statutory rules, government order source hashing, impact analysis, regression gates, and Rule Simulator</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleSimulateRule}
            disabled={actionLoading}
            className="flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg shadow transition disabled:opacity-50"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Launch Interactive Rule Simulator</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Statutory Rule Registry Directory */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h2 className="font-bold text-slate-200 text-sm">Statutory Rule Registry</h2>
            <span className="text-[10px] text-slate-400">Total Rules: {rules.length}</span>
          </div>

          <div className="space-y-2">
            {rules.map((r) => (
              <div
                key={r.rule_id}
                onClick={() => handleSelectRule(r)}
                className={`p-3 rounded-lg border cursor-pointer transition ${selectedRule?.rule_id === r.rule_id ? 'bg-blue-950/60 border-blue-500/50 shadow' : 'bg-slate-950 border-slate-800 hover:bg-slate-800/50'}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-blue-400 text-xs">{r.rule_code}</span>
                  <span className="px-2 py-0.5 bg-slate-800 text-slate-300 font-mono text-[9px] font-bold rounded">
                    v{r.active_version_tag}
                  </span>
                </div>
                <p className="font-bold text-slate-200 mt-1">{r.rule_name}</p>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 font-mono">
                  <span>{r.category}</span>
                  <span>Eff: {r.effective_from}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Selected Rule Version Detail & Governance Panel */}
        {selectedRule && (
          <div className="lg:col-span-2 space-y-6">
            {/* Rule Metadata & Government Order Source */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h2 className="font-bold text-slate-100 text-sm">{selectedRule.rule_code}</h2>
                  <p className="text-slate-400 text-xs">{selectedRule.rule_name}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleRunImpactAnalysis}
                    disabled={actionLoading}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-bold transition"
                  >
                    Run Impact Analysis
                  </button>
                  <button
                    onClick={handleRunRegression}
                    disabled={actionLoading}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold shadow transition"
                  >
                    Execute Golden 20 Regression
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 font-mono text-xs">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase">Category</span>
                  <p className="font-bold text-slate-200">{selectedRule.category}</p>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase">Issuing Authority</span>
                  <p className="font-bold text-slate-200">{selectedRule.authority}</p>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase">Govt Order No & Date</span>
                  <p className="font-bold text-blue-300">{selectedRule.source_order_no} ({selectedRule.source_order_date})</p>
                </div>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1 font-mono text-[10px]">
                <span className="text-slate-400">Government Order Document SHA-256 Hash:</span>
                <p className="font-bold text-emerald-300 break-all">{selectedRule.source_document_hash}</p>
              </div>
            </div>

            {/* Impact Analysis & Regression Log */}
            {impact && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl space-y-3 font-mono text-xs">
                <div className="flex items-center space-x-2 text-amber-300 font-bold border-b border-slate-800 pb-2">
                  <Layers className="w-4 h-4" />
                  <span>Rule Change Automated Impact Analysis Report</span>
                </div>
                <p className="text-slate-300">{impact.impact_summary}</p>
                <div className="flex items-center space-x-4 text-[11px] text-slate-400">
                  <span>Affected Engines: {impact.affected_engines.join(', ')}</span>
                  <span>Test Count: {impact.affected_test_count}</span>
                  <span>Historical Cases: {impact.potential_historical_cases_count}</span>
                </div>
              </div>
            )}

            {regression && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                    <FileCheck className="w-4 h-4" />
                    <span>Golden 20 & Real Excel Case Regression Results</span>
                  </div>
                  <span className="font-bold text-emerald-400">{regression.status}</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span>Total Automated Tests Run: {regression.total_tests}</span>
                  <span>Passed: {regression.passed_tests}</span>
                  <span>Failed: {regression.failed_tests}</span>
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    onClick={handleApproveProposal}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold"
                  >
                    Approve Rule Proposal
                  </button>
                  <button
                    onClick={handleActivateRule}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold shadow"
                  >
                    Activate Rule Version
                  </button>
                </div>
              </div>
            )}

            {/* Version Lifecycle History */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
              <h3 className="font-bold text-slate-200 text-sm border-b border-slate-800 pb-2">Rule Version Lifecycle History</h3>
              <div className="space-y-3 font-mono text-xs">
                {versions.map((v) => (
                  <div key={v.version_id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-blue-400">Version {v.version_tag}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${v.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'}`}>
                          {v.status}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">Effective: {v.effective_from}</span>
                    </div>

                    <p className="text-[11px] text-slate-400">Config: {v.value_json}</p>
                    <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1 border-t border-slate-900">
                      <span>Created By: {v.created_by}</span>
                      <span>Content Digest: {v.content_hash.slice(0, 16)}...</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Rule Simulator Result Card */}
            {simulation && (
              <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-xl p-5 shadow-xl space-y-4 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-indigo-500/20 pb-2">
                  <div className="flex items-center space-x-2 text-indigo-300 font-bold">
                    <Sliders className="w-5 h-5 text-indigo-400" />
                    <h3 className="text-sm">INTERACTIVE RULE SIMULATION OUTPUT</h3>
                  </div>
                  <span className="text-[10px] text-slate-400">Case ID: {simulation.case_id}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
                    <span className="text-[10px] text-slate-400">Basic Pension Delta</span>
                    <p className="text-base font-extrabold text-emerald-400">+₹{simulation.financial_delta_pension.toFixed(2)} / month</p>
                  </div>
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
                    <span className="text-[10px] text-slate-400">Commutation Delta</span>
                    <p className="text-base font-extrabold text-emerald-400">+₹{simulation.financial_delta_commutation.toFixed(2)} lump-sum</p>
                  </div>
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
                    <span className="text-[10px] text-slate-400">DCRG Delta</span>
                    <p className="text-base font-extrabold text-slate-200">₹0.00 (At Ceiling)</p>
                  </div>
                </div>

                <p className="text-[11px] text-slate-300">{simulation.simulation_summary}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
