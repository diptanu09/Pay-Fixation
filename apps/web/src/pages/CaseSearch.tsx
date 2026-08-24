import React, { useState, useEffect } from 'react';
import { fetchCasesApi } from '../lib/api';
import type { PersistentCaseRecord } from '../types/api';
import { StatusBadge } from '../components/ui/Badge';
import { NewCaseModal } from '../components/case/NewCaseModal';
import { Search, RefreshCw, ChevronRight, Plus } from 'lucide-react';

interface CaseSearchProps {
  onSelectCase: (caseId: string) => void;
}

export const CaseSearch: React.FC<CaseSearchProps> = ({ onSelectCase }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [records, setRecords] = useState<PersistentCaseRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchCasesApi(searchQuery);
      setRecords(res.data || []);
      setTotalCount(res.meta?.total_records || res.data?.length || 0);
    } catch (e) {
      console.error('Failed to fetch cases', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-100">Case Search & Registry</h2>
          <p className="text-xs text-slate-400">Search and filter active pay fixation and pension cases</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold text-xs transition shadow"
          >
            <Plus className="w-4 h-4" />
            <span>New Case</span>
          </button>
          <button
            onClick={loadData}
            className="p-2 bg-slate-900 border border-slate-800 rounded-md hover:bg-slate-800 text-slate-300 transition"
            title="Refresh Registry"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search PPO / Case No / Employee Name / PR No..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          <select className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-lg px-3 py-2 focus:outline-none">
            <option value="">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="VERIFICATION">Verification</option>
            <option value="APPROVAL">Approval</option>
            <option value="ISSUED">Issued</option>
          </select>

          <select className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-lg px-3 py-2 focus:outline-none">
            <option value="">All Case Types</option>
            <option value="Superannuation">Superannuation</option>
            <option value="FamilyPension">Family Pension</option>
          </select>
        </div>
      </div>

      {/* High-Density Registry Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <table className="w-full text-left border-collapse gov-table">
          <thead>
            <tr>
              <th>Case Number</th>
              <th>Employee Name & Desig</th>
              <th>PR / Application No</th>
              <th>Type</th>
              <th>Status</th>
              <th>Version</th>
              <th>Updated</th>
              <th className="text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {records.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-12 text-slate-500 text-xs">
                  {loading ? 'Loading registry...' : 'No matching cases found.'}
                </td>
              </tr>
            ) : (
              records.map((r) => (
                <tr
                  key={r.case.case_id}
                  onClick={() => onSelectCase(r.case.case_id)}
                  className="hover:bg-slate-800/80 transition-colors"
                >
                  <td className="font-semibold text-blue-400 font-mono text-xs">{r.case.case_no}</td>
                  <td>
                    <div className="font-medium text-slate-200">{r.case.employee.name}</div>
                    <div className="text-[10px] text-slate-400">{r.case.employee.designation}</div>
                  </td>
                  <td className="font-mono text-xs text-slate-400">{r.case.employee.pr_no}</td>
                  <td>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                      {r.case.case_type}
                    </span>
                  </td>
                  <td>
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="font-mono text-xs text-slate-400">v{r.version}</td>
                  <td className="text-xs text-slate-400">
                    {new Date(r.updated_at).toLocaleDateString()}
                  </td>
                  <td className="text-right">
                    <button className="p-1 hover:bg-slate-700 text-slate-400 hover:text-white rounded">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Footer Stats */}
        <div className="p-3 bg-slate-900 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
          <span>Showing {records.length} of {totalCount} records</span>
          <span>Page 1 of 1</span>
        </div>
      </div>

      {/* New Case Dialog Modal */}
      <NewCaseModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={(newId) => {
          loadData();
          onSelectCase(newId);
        }}
      />
    </div>
  );
};
