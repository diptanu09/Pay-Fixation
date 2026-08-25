import React, { useState } from 'react';
import type { ServiceEvent } from '../../types/api';
import { Plus, Trash2, Edit2, HelpCircle, X, Calendar } from 'lucide-react';

interface ServiceHistoryProps {
  events: ServiceEvent[];
  onUpdate: (events: ServiceEvent[]) => void;
}

export const ServiceHistory: React.FC<ServiceHistoryProps> = ({ events, onUpdate }) => {
  const [list, setList] = useState<ServiceEvent[]>(events);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [designation, setDesignation] = useState('');
  const [nature, setNature] = useState('Regular');
  const [excludedDays, setExcludedDays] = useState(0);
  const [remarks, setRemarks] = useState('');

  React.useEffect(() => {
    setList(events);
  }, [events]);

  const handleOpenAddModal = () => {
    setEditingId(null);
    setFromDate(new Date().toISOString().split('T')[0]);
    setToDate('');
    setDesignation('');
    setNature('Regular');
    setExcludedDays(0);
    setRemarks('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (evt: ServiceEvent) => {
    setEditingId(evt.id);
    setFromDate(evt.from_date || '');
    setToDate(evt.to_date || '');
    setDesignation(evt.designation || '');
    setNature(evt.nature_of_service || 'Regular');
    setExcludedDays(evt.excluded_days || 0);
    setRemarks(evt.remarks || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromDate) {
      alert('Please enter From Date');
      return;
    }
    if (!designation.trim()) {
      alert('Please enter Designation');
      return;
    }

    if (editingId) {
      const updated = list.map((item) =>
        item.id === editingId
          ? {
              ...item,
              from_date: fromDate,
              to_date: toDate,
              designation: designation.trim(),
              nature_of_service: nature,
              excluded_days: Number(excludedDays) || 0,
              remarks: remarks.trim(),
            }
          : item
      );
      setList(updated);
      onUpdate(updated);
    } else {
      const newEvt: ServiceEvent = {
        id: window.crypto.randomUUID(),
        from_date: fromDate,
        to_date: toDate,
        designation: designation.trim(),
        nature_of_service: nature,
        excluded_days: Number(excludedDays) || 0,
        remarks: remarks.trim(),
      };
      const updated = [...list, newEvt];
      setList(updated);
      onUpdate(updated);
    }

    setIsModalOpen(false);
  };

  const handleRemove = (id: string) => {
    if (confirm('Are you sure you want to remove this service period?')) {
      const updated = list.filter((e) => e.id !== id);
      setList(updated);
      onUpdate(updated);
    }
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
          onClick={handleOpenAddModal}
          className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md font-semibold text-xs transition shadow"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Add Period</span>
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
            {list.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-6 text-slate-500 italic">
                  No service periods added yet. Click "+ Add Period" above to enter service history details.
                </td>
              </tr>
            ) : (
              list.map((evt) => (
                <tr key={evt.id} className="hover:bg-slate-800/50 transition">
                  <td className="font-mono text-slate-200">{evt.from_date}</td>
                  <td className="font-mono text-slate-200">{evt.to_date || 'Present'}</td>
                  <td className="font-medium text-slate-200">{evt.designation}</td>
                  <td>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                      {evt.nature_of_service}
                    </span>
                  </td>
                  <td className="font-mono text-slate-300">{evt.excluded_days} Days</td>
                  <td className="text-slate-400 text-[11px]">{evt.remarks || '—'}</td>
                  <td className="text-right space-x-1">
                    <button
                      onClick={() => handleOpenEditModal(evt)}
                      className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded transition"
                      title="Edit Period"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleRemove(evt.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded transition"
                      title="Delete Period"
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

      {/* Service Calculation Breakdown Card */}
      <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="font-bold text-slate-200">Qualifying Service Summary</p>
          <p className="text-slate-400 text-[11px]">
            Gross Service Periods: <span className="text-slate-200">{list.length} Record(s)</span> · Excluded / Non-Qualifying: <span className="text-amber-400 font-semibold">{totalExcluded} Days</span>
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="text-right">
            <p className="text-[10px] uppercase font-bold text-slate-400">Total Excluded Days</p>
            <p className="text-base font-black text-amber-400 font-mono">{totalExcluded} Days</p>
          </div>
          <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400" title="Rule 28 of Tripura Pension Rules 1980">
            <HelpCircle className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Interactive Modal to Fill / Edit Service Period Data */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-blue-400" />
                <h3 className="text-sm font-bold text-slate-100">
                  {editingId ? 'Edit Service History Period' : 'Add New Service History Period'}
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
                    From Date <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    To Date <span className="text-slate-500">(Leave blank if ongoing)</span>
                  </label>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Designation / Post Held <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. Panchayet Secretary, LDC, Teacher..."
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Nature of Service
                  </label>
                  <select
                    value={nature}
                    onChange={(e) => setNature(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Regular">Regular</option>
                    <option value="Temporary">Temporary</option>
                    <option value="Ad-hoc">Ad-hoc</option>
                    <option value="Officiating">Officiating</option>
                    <option value="Deputation">Deputation</option>
                    <option value="Contractual">Contractual</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Excluded / Non-Qualifying Days
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={excludedDays}
                    onChange={(e) => setExcludedDays(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Remarks / Order Authority
                </label>
                <input
                  type="text"
                  placeholder="e.g. Initial Appointment Order No. X / CAS-1 Promotion"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
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
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow transition"
                >
                  {editingId ? 'Save Changes' : 'Add Service Period'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
