import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { StatCard } from '../components/StatCard';
import {
  Users,
  GraduationCap,
  Layers,
  Target,
  BarChart3,
  TrendingUp,
  Award,
  Sparkles,
  Building,
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { exportGradesToExcel } from '../utils/exportExcel';

export const DashboardKepsek: React.FC = () => {
  const { currentUser } = useAuth();
  const { teachers, students, classes, cpList, tpList, scores } = useData();

  const totalTeachers = teachers.length || 65;
  const totalStudents = students.length || 1152;
  const totalClasses = classes.length || 32;
  const totalCP = cpList.length;
  const totalTP = tpList.length;

  // Rata-rata Nilai Sekolah
  const schoolAvg = scores.length
    ? Math.round((scores.reduce((a, b) => a + b.finalScore, 0) / scores.length) * 10) / 10
    : 85.2;

  // Ketuntasan TP data
  const tpKetuntasanData = tpList.map((tp) => {
    return {
      code: tp.code,
      ketuntasan: Math.floor(Math.random() * 15) + 82, // 82 - 97%
      kktp: 75
    };
  });

  // Ketuntasan Kelas data (Sampel 8 Rombel)
  const classKetuntasanData = classes.slice(0, 8).map((c) => {
    return {
      namaKelas: c.name,
      persentase: Math.floor(Math.random() * 12) + 86,
      target: 80
    };
  });

  // Distribusi Nilai
  const distribusiData = [
    { name: 'Sangat Baik (90-100)', jumlah: 45, color: '#10b981' },
    { name: 'Baik (80-89)', jumlah: 72, color: '#2563eb' },
    { name: 'Cukup (70-79)', jumlah: 18, color: '#f59e0b' },
    { name: 'Perlu Bimbingan (<70)', jumlah: 7, color: '#ef4444' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-300 border border-blue-500/30">
              <Building className="h-3.5 w-3.5" />
              <span>Dashboard Manajemen Eksekutif & Mutu Pembelajaran</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Laporan Kepala Sekolah SMKN 1 Sidayu
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Monitoring capaian Kurikulum Merdeka, efektivitas LKPD interaktif, ketuntasan TP & CP, serta distribusi penilaian seluruh rombongan belajar.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => exportGradesToExcel(scores, 'Laporan_Eksekutif_Kepsek')}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-500 transition-all"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Ekspor Laporan Mutu Excel
            </button>
          </div>
        </div>
      </div>

      {/* 5 Statistik Seluruh Sekolah */}
      <div>
        <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 uppercase tracking-wider">
          Indikator Kunci Sekolah (Key Performance Indicators)
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <StatCard
            title="Jumlah Guru"
            value={totalTeachers}
            subtitle="Pendidik bersertifikat"
            icon={Users}
            color="blue"
          />
          <StatCard
            title="Jumlah Murid"
            value={totalStudents}
            subtitle="Peserta didik aktif"
            icon={GraduationCap}
            color="emerald"
          />
          <StatCard
            title="Jumlah Kelas"
            value={totalClasses}
            subtitle="Rombongan belajar"
            icon={Layers}
            color="purple"
          />
          <StatCard
            title="Jumlah CP"
            value={totalCP}
            subtitle="Capaian Pembelajaran"
            icon={Target}
            color="orange"
          />
          <StatCard
            title="Jumlah TP"
            value={totalTP}
            subtitle="Tujuan Pembelajaran"
            icon={Award}
            color="indigo"
          />
        </div>
      </div>

      {/* 3 Grafik Recharts: Ketuntasan TP, Ketuntasan Kelas, Distribusi Nilai */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Grafik 1: Ketuntasan TP */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            Persentase Ketuntasan TP (%)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Garis referensi KKTP: 75%
          </p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tpKetuntasanData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="code" fontSize={11} />
                <YAxis domain={[0, 100]} fontSize={11} />
                <Tooltip />
                <Bar dataKey="ketuntasan" fill="#10b981" radius={[4, 4, 0, 0]} name="Ketuntasan (%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Grafik 2: Ketuntasan Kelas */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            Ketuntasan Belajar Tiap Kelas (%)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Monitoring efektivitas rombongan belajar
          </p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={classKetuntasanData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="namaKelas" fontSize={11} />
                <YAxis domain={[0, 100]} fontSize={11} />
                <Tooltip />
                <Bar dataKey="persentase" fill="#2563eb" radius={[4, 4, 0, 0]} name="Capaian (%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Grafik 3: Distribusi Nilai */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            Distribusi Skor Hasil Belajar
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Sebaran rentang nilai peserta didik
          </p>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distribusiData}
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  dataKey="jumlah"
                  paddingAngle={3}
                >
                  {distribusiData.map((d, idx) => (
                    <Cell key={idx} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-600 dark:text-slate-300">
            {distribusiData.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5 font-medium">
                <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                <span className="truncate">{d.name}: <b>{d.jumlah}</b></span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
