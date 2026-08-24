import React, { useState, useEffect } from 'react';
import {
  fetchCaseByIdApi,
  calculatePensionApi,
  transitionWorkflowApi,
  updateCaseApi,
  createRevisionApi,
  fetchRevisionsByCaseApi,
} from '../lib/api';
import type {
  PersistentCaseRecord,
  Employee,
  ServiceEvent,
  PayHistoryEntry,
  RevisionCase,
  RevisionReason,
} from '../types/api';
import { WorkflowStepper } from '../components/ui/Stepper';
import { StatusBadge } from '../components/ui/Badge';
import { EmployeeForm } from '../components/case/EmployeeForm';
import { ServiceHistory } from '../components/case/ServiceHistory';
import { PayHistory } from '../components/case/PayHistory';
import { ValidationPanel } from '../components/case/ValidationPanel';
import { RejectionModal } from '../components/case/RejectionModal';
import { PayFixationWorkspace } from '../components/payfix/PayFixationWorkspace';
import { PensionWorkspace } from '../components/pension/PensionWorkspace';
import { DcrgWorkspace } from '../components/benefits/DcrgWorkspace';
import { CommutationWorkspace } from '../components/benefits/CommutationWorkspace';
import { FamilyPensionWorkspace } from '../components/benefits/FamilyPensionWorkspace';
import { BenefitsCenter } from '../components/benefits/BenefitsCenter';
import { RevisionHistory } from '../components/revision/RevisionHistory';
import { RevisionComparison } from '../components/revision/RevisionComparison';
import { ArrearsWorkspace } from '../components/revision/ArrearsWorkspace';
import { NewRevisionModal } from '../components/revision/NewRevisionModal';
import { VerificationChecklistPanel } from '../components/workflow/VerificationChecklistPanel';
import { EvidencePanel } from '../components/workflow/EvidencePanel';
import { DecisionPanel } from '../components/workflow/DecisionPanel';
import { WorkflowHistoryLog } from '../components/workflow/WorkflowHistoryLog';
import { DocumentCenter } from '../components/documents/DocumentCenter';
import {
  Calculator,
  CheckCircle2,
  FileCheck,
  ShieldCheck,
  User as UserIcon,
  Award,
  Layers,
  ArrowRight,
  AlertTriangle,
  History,
  CheckSquare,
  Users,
  GitCompare,
} from 'lucide-react';

interface CaseWorkspaceProps {
  caseId: string;
}

