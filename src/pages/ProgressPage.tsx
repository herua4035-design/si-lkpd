import React from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Target, Layers, TrendingUp, Award, CheckCircle2, AlertCircle } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

export const ProgressPage: React.FC = () => {
  const { tpList, cpList, scores } = useData();
  const { currentUser, role } = useAuth();

  // Radar data for mastery dimensions
  const radarData = [
    { subject: 'Pemahaman Konsep', A: 92, fullMark: 100 },
    { subject: 'Ketepatan Jawaban', A: 90, fullMark: 100 },
    { subject: 'Kreativitas Solusi', A: 85, fullMark: 100 },
    { subject: 'Kelengkapan Dokumen', A: 95, fullMark: 100 },
    { subject: 'Refleksi Diri', A: 88, fullMark: 100 },
  ];

  // TP progress items
  const tpProgressData = tpList.map((tp) => {
    const matchedScores = scores.filter((s) => s.tpId === tp.id);
    const scoreVal = matchedScores.length ? matchedScores[0].finalScore : 88;
    const isMastered = scoreVal >= (tp.minimumMasteryScore || 75);

    return {
      code: tp.code,
      desc: tp.description,
      score: scoreVal,
      kktp: tp.minimumMasteryScore || 75,
      isMastered
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
              ANALITIK CAPAIAN BELAJAR
            </span>
            <span className="rounded-md bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
              KURIKULUM MERDEKA
            </span>
          </div>
          <h1 className="mt-2 text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            Progress Belajar Capaian (CP) & Tujuan (TP)
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Monitoring ketercapaian kompetensi berbasis Kriteria Ketercapaian Tujuan Pembelajaran (KKTP).
          </p>
        </div>
      </div>

      {/* Visual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* TP Score Bar Chart */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            Pencapaian Skor Setiap Tujuan Pembelajaran (TP)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Batas tuntas minimum (KKTP): 75
          </p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tpProgressData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="code" fontSize={11} />
                <YAxis domain={[0, 100]} fontSize={11} />
                <Tooltip />
                <Bar dataKey="score" fill="#2563eb" radius={[6, 6, 0, 0]} name="Skor Capaian" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Radar Dimensions */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            Radar Dimensi Kompetensi LKPD
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Penguasaan 5 pilar keterampilan peserta didik
          </p>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#94a3b8" opacity={0.3} />
                <PolarAngleAxis dataKey="subject" fontSize={10} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar name="Kompetensi" dataKey="A" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.5} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detail TP List with Mastery Status */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Daftar Ketercapaian Tujuan Pembelajaran (TP)
        </h3>

        <div className="space-y-3">
          {tpProgressData.map((tp) => (
            <div
              key={tp.code}
              className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200/80 p-4 transition-all hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/60"
            >
              <div className="space-y-1 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-blue-600 px-2 py-0.5 text-xs font-bold text-white">
                    {tp.code}
                  </span>
                  <span className="text-xs font-medium text-slate-500">
                    Target KKTP: {tp.kktp}
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">
                  {tp.desc}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Skor:</span>
                  <span className="text-lg font-extrabold text-blue-600 dark:text-blue-400">
                    {tp.score} / 100
                  </span>
                </div>

                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                    tp.isMastered
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800'
                      : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800'
                  }`}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {tp.isMastered ? 'Tuntas' : 'Perlu Bimbingan'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
