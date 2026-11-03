import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { isFirebaseConfigured } from '../services/firebase';
import { UserRole } from '../types';
import {
  Settings,
  User,
  Shield,
  Database,
  Cloud,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Save,
  Moon,
  Sun,
  Camera,
  Upload,
  Image as ImageIcon,
  KeyRound,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import Swal from 'sweetalert2';
import { ProfilePhotoModal } from '../components/ProfilePhotoModal';

export const PengaturanPage: React.FC = () => {
  const { currentUser, role, switchRole, updateProfile, changePassword, isDarkMode, toggleDarkMode } = useAuth();

  const [displayName, setDisplayName] = useState(currentUser.displayName);
  const [phone, setPhone] = useState(currentUser.phone || '081234567890');
  const [major, setMajor] = useState(currentUser.major || 'PPLG');
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  // Change password states
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      Swal.fire({
        icon: 'warning',
        title: 'Konfirmasi Sandi Tidak Cocok',
        text: 'Pastikan kata sandi baru dan konfirmasi kata sandi sama persis.'
      });
      return;
    }
    const res = await changePassword(oldPassword, newPassword);
    if (res.success) {
      Swal.fire({
        icon: 'success',
        title: 'Kata Sandi Diperbarui',
        text: 'Kata sandi akun Anda berhasil diganti.',
        timer: 1800,
        showConfirmButton: false
      });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Gagal Mengubah Sandi',
        text: res.message || 'Periksa kembali kata sandi lama Anda.'
      });
    }
  };


  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      displayName,
      phone,
      major
    });
    Swal.fire({
      icon: 'success',
      title: 'Profil Berhasil Disimpan',
      timer: 1500,
      showConfirmButton: false
    });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
          Pengaturan Akun & Profil Pengguna
        </h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Kelola foto profil pengguna, biodata, tema tampilan, dan konfigurasi sistem SMKN 1 Sidayu.
        </p>
      </div>

      {/* Foto Profil Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Camera className="h-4 w-4 text-blue-600" />
          Foto Profil Akun
        </h2>

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          {/* Avatar with click-to-change overlay */}
          <div className="relative group cursor-pointer" onClick={() => setShowPhotoModal(true)}>
            <img
              src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250'}
              alt={currentUser.displayName}
              className="h-28 w-28 rounded-2xl object-cover ring-4 ring-blue-500/20 shadow-md group-hover:opacity-90 transition-all"
            />
            <div className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity">
              <Camera className="h-6 w-6" />
              <span className="text-[10px] font-bold mt-1">Ganti Foto</span>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowPhotoModal(true);
              }}
              title="Ganti Foto Profil"
              className="absolute -bottom-2 -right-2 rounded-xl bg-blue-600 p-2 text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-colors"
            >
              <Camera className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 space-y-3 text-center sm:text-left">
            <div>
              <p className="text-base font-extrabold text-slate-900 dark:text-white">
                {currentUser.displayName}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                {role === 'kepsek' ? 'Kepala Sekolah' : role} • {currentUser.className || 'SMKN 1 Sidayu'}
              </p>
              {currentUser.nip && (
                <p className="text-xs text-blue-600 dark:text-blue-400 font-mono mt-0.5">
                  NIP: {currentUser.nip.replace(/\s+/g, '')}
                </p>
              )}
              {currentUser.nisn && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                  NISN: {currentUser.nisn}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <button
                type="button"
                onClick={() => setShowPhotoModal(true)}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-blue-600/30 hover:bg-blue-700 transition-all"
              >
                <Upload className="h-3.5 w-3.5" />
                Ganti Foto Profil
              </button>
              <button
                type="button"
                onClick={() => {
                  updateProfile({
                    avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      currentUser.displayName
                    )}&background=2563eb&color=fff&size=256&bold=true`
                  });
                  Swal.fire({
                    icon: 'success',
                    title: 'Foto Profil Di-reset',
                    timer: 1500,
                    showConfirmButton: false
                  });
                }}
                className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              >
                <ImageIcon className="h-3.5 w-3.5" />
                Gunakan Inisial Nama
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              Format yang didukung: JPG, PNG, WEBP. Maksimal 5 MB. Otomatis dipotong rasio bujur sangkar (1:1).
            </p>
          </div>
        </div>
      </div>


      {/* Profile Form */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-5">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <User className="h-4 w-4 text-blue-600" />
          Informasi Profil Pengguna
        </h2>

        <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Nama Lengkap & Gelar
              </label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Alamat Email Belajar
              </label>
              <input
                type="email"
                disabled
                value={currentUser.email}
                className="w-full rounded-xl border border-slate-200 bg-slate-100 p-2.5 text-slate-500 dark:border-slate-800 dark:bg-slate-800/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Nomor Telepon / WhatsApp
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Jurusan / Program Keahlian
              </label>
              <input
                type="text"
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 font-bold text-white shadow-md shadow-blue-600/30 hover:bg-blue-700"
          >
            <Save className="h-4 w-4" />
            Simpan Perubahan Profil
          </button>
        </form>
      </div>

      {/* Keamanan & Ganti Kata Sandi Akun */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            Keamanan Akun & Ganti Kata Sandi
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Ubah kata sandi login pribadi Anda untuk menjaga keamanan akun pembelajaran.
          </p>
        </div>

        <form onSubmit={handleChangePasswordSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Kata Sandi Saat Ini
              </label>
              <div className="relative">
                <input
                  type={showOldPass ? 'text' : 'password'}
                  required
                  placeholder="Sandi lama Anda"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 pr-9 p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowOldPass(!showOldPass)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showOldPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Kata Sandi Baru
              </label>
              <div className="relative">
                <input
                  type={showNewPass ? 'text' : 'password'}
                  required
                  placeholder="Minimal 4 karakter"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 pr-9 p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showNewPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Ulangi Kata Sandi Baru
              </label>
              <input
                type="password"
                required
                placeholder="Konfirmasi sandi baru"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            className="flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 font-bold text-white shadow-md shadow-purple-600/30 hover:bg-purple-700"
          >
            <Lock className="h-4 w-4" />
            Perbarui Kata Sandi Saya
          </button>
        </form>
      </div>

      {/* Switch Demo Role */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">

        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-orange-500" />
          Beralih Peran Demo Pengujian (Instant Testing)
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Uji coba seluruh fitur aplikasi dari 4 sudut pandang berbeda hanya dengan satu kali klik:
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(['guru', 'murid', 'admin', 'kepsek'] as UserRole[]).map((r) => {
            const isActive = role === r;
            const labels: Record<UserRole, string> = {
              guru: 'Guru Pengampu',
              murid: 'Peserta Didik',
              admin: 'Administrator',
              kepsek: 'Kepala Sekolah'
            };

            return (
              <button
                key={r}
                type="button"
                onClick={() => switchRole(r)}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  isActive
                    ? 'border-blue-600 bg-blue-50 dark:border-blue-500 dark:bg-blue-950/50 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800'
                }`}
              >
                <span className="font-bold text-xs block text-slate-900 dark:text-white capitalize">
                  {labels[r]}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  {isActive ? '✓ Sedang Aktif' : 'Klik untuk uji'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Firebase Status */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-3">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Cloud className="h-4 w-4 text-blue-600" />
          Status Koneksi Firebase & Cloud Storage
        </h2>

        <div className="flex items-center gap-2 text-xs">
          <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-bold text-slate-800 dark:text-slate-200">
            {isFirebaseConfigured ? 'Firebase Live Connected' : 'Mode Offline / Local Persistent Store Aktif'}
          </span>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Aplikasi siap di-deploy langsung ke Firebase Hosting maupun Vercel. Untuk menghubungkan ke project Firebase langsung, tambahkan <code>VITE_FIREBASE_API_KEY</code> dan variabel terkait di Secrets / Environment variables.
        </p>
      </div>

      <ProfilePhotoModal
        isOpen={showPhotoModal}
        onClose={() => setShowPhotoModal(false)}
      />
    </div>
  );
};