export const CaseWorkspace: React.FC<CaseWorkspaceProps> = ({ caseId }) => {
  const [record, setRecord] = useState<PersistentCaseRecord | null>(null);
  const [revisions, setRevisions] = useState<RevisionCase[]>([]);
  const [selectedRevision, setSelectedRevision] = useState<RevisionCase | null>(null);
  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'employee'
    | 'service'
    | 'payhistory'
    | 'payfix'
    | 'pension'
    | 'dcrg'
    | 'commutation'
    | 'family'
    | 'benefits'
    | 'revisions'
    | 'comparison'
    | 'arrears'
    | 'documents'
    | 'validation'
    | 'audit'
  >('overview');
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectionOpen, setRejectionOpen] = useState(false);
  const [newRevisionOpen, setNewRevisionOpen] = useState(false);
  const [concurrencyConflict, setConcurrencyConflict] = useState(false);

  const loadCase = async () => {
    setLoading(true);
    setConcurrencyConflict(false);
    try {
      const data = await fetchCaseByIdApi(caseId);
      setRecord(data);
      const revs = await fetchRevisionsByCaseApi(caseId);
      setRevisions(revs);
      if (revs.length > 0) setSelectedRevision(revs[0]);
    } catch (err) {
      console.error('Failed to load case', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (caseId) loadCase();
  }, [caseId]);

  const handleUpdateEmployee = async (updatedEmp: Employee) => {
    if (!record) return;
    try {
      const updatedCase = { ...record.case, employee: updatedEmp };
      const res = await updateCaseApi(record.case.case_id, updatedCase);
      setRecord(res);
    } catch (err: any) {
      if (err.message.includes('modified by another user')) {
        setConcurrencyConflict(true);
      } else {
        alert(err.message);
      }
    }
  };

  const handleUpdateServiceHistory = async (events: ServiceEvent[]) => {
    if (!record) return;
    try {
      const updatedCase = { ...record.case, service_history: events };
      const res = await updateCaseApi(record.case.case_id, updatedCase);
      setRecord(res);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpdatePayHistory = async (entries: PayHistoryEntry[]) => {
    if (!record) return;
    try {
      const updatedCase = { ...record.case, pay_history: entries };
      const res = await updateCaseApi(record.case.case_id, updatedCase);
      setRecord(res);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleRunCalculation = async () => {
    if (!record) return;
    setActionLoading(true);
    try {
      await calculatePensionApi(record.case.case_id, record.case.employee, 53200);
      setActiveTab('pension');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateRevision = async (reason: RevisionReason, effectiveDate: string) => {
    if (!record) return;
    setActionLoading(true);
    try {
      const newRev = await createRevisionApi(record.case.case_id, reason, effectiveDate);
      const revs = await fetchRevisionsByCaseApi(record.case.case_id);
      setRevisions(revs);
      setSelectedRevision(newRev);
      setActiveTab('comparison');
    } catch (err: any) {
      alert(err.message || 'Failed to create revision');
    } finally {
      setActionLoading(false);
    }
  };

  const handleWorkflowTransition = async (action: string, notes?: string) => {
    if (!record) return;
    setActionLoading(true);
    try {
      await transitionWorkflowApi(record.case.case_id, action, record.version, notes);
      await loadCase();
    } catch (err: any) {
      if (err.message.includes('modified by another user')) {
        setConcurrencyConflict(true);
      } else {
        alert(err.message);
      }
    } finally {
      setActionLoading(false);
    }
  };

  if (loading || !record) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500 text-xs">
        Loading case workspace...
      </div>
    );
  }

  const { case: c, status, version } = record;

  return (
    <div className="space-y-6">
      {/* Optimistic Concurrency Banner */}
      {concurrencyConflict && (
        <div className="bg-amber-950/80 border border-amber-800 text-amber-200 p-4 rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <p className="font-bold">Case Modified by Another User</p>
              <p className="text-[11px] text-amber-300">Another officer updated this case while you were working. Please reload to see the latest version.</p>
            </div>
          </div>
          <button
            onClick={loadCase}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-md font-semibold text-xs transition shadow"
          >
            Reload Latest Version
          </button>
        </div>
      )}

      {/* Header Info Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3 mb-1">
              <span className="font-mono text-lg font-bold text-blue-400">{c.case_no}</span>
              <StatusBadge status={status} />
              <span className="text-xs text-slate-500 font-mono">v{version}</span>
            </div>
            <h2 className="text-base font-bold text-slate-100">{c.employee.name}</h2>
            <p className="text-xs text-slate-400">{c.employee.designation} · {c.employee.group_class} · {c.employee.ddo_code}</p>
          </div>

          {/* Workflow Action Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setNewRevisionOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow transition"
            >
              <span>+ Create Revision</span>
            </button>

            <button
              onClick={handleRunCalculation}
              disabled={actionLoading}
              className="flex items-center space-x-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold shadow transition disabled:opacity-50"
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Run Engine</span>
            </button>

            {status === 'DRAFT' && (
              <button
                onClick={() => handleWorkflowTransition('submit-verification')}
                disabled={actionLoading}
                className="flex items-center space-x-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow transition"
              >
                <span>Submit Verification</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {status === 'VERIFICATION' && (
              <>
                <button
                  onClick={() => setRejectionOpen(true)}
                  disabled={actionLoading}
                  className="px-3 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold shadow transition"
                >
                  Reject Case
                </button>
                <button
                  onClick={() => handleWorkflowTransition('verify')}
                  disabled={actionLoading}
                  className="flex items-center space-x-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow transition"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verify Calculation</span>
                </button>
              </>
            )}

            {status === 'APPROVAL' && (
              <button
                onClick={() => handleWorkflowTransition('authorize')}
                disabled={actionLoading}
                className="flex items-center space-x-1.5 px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold shadow transition"
              >
                <FileCheck className="w-3.5 h-3.5" />
                <span>Authorize & Issue Sanction</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stepper */}
      <WorkflowStepper currentStatus={status} />

      {/* Workspace Navigation Tabs */}
      <div className="border-b border-slate-800 flex space-x-4 overflow-x-auto">
        {[
          { id: 'overview', label: 'Overview', icon: UserIcon },
          { id: 'employee', label: 'Employee Profile', icon: UserIcon },
          { id: 'service', label: 'Service History', icon: Layers },
          { id: 'payhistory', label: 'Pay History', icon: History },
          { id: 'payfix', label: 'Pay Fixation', icon: Calculator },
          { id: 'pension', label: 'Pension', icon: Award },
          { id: 'dcrg', label: 'DCRG Gratuity', icon: Award },
          { id: 'commutation', label: 'Commutation', icon: Calculator },
          { id: 'family', label: 'Family Pension', icon: Users },
          { id: 'benefits', label: 'Benefits Center', icon: ShieldCheck },
          { id: 'revisions', label: 'Revision Chain', icon: History },
          { id: 'comparison', label: 'Before/After Diff', icon: GitCompare },
          { id: 'arrears', label: 'Period Arrears', icon: Calculator },
          { id: 'documents', label: 'Document Center', icon: FileCheck },
          { id: 'validation', label: 'Validation', icon: CheckSquare },
          { id: 'audit', label: 'Audit Trail', icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 text-xs font-semibold flex items-center space-x-2 border-b-2 whitespace-nowrap transition-all ${
                active
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Employee Details</h3>
              <div className="space-y-2 text-xs">
                <div><span className="text-slate-500">PR Number:</span> <span className="font-mono text-slate-200">{c.employee.pr_no}</span></div>
                <div><span className="text-slate-500">Date of Birth:</span> <span className="text-slate-200">{c.employee.dob}</span></div>
                <div><span className="text-slate-500">Date of Joining:</span> <span className="text-slate-200">{c.employee.doj}</span></div>
                <div><span className="text-slate-500">Date of Retirement:</span> <span className="text-slate-200 font-semibold text-emerald-400">{c.employee.date_retirement_or_death}</span></div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Qualifying Service</h3>
              <div className="space-y-2 text-xs">
                <div><span className="text-slate-500">Gross Service:</span> <span className="text-slate-200">29 Years 0 Months 27 Days</span></div>
                <div><span className="text-slate-500">Non-Qualifying:</span> <span className="text-slate-200">{c.non_qualifying_days} Days</span></div>
                <div><span className="text-slate-500">Net Half-Year Periods:</span> <span className="font-bold text-blue-400">58 Periods (Full 100%)</span></div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Fixation Context</h3>
              <div className="space-y-2 text-xs">
                <div><span className="text-slate-500">Applicable ROP:</span> <span className="text-slate-200">TRIPURA-ROP-2017</span></div>
                <div><span className="text-slate-500">Last Basic Pay:</span> <span className="font-semibold text-emerald-400 font-mono">₹53,200</span></div>
                <div><span className="text-slate-500">Commutation Option:</span> <span className="text-slate-200">{c.commutation_percentage}%</span></div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'employee' && (
          <EmployeeForm employee={c.employee} onSave={handleUpdateEmployee} />
        )}

        {activeTab === 'service' && (
          <ServiceHistory events={c.service_history} onUpdate={handleUpdateServiceHistory} />
        )}

        {activeTab === 'payhistory' && (
          <PayHistory entries={c.pay_history} onUpdate={handleUpdatePayHistory} />
        )}

        {activeTab === 'payfix' && (
          <PayFixationWorkspace caseId={c.case_id} employeeId={c.employee.id} />
        )}

        {activeTab === 'pension' && (
          <PensionWorkspace caseId={c.case_id} employee={c.employee} />
        )}

        {activeTab === 'dcrg' && (
          <DcrgWorkspace lastEmoluments={53200} halfYears={58} />
        )}

        {activeTab === 'commutation' && (
          <CommutationWorkspace basicPension={26600} />
        )}

        {activeTab === 'family' && (
          <FamilyPensionWorkspace lastPay={53200} />
        )}

        {activeTab === 'benefits' && (
          <BenefitsCenter
            caseId={c.case_id}
            onNavigateTab={(tab) => setActiveTab(tab as any)}
            onSubmitVerification={() => handleWorkflowTransition('submit-verification')}
          />
        )}

        {activeTab === 'revisions' && (
          <RevisionHistory
            revisions={revisions}
            onSelectRevision={(rev) => {
              setSelectedRevision(rev);
              setActiveTab('comparison');
            }}
            onOpenNewRevision={() => setNewRevisionOpen(true)}
          />
        )}

        {activeTab === 'comparison' && (
          <RevisionComparison revisionId={selectedRevision?.revision_id || 'REV-001'} />
        )}

        {activeTab === 'arrears' && (
          <ArrearsWorkspace revisionId={selectedRevision?.revision_id || 'REV-001'} />
        )}

        {activeTab === 'documents' && (
          <DocumentCenter caseId={c.case_id} />
        )}

        {activeTab === 'validation' && (
          <ValidationPanel caseData={c} />
        )}

        {activeTab === 'audit' && (
          <div className="space-y-6">
            <EvidencePanel caseId={c.case_id} />
            <VerificationChecklistPanel />
            <DecisionPanel
              currentStatus={status}
              onAction={(action, notes) => handleWorkflowTransition(action, notes)}
              loading={actionLoading}
            />
            <WorkflowHistoryLog caseId={c.case_id} />
          </div>
        )}
      </div>

      {/* Structured Rejection Dialog */}
      <RejectionModal
        isOpen={rejectionOpen}
        onClose={() => setRejectionOpen(false)}
        onConfirm={(reason) => handleWorkflowTransition('reject', reason)}
      />

      {/* New Revision Modal */}
      <NewRevisionModal
        isOpen={newRevisionOpen}
        onClose={() => setNewRevisionOpen(false)}
        onConfirm={handleCreateRevision}
      />
    </div>
  );
};
