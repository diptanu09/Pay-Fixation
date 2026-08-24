import React, { useState } from 'react';
import type { PayHistoryEntry } from '../../types/api';
import { Plus, Trash2 } from 'lucide-react';

interface PayHistoryProps {
  entries: PayHistoryEntry[];
  onUpdate: (entries: PayHistoryEntry[]) => void;
}

export const PayHistory: React.FC<PayHistoryProps> = ({ entries, onUpdate }) => {
  const [list, setList] = useState<PayHistoryEntry[]>(entries.length > 0 ? entries : [
    {
      id: '1',
      effective_date: '1997-03-05',
      pay_revision: 'Rop1988',
      pay_scale: '950-1500',
      grade_pay: 0,
      basic_pay: 950,
      reason: 'Initial Appointment',
    },
    {
      id: '2',
      effective_date: '1999-01-01',
      pay_revision: 'Rop1999',
      pay_scale: '3300-7100',
      grade_pay: 0,
      basic_pay: 3300,
      reason: 'Revision under ROP 1999',
    },
    {
      id: '3',
      effective_date: '2017-01-01',
      pay_revision: 'Rop2017',
      pay_scale: 'Level 8',
      grade_pay: 2400,
      basic_pay: 18300,
      pay_level: 'Level 8',
      reason: 'Revision under TSCS (RP) Rules 2017',
    },
    {
      id: '4',
      effective_date: '2018-10-01',
      pay_revision: 'Rop2018',
      pay_scale: 'Level 8',
      grade_pay: 2400,
      basic_pay: 53200,
      pay_level: 'Level 8',
      reason: 'TSCS (RP) 1st Amendment 2018 (Fitment 2.57)',
    },
  ]);

  const handleAdd = () => {
    const newEntry: PayHistoryEntry = {
      id: window.crypto.randomUUID(),
      effective_date: '2024-07-01',
      pay_revision: 'Rop2018',
      pay_scale: 'Level 8',
      grade_pay: 2400,
      basic_pay: 54800,
      pay_level: 'Level 8',
      reason: 'Annual Increment',
    };
    const updated = [...list, newEntry];
    setList(updated);
    onUpdate(updated);
  };

  const handleRemove = (id: string) => {
    const updated = list.filter((e) => e.id !== id);
    setList(updated);
    onUpdate(updated);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 text-xs">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-100">Pay Progression & Fixation History</h3>
          <p className="text-[11px] text-slate-400">Chronological basic pay events across applicable ROP revisions</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md font-semibold text-xs transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Pay Event</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse gov-table">
          <thead>
            <tr>
              <th>Effective Date</th>
              <th>ROP Rule</th>
              <th>Pay Level / Scale</th>
              <th>Grade Pay</th>
              <th>Basic Pay</th>
              <th>Reason & Authority</th>
              <th className="text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {list.map((entry) => (
              <tr key={entry.id}>
                <td className="font-mono text-slate-200">{entry.effective_date}</td>
                <td>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-blue-950 text-blue-300 border border-blue-800 font-mono">
                    {entry.pay_revision}
                  </span>
                </td>
                <td className="text-slate-300 font-medium">{entry.pay_level || entry.pay_scale}</td>
                <td className="font-mono text-slate-400">₹{entry.grade_pay.toLocaleString()}</td>
                <td className="font-mono font-bold text-emerald-400">₹{entry.basic_pay.toLocaleString()}</td>
                <td className="text-slate-400 text-[11px]">{entry.reason}</td>
                <td className="text-right">
                  <button
                    onClick={() => handleRemove(entry.id)}
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
    </div>
  );
};
