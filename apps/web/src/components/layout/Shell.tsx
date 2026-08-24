import React, { useState, useEffect } from 'react';
import type { User } from '../../types/api';
import {
  FileText,
  Search,
  Calculator,
  ShieldCheck,
  Award,
  LogOut,
  Command,
  Database,
  Activity,
  BookOpen,
  BarChart3,
} from 'lucide-react';

interface ShellProps {
  user: User | null;
  onLogout: () => void;
  currentTab: string;
  onSelectTab: (tab: string) => void;
  children: React.ReactNode;
}

export const Shell: React.FC<ShellProps> = ({
  user,
  onLogout,
  currentTab,
  onSelectTab,
  children,
}) => {
  const [commandOpen, setCommandOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setCommandOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navItems = [
    { id: 'search', label: 'Case Search', icon: Search },
    { id: 'mis', label: 'MIS & Analytics', icon: BarChart3 },
    { id: 'queues', label: 'Work Queues', icon: ShieldCheck },
    { id: 'workspace', label: 'Case Workspace', icon: FileText },
    { id: 'production', label: 'Production Operations', icon: ShieldCheck },
    { id: 'ruleregistry', label: 'Rule Registry & Governance', icon: BookOpen },
    { id: 'golive', label: 'Go-Live Control Center', icon: ShieldCheck },
    { id: 'pilot', label: 'Pilot & Certification', icon: Award },
    { id: 'migration', label: 'Legacy Migration', icon: Database },
    { id: 'diagnostics', label: 'System Diagnostics', icon: Activity },
    { id: 'payfix', label: 'Pay Fixation', icon: Calculator },
    { id: 'pension', label: 'Pension Engine', icon: Award },
    { id: 'audit', label: 'Audit Trail', icon: ShieldCheck },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 sticky top-0 z-40">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center font-black text-white shadow">
            PF
          </div>
          <div>
            <h1 className="font-bold text-sm text-slate-100 tracking-wide">PAYFIX</h1>
            <p className="text-[10px] text-slate-400 font-medium">State of Tripura · Pension & Pay Fixation</p>
          </div>
          <span className="ml-3 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
            PRODUCTION
          </span>
        </div>

        {/* Global Search Trigger */}
        <button
          onClick={() => setCommandOpen(true)}
          className="flex items-center space-x-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-md px-3 py-1.5 text-xs text-slate-400 w-80 justify-between transition-all"
        >
          <span className="flex items-center space-x-2">
            <Search className="w-3.5 h-3.5" />
            <span>Search cases, employees, PPO...</span>
          </span>
          <kbd className="bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded text-[10px] font-mono border border-slate-700 flex items-center">
            <Command className="w-2.5 h-2.5 mr-0.5" />K
          </kbd>
        </button>

        {/* User Profile & Quick Actions */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-xs">
            <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-blue-400">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <div className="text-left hidden sm:block">
              <p className="font-medium text-slate-200">{user?.full_name || 'SWAPAN DEBBARMA'}</p>
              <p className="text-[10px] text-slate-400">{user?.roles?.[0] || 'DEALING_ASSISTANT'}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded transition"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-56 bg-slate-900/50 border-r border-slate-800 p-3 flex flex-col justify-between hidden md:flex">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-md text-xs font-medium transition-all ${
                    active
                      ? 'bg-blue-600 text-white font-semibold shadow'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
          <div className="text-[10px] text-slate-500 border-t border-slate-800 pt-3">
            <p>Engine Version: 1.0.0</p>
            <p>Rule Set: ROP-2017 / 2026.01</p>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-950">{children}</main>
      </div>

      {/* Global Command Palette Modal */}
      {commandOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-20">
          <div className="bg-slate-900 border border-slate-700 rounded-xl w-[540px] shadow-2xl overflow-hidden">
            <div className="p-3 border-b border-slate-800 flex items-center space-x-2">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                autoFocus
                placeholder="Type a command or search PPO/Employee..."
                className="bg-transparent border-none text-slate-100 text-sm focus:outline-none w-full"
              />
              <button
                onClick={() => setCommandOpen(false)}
                className="text-xs text-slate-500 hover:text-slate-300"
              >
                ESC
              </button>
            </div>
            <div className="p-2 text-xs space-y-1">
              <div className="px-3 py-1 text-[10px] font-semibold text-slate-500 uppercase">Quick Actions</div>
              <button
                onClick={() => {
                  onSelectTab('search');
                  setCommandOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded hover:bg-slate-800 flex items-center justify-between text-slate-200"
              >
                <span>Go to Case Search</span>
                <span className="text-[10px] text-slate-500">Search PPO/Employee</span>
              </button>
              <button
                onClick={() => {
                  onSelectTab('workspace');
                  setCommandOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded hover:bg-slate-800 flex items-center justify-between text-slate-200"
              >
                <span>Open Active Case Workspace</span>
                <span className="text-[10px] text-slate-500">PEN-2026-000123</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
