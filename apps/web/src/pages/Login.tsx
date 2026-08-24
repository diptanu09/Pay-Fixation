import React, { useState } from 'react';
import { loginApi } from '../lib/api';
import type { User } from '../types/api';
import { Shield, Lock, User as UserIcon, AlertCircle } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (user: User, token: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('Password123!');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await loginApi(username, password);
      onLoginSuccess(data.user, data.token);
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xl mb-3">
            <Shield className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-bold text-slate-100">PAYFIX</h1>
          <p className="text-xs text-slate-400 font-medium">State of Tripura · Pay Fixation & Pension System</p>
        </div>

        {error && (
          <div className="mb-4 bg-rose-950/60 border border-rose-800 text-rose-300 px-3 py-2 rounded-lg text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Username
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="Enter officer username"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="Enter password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 rounded-lg text-sm transition-all shadow-lg hover:shadow-blue-600/20 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In to Workspace'}
          </button>
        </form>

        <div className="mt-8 pt-4 border-t border-slate-800/60 text-center text-[10px] text-slate-500">
          <p>Restricted Official Use · Government of Tripura</p>
          <p className="mt-0.5 font-mono">Environment: PRODUCTION · API v1.0</p>
        </div>
      </div>
    </div>
  );
};
