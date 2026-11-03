import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { exportGradesToExcel } from '../utils/exportExcel';
import { printStudentReport } from '../utils/exportPDF';
import {
  BarChart3,
  FileSpreadsheet,
  Printer,
  Download,
  Filter,
  Layers,
  Award,
  Search,
  CheckCircle2
} from 'lucide-react';
import { getCategoryBadgeColor } from '../utils/calculateScore';

export const LaporanPage: React.FC = () => {
  const { scores, classes, cpList, tpList } = useData();
  const { currentUser } = useAuth();

  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredScores = scores.filter((s) => {
    const matchesClass = selectedClass === 'all' || s.classId === selectedClass;
    const matchesCat = selectedCategory === 'all' || s.category === selectedCategory;
    return matchesClass && matchesCat;
  });

  const handleExportExcel = () => {
    exportGradesToExcel(filteredScores, 'Rekapitulasi_Nilai_LKPD');
  };

  const handlePrintFirst = () => {
    if (filteredScores.length > 0) {
      const top = filteredScores[0];
      printStudentReport(
        top.studentName,
        top.studentNisn,
        top.classId || 'X PPLG 1',
        filteredScores.filter((sc) => sc.studentId === top.studentId),
        cpList,
        tpList
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
              LEMBAR REKAPITULASI
            </span>
            <span className="rounded-md bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
              SMKN 1 SIDAYU
            </span>
          </div>
          <h1 className="mt-2 text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            Laporan Rekap Nilai & Ketuntasan Belajar
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Ekspor rekapitulasi nilai LKPD format Excel (.xlsx) dan pencetakan rapor capaian kompetensi format PDF.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/30 hover:bg-emerald-700 transition-colors"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Ekspor ke Excel (.xlsx)
          </button>
          <button
            onClick={handlePrintFirst}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-600/30 hover:bg-blue-700 transition-colors"
          >
            <Printer className="h-4 w-4" />
            Cetak Transkrip Rapor
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 shadow-xs dark:border-slate-800 dark:bg-slate-900 dark:text-white"
        >
          <option value="all">Semua Rombel</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 shadow-xs dark:border-slate-800 dark:bg-slate-900 dark:text-white"
        >
          <option value="all">Semua Kategori Nilai</option>
          <option value="Sangat Baik">Sangat Baik (90-100)</option>
          <option value="Baik">Baik (80-89)</option>
          <option value="Cukup">Cukup (70-79)</option>
          <option value="Perlu Bimbingan">Perlu Bimbingan (&lt;70)</option>
        </select>
      </div>

      {/* Rekap Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              <tr>
                <th className="p-3.5">No</th>
                <th className="p-3.5">Nama Peserta Didik</th>
                <th className="p-3.5">NISN</th>
                <th className="p-3.5">Kelas</th>
                <th className="p-3.5">Nilai Akhir</th>
                <th className="p-3.5">Kategori</th>
                <th className="p-3.5">Umpan Balik Guru</th>
                <th className="p-3.5">Tanggal Dinilai</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredScores.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    Tidak ada data rekap nilai untuk filter ini.
                  </td>
                </tr>
              ) : (
                filteredScores.map((sc, i) => {
                  const badge = getCategoryBadgeColor(sc.category);
                  return (
                    <tr key={sc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="p-3.5 text-slate-400">{i + 1}</td>
                      <td className="p-3.5 font-bold text-slate-900 dark:text-white">{sc.studentName}</td>
                      <td className="p-3.5 font-mono text-blue-600 dark:text-blue-400">{sc.studentNisn}</td>
                      <td className="p-3.5">{sc.classId || 'X PPLG 1'}</td>
                      <td className="p-3.5">
                        <span className="text-base font-extrabold text-blue-600 dark:text-blue-400">
                          {sc.finalScore}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.bg} ${badge.text} ${badge.border}`}>
                          {sc.category}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-600 dark:text-slate-300 max-w-xs truncate">
                        {sc.feedback}
                      </td>
                      <td className="p-3.5 text-slate-400 text-[11px]">
                        {new Date(sc.gradedAt).toLocaleDateString('id-ID')}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
