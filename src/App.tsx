import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { UserRole } from './types';

import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';

import { DashboardGuru } from './pages/DashboardGuru';
import { DashboardMurid } from './pages/DashboardMurid';
import { DashboardKepsek } from './pages/DashboardKepsek';
import { DashboardAdmin } from './pages/DashboardAdmin';

import { ClassPage } from './pages/ClassPage';
import { CPManagement } from './pages/CPManagement';
import { TPManagement } from './pages/TPManagement';
import { LKPDPage } from './pages/LKPDPage';
import { MateriPage } from './pages/MateriPage';
import { TugasPage } from './pages/TugasPage';
import { PenilaianPage } from './pages/PenilaianPage';
import { NilaiSayaPage } from './pages/NilaiSayaPage';
import { ProgressPage } from './pages/ProgressPage';
import { ChatPage } from './pages/ChatPage';
import { LaporanPage } from './pages/LaporanPage';
import { PengaturanPage } from './pages/PengaturanPage';
import { GuruDanMapelPage } from './pages/GuruDanMapelPage';
import { Login } from './pages/Login';
import { ShieldAlert, Home, LogOut, Lock } from 'lucide-react';

// Main Home Switcher based on active user role
const RoleHome: React.FC = () => {
  const { role } = useAuth();
  switch (role) {
    case 'guru':
      return <DashboardGuru />;
    case 'murid':
      return <DashboardMurid />;
    case 'kepsek':
      return <DashboardKepsek />;
    case 'admin':
      return <DashboardAdmin />;
    default:
      return <DashboardMurid />;
  }
};

// Main App Layout Wrapper
const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      <Navbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="lg:pl-64 min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  );
};

// Access Denied (403 Forbidden) Page when role cannot access route
const AccessDeniedPage: React.FC<{ allowedRoles: UserRole[] }> = ({ allowedRoles }) => {
  const { currentUser, role, logout } = useAuth();
  const navigate = useNavigate();

  const roleLabels: Record<UserRole, string> = {
    guru: 'Guru Pengampu',
    murid: 'Peserta Didik (Murid)',
    admin: 'Administrator',
    kepsek: 'Kepala Sekolah'
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[65vh] text-center p-6 animate-fadeIn">
      <div className="h-20 w-20 rounded-3xl bg-red-100 dark:bg-red-950/60 flex items-center justify-center text-red-600 dark:text-red-400 mb-5 shadow-xl shadow-red-500/10 ring-8 ring-red-50 dark:ring-red-900/20">
        <ShieldAlert className="h-10 w-10" />
      </div>

      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 text-xs font-bold mb-3">
        <Lock className="h-3.5 w-3.5" /> KEAMANAN & PEMBATASAN HAK AKSES SISTEM
      </div>

      <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight sm:text-3xl">
        Akses Ditolak (403 Forbidden)
      </h1>

      <p className="mt-3 max-w-lg text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
        Halaman ini memiliki pembatasan keamanan dan hanya boleh diakses oleh:{' '}
        <span className="font-bold text-blue-600 dark:text-blue-400">
          {allowedRoles.map((r) => roleLabels[r] || r).join(', ')}
        </span>.
      </p>

      <div className="mt-5 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 max-w-md shadow-xs text-left">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2 dark:border-slate-800">
          <span className="text-slate-500">Akun Anda:</span>
          <span className="font-bold text-slate-900 dark:text-white">{currentUser.displayName}</span>
        </div>
        <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2 dark:border-slate-800">
          <span className="text-slate-500">Peran Aktif:</span>
          <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 font-extrabold uppercase text-[10px]">
            {roleLabels[role] || role}
          </span>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mt-2">
          {role === 'murid'
            ? 'Sebagai Peserta Didik, Anda tidak memiliki akses ke pengaturan guru, rekap nilai kelas, manajemen CP/TP, atau panel admin. Anda hanya memiliki akses ke materi belajar, LKPD, pengumpulan tugas, dan nilai rapor Anda sendiri.'
            : 'Akun Anda tidak memiliki izin untuk melihat modul ini. Hubungi administrator jika membutuhkan penyesuaian hak akses.'}
        </p>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md shadow-blue-600/30 hover:bg-blue-700 transition-all cursor-pointer"
        >
          <Home className="h-4 w-4" /> Kembali ke Beranda Saya
        </button>
        <button
          onClick={logout}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 font-bold text-xs transition-all cursor-pointer"
        >
          <LogOut className="h-4 w-4" /> Keluar & Ganti Akun
        </button>
      </div>
    </div>
  );
};

