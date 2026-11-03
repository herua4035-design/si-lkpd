import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { PenilaianModal } from '../components/PenilaianModal';
import { Submission, Score } from '../types';
import {
  Award,
  Filter,
  CheckCircle2,
  Clock,
  Search,
  FileSpreadsheet,
  FileText,
  User,
  Sparkles,
  Layers
} from 'lucide-react';
import { getCategoryBadgeColor } from '../utils/calculateScore';
import { exportGradesToExcel } from '../utils/exportExcel';

export const PenilaianPage: React.FC = () => {
  const { submissions, scores, classes, rubrics } = useData();
  const { role } = useAuth();

  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'graded'>('all');
  const [search, setSearch] = useState('');
  const [activeSubmission, setActiveSubmission] = useState<Submission | null>(null);

  const filteredSubmissions = submissions.filter((sub) => {
    const matchesClass = selectedClass === 'all' || sub.classId === selectedClass;
    const isGraded = Boolean(sub.scoreId);
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'graded' && isGraded) ||
      (filterStatus === 'pending' && !isGraded);
    const matchesSearch =
      sub.studentName.toLowerCase().includes(search.toLowerCase()) ||
      sub.studentNisn.includes(search) ||
      sub.assignmentTitle.toLowerCase().includes(search.toLowerCase());

    return matchesClass && matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
              PUSAT PENILAIAN & RUBRIK
            </span>
            <span className="rounded-md bg-orange-100 px-2.5 py-0.5 text-xs font-bold text-orange-700 dark:bg-orange-900/40 dark:text-orange-300">
              FORMULA OTOMATIS
            </span>
          </div>
          <h1 className="mt-2 text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            Penilaian Tugas & LKPD Interaktif
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Penilaian berbasis rubrik 4 kriteria dengan pembobotan otomatis, kategori ketuntasan, dan feedback naratif instan.
          </p>
        </div>

        <button
          onClick={() => exportGradesToExcel(scores, 'Rekap_Penilaian_Guru')}
          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/30 hover:bg-emerald-700 transition-colors"
        >
          <FileSpreadsheet className="h-4 w-4" />
          Ekspor Rekap Excel (.xlsx)
        </button>
      </div>

      {/* Rubric Structure Overview Card */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50/60 p-5 dark:from-slate-900 dark:to-blue-950/40 border border-blue-200/80 dark:border-slate-800">
        <h3 className="text-xs font-bold uppercase tracking-wider text-blue-900 dark:text-blue-300 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-orange-500" />
          Rumus Penilaian Kurikulum Merdeka SMKN 1 Sidayu:
        </h3>
        <p className="mt-1 text-xs text-slate-700 dark:text-slate-300 font-mono">
          nilaiAkhir = (Konsep × 30% + Ketepatan × 30% + Kreativitas × 20% + Kelengkapan × 20%) / 4
        </p>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
          <span className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold">
            1. Pemahaman Konsep (30%)
          </span>
          <span className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold">
            2. Ketepatan Jawaban (30%)
          </span>
          <span className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold">
            3. Kreativitas (20%)
          </span>
          <span className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold">
            4. Kelengkapan (20%)
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Class Filter */}
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 shadow-xs dark:border-slate-800 dark:bg-slate-900 dark:text-white"
          >
            <option value="all">Semua Rombel / Kelas</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.major})
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800 text-xs font-semibold">
            <button
              onClick={() => setFilterStatus('all')}
              className={`rounded-lg px-3 py-1.5 transition-all ${
                filterStatus === 'all' ? 'bg-white dark:bg-slate-700 shadow-xs' : 'text-slate-500'
              }`}
            >
              Semua ({submissions.length})
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`rounded-lg px-3 py-1.5 transition-all ${
                filterStatus === 'pending' ? 'bg-white dark:bg-slate-700 shadow-xs text-orange-600' : 'text-slate-500'
              }`}
            >
              Belum Dinilai ({submissions.filter((s) => !s.scoreId).length})
            </button>
            <button
              onClick={() => setFilterStatus('graded')}
              className={`rounded-lg px-3 py-1.5 transition-all ${
                filterStatus === 'graded' ? 'bg-white dark:bg-slate-700 shadow-xs text-emerald-600' : 'text-slate-500'
              }`}
            >
              Sudah Dinilai ({submissions.filter((s) => s.scoreId).length})
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari siswa atau NISN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* Submissions Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              <tr>
                <th className="p-4">Peserta Didik</th>
                <th className="p-4">Kelas</th>
                <th className="p-4">Judul Tugas LKPD</th>
                <th className="p-4">Waktu Kumpul</th>
                <th className="p-4">Nilai Akhir</th>
                <th className="p-4">Kategori</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    Tidak ditemukan data pengumpulan tugas sesuai filter.
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map((sub) => {
                  const score = scores.find((s) => s.submissionId === sub.id);
                  const badge = score ? getCategoryBadgeColor(score.category) : null;

                  return (
                    <tr key={sub.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                      <td className="p-4">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                            {sub.studentName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">
                              {sub.studentName}
                            </p>
                            <p className="font-mono text-[10px] text-blue-600 dark:text-blue-400">
                              NISN: {sub.studentNisn}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-semibold text-slate-700 dark:text-slate-300">
                        {sub.className}
                      </td>
                      <td className="p-4 max-w-[200px] truncate text-slate-700 dark:text-slate-300 font-medium">
                        {sub.assignmentTitle}
                      </td>
                      <td className="p-4 text-[11px] text-slate-500">
                        {new Date(sub.submittedAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="p-4">
                        {score ? (
                          <span className="text-base font-extrabold text-blue-600 dark:text-blue-400">
                            {score.finalScore}
                          </span>
                        ) : (
                          <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                            <Clock className="h-3 w-3" /> Menunggu
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        {score && badge ? (
                          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${badge.bg} ${badge.text} ${badge.border}`}>
                            {score.category}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[10px]">-</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => setActiveSubmission(sub)}
                          className="rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition-colors"
                        >
                          {score ? 'Lihat / Edit Nilai' : 'Beri Nilai Rubrik'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Penilaian jika dipilih */}
      {activeSubmission && (
        <PenilaianModal
          submission={activeSubmission}
          onClose={() => setActiveSubmission(null)}
          onGraded={() => setActiveSubmission(null)}
        />
      )}
    </div>
  );
};
