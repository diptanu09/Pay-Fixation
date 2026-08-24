import React, { useState } from 'react';
import { verifyDocumentApi } from '../lib/api';
import type { DocumentVerificationResult } from '../types/api';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

export const PublicVerifyPage: React.FC = () => {
  const [docId, setDocId] = useState('');
  const [result, setResult] = useState<DocumentVerificationResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docId.trim()) return;
    setLoading(true);
    try {
      const res = await verifyDocumentApi(docId.trim());
      setResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 text-xs font-sans">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center font-black text-xl text-white mx-auto shadow-lg">
            PF
          </div>
          <h1 className="text-lg font-bold text-slate-100">State of Tripura · Document Authenticity Verification</h1>
          <p className="text-xs text-slate-400">Public portal for validating official PAYFIX pension sanction orders and certificates</p>
        </div>

        <form onSubmit={handleVerify} className="space-y-3">
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Document ID or Sanction Number *</label>
            <div className="relative">
              <input
                type="text"
                value={docId}
                onChange={(e) => setDocId(e.target.value)}
                placeholder="Enter Document UUID or PAYFIX-AUTH-2026-XXXXXX..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-slate-100 font-mono focus:outline-none focus:border-blue-500"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="absolute right-1.5 top-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-md transition shadow"
              >
                {loading ? 'Verifying...' : 'Verify Authenticity'}
              </button>
            </div>
          </div>
        </form>

        {result && (
          <div className="space-y-4 pt-2">
            <div className={`p-4 rounded-xl border flex items-center space-x-3 ${result.is_valid ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300' : 'bg-rose-950/60 border-rose-800 text-rose-300'}`}>
              {result.is_valid ? (
                <CheckCircle2 className="w-6 h-6 shrink-0 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-6 h-6 shrink-0 text-rose-400" />
              )}
              <div>
                <p className="font-bold text-sm">{result.verification_message}</p>
                <p className="text-[11px] opacity-80 font-mono">Sanction: {result.official_sanction_no}</p>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2 font-mono text-xs">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-500">Document Type:</span>
                <span className="text-slate-200 font-bold">{result.document_type}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-500">Issue Date:</span>
                <span className="text-slate-200">{new Date(result.issue_date).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">SHA-256 Digest:</span>
                <span className="text-blue-400 font-bold">{result.sha256_hash.substring(0, 16)}...</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
