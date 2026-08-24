import React, { useState } from 'react';
import type { Employee } from '../../types/api';
import { Check } from 'lucide-react';

interface EmployeeFormProps {
  employee: Employee;
  onSave: (updated: Employee) => void;
}

export const EmployeeForm: React.FC<EmployeeFormProps> = ({ employee, onSave }) => {
  const [form, setForm] = useState<Employee>({ ...employee });
  const [savedStatus, setSavedStatus] = useState<string | null>(null);

  const handleChange = (field: keyof Employee, value: string) => {
    const updated = { ...form, [field]: value };
    setForm(updated);
    setSavedStatus('Saving...');
    setTimeout(() => {
      onSave(updated);
      setSavedStatus('Saved 5 seconds ago ✓');
    }, 600);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 text-xs">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-100">Employee Master Record</h3>
          <p className="text-[11px] text-slate-400">Personal, service appointment and DDO registration details</p>
        </div>
        {savedStatus && (
          <span className="text-[10px] text-emerald-400 font-medium flex items-center space-x-1">
            <Check className="w-3 h-3" />
            <span>{savedStatus}</span>
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-slate-400 mb-1 font-medium">Full Name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-slate-400 mb-1 font-medium">Designation</label>
          <input
            type="text"
            value={form.designation}
            onChange={(e) => handleChange('designation', e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-slate-400 mb-1 font-medium">Group / Class</label>
          <select
            value={form.group_class}
            onChange={(e) => handleChange('group_class', e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
          >
            <option value="Group A">Group A</option>
            <option value="Group B">Group B</option>
            <option value="Group C">Group C</option>
            <option value="Group D">Group D</option>
          </select>
        </div>

        <div>
          <label className="block text-slate-400 mb-1 font-medium">Date of Birth</label>
          <input
            type="date"
            value={form.dob}
            onChange={(e) => handleChange('dob', e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-slate-400 mb-1 font-medium">Date of Joining</label>
          <input
            type="date"
            value={form.doj}
            onChange={(e) => handleChange('doj', e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-slate-400 mb-1 font-medium">Date of Retirement / Demise</label>
          <input
            type="date"
            value={form.date_retirement_or_death}
            onChange={(e) => handleChange('date_retirement_or_death', e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-slate-400 mb-1 font-medium">PR Number / PPO</label>
          <input
            type="text"
            value={form.pr_no}
            onChange={(e) => handleChange('pr_no', e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 font-mono text-slate-100 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-slate-400 mb-1 font-medium">Application Number</label>
          <input
            type="text"
            value={form.application_no}
            onChange={(e) => handleChange('application_no', e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 font-mono text-slate-100 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-slate-400 mb-1 font-medium">DDO Code</label>
          <input
            type="text"
            value={form.ddo_code}
            onChange={(e) => handleChange('ddo_code', e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 font-mono text-slate-100 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  );
};