// Strict Role Guarded Route Wrapper
const RoleRoute: React.FC<{ children: React.ReactNode; allowedRoles: UserRole[] }> = ({
  children,
  allowedRoles
}) => {
  const { isAuthenticated, role } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (!allowedRoles.includes(role)) {
    return (
      <MainLayout>
        <AccessDeniedPage allowedRoles={allowedRoles} />
      </MainLayout>
    );
  }
  return <MainLayout>{children}</MainLayout>;
};

const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
      />

      {/* Home Switcher: All authenticated roles */}
      <Route
        path="/"
        element={
          <RoleRoute allowedRoles={['guru', 'murid', 'kepsek', 'admin']}>
            <RoleHome />
          </RoleRoute>
        }
      />

      {/* Strictly RESTRICTED for Murid: Guru & Mapel Directory */}
      <Route
        path="/guru-mapel"
        element={
          <RoleRoute allowedRoles={['guru', 'kepsek', 'admin']}>
            <GuruDanMapelPage />
          </RoleRoute>
        }
      />

      {/* Strictly RESTRICTED for Murid: Class Management */}
      <Route
        path="/kelas"
        element={
          <RoleRoute allowedRoles={['guru', 'kepsek', 'admin']}>
            <ClassPage />
          </RoleRoute>
        }
      />

      {/* Strictly RESTRICTED for Murid: Capaian Pembelajaran (CP) */}
      <Route
        path="/cp"
        element={
          <RoleRoute allowedRoles={['guru', 'kepsek', 'admin']}>
            <CPManagement />
          </RoleRoute>
        }
      />

      {/* Strictly RESTRICTED for Murid: Tujuan Pembelajaran (TP) */}
      <Route
        path="/tp"
        element={
          <RoleRoute allowedRoles={['guru', 'kepsek', 'admin']}>
            <TPManagement />
          </RoleRoute>
        }
      />

      {/* Strictly RESTRICTED for Murid & Kepsek: Teacher Grading & Rubrics */}
      <Route
        path="/penilaian"
        element={
          <RoleRoute allowedRoles={['guru', 'admin']}>
            <PenilaianPage />
          </RoleRoute>
        }
      />

      {/* Strictly RESTRICTED for Murid: School Grade Analytics & Rekap */}
      <Route
        path="/laporan"
        element={
          <RoleRoute allowedRoles={['guru', 'kepsek', 'admin']}>
            <LaporanPage />
          </RoleRoute>
        }
      />

      {/* STRICTLY Administrator Only: Account Management, Password Reset, Database */}
      <Route
        path="/admin/*"
        element={
          <RoleRoute allowedRoles={['admin']}>
            <DashboardAdmin />
          </RoleRoute>
        }
      />

      {/* LKPD Interaktif: Murid can work, Guru/Admin can edit/review */}
      <Route
        path="/lkpd"
        element={
          <RoleRoute allowedRoles={['murid', 'guru', 'admin', 'kepsek']}>
            <LKPDPage />
          </RoleRoute>
        }
      />

      {/* Materi Pelajaran: Murid can view, Guru/Admin can upload */}
      <Route
        path="/materi"
        element={
          <RoleRoute allowedRoles={['murid', 'guru', 'admin', 'kepsek']}>
            <MateriPage />
          </RoleRoute>
        }
      />

      {/* Penugasan: Murid can submit, Guru/Admin can create/review */}
      <Route
        path="/tugas"
        element={
          <RoleRoute allowedRoles={['murid', 'guru', 'admin']}>
            <TugasPage />
          </RoleRoute>
        }
      />

      {/* Nilai Saya: Exclusively for Murid to check personal grades & feedback */}
      <Route
        path="/nilai-saya"
        element={
          <RoleRoute allowedRoles={['murid', 'admin']}>
            <NilaiSayaPage />
          </RoleRoute>
        }
      />

      {/* Progress Belajar: Murid sees personal mastery; Teachers see rombel progress */}
      <Route
        path="/progress"
        element={
          <RoleRoute allowedRoles={['murid', 'guru', 'kepsek', 'admin']}>
            <ProgressPage />
          </RoleRoute>
        }
      />

      {/* Chat Ruang Diskusi: All authenticated roles */}
      <Route
        path="/chat"
        element={
          <RoleRoute allowedRoles={['murid', 'guru', 'admin', 'kepsek']}>
            <ChatPage />
          </RoleRoute>
        }
      />

      {/* Pengaturan Profil & Ganti Foto: All authenticated roles */}
      <Route
        path="/pengaturan"
        element={
          <RoleRoute allowedRoles={['murid', 'guru', 'admin', 'kepsek']}>
            <PengaturanPage />
          </RoleRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </DataProvider>
    </AuthProvider>
  );
}
