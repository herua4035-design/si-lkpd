import React from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Award, Printer, CheckCircle2, Sparkles, TrendingUp, BookOpen, Layers } from 'lucide-react';
import { getCategoryBadgeColor } from '../utils/calculateScore';
import { printStudentReport } from '../utils/exportPDF';

export const NilaiSayaPage: React.FC = () => {
  const { scores, assignments, cpList, tpList } = useData();
  const { currentUser } = useAuth();

  // Filter student scores
  const myScores = scores.filter((s) => s.studentId === currentUser.uid);

  const average = myScores.length
    ? Math.round((myScores.reduce((a, b) => a + b.finalScore, 0) / myScores.length) * 10) / 10
    : 95;

  const handlePrint = () => {
    printStudentReport(
      currentUser.displayName,
      currentUser.nisn || '0075648921',
      currentUser.className || 'X PPLG 1',
      myScores,
      cpList,
      tpList
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
              REKAPITULASI HASIL ASESMEN
            </span>
            <span className="rounded-md bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
              SMKN 1 SIDAYU
            </span>
          </div>
          <h1 className="mt-2 text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            Nilai & Umpan Balik Belajar
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Hasil evaluasi pengerjaan LKPD interaktif dan catatan bimbingan guru pengampu.
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-600/30 hover:bg-blue-700 transition-colors"
        >
          <Printer className="h-4 w-4" />
          Cetak Lembar Nilai Resmi (PDF)
        </button>
      </div>

      {/* Summary Card */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white shadow-lg flex flex-wrap items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-200">
            Rata-rata Capaian Kompetensi
          </span>
          <div className="mt-1 flex items-baseline gap-3">
            <h2 className="text-4xl font-extrabold tracking-tight">{average}</h2>
            <span className="text-blue-200 text-sm">/ 100</span>
            <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold backdrop-blur-md">
              {average >= 75 ? 'TUNTAS (Memenuhi KKTP)' : 'PERLU BIMBINGAN'}
            </span>
          </div>
          <p className="mt-2 text-xs text-blue-100">
            Peserta Didik: <b>{currentUser.displayName}</b> • NISN: <b className="font-mono">{currentUser.nisn || '0075648921'}</b> • Kelas: <b>{currentUser.className || 'X PPLG 1'}</b>
          </p>
        </div>

        <div className="rounded-xl bg-white/10 p-4 backdrop-blur-md border border-white/20 text-xs space-y-1">
          <p className="font-bold text-yellow-300 flex items-center gap-1.5">
            <Sparkles className="h-4 w-4" /> Standar Kategori Nilai:
          </p>
          <p>• 90 - 100: Sangat Baik</p>
          <p>• 80 - 89: Baik</p>
          <p>• 70 - 79: Cukup</p>
          <p>• &lt; 70: Perlu Bimbingan</p>
        </div>
      </div>

      {/* Nilai Saya Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <tr>
                <th className="p-4" style={{ width: '35%' }}>Tugas / LKPD</th>
                <th className="p-4" style={{ width: '15%' }}>Nilai Akhir</th>
                <th className="p-4" style={{ width: '15%' }}>Kategori</th>
                <th className="p-4">Umpan Balik Guru & Catatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {myScores.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-400">
                    Belum ada nilai yang masuk. Selesaikan LKPD untuk mendapatkan penilaian.
                  </td>
                </tr>
              ) : (
                myScores.map((sc) => {
                  const targetAssign = assignments.find((a) => a.id === sc.assignmentId);
                  const badge = getCategoryBadgeColor(sc.category);

                  return (
                    <tr key={sc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="p-4">
                        <p className="font-bold text-slate-900 dark:text-white">
                          {targetAssign?.title || 'Penugasan LKPD Interaktif 01'}
                        </p>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          Dinilai oleh: {sc.gradedBy} • {new Date(sc.gradedAt).toLocaleDateString('id-ID')}
                        </span>
                      </td>

                      <td className="p-4">
                        <span className="text-xl font-extrabold text-blue-600 dark:text-blue-400">
                          {sc.finalScore}
                        </span>
                        <span className="text-slate-400 text-xs"> / 100</span>
                      </td>

                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.bg} ${badge.text} ${badge.border}`}>
                          {sc.category}
                        </span>
                      </td>

                      <td className="p-4 text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50/50 dark:bg-slate-800/30 rounded-r-xl">
                        <p className="font-medium">{sc.feedback}</p>
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
