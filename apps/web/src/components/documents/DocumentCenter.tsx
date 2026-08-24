import React, { useState, useEffect } from 'react';
import type { GeneratedDocument, OfficialPackageManifest } from '../../types/api';
import {
  generateDocumentsApi,
  fetchCaseDocumentsApi,
  downloadPackageManifestApi,
} from '../../lib/api';
import { DocumentPreviewModal } from './DocumentPreviewModal';
import { QrVerificationModal } from './QrVerificationModal';
import {
  FileText,
  Download,
  Eye,
  QrCode,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

interface DocumentCenterProps {
  caseId: string;
}

export const DocumentCenter: React.FC<DocumentCenterProps> = ({ caseId }) => {
  const [documents, setDocuments] = useState<GeneratedDocument[]>([]);
  const [manifest, setManifest] = useState<OfficialPackageManifest | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<GeneratedDocument | null>(null);
  const [qrDoc, setQrDoc] = useState<GeneratedDocument | null>(null);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const docs = await fetchCaseDocumentsApi(caseId);
      setDocuments(docs);
      if (docs.length > 0) {
        const m = await downloadPackageManifestApi(caseId);
        setManifest(m);
      }
    } catch (err) {
      console.error('Failed to load documents', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (caseId) loadDocuments();
  }, [caseId]);

  const handleGenerateSuite = async () => {
    setGenerating(true);
    try {
      await generateDocumentsApi(caseId);
      await loadDocuments();
    } catch (err: any) {
      alert(err.message || 'Failed to generate document suite');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadManifest = () => {
    if (!manifest) return;
    const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `manifest_${manifest.official_sanction_no}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 text-xs">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <FileText className="w-6 h-6 text-blue-400 shrink-0" />
          <div>
            <h2 className="text-base font-bold text-slate-100">Official Document & Reporting Center</h2>
            <p className="text-xs text-slate-400">Versioned statutory document suite rendered exclusively from sealed calculation snapshots</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {manifest && (
            <button
              onClick={handleDownloadManifest}
              className="flex items-center space-x-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Manifest JSON</span>
            </button>
          )}

          <button
            onClick={handleGenerateSuite}
            disabled={generating}
            className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow transition disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{generating ? 'Generating Suite...' : 'Generate Document Suite'}</span>
          </button>
        </div>
      </div>

      {/* Package Manifest Bar */}
      {manifest && (
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono">
          <div className="flex items-center space-x-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <p className="font-bold text-slate-200">Official Sanction Package: {manifest.official_sanction_no}</p>
              <p className="text-[11px] text-slate-400">Package Hash: {manifest.package_hash}</p>
            </div>
          </div>

          <span className="px-3 py-1 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded font-bold text-[10px]">
            ARCHIVAL PACKAGE READY ({manifest.documents.length} DOCS)
          </span>
        </div>
      )}

      {/* Generated Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="text-slate-500 text-center py-8 col-span-full">Loading generated document records...</div>
        ) : documents.length === 0 ? (
          <div className="text-slate-500 text-center py-8 col-span-full bg-slate-900 border border-slate-800 rounded-xl">
            No documents generated yet. Click "Generate Document Suite" above to generate the official package.
          </div>
        ) : (
          documents.map((doc) => (
            <div key={doc.document_id} className="bg-slate-900 border border-slate-800 hover:border-blue-500/50 transition rounded-xl p-4 space-y-3 shadow-lg">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-100 text-xs">{doc.title}</h3>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">{doc.template_code} v{doc.template_version}</p>
                </div>
                <span className="px-2 py-0.5 bg-blue-950 text-blue-300 border border-blue-800 rounded font-mono text-[9px] font-bold">
                  SHA-256
                </span>
              </div>

              <div className="bg-slate-950 border border-slate-800 p-2.5 rounded-lg space-y-1 font-mono text-[10px]">
                <p className="text-slate-400 truncate"><span className="text-slate-600">Digest:</span> {doc.sha256_hash}</p>
                <p className="text-slate-400"><span className="text-slate-600">Issued:</span> {new Date(doc.generated_at).toLocaleDateString()}</p>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-1">
                <button
                  onClick={() => setQrDoc(doc)}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md transition"
                  title="Verify QR Code"
                >
                  <QrCode className="w-3.5 h-3.5 text-blue-400" />
                </button>
                <button
                  onClick={() => setPreviewDoc(doc)}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-md transition shadow"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modals */}
      <DocumentPreviewModal document={previewDoc} onClose={() => setPreviewDoc(null)} />
      <QrVerificationModal document={qrDoc} onClose={() => setQrDoc(null)} />
    </div>
  );
};
