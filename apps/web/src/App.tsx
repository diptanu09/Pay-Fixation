import { useState, useEffect } from 'react';
import { Login } from './pages/Login';
import { Shell } from './components/layout/Shell';
import { CaseSearch } from './pages/CaseSearch';
import { CaseWorkspace } from './pages/CaseWorkspace';
import { WorkQueuesPage } from './pages/WorkQueuesPage';
import { MigrationPage } from './pages/MigrationPage';
import { SystemDiagnosticsPage } from './pages/SystemDiagnosticsPage';
import { PilotDashboardPage } from './pages/PilotDashboardPage';
import { PilotOperationsPage } from './pages/PilotOperationsPage';
import { ProductionOperationsPage } from './pages/ProductionOperationsPage';
import { OperationsDashboardPage } from './pages/OperationsDashboardPage';
import type { User } from './types/api';

export function App() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState('search');
  const [activeCaseId, setActiveCaseId] = useState<string | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('payfix_token');
    const savedUser = localStorage.getItem('payfix_user');
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('payfix_token');
        localStorage.removeItem('payfix_user');
      }
    }
  }, []);

  const handleLoginSuccess = (user: User, token: string) => {
    setUser(user);
    setToken(token);
    localStorage.setItem('payfix_token', token);
    localStorage.setItem('payfix_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('payfix_token');
    localStorage.removeItem('payfix_user');
  };

  if (!token || !user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  const handleSelectCase = (caseId: string) => {
    setActiveCaseId(caseId);
    setCurrentTab('workspace');
  };

  return (
    <Shell
      user={user}
      onLogout={handleLogout}
      currentTab={currentTab}
      onSelectTab={setCurrentTab}
    >
      {currentTab === 'search' && <CaseSearch onSelectCase={handleSelectCase} />}
      {currentTab === 'queues' && <WorkQueuesPage onSelectCase={handleSelectCase} />}
      {currentTab === 'migration' && <MigrationPage />}
      {currentTab === 'diagnostics' && <SystemDiagnosticsPage />}
      {currentTab === 'pilot' && <PilotDashboardPage />}
      {currentTab === 'golive' && <PilotOperationsPage />}
      {currentTab === 'production' && <OperationsDashboardPage />}
      {currentTab === 'cutover' && <ProductionOperationsPage />}
      {currentTab === 'workspace' && (
        <CaseWorkspace caseId={activeCaseId || 'PEN-2026-000123'} />
      )}
      {currentTab === 'payfix' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-slate-300">
          <h2 className="text-base font-bold text-slate-100 mb-2">Pay Fixation Engine</h2>
          <p className="text-xs text-slate-400">ROP 2017 fitment and option calculation workspace</p>
        </div>
      )}
      {currentTab === 'pension' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-slate-300">
          <h2 className="text-base font-bold text-slate-100 mb-2">Pension Calculation Engine</h2>
          <p className="text-xs text-slate-400">Statutory pension, DCRG ceiling, and commutation factor engine</p>
        </div>
      )}
      {currentTab === 'audit' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-slate-300">
          <h2 className="text-base font-bold text-slate-100 mb-2">System Audit Trail</h2>
          <p className="text-xs text-slate-400">Immutable request tracking and state transition history</p>
        </div>
      )}
    </Shell>
  );
}

export default App;
