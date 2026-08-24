import React, { useState, useEffect } from 'react';
import type { RevisionDifference } from '../../types/api';
import { fetchRevisionComparisonApi } from '../../lib/api';
import { GitCompare, TrendingUp } from 'lucide-react';

interface RevisionComparisonProps {
  revisionId: string;
}

export const RevisionComparison: React.FC<RevisionComparisonProps> = ({ revisionId }) => {
  const [diffs, setDiffs] = useState<RevisionDifference[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadComparison = async () => {
      setLoading(true);
      try {
        const data = await fetchRevisionComparisonApi(revisionId);
        setDiffs(data);
      } catch (err) {
        console.error('Failed to load comparison', err);
      } finally {
        setLoading(false);
      }
    };
    if (revisionId) loadComparison();
  }, [revisionId]);

  if (loading) {
    return <div className="text-slate-500 text-xs py-8 text-center">Loading Before/After comparison...</div>;
  }

  return (
    <div className="space-y-6 text-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
          <GitCompare className="w-5 h-5 text-blue-400" />
          <div>
            <h3 className="font-bold text-slate-100 text-sm">Before / After Revision Differential Analysis</h3>
            <p className="text-[11px] text-slate-400">Statutory calculation comparison between Original Base Package vs Revised Package</p>
          </div>
        </div>

        {/* Side-by-Side Comparison Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {diffs.map((diff, i) => (
            <div key={i} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-blue-400 text-xs">{diff.category}: {diff.field_name}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center space-x-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>+₹{diff.difference_value.toLocaleString()}</span>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg">
                  <p className="text-[10px] uppercase font-bold text-slate-500">Original Base</p>
                  <p className="font-mono font-bold text-slate-300 mt-1">{diff.old_value}</p>
                </div>
                <div className="bg-slate-900 border border-blue-900/60 p-2.5 rounded-lg">
                  <p className="text-[10px] uppercase font-bold text-blue-400">Revised Value</p>
                  <p className="font-mono font-bold text-emerald-400 mt-1">{diff.new_value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
