import React, { useState, useEffect } from 'react';
import type { GeneratedDocument, DocumentVerificationResult } from '../../types/api';
import { verifyDocumentApi } from '../../lib/api';
import { X, QrCode, CheckCircle2, AlertTriangle } from 'lucide-react';

interface QrVerificationModalProps {
  document: GeneratedDocument | null;
  onClose: () => void;
}

export const QrVerificationModal: React.FC<QrVerificationModalProps> = ({ document: doc, onClose }) => {
  const [result, setResult] = useState<DocumentVerificationResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const runVerify = async () => {
      if (!doc) return;
      setLoading(true);
      try {
        const res = await verifyDocumentApi(doc.document_id);
        setResult(res);
      } catch (err) {
        console.error('Verification failed', err);
      } finally {
        setLoading(false);
      }
    };
    runVerify();
  }, [doc]);

  if (!doc) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 text-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <QrCode className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-slate-100 text-sm">Public QR Document Authenticity Verification</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="text-slate-500 text-center py-6">Verifying digital signature digest...</div>
        ) : result ? (
          <div className="space-y-4">
            <div className={`p-4 rounded-xl border flex items-center space-x-3 ${result.is_valid ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300' : 'bg-rose-950/60 border-rose-800 text-rose-300'}`}>
              {result.is_valid ? (
                <CheckCircle2 className="w-6 h-6 shrink-0" />
              ) : (
                <AlertTriangle className="w-6 h-6 shrink-0" />
              )}
              <div>
                <p className="font-bold text-sm">{result.verification_message}</p>
                <p className="text-[11px] opacity-80">Official State Sanction ID: {result.official_sanction_no}</p>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl space-y-2 font-mono">
              <div>
                <p className="text-[10px] text-slate-500 uppercase">Document Title</p>
                <p className="text-slate-200 font-bold">{doc.title}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase">SHA-256 Digest Hash</p>
                <p className="text-blue-400 font-bold break-all text-[10px]">{result.sha256_hash}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase">Issue Timestamp</p>
                <p className="text-slate-300">{new Date(result.issue_date).toLocaleString()}</p>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
