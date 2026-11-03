import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import {
  LayoutDashboard,
  Users,
  Layers,
  Target,
  BookOpen,
  FileCheck2,
  Award,
  MessageSquare,
  BarChart3,
  Settings,
  FileSpreadsheet,
  Database,
  GraduationCap,
  Sparkles,
  Compass,
  X,
  Camera
} from 'lucide-react';
import { ProfilePhotoModal } from './ProfilePhotoModal';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { role, currentUser } = useAuth();
  const { submissions, assignments, notifications } = useData();
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  // Pending submissions for Guru badge
  const pendingGradingCount = submissions.filter((s) => !s.scoreId).length;
  // Active assignments for Murid
  const activeAssignmentsCount = assignments.length;

  const getNavLinks = () => {
    switch (role) {
      case 'guru':
        return [
          { to: '/', label: 'Beranda Guru', icon: LayoutDashboard },
          { to: '/guru-mapel', label: 'Data Guru & Mapel', icon: Users, badge: '65', badgeColor: 'bg-blue-100 text-blue-700' },
          { to: '/kelas', label: 'Data Kelas (32)', icon: Layers },
          { to: '/cp', label: 'Capaian Pembelajaran (CP)', icon: Layers },
          { to: '/tp', label: 'Tujuan Pembelajaran (TP)', icon: Target },
          { to: '/lkpd', label: 'LKPD Interaktif', icon: Compass },
          { to: '/materi', label: 'Materi Pembelajaran', icon: BookOpen },
          { to: '/tugas', label: 'Penugasan', icon: FileCheck2 },
          {
            to: '/penilaian',
            label: 'Penilaian & Rubrik',
            icon: Award,
            badge: pendingGradingCount > 0 ? `${pendingGradingCount} Baru` : undefined,
            badgeColor: 'bg-orange-500 text-white'
          },
          { to: '/chat', label: 'Komunikasi Chat', icon: MessageSquare },
          { to: '/laporan', label: 'Rekap Nilai & Analitik', icon: BarChart3 },
          { to: '/pengaturan', label: 'Profil & Pengaturan', icon: Settings },
        ];
      case 'murid':
        return [
          { to: '/', label: 'Beranda Murid', icon: LayoutDashboard },
          { to: '/lkpd', label: 'LKPD Interaktif', icon: Compass },
          { to: '/materi', label: 'Materi Pembelajaran', icon: BookOpen },
          {
            to: '/tugas',
            label: 'Tugas Saya',
            icon: FileCheck2,
            badge: `${activeAssignmentsCount}`,
            badgeColor: 'bg-blue-600 text-white'
          },
          { to: '/nilai-saya', label: 'Nilai & Rapor Saya', icon: Award },
          { to: '/progress', label: 'Progress Belajar (CP/TP)', icon: BarChart3 },
          { to: '/chat', label: 'Chat Kelas & Guru', icon: MessageSquare },
          { to: '/pengaturan', label: 'Profil & Pengaturan', icon: Settings },
        ];
      case 'admin':
        return [
          { to: '/', label: 'Dashboard Admin', icon: LayoutDashboard },
          { to: '/guru-mapel', label: 'Master Guru & Mapel', icon: Users, badge: '65', badgeColor: 'bg-purple-100 text-purple-700' },
          { to: '/admin/pengguna', label: 'Kelola Akun Murid', icon: Users },
          { to: '/kelas', label: 'Kelola 32 Kelas', icon: Layers },
          { to: '/admin/import', label: 'Import Excel Murid', icon: FileSpreadsheet, badge: 'Excel', badgeColor: 'bg-emerald-600 text-white' },
          { to: '/cp', label: 'Kelola CP', icon: Layers },
          { to: '/tp', label: 'Kelola TP', icon: Target },
          { to: '/lkpd', label: 'Kelola LKPD', icon: Compass },
          { to: '/tugas', label: 'Kelola Tugas & Rubrik', icon: FileCheck2 },
          { to: '/admin/database', label: 'Database & Backup', icon: Database },
          { to: '/laporan', label: 'Laporan Rekap', icon: BarChart3 },
          { to: '/pengaturan', label: 'Profil & Pengaturan', icon: Settings },
        ];
      case 'kepsek':
      default:
        return [
          { to: '/', label: 'Dashboard Kepsek', icon: LayoutDashboard },
          { to: '/guru-mapel', label: 'Direktori 65 Guru & Mapel', icon: Users, badge: '65 Guru', badgeColor: 'bg-amber-100 text-amber-700' },
          { to: '/progress', label: 'Ketuntasan TP & CP', icon: BarChart3 },
          { to: '/laporan', label: 'Distribusi Nilai', icon: Award },
          { to: '/kelas', label: 'Monitoring 32 Rombel', icon: Layers },
          { to: '/materi', label: 'Pantau Materi & LKPD', icon: BookOpen },
          { to: '/pengaturan', label: 'Profil & Pengaturan', icon: Settings },
        ];
    }
  };

  const navLinks = getNavLinks();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Profile Card Banner */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <div className="relative group cursor-pointer" onClick={() => setShowPhotoModal(true)} title="Klik untuk ganti foto">
              <img
                src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250'}
                alt={currentUser.displayName}
                className="h-10 w-10 rounded-lg object-cover ring-2 ring-blue-500/20 group-hover:opacity-80 transition-opacity"
              />
              <div className="absolute inset-0 rounded-lg bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                <Camera className="h-4 w-4" />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {currentUser.displayName}
              </p>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 capitalize truncate">
                  {role === 'kepsek' ? 'Kepsek' : role}
                </span>
                <span className="text-[10px] text-slate-300 dark:text-slate-600">•</span>
                <button
                  type="button"
                  onClick={() => setShowPhotoModal(true)}
                  className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-0.5"
                >
                  <Camera className="h-2.5 w-2.5" /> Ganti Foto
                </button>
              </div>
            </div>
          </div>
        </div>


        {/* Navigation list */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Menu Utama
          </div>

          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `group flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30 font-bold'
                      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/80'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4 shrink-0 transition-transform group-hover:scale-110" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${item.badgeColor || 'bg-slate-200 text-slate-700'}`}>
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom School Badge */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800">
          <div className="rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50/70 p-3 dark:from-blue-950/30 dark:to-indigo-950/20 border border-blue-100 dark:border-blue-900/40">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-bold text-blue-900 dark:text-blue-300">
                SMKN 1 SIDAYU ONLINE
              </span>
            </div>
            <p className="mt-1 text-[10px] text-slate-600 dark:text-slate-400">
              Kurikulum Merdeka SMK Terpadu
            </p>
          </div>
        </div>
      </aside>

      <ProfilePhotoModal
        isOpen={showPhotoModal}
        onClose={() => setShowPhotoModal(false)}
      />
    </>
  );
};

