import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { StatCard } from '../components/StatCard';
import {
  GraduationCap,
  FileCheck2,
  Clock,
  Award,
  TrendingUp,
  Compass,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Calendar,
  Layers
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardMurid: React.FC = () => {
  const { currentUser } = useAuth();
  const { assignments, submissions, scores, materials, announcements, lkpdList, tpList, cpList } = useData();

  // Filter student submissions
  const mySubmissions = submissions.filter((s) => s.studentId === currentUser.uid);
  const myScores = scores.filter((s) => s.studentId === currentUser.uid);

  // Active assignments
  const activeAssignmentsCount = assignments.length;

  // Nearest deadline
  const sortedByDeadline = [...assignments].sort(
    (a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
  );
  const nearestDeadline = sortedByDeadline[0]
    ? new Date(sortedByDeadline[0].deadline).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    : 'Tidak ada';

  // Last score
  const lastScore = myScores.length ? myScores[0].finalScore : 95;

  // Average score
  const avgScore = myScores.length
    ? Math.round((myScores.reduce((a, b) => a + b.finalScore, 0) / myScores.length) * 10) / 10
    : 95;

  // Determine submission status for each assignment
  const assignmentsWithStatus = assignments.map((a) => {
    const sub = mySubmissions.find((s) => s.assignmentId === a.id);
    const isOverdue = new Date(a.deadline).getTime() < Date.now();

    let statusType: 'submitted' | 'pending' | 'late' = 'pending';
    if (sub) {
      statusType = 'submitted';
    } else if (isOverdue) {
      statusType = 'late';
    }

    return {
      ...a,
      statusType,
      submission: sub,
      score: sub?.scoreId ? myScores.find((sc) => sc.id === sub.scoreId) : undefined
    };
  });

  return (
    <div className="space-y-6">
      {/* Student Profile Identity Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-800 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-yellow-300" />
              <span>Portal Siswa SMKN 1 SIDAYU</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Halo, {currentUser.displayName}!
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 max-w-xl">
              Selamat datang di sistem pembelajaran daring dan LKPD interaktif. Pantau tugas, pelajari materi modul, dan tingkatkan capaian kompetensi belajar Anda.
            </p>
          </div>

          {/* Student Badge Card */}
          <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-md border border-white/20 min-w-[240px]">
            <p className="text-[11px] font-bold uppercase tracking-wider text-blue-200">
              Identitas Peserta Didik
            </p>
            <div className="mt-2 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-blue-100">Nama:</span>
                <span className="font-bold">{currentUser.displayName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-100">Kelas:</span>
                <span className="font-bold">{currentUser.className || 'X PPLG 1'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-100">NISN:</span>
                <span className="font-bold font-mono text-yellow-300">{currentUser.nisn || '0075648921'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-100">Jurusan:</span>
                <span className="font-semibold text-right max-w-[140px] truncate">{currentUser.major || 'PPLG'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Cards: Tugas Aktif, Deadline Terdekat, Nilai Terakhir, Rata-rata */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="Tugas Aktif"
          value={activeAssignmentsCount}
          subtitle="Penugasan semester berjalan"
          icon={FileCheck2}
          color="blue"
        />
        <StatCard
          title="Deadline Terdekat"
          value={nearestDeadline}
          subtitle="Segera selesaikan LKPD"
          icon={Clock}
          color="orange"
        />
        <StatCard
          title="Nilai Terakhir"
          value={lastScore}
          subtitle="LKPD Prompt Engineering"
          icon={Award}
          color="emerald"
        />
        <StatCard
          title="Rata-rata Nilai"
          value={avgScore}
          subtitle="KKTP: 75 (Tuntas)"
          icon={TrendingUp}
          color="purple"
          trend={{ value: `${avgScore}`, isPositive: true }}
        />
      </div>

      {/* Quick Interactive LKPD Highlight */}
      {lkpdList.length > 0 && (
        <div className="rounded-2xl border-2 border-blue-500/30 bg-gradient-to-r from-blue-50 via-white to-indigo-50/50 p-5 shadow-sm dark:border-blue-900/60 dark:from-slate-900 dark:via-slate-900 dark:to-blue-950/30">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-600/30">
                <Compass className="h-6 w-6" />
              </div>
              <div>
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                  LKPD INTERAKTIF TERBARU
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                  {lkpdList[0].title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  5 Komponen: Orientasi Stimulus • Eksplorasi Konsep • Diskusi Teks • Praktik • Refleksi Diri
                </p>
              </div>
            </div>

            <Link
              to="/lkpd"
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-600/30 hover:bg-blue-700 transition-all active:scale-95"
            >
              Buka & Kerjakan LKPD
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Daftar Tugas & Status: 🟢 Sudah, 🟡 Belum, 🔴 Terlambat */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Daftar Tugas & Status Pengumpulan
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Perhatikan batas waktu pengerjaan setiap tugas LKPD
            </p>
          </div>
          <Link
            to="/tugas"
            className="text-xs font-bold text-blue-600 hover:underline dark:text-blue-400"
          >
            Lihat Semua Tugas &rarr;
          </Link>
        </div>

        <div className="mt-4 space-y-3">
          {assignmentsWithStatus.map((item) => {
            const badgeConfigs = {
              submitted: {
                label: '🟢 Sudah dikumpulkan',
                color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800'
              },
              pending: {
                label: '🟡 Belum dikumpulkan',
                color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800'
              },
              late: {
                label: '🔴 Terlambat',
                color: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800'
              }
            };
            const currentBadge = badgeConfigs[item.statusType];

            return (
              <div
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200/80 p-4 transition-all hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/60"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold border ${currentBadge.color}`}>
                      {currentBadge.label}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      Batas: {new Date(item.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                    {item.description}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {item.score && (
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Nilai Guru:</span>
                      <span className="text-base font-extrabold text-blue-600 dark:text-blue-400">
                        {item.score.finalScore} / 100
                      </span>
                    </div>
                  )}

                  <Link
                    to={item.lkpdId ? '/lkpd' : '/tugas'}
                    className="rounded-xl border border-blue-600 bg-blue-50 px-3.5 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-600 hover:text-white transition-all dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-700"
                  >
                    {item.statusType === 'submitted' ? 'Lihat Pengumpulan' : 'Buka & Kerjakan'}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Materi Terbaru & Pengumuman Sekolah */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Materi Terbaru */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-blue-600" />
              Materi Pembelajaran Terbaru
            </h3>
            <Link to="/materi" className="text-xs text-blue-600 hover:underline dark:text-blue-400 font-semibold">
              Semua &rarr;
            </Link>
          </div>
          <div className="mt-3 space-y-2.5">
            {materials.slice(0, 3).map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{m.title}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide">
                    Format: {m.type} • Pengampu: {m.teacherName}
                  </p>
                </div>
                <Link
                  to="/materi"
                  className="text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
                >
                  Buka
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Pengumuman Sekolah */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-orange-500" />
              Pengumuman Sekolah
            </h3>
            <span className="text-[11px] text-slate-400">SMKN 1 Sidayu</span>
          </div>
          <div className="mt-3 space-y-3">
            {announcements.slice(0, 2).map((a) => (
              <div
                key={a.id}
                className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{a.title}</h4>
                  {a.isImportant && (
                    <span className="rounded bg-rose-100 px-1.5 py-0.2 text-[9px] font-bold text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                      PENTING
                    </span>
                  )}
                </div>
                <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2">
                  {a.content}
                </p>
                <span className="text-[10px] text-slate-400 block mt-1">
                  Oleh: {a.authorName} • {new Date(a.createdAt).toLocaleDateString('id-ID')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
