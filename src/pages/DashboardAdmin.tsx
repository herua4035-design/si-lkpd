import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { StatCard } from '../components/StatCard';
import { ExcelImportModal } from '../components/ExcelImportModal';
import { UserCredentialModal } from '../components/UserCredentialModal';
import { UserProfile, UserRole } from '../types';
import {
  Shield,
  Users,
  GraduationCap,
  Layers,
  FileSpreadsheet,
  Database,
  Download,
  Upload,
  RefreshCw,
  Plus,
  Trash2,
  CheckCircle2,
  FileText,
  BookOpen,
  KeyRound,
  Eye,
  EyeOff,
  Search,
  Filter,
  Edit3,
  UserCheck,
  UserPlus,
  Lock
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';

export const DashboardAdmin: React.FC = () => {
  const location = useLocation();
  const {
    students,
    teachers,
    allUsers,
    classes,
    cpList,
    tpList,
    deleteUserAccount,
    exportDatabaseJSON,
    restoreDatabaseJSON,
    resetToDefaultData
  } = useData();

  const [showImportModal, setShowImportModal] = useState(false);
  const [restoreText, setRestoreText] = useState('');
  const [showRestoreBox, setShowRestoreBox] = useState(false);

  // User & Password Management States
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<UserProfile | null>(null);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | UserRole>('all');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [visibleCount, setVisibleCount] = useState<number>(50);
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});

  const togglePasswordVisibility = (uid: string) => {
    setRevealedPasswords((prev) => ({
      ...prev,
      [uid]: !prev[uid]
    }));
  };

  // Filtered users for User & Password Management table
  const usersList: UserProfile[] = allUsers && allUsers.length > 0 ? allUsers : [...teachers, ...students];
  const displayUsers: UserProfile[] = usersList.filter((u: UserProfile) => {
    const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
    const matchesClassFilter =
      classFilter === 'all' ||
      (u.className && u.className.toLowerCase() === classFilter.toLowerCase());
    const q = userSearchQuery.toLowerCase().trim();
    if (!q) return matchesRole && matchesClassFilter;
    const matchesName = (u.displayName || '').toLowerCase().includes(q);
    const matchesEmail = (u.email || '').toLowerCase().includes(q);
    const matchesNip = (u.nip || '').replace(/\s/g, '').includes(q.replace(/\s/g, ''));
    const matchesNisn = (u.nisn || '').includes(q);
    const matchesClass = (u.className || '').toLowerCase().includes(q);
    return matchesRole && matchesClassFilter && (matchesName || matchesEmail || matchesNip || matchesNisn || matchesClass);
  });

  React.useEffect(() => {

    if (location.pathname.includes('/admin/import')) {
      setShowImportModal(true);
    } else if (location.pathname.includes('/admin/database')) {
      const el = document.getElementById('database-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (location.pathname.includes('/admin/pengguna')) {
      const el = document.getElementById('students-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  }, [location.pathname]);

  const handleBackupDownload = () => {
    const jsonStr = exportDatabaseJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Backup_SILKPD_SMKN1SIDAYU_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    Swal.fire({
      icon: 'success',
      title: 'Cadangan Sistem Diunduh',
      text: 'File JSON backup database berhasil disimpan.',
      timer: 1800,
      showConfirmButton: false
    });
  };

  const handleRestoreSubmit = () => {
    if (!restoreText.trim()) return;
    const ok = restoreDatabaseJSON(restoreText);
    if (ok) {
      Swal.fire({
        icon: 'success',
        title: 'Pemulihan Berhasil',
        text: 'Database telah dipulihkan dari data cadangan.',
      });
      setShowRestoreBox(false);
      setRestoreText('');
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Format Tidak Valid',
        text: 'File cadangan JSON rusak atau struktur data tidak sesuai.',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <div className="rounded-3xl bg-gradient-to-r from-purple-800 via-indigo-900 to-slate-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-purple-500/30 px-3 py-1 text-xs font-semibold text-purple-200 border border-purple-500/40">
              <Shield className="h-3.5 w-3.5" />
              <span>Pusat Kendali Administrator Sistem</span>
            </div>
            <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight">
              Manajemen Sistem SI-LKPD SMKN 1 SIDAYU
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-purple-200 max-w-2xl leading-relaxed">
              Kelola master data pendidik, peserta didik, rombongan belajar, kurikulum, serta backup dan pemulihan database.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <Link
              to="/guru-mapel"
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-500 transition-all"
            >
              <BookOpen className="h-4 w-4" />
              Data 65 Guru & 17 Mapel
            </Link>
            <button
              onClick={() => setShowImportModal(true)}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-500 transition-all"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Import Excel Murid
            </button>
            <button
              onClick={handleBackupDownload}
              className="flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2.5 text-xs font-bold text-white backdrop-blur-md hover:bg-white/30 transition-all border border-white/20"
            >
              <Download className="h-4 w-4" />
              Backup Database
            </button>
          </div>
        </div>
      </div>

      {/* Admin Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="Total Murid"
          value={students.length}
          subtitle="Tersimpan di sistem"
          icon={GraduationCap}
          color="emerald"
        />
        <StatCard
          title="Total Guru"
          value={teachers.length}
          subtitle="Pendidik aktif"
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Total Kelas"
          value={classes.length}
          subtitle="Rombongan belajar"
          icon={Layers}
          color="purple"
        />
        <StatCard
          title="Master CP & TP"
          value={`${cpList.length} CP / ${tpList.length} TP`}
          subtitle="Kurikulum Merdeka"
          icon={Shield}
          color="orange"
        />
      </div>

      {/* Database Maintenance & Backup Section */}
      <div id="database-section" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Database className="h-5 w-5 text-indigo-600" />
              Manajemen & Cadangan Database (Firestore / Local Storage)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Ekspor dan pulihkan seluruh data aplikasi (Users, Kelas, CP, TP, LKPD, Nilai)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Download className="h-4 w-4 text-blue-600" /> Unduh Cadangan JSON
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Simpan berkas snapshot database lengkap ke perangkat lokal Anda.
            </p>
            <button
              onClick={handleBackupDownload}
              className="mt-2 w-full rounded-lg bg-blue-50 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300"
            >
              Unduh Backup
            </button>
          </div>

          <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Upload className="h-4 w-4 text-emerald-600" /> Pulihkan dari Cadangan
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Masukkan atau unggah isi file cadangan JSON untuk pemulihan instan.
            </p>
            <button
              onClick={() => setShowRestoreBox(!showRestoreBox)}
              className="mt-2 w-full rounded-lg bg-emerald-50 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300"
            >
              {showRestoreBox ? 'Tutup Formulir' : 'Buka Panel Restore'}
            </button>
          </div>

          <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <RefreshCw className="h-4 w-4 text-rose-600" /> Reset ke Bawaan
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Mengembalikan seluruh data ke sampel bawaan resmi SMKN 1 Sidayu.
            </p>
            <button
              onClick={() => {
                Swal.fire({
                  title: 'Reset Database?',
                  text: 'Data yang dibuat manual akan ditimpa dengan data default sekolah.',
                  icon: 'warning',
                  showCancelButton: true,
                  confirmButtonColor: '#ef4444',
                  cancelButtonColor: '#64748b',
                  confirmButtonText: 'Ya, Reset'
                }).then((r) => {
                  if (r.isConfirmed) resetToDefaultData();
                });
              }}
              className="mt-2 w-full rounded-lg bg-rose-50 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300"
            >
              Reset Database
            </button>
          </div>
        </div>

        {/* Restore Input Area */}
        {showRestoreBox && (
          <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
              Tempelkan (Paste) Teks JSON Cadangan di Bawah:
            </label>
            <textarea
              rows={4}
              value={restoreText}
              onChange={(e) => setRestoreText(e.target.value)}
              placeholder='{"classes": [...], "cpList": [...]}'
              className="w-full font-mono text-xs p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowRestoreBox(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:underline"
              >
                Batal
              </button>
              <button
                onClick={handleRestoreSubmit}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-700"
              >
                Terapkan Pemulihan Database
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Manajemen Akun & Kata Sandi Pengguna (Admin Security Control) */}
      <div id="students-section" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              Pusat Manajemen Akun & Kata Sandi Pengguna ({displayUsers.length})
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Administrator dapat melihat, mengatur ulang kata sandi, mengedit email/identitas, serta menambah pengguna baru.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setSelectedUserForEdit(null);
                setUserModalOpen(true);
              }}
              className="flex items-center gap-1.5 rounded-xl bg-purple-600 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-purple-600/30 hover:bg-purple-700 transition-all"
            >
              <UserPlus className="h-4 w-4" /> Tambah Pengguna Baru
            </button>
            <button
              onClick={() => setShowImportModal(true)}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition-all"
            >
              <FileSpreadsheet className="h-4 w-4" /> Import Excel Murid
            </button>
          </div>
        </div>

        {/* Filter Role & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
            {[
              { id: 'all', label: `Semua (${(allUsers || []).length})` },
              { id: 'guru', label: `Guru (${teachers.length})` },
              { id: 'murid', label: `Siswa (${students.length})` },
              { id: 'kepsek', label: 'Kepsek' },
              { id: 'admin', label: 'Admin' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setUserRoleFilter(tab.id as any);
                  setVisibleCount(50);
                }}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                  userRoleFilter === tab.id
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {tab.label}
              </button>
            ))}

            {/* Rombel Class Filter */}
            {(userRoleFilter === 'all' || userRoleFilter === 'murid') && (
              <select
                value={classFilter}
                onChange={(e) => {
                  setClassFilter(e.target.value);
                  setVisibleCount(50);
                }}
                className="rounded-xl border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 outline-none"
              >
                <option value="all">Semua Rombel (11 Kelas)</option>
                <option value="X TKR 1">X TKR 1</option>
                <option value="X TKR 2">X TKR 2</option>
                <option value="X TKR 3">X TKR 3</option>
                <option value="X TKR 4">X TKR 4</option>
                <option value="X TITL 1">X TITL 1</option>
                <option value="X TITL 2">X TITL 2</option>
                <option value="X TKJ 1">X TKJ 1</option>
                <option value="X TKJ 2">X TKJ 2</option>
                <option value="X TKJ 3">X TKJ 3</option>
                <option value="X APHPi 1">X APHPi 1</option>
                <option value="X APHPi 2">X APHPi 2</option>
              </select>
            )}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama, email, NIP, NISN..."
              value={userSearchQuery}
              onChange={(e) => {
                setUserSearchQuery(e.target.value);
                setVisibleCount(50);
              }}
              className="w-full rounded-xl border border-slate-300 pl-9 pr-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
        </div>

        {/* Table of Users with Editable Password */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              <tr>
                <th className="p-3">Nama & Profil</th>
                <th className="p-3">Peran (Role)</th>
                <th className="p-3">Email / ID Login</th>
                <th className="p-3">NIP / NISN / Rombel</th>
                <th className="p-3">Kata Sandi (Password)</th>
                <th className="p-3 text-right">Aksi Administrator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {displayUsers.slice(0, visibleCount).map((u) => {
                const userPassword = u.password || (
                  u.role === 'admin' ? 'admin123' :
                  u.role === 'guru' ? 'guru123' :
                  u.role === 'kepsek' ? 'kepsek123' : 'siswa123'
                );
                const isRevealed = !!revealedPasswords[u.uid];

                const roleBadgeColors: Record<UserRole, string> = {
                  admin: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
                  guru: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
                  murid: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
                  kepsek: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
                };

                return (
                  <tr key={u.uid} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={u.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250'}
                          alt=""
                          className="h-8 w-8 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                        />
                        <div>
                          <p className="font-bold">{u.displayName}</p>
                          <p className="text-[10px] text-slate-400 capitalize">{u.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${roleBadgeColors[u.role] || 'bg-slate-100'}`}>
                        {u.role === 'kepsek' ? 'Kepsek' : u.role}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-slate-700 dark:text-slate-300">
                      {u.email}
                    </td>
                    <td className="p-3 text-slate-600 dark:text-slate-400">
                      {u.nip ? `NIP: ${u.nip.replace(/\s+/g, '')}` : u.nisn ? `NISN: ${u.nisn} (${u.className || '-'})` : (u.className || '-')}
                    </td>
                    <td className="p-3">
                      <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1 dark:border-slate-700 dark:bg-slate-800 font-mono text-xs">
                        <Lock className="h-3 w-3 text-slate-400" />
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {isRevealed ? userPassword : '••••••••'}
                        </span>
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility(u.uid)}
                          title={isRevealed ? 'Sembunyikan Sandi' : 'Tampilkan Sandi'}
                          className="ml-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                          {isRevealed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedUserForEdit(u);
                            setUserModalOpen(true);
                          }}
                          className="flex items-center gap-1 rounded-lg bg-purple-50 px-2.5 py-1 text-[11px] font-bold text-purple-700 hover:bg-purple-100 dark:bg-purple-950/40 dark:text-purple-300"
                          title="Edit Akun & Reset Kata Sandi"
                        >
                          <Edit3 className="h-3 w-3" /> Edit Sandi
                        </button>
                        <button
                          onClick={() => {
                            Swal.fire({
                              title: 'Hapus Pengguna?',
                              text: `Akun ${u.displayName} akan dihapus dari sistem.`,
                              icon: 'warning',
                              showCancelButton: true,
                              confirmButtonColor: '#ef4444',
                              cancelButtonColor: '#64748b',
                              confirmButtonText: 'Ya, Hapus'
                            }).then((r) => {
                              if (r.isConfirmed) {
                                deleteUserAccount(u.uid);
                                Swal.fire({ icon: 'success', title: 'Akun Dihapus', timer: 1500, showConfirmButton: false });
                              }
                            });
                          }}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                          title="Hapus Akun"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showImportModal && (
        <ExcelImportModal onClose={() => setShowImportModal(false)} />
      )}

      <UserCredentialModal
        isOpen={userModalOpen}
        onClose={() => setUserModalOpen(false)}
        user={selectedUserForEdit}
        defaultRole={userRoleFilter === 'all' ? 'murid' : userRoleFilter}
      />
    </div>
  );
};

