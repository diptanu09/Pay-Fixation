import React, { useState } from 'react';
import type { PayHistoryEntry } from '../../types/api';
import { Plus, Trash2, Edit2, X, CreditCard } from 'lucide-react';

interface PayHistoryProps {
  entries: PayHistoryEntry[];
  onUpdate: (entries: PayHistoryEntry[]) => void;
}

export const PayHistory: React.FC<PayHistoryProps> = ({ entries, onUpdate }) => {
  const [list, setList] = useState<PayHistoryEntry[]>(entries);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [effectiveDate, setEffectiveDate] = useState('');
  const [payRevision, setPayRevision] = useState<any>('Rop2017');
  const [payScale, setPayScale] = useState('Level 8');
  const [gradePay, setGradePay] = useState(2400);
  const [basicPay, setBasicPay] = useState(53200);
  const [payLevel, setPayLevel] = useState('Level 8');
  const [reason, setReason] = useState('');

  React.useEffect(() => {
    setList(entries);
  }, [entries]);

  const handleOpenAddModal = () => {
    setEditingId(null);
    setEffectiveDate(new Date().toISOString().split('T')[0]);
    setPayRevision('Rop2017');
    setPayScale('Level 8');
    setGradePay(2400);
    setBasicPay(53200);
    setPayLevel('Level 8');
    setReason('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (entry: PayHistoryEntry) => {
    setEditingId(entry.id);
    setEffectiveDate(entry.effective_date || '');
    setPayRevision(entry.pay_revision || 'Rop2017');
    setPayScale(entry.pay_scale || '');
    setGradePay(entry.grade_pay || 0);
    setBasicPay(entry.basic_pay || 0);
    setPayLevel(entry.pay_level || '');
    setReason(entry.reason || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!effectiveDate) {
      alert('Please enter Effective Date');
      return;
    }
    if (!basicPay || basicPay <= 0) {
      alert('Please enter a valid Basic Pay amount');
      return;
    }

    if (editingId) {
      const updated = list.map((item) =>
        item.id === editingId
          ? {
              ...item,
              effective_date: effectiveDate,
              pay_revision: payRevision,
              pay_scale: payScale.trim(),
              grade_pay: Number(gradePay) || 0,
              basic_pay: Number(basicPay) || 0,
              pay_level: payLevel.trim() || undefined,
              reason: reason.trim(),
            }
          : item
      );
      setList(updated);
      onUpdate(updated);
    } else {
      const newEntry: PayHistoryEntry = {
        id: window.crypto.randomUUID(),
        effective_date: effectiveDate,
        pay_revision: payRevision,
        pay_scale: payScale.trim(),
        grade_pay: Number(gradePay) || 0,
        basic_pay: Number(basicPay) || 0,
        pay_level: payLevel.trim() || undefined,
        reason: reason.trim(),
      };
      const updated = [...list, newEntry];
      setList(updated);
      onUpdate(updated);
    }

    setIsModalOpen(false);
  };

  const handleRemove = (id: string) => {
    if (confirm('Are you sure you want to remove this pay event?')) {
      const updated = list.filter((e) => e.id !== id);
      setList(updated);
      onUpdate(updated);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 text-xs">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-100">Pay Progression & Fixation History</h3>
          <p className="text-[11px] text-slate-400">Chronological basic pay events across applicable ROP revisions</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md font-semibold text-xs transition shadow"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Add Pay Event</span>
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
            {list.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-6 text-slate-500 italic">
                  No pay fixation events added yet. Click "+ Add Pay Event" above to fill in pay progression details.
                </td>
              </tr>
            ) : (
              list.map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-800/50 transition">
                  <td className="font-mono text-slate-200">{entry.effective_date}</td>
                  <td>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-blue-950 text-blue-300 border border-blue-800 font-mono">
                      {entry.pay_revision}
                    </span>
                  </td>
                  <td className="text-slate-300 font-medium">{entry.pay_level || entry.pay_scale}</td>
                  <td className="font-mono text-slate-400">₹{(entry.grade_pay || 0).toLocaleString()}</td>
                  <td className="font-mono font-bold text-emerald-400">₹{(entry.basic_pay || 0).toLocaleString()}</td>
                  <td className="text-slate-400 text-[11px]">{entry.reason || '—'}</td>
                  <td className="text-right space-x-1">
                    <button
                      onClick={() => handleOpenEditModal(entry)}
                      className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded transition"
                      title="Edit Pay Event"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleRemove(entry.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded transition"
                      title="Delete Pay Event"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Interactive Modal to Fill / Edit Pay Event Data */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
              <div className="flex items-center space-x-2">
                <CreditCard className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-100">
                  {editingId ? 'Edit Pay Fixation Event' : 'Add New Pay Fixation Event'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Effective Date <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={effectiveDate}
                    onChange={(e) => setEffectiveDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Applicable ROP Rule
                  </label>
                  <select
                    value={payRevision}
                    onChange={(e) => setPayRevision(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
                  >
                    <option value="Rop2018">TSCS (RP) Rules 2018 (1st Amend)</option>
                    <option value="Rop2017">TSCS (RP) Rules 2017</option>
                    <option value="Rop1999">ROP Rules 1999</option>
                    <option value="Rop1988">ROP Rules 1988</option>
                    <option value="Rop1982">ROP Rules 1982</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Pay Level / Matrix Level
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Level 8, Level 10..."
                    value={payLevel}
                    onChange={(e) => {
                      setPayLevel(e.target.value);
                      setPayScale(e.target.value);
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Grade Pay (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={gradePay}
                    onChange={(e) => setGradePay(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Basic Pay (₹) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="e.g. 53200"
                  value={basicPay}
                  onChange={(e) => setBasicPay(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 font-mono text-emerald-400 font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Reason & Authority
                </label>
                <input
                  type="text"
                  placeholder="e.g. Annual Increment / CAS-1 Promotion Fixation / ROP Revision"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow transition"
                >
                  {editingId ? 'Save Changes' : 'Add Pay Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
