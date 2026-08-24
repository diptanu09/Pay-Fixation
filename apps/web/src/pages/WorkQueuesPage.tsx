import React, { useState, useEffect } from 'react';
import type { WorkQueueItem } from '../types/api';
import { fetchWorkQueueApi, claimCaseApi } from '../lib/api';
import { ShieldCheck, Clock, ArrowRight } from 'lucide-react';

interface WorkQueuesPageProps {
  onSelectCase: (caseId: string) => void;
}

export const WorkQueuesPage: React.FC<WorkQueuesPageProps> = ({ onSelectCase }) => {
  const [queueType, setQueueType] = useState<'verification' | 'approval' | 'authorization'>('verification');
  const [items, setItems] = useState<WorkQueueItem[]>([]);
  const [loading, setLoading] = useState(false);

  const loadQueue = async () => {
    setLoading(true);
    try {
      const data = await fetchWorkQueueApi(queueType);
      setItems(data);
    } catch (err) {
      console.error('Failed to load queue', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, [queueType]);

  const handleClaim = async (caseId: string) => {
    try {
      await claimCaseApi(caseId, 'CURRENT_OFFICER');
      await loadQueue();
    } catch (err: any) {
      alert(err.message || 'Failed to claim case');
    }
  };

  return (
    <div className="space-y-6 text-xs">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <ShieldCheck className="w-6 h-6 text-blue-400" />
          <div>
            <h2 className="text-base font-bold text-slate-100">Work Queue Management Dashboard</h2>
            <p className="text-xs text-slate-400">Assigned pension cases requiring verification, approval, or authorization</p>
          </div>
        </div>

        {/* Queue Selector Tabs */}
        <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
          {(['verification', 'approval', 'authorization'] as const).map((q) => (
            <button
              key={q}
              onClick={() => setQueueType(q)}
              className={`px-3 py-1.5 rounded-md font-bold text-xs uppercase tracking-wider transition ${
                queueType === q
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {q} Queue
            </button>
          ))}
        </div>
      </div>

      {/* Queue Items Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
        {loading ? (
          <div className="text-slate-500 text-center py-8">Loading queue items...</div>
        ) : items.length === 0 ? (
          <div className="text-slate-500 text-center py-8">No pending cases in {queueType} queue</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950 text-slate-400 text-[10px] uppercase border-b border-slate-800 font-semibold">
                  <th className="py-3 px-3">Case Number</th>
                  <th className="py-3 px-3">Employee Name</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Assignment</th>
                  <th className="py-3 px-3">Aging / Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-sans">
                {items.map((item) => (
                  <tr key={item.case_id} className="hover:bg-slate-950/60 transition">
                    <td className="py-3 px-3 font-mono font-bold text-blue-400">{item.case_no}</td>
                    <td className="py-3 px-3 font-semibold text-slate-100">{item.employee_name}</td>
                    <td className="py-3 px-3 text-slate-400">{item.case_type}</td>
                    <td className="py-3 px-3">
                      {item.assigned_to ? (
                        <span className="px-2 py-0.5 bg-blue-950 text-blue-300 border border-blue-800 rounded font-mono text-[10px] font-bold">
                          Assigned: {item.assigned_to}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-slate-800 text-slate-400 rounded text-[10px]">
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span className="flex items-center space-x-1 text-slate-300 font-mono">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span>{item.days_pending} d pending</span>
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right space-x-2">
                      {!item.assigned_to && (
                        <button
                          onClick={() => handleClaim(item.case_id)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded text-[11px] transition"
                        >
                          Claim Case
                        </button>
                      )}
                      <button
                        onClick={() => onSelectCase(item.case_id)}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded text-[11px] transition shadow inline-flex items-center space-x-1"
                      >
                        <span>Open Workspace</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
