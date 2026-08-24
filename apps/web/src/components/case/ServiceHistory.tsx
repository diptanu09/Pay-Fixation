import React, { useState } from 'react';
import type { ServiceEvent } from '../../types/api';
import { Plus, Trash2, HelpCircle } from 'lucide-react';

interface ServiceHistoryProps {
  events: ServiceEvent[];
  onUpdate: (events: ServiceEvent[]) => void;
}

export const ServiceHistory: React.FC<ServiceHistoryProps> = ({ events, onUpdate }) => {
  const [list, setList] = useState<ServiceEvent[]>(events.length > 0 ? events : [
    {
      id: '1',
      from_date: '1997-03-05',
      to_date: '2006-08-10',
      designation: 'Lower Division Clerk (LDC)',
      nature_of_service: 'Regular',
      excluded_days: 0,
      remarks: 'Initial Appointment',
    },
    {
      id: '2',
      from_date: '2006-08-11',
      to_date: '2026-03-31',
      designation: 'Upper Division Clerk (UDC)',
      nature_of_service: 'Regular',
      excluded_days: 0,
      remarks: 'Promotion on CAS-1',
    },
  ]);

  const handleAdd = () => {
    const newEvt: ServiceEvent = {
      id: window.crypto.randomUUID(),
      from_date: '2020-01-01',
      to_date: '2026-03-31',
      designation: 'Staff',
      nature_of_service: 'Regular',
      excluded_days: 0,
      remarks: '',
    };
    const updated = [...list, newEvt];
    setList(updated);
    onUpdate(updated);
  };

  const handleRemove = (id: string) => {
    const updated = list.filter((e) => e.id !== id);
    setList(updated);
    onUpdate(updated);
  };

  const totalExcluded = list.reduce((sum, e) => sum + (e.excluded_days || 0), 0);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 text-xs">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-100">Service History Timeline</h3>
          <p className="text-[11px] text-slate-400">Chronological service periods and qualifying service breakdown</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md font-semibold text-xs transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Period</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse gov-table">
          <thead>
            <tr>
              <th>From Date</th>
              <th>To Date</th>
              <th>Designation</th>
              <th>Nature</th>
              <th>Excluded Days</th>
              <th>Remarks</th>
              <th className="text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {list.map((evt) => (
              <tr key={evt.id}>
                <td className="font-mono text-slate-200">{evt.from_date}</td>
                <td className="font-mono text-slate-200">{evt.to_date}</td>
                <td className="font-medium text-slate-200">{evt.designation}</td>
                <td>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                    {evt.nature_of_service}
                  </span>
                </td>
                <td className="font-mono text-slate-300">{evt.excluded_days} Days</td>
                <td className="text-slate-400 text-[11px]">{evt.remarks || '—'}</td>
                <td className="text-right">
                  <button
                    onClick={() => handleRemove(evt.id)}
                    className="p-1 text-slate-500 hover:text-rose-400 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Service Calculation Breakdown Card */}
      <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="font-bold text-slate-200">Qualifying Service Summary</p>
          <p className="text-slate-400 text-[11px]">
            Gross Service: <span className="text-slate-200">29 Years 0 Months 27 Days</span> · Excluded: <span className="text-amber-400 font-semibold">{totalExcluded} Days</span>
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="text-right">
            <p className="text-[10px] uppercase font-bold text-slate-400">Net Qualifying Half-Years</p>
            <p className="text-lg font-black text-emerald-400 font-mono">58 Periods (Full Pension 100%)</p>
          </div>
          <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400" title="Why was this calculated? Rule 28 of Tripura Pension Rules 1980">
            <HelpCircle className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
};
