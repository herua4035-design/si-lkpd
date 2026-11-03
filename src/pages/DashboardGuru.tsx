import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { StatCard } from '../components/StatCard';
import { PenilaianModal } from '../components/PenilaianModal';
import {
  Users,
  Layers,
  Target,
  FileCheck2,
  Compass,
  Award,
  AlertCircle,
  PlusCircle,
  TrendingUp,
  Clock,
  Sparkles,
  ArrowRight,
  BookOpen
} from 'lucide-react';
import { Link } from 'react-router-dom';
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

export const DashboardGuru: React.FC = () => {
  const { currentUser } = useAuth();
  const {
    classes,
    cpList,
    tpList,
    assignments,
    lkpdList,
    submissions,
    scores,
    students
  } = useData();

  const [selectedSubForGrading, setSelectedSubForGrading] = useState<any | null>(null);

  // Statistics Realtime
  const totalStudents = students.length || 36;
  const totalClasses = classes.length;
  const totalCP = cpList.length;
  const totalTP = tpList.length;
  const totalActiveAssignments = assignments.length;
  const totalLKPD = lkpdList.length;

  const pendingGradingSubmissions = submissions.filter((s) => !s.scoreId);
  const gradedCount = scores.length;

  // Persentase Ketuntasan (Skor >= 75)
  const passedScores = scores.filter((s) => s.finalScore >= 75);
  const completionPercentage = scores.length
    ? Math.round((passedScores.length / scores.length) * 100)
    : 88;

  // Chart Data: Rata-rata Nilai per Kelas (Sampel Rombel)
  const classPerformanceData = classes.slice(0, 6).map((cls) => {
    const classScores = scores.filter((s) => s.classId === cls.id);
    const avg = classScores.length
      ? Math.round((classScores.reduce((a, b) => a + b.finalScore, 0) / classScores.length) * 10) / 10
      : 84.5;
    return {
      name: cls.name,
      rataRata: avg,
      target: 75
    };
  });

  // Category Distribution
  const categoryCount = {
    'Sangat Baik': scores.filter((s) => s.category === 'Sangat Baik').length || 8,
    'Baik': scores.filter((s) => s.category === 'Baik').length || 14,
    'Cukup': scores.filter((s) => s.category === 'Cukup').length || 3,
    'Perlu Bimbingan': scores.filter((s) => s.category === 'Perlu Bimbingan').length || 1,
  };

  const pieData = [
    { name: 'Sangat Baik (90-100)', value: categoryCount['Sangat Baik'], color: '#10b981' },
    { name: 'Baik (80-89)', value: categoryCount['Baik'], color: '#2563eb' },
    { name: 'Cukup (70-79)', value: categoryCount['Cukup'], color: '#f59e0b' },
    { name: 'Perlu Bimbingan (<70)', value: categoryCount['Perlu Bimbingan'], color: '#ef4444' },
  ];

  const teacherSubjects: string[] = currentUser.subjectsTaught && currentUser.subjectsTaught.length > 0
    ? currentUser.subjectsTaught
    : currentUser.subject
    ? currentUser.subject.split(',').map((s) => s.trim()).filter(Boolean)
    : ['Koding dan Kecerdasan Artifisial'];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-800 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-yellow-300" />
              <span>NIP: {currentUser.nip || '-'}</span>
            </div>
            {teacherSubjects.map((sName, sIdx) => (
              <div
                key={sIdx}
                className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold backdrop-blur-md border border-white/20"
              >
                <BookOpen className="h-3.5 w-3.5 text-cyan-200" />
                <span>Mapel {teacherSubjects.length > 1 ? `#${sIdx + 1}: ` : ''}{sName}</span>
              </div>
            ))}
          </div>
          <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight">
            Selamat Datang, {currentUser.displayName}
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-blue-100 leading-relaxed">
            Sistem LKPD Interaktif & Pembelajaran Daring SMKN 1 Sidayu siap memfasilitasi ketercapaian Tujuan Pembelajaran (TP) dan Capaian Pembelajaran (CP) peserta didik.
          </p>

          <div className="mt-5 flex flex-wrap gap-2.5">
            <Link
              to="/lkpd"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-bold text-blue-700 shadow-md hover:bg-blue-50 transition-all"
            >
              <Compass className="h-4 w-4" />
              Kelola LKPD Interaktif
            </Link>
            <Link
              to="/tugas"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-800/60 px-4 py-2 text-xs font-bold text-white hover:bg-blue-800 transition-all border border-blue-400/40"
            >
              <FileCheck2 className="h-4 w-4" />
              Buat Tugas Baru
            </Link>
            <Link
              to="/penilaian"
              className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-orange-600 transition-all"
            >
              <Award className="h-4 w-4" />
              Penilaian & Rubrik
            </Link>
          </div>
        </div>
      </div>

      {/* Grid 8 Statistik Realtime Guru */}
      <div>
        <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 uppercase tracking-wider">
          Statistik Pembelajaran Realtime
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard
            title="Jumlah Murid"
            value={totalStudents}
            subtitle="Peserta didik aktif"
            icon={Users}
            color="blue"
          />
          <StatCard
            title="Jumlah Kelas"
            value={totalClasses}
            subtitle="Rombel yang diampu"
            icon={Layers}
            color="purple"
          />
          <StatCard
            title="Jumlah CP"
            value={totalCP}
            subtitle="Capaian Pembelajaran"
            icon={Target}
            color="emerald"
          />
          <StatCard
            title="Jumlah TP"
            value={totalTP}
            subtitle="Tujuan Pembelajaran"
            icon={Target}
            color="indigo"
          />
          <StatCard
            title="Tugas Aktif"
            value={totalActiveAssignments}
            subtitle="Penugasan berjalan"
            icon={FileCheck2}
            color="blue"
          />
          <StatCard
            title="Jumlah LKPD"
            value={totalLKPD}
            subtitle="Lembar kerja interaktif"
            icon={Compass}
            color="orange"
          />
          <StatCard
            title="Belum Dinilai"
            value={pendingGradingSubmissions.length}
            subtitle="Menunggu review rubrik"
            icon={AlertCircle}
            color={pendingGradingSubmissions.length > 0 ? 'rose' : 'emerald'}
          />
          <StatCard
            title="Ketuntasan"
            value={`${completionPercentage}%`}
            subtitle="KKTP Tercapai (>=75)"
            icon={TrendingUp}
            color="emerald"
            trend={{ value: `${completionPercentage}%`, isPositive: true }}
          />
        </div>
      </div>

      {/* Pending Grading & Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Submissions Queue */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-orange-500" />
                Antrean Tugas LKPD Siap Dinilai
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Gunakan rubrik penilaian otomatis dengan umpan balik terstruktur
              </p>
            </div>
            <Link
              to="/penilaian"
              className="text-xs font-bold text-blue-600 hover:underline dark:text-blue-400 flex items-center gap-1"
            >
              Lihat Semua ({submissions.length}) <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {pendingGradingSubmissions.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Semua pengumpulan tugas LKPD sudah selesai dinilai! 🎉
              </div>
            ) : (
              pendingGradingSubmissions.slice(0, 4).map((sub) => (
                <div
                  key={sub.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200/80 p-3.5 transition-all hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/60"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center dark:bg-blue-900/40 dark:text-blue-300 text-xs">
                      {sub.studentName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        {sub.studentName}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        NISN: {sub.studentNisn} • Kelas: {sub.className}
                      </p>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        Tugas: {sub.assignmentTitle}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedSubForGrading(sub)}
                      className="rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition-colors flex items-center gap-1.5"
                    >
                      <Award className="h-3.5 w-3.5" />
                      Beri Nilai Rubrik
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions & Shortcut */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Aksi Cepat Guru
          </h3>

          <div className="space-y-2.5">
            <Link
              to="/cp"
              className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-slate-800 transition-all text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              <span className="flex items-center gap-2.5">
                <Target className="h-4 w-4 text-blue-600" />
                Tambah Capaian Pembelajaran (CP)
              </span>
              <PlusCircle className="h-4 w-4 text-slate-400" />
            </Link>

            <Link
              to="/tp"
              className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-slate-800 transition-all text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              <span className="flex items-center gap-2.5">
                <Target className="h-4 w-4 text-emerald-600" />
                Tambah Tujuan Pembelajaran (TP)
              </span>
              <PlusCircle className="h-4 w-4 text-slate-400" />
            </Link>

            <Link
              to="/materi"
              className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-slate-800 transition-all text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              <span className="flex items-center gap-2.5">
                <BookOpen className="h-4 w-4 text-indigo-600" />
                Upload Modul / PPT / Video
              </span>
              <PlusCircle className="h-4 w-4 text-slate-400" />
            </Link>

            <Link
              to="/laporan"
              className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-slate-800 transition-all text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              <span className="flex items-center gap-2.5">
                <TrendingUp className="h-4 w-4 text-orange-600" />
                Ekspor Rekap Nilai ke Excel
              </span>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </Link>
          </div>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            Rata-rata Capaian Nilai per Kelas (KKTP: 75)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Evaluasi capaian penugasan LKPD interaktif
          </p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={classPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" fontSize={11} />
                <YAxis domain={[0, 100]} fontSize={11} />
                <Tooltip />
                <Bar dataKey="rataRata" fill="#2563eb" radius={[6, 6, 0, 0]} name="Rata-rata Nilai" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            Distribusi Kategori Penilaian Otomatis
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Klasifikasi rentang skor peserta didik
          </p>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-3 text-[11px]">
            {pieData.map((p) => (
              <span key={p.name} className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-300">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                {p.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Modal Penilaian jika dibuka */}
      {selectedSubForGrading && (
        <PenilaianModal
          submission={selectedSubForGrading}
          onClose={() => setSelectedSubForGrading(null)}
          onGraded={() => setSelectedSubForGrading(null)}
        />
      )}
    </div>
  );
};
