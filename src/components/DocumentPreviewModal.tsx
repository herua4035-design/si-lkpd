import React from 'react';
import { X, Download, FileText, ExternalLink, FileSpreadsheet, Presentation, Video, Image as ImageIcon, FileCheck } from 'lucide-react';
import { AttachmentItem } from '../types';

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  attachment: AttachmentItem | {
    name: string;
    url?: string;
    type?: string;
    size?: string;
    uploadedAt?: string;
  } | null;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  isOpen,
  onClose,
  attachment
}) => {
  if (!isOpen || !attachment) return null;

  const fileType = attachment.type || (attachment.name.endsWith('.pdf') ? 'pdf' : attachment.name.endsWith('.docx') ? 'docx' : 'file');

  const getIcon = () => {
    switch (fileType) {
      case 'pdf':
        return <FileText className="h-6 w-6 text-rose-500" />;
      case 'docx':
      case 'doc':
        return <FileCheck className="h-6 w-6 text-blue-500" />;
      case 'xlsx':
      case 'xls':
        return <FileSpreadsheet className="h-6 w-6 text-emerald-500" />;
      case 'pptx':
      case 'ppt':
        return <Presentation className="h-6 w-6 text-amber-500" />;
      case 'mp4':
      case 'video':
        return <Video className="h-6 w-6 text-purple-500" />;
      case 'png':
      case 'jpg':
      case 'jpeg':
        return <ImageIcon className="h-6 w-6 text-indigo-500" />;
      default:
        return <FileText className="h-6 w-6 text-slate-500" />;
    }
  };

  const handleDownload = () => {
    if (attachment.url && attachment.url !== '#' && !attachment.url.startsWith('data:')) {
      window.open(attachment.url, '_blank');
      return;
    }
    // Create mock download file
    const element = document.createElement('a');
    const file = new Blob([`Dokumen Resmi SI-LKPD SMKN 1 Sidayu\nNama File: ${attachment.name}\nUkuran: ${attachment.size || '1.2 MB'}\nTanggal: ${new Date().toLocaleDateString('id-ID')}`], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = attachment.name;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
      <div
        className="w-full max-w-3xl rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-4 sm:p-5 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-white dark:bg-slate-900 p-2.5 shadow-xs border border-slate-200 dark:border-slate-700">
              {getIcon()}
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white line-clamp-1">
                {attachment.name}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Ukuran: {attachment.size || '2.4 MB'} • Ekstensi: {fileType.toUpperCase()} • SMKN 1 Sidayu LMS
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Unduh File</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-xl p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-600 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content Preview */}
        <div className="p-6 flex-1 overflow-y-auto bg-slate-100 dark:bg-slate-950/60 flex flex-col items-center justify-center min-h-[360px]">
          {fileType === 'pdf' ? (
            <div className="w-full max-w-xl rounded-2xl bg-white dark:bg-slate-900 p-8 shadow-sm border border-slate-200 dark:border-slate-800 text-center space-y-4">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400">
                <FileText className="h-8 w-8" />
              </div>
              <div>
                <h4 className="font-extrabold text-base text-slate-900 dark:text-white">{attachment.name}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Dokumen Kurikulum Merdeka SMKN 1 Sidayu telah diverifikasi oleh Tim Pengembang Kurikulum.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 text-left text-xs text-slate-600 dark:text-slate-300 font-mono space-y-1">
                <p>• Status Dokumen: Terbit & Terbaca</p>
                <p>• Hak Akses: Guru & Peserta Didik Rombel</p>
                <p>• Integrasi: Google Classroom & Microsoft Teams Sync</p>
              </div>
              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-4 py-2 text-xs font-bold hover:opacity-90"
              >
                <Download className="h-4 w-4" /> Buka / Simpan Dokumen PDF Lengkap
              </button>
            </div>
          ) : (
            <div className="w-full max-w-xl rounded-2xl bg-white dark:bg-slate-900 p-8 shadow-sm border border-slate-200 dark:border-slate-800 text-center space-y-4">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                {getIcon()}
              </div>
              <div>
                <h4 className="font-extrabold text-base text-slate-900 dark:text-white">{attachment.name}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Lampiran materi pembelajaran daring interaktif SMKN 1 Sidayu.
                </p>
              </div>
              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 text-white px-4 py-2 text-xs font-bold hover:bg-blue-700"
              >
                <Download className="h-4 w-4" /> Unduh Dokumen ({attachment.size || 'File Lampiran'})
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between text-xs text-slate-400">
          <span>Pratinjau Dokumen Cloud SMKN 1 Sidayu</span>
          <span className="font-mono">T.A. 2026/2027</span>
        </div>
      </div>
    </div>
  );
};
