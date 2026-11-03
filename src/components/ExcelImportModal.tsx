import React, { useState } from 'react';
import { parseStudentsExcel, downloadStudentTemplate, ImportedStudentRow } from '../utils/exportExcel';
import { useData } from '../context/DataContext';
import { X, Upload, FileSpreadsheet, Download, CheckCircle2, AlertCircle, Users } from 'lucide-react';
import Swal from 'sweetalert2';

interface ExcelImportModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({ onClose, onSuccess }) => {
  const { importStudentsBatch } = useData();
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ImportedStudentRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setErrorMsg(null);
    setLoading(true);

    try {
      const rows = await parseStudentsExcel(selectedFile);
      if (rows.length === 0) {
        setErrorMsg('Tidak ditemukan data murid yang valid. Pastikan kolom memuat Nama dan NISN.');
      } else {
        setParsedRows(rows);
      }
    } catch (err: any) {
      setErrorMsg('Gagal membaca file Excel. ' + (err.message || ''));
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToDatabase = () => {
    if (parsedRows.length === 0) return;

    try {
      const count = importStudentsBatch(parsedRows);
      Swal.fire({
        icon: 'success',
        title: 'Import Data Berhasil!',
        html: `<p>Berhasil mengimpor <b>${count}</b> peserta didik baru ke database SMKN 1 Sidayu.</p>`,
        confirmButtonColor: '#2563eb'
      });
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal Menyimpan',
        text: err.message || 'Terjadi kesalahan sistem.'
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative my-8 w-full max-w-2xl rounded-2xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Import Data Peserta Didik dari Excel
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Membaca otomatis kolom Nama Murid, NISN, Kelas, dan Jurusan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                Unduh Format File Excel Standar
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Gunakan template resmi agar struktur kolom sesuai sistem
              </p>
            </div>
            <button
              type="button"
              onClick={downloadStudentTemplate}
              className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
            >
              <Download className="h-3.5 w-3.5 text-emerald-600" />
              Unduh Template (.xlsx)
            </button>
          </div>

          {/* Upload Area */}
          <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:border-blue-500 transition-colors dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/20">
            <Upload className="mx-auto h-9 w-9 text-slate-400" />
            <p className="mt-2 text-xs font-bold text-slate-700 dark:text-slate-300">
              Pilih atau seret file Excel/CSV ke sini
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Mendukung format .xlsx, .xls, atau .csv
            </p>
            <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-sm">
              <span>Telusuri File...</span>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
            {file && (
              <p className="mt-3 text-xs font-medium text-blue-600 dark:text-blue-400">
                📄 {file.name} ({Math.round(file.size / 1024)} KB)
              </p>
            )}
          </div>

          {errorMsg && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Table Preview */}
          {parsedRows.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Pratinjau Data: {parsedRows.length} Siswa Terbaca
                </span>
                <span className="text-[11px] text-slate-400">Menampilkan hingga 5 baris pertama</span>
              </div>

              <div className="max-h-52 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 sticky top-0">
                    <tr>
                      <th className="p-2.5">No</th>
                      <th className="p-2.5">Nama Murid</th>
                      <th className="p-2.5">NISN</th>
                      <th className="p-2.5">Kelas</th>
                      <th className="p-2.5">Jurusan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {parsedRows.slice(0, 5).map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="p-2.5 text-slate-400">{i + 1}</td>
                        <td className="p-2.5 font-semibold text-slate-900 dark:text-white">{row.displayName}</td>
                        <td className="p-2.5 font-mono text-blue-600 dark:text-blue-400">{row.nisn}</td>
                        <td className="p-2.5">{row.className}</td>
                        <td className="p-2.5 text-slate-500">{row.major}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={parsedRows.length === 0 || loading}
            onClick={handleSaveToDatabase}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/30 hover:bg-emerald-700 disabled:opacity-50 transition-colors"
          >
            <CheckCircle2 className="h-4 w-4" />
            Simpan {parsedRows.length} Murid ke Database
          </button>
        </div>
      </div>
    </div>
  );
};
