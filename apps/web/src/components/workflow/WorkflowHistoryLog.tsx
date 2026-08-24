import React, { useState, useEffect } from 'react';
import type { WorkflowHistoryEntry } from '../../types/api';
import { fetchWorkflowHistoryApi } from '../../lib/api';
import { History, ShieldCheck, UserCheck } from 'lucide-react';

interface WorkflowHistoryLogProps {
  caseId: string;
}

export const WorkflowHistoryLog: React.FC<WorkflowHistoryLogProps> = ({ caseId }) => {
  const [history, setHistory] = useState<WorkflowHistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadHistory = async () => {
      setLoading(true);
      try {
        const data = await fetchWorkflowHistoryApi(caseId);
        setHistory(data);
      } catch (err) {
        console.error('Failed to load workflow history', err);
      } finally {
        setLoading(false);
      }
    };
    if (caseId) loadHistory();
  }, [caseId]);

  if (loading) {
    return <div className="text-slate-500 text-xs py-6 text-center">Loading workflow audit log...</div>;
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4 text-xs">
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
        <History className="w-5 h-5 text-blue-400" />
        <div>
          <h3 className="font-bold text-slate-100 text-sm">Case Audit & Workflow History Trail</h3>
          <p className="text-[11px] text-slate-400">Complete immutable record of all state transitions and officer actions</p>
        </div>
      </div>

      <div className="space-y-3">
        {history.map((entry) => (
          <div key={entry.id} className="bg-slate-950 border border-slate-800 rounded-lg p-3.5 flex items-center justify-between">
            <div className="flex items-start space-x-3">
              <UserCheck className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
              <div>
                <p className="font-bold text-slate-200 flex items-center space-x-2">
                  <span>{entry.performed_by} ({entry.role})</span>
                  <span className="text-slate-500">·</span>
                  <span className="text-blue-400 font-mono text-[11px]">{entry.from_status} → {entry.to_status}</span>
                </p>
                {entry.comment && <p className="text-[11px] text-slate-400 mt-1 italic">"{entry.comment}"</p>}
                {entry.calculation_hash && (
                  <p className="text-[10px] text-slate-500 font-mono mt-1 flex items-center space-x-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    <span>Sealed Hash: {entry.calculation_hash.substring(0, 24)}...</span>
                  </p>
                )}
              </div>
            </div>

            <span className="text-[10px] text-slate-500 font-mono whitespace-nowrap">
              {new Date(entry.timestamp).toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
