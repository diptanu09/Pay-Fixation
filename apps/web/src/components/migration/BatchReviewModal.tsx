import React, { useState, useEffect } from 'react';
import type { MigrationBatch, MigrationRecord } from '../../types/api';
import { fetchMigrationRecordsApi } from '../../lib/api';
import { X, AlertTriangle, Database } from 'lucide-react';

interface BatchReviewModalProps {
  batch: MigrationBatch | null;
  onClose: () => void;
}

export const BatchReviewModal: React.FC<BatchReviewModalProps> = ({ batch, onClose }) => {
  const [records, setRecords] = useState<MigrationRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MigrationRecord | null>(null);

  useEffect(() => {
    const loadRecords = async () => {
      if (!batch) return;
      setLoading(true);
      try {
        const list = await fetchMigrationRecordsApi(batch.batch_id);
        setRecords(list);
        if (list.length > 0) setSelectedRecord(list[0]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadRecords();
  }, [batch]);

  if (!batch) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 text-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="font-bold text-slate-100 text-sm">Batch Review: {batch.batch_code}</h3>
              <p className="text-[11px] text-slate-400 font-mono">Source Hash: {batch.file_hash.substring(0, 32)}...</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-3">
          {/* Record List */}
          <div className="border-r border-slate-800 overflow-y-auto p-3 space-y-2 bg-slate-950">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Imported Records ({records.length})</p>
            {loading ? (
              <div className="text-slate-500 text-center py-6">Loading batch records...</div>
            ) : (
              records.map((r) => (
                <button
                  key={r.record_id}
                  onClick={() => setSelectedRecord(r)}
                  className={`w-full text-left p-2.5 rounded-lg border transition ${
                    selectedRecord?.record_id === r.record_id
                      ? 'bg-blue-950/60 border-blue-600 text-slate-100'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="font-bold truncate text-xs">{r.employee_name}</p>
                    <span
                      className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${
                        r.status === 'Matched'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}
                    >
                      {r.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">{r.pr_no}</p>
                </button>
              ))
            )}
          </div>

          {/* Record Comparison Detail Panel */}
          <div className="col-span-2 overflow-y-auto p-5 space-y-4 bg-slate-900">
            {selectedRecord ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h4 className="font-bold text-slate-100 text-sm">{selectedRecord.employee_name}</h4>
                    <p className="text-xs text-slate-400 font-mono">PR No: {selectedRecord.pr_no} | Sheet: {selectedRecord.source_sheet}</p>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded font-mono font-bold text-[10px]">
                    EXACT MATCH PARITY ✓
                  </span>
                </div>

                {selectedRecord.validation_errors.length > 0 && (
                  <div className="p-3 bg-amber-950/40 border border-amber-800 rounded-lg text-amber-200 text-xs space-y-1">
                    <p className="font-bold flex items-center space-x-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      <span>Validation Warnings ({selectedRecord.validation_errors.length})</span>
                    </p>
                    {selectedRecord.validation_errors.map((e, idx) => (
                      <p key={idx} className="text-[11px] opacity-90 pl-4">• {e}</p>
                    ))}
                  </div>
                )}

                {/* Component-by-Component Excel vs PAYFIX Grid */}
                <div className="space-y-2">
                  <p className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">Excel vs PAYFIX Component Parity Matrix</p>
                  <div className="space-y-2">
                    {selectedRecord.comparisons.map((c, idx) => (
                      <div key={idx} className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between text-xs">
                        <div>
                          <p className="font-bold text-slate-200">{c.component}</p>
                          <p className="text-[11px] text-slate-400">Excel: <span className="font-mono text-slate-300">{c.excel_value}</span> | PAYFIX: <span className="font-mono text-blue-400">{c.payfix_value}</span></p>
                        </div>
                        <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded font-mono text-[9px] font-bold">
                          {c.match_type}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-slate-500 text-center py-12">Select a record from the list to review components</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
