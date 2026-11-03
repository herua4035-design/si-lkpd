import React, { useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { useData } from '../context/DataContext';
import {
  KeyRound,
  Eye,
  EyeOff,
  Sparkles,
  Shield,
  User,
  Mail,
  Lock,
  X,
  Check,
  RotateCcw,
  BookOpen,
  GraduationCap,
  Layers
} from 'lucide-react';
import Swal from 'sweetalert2';

interface UserCredentialModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null; // null means adding a new user
  defaultRole?: UserRole;
}

export const UserCredentialModal: React.FC<UserCredentialModalProps> = ({
  isOpen,
  onClose,
  user,
  defaultRole = 'murid'
}) => {
  const { updateUserCredential, addUserAccount, classes } = useData();

  const isEditing = !!user;

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('murid');
  const [nip, setNip] = useState('');
  const [nisn, setNisn] = useState('');
  const [className, setClassName] = useState('');
  const [major, setMajor] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setEmail(user.email || '');
      setRole(user.role || 'murid');
      setNip(user.nip || '');
      setNisn(user.nisn || '');
      setClassName(user.className || '');
      setMajor(user.major || '');
      setPassword(
        user.password || (
          user.role === 'admin' ? 'admin123' :
          user.role === 'guru' ? 'guru123' :
          user.role === 'kepsek' ? 'kepsek123' : 'siswa123'
        )
      );
    } else {
      setDisplayName('');
      setEmail('');
      setRole(defaultRole);
      setNip('');
      setNisn('');
      setClassName(classes[0]?.name || 'X TKJ 1');
      setMajor('');
      setPassword(
        defaultRole === 'admin' ? 'admin123' :
        defaultRole === 'guru' ? 'guru123' :
        defaultRole === 'kepsek' ? 'kepsek123' : 'siswa123'
      );
    }
  }, [user, defaultRole, isOpen, classes]);

  if (!isOpen) return null;

  const generateRandomPassword = () => {
    const prefixes = ['Smk1Sidayu', 'Gresik', 'Merdeka', 'Hebat', 'BisaSMK', 'Belajar'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const num = Math.floor(100 + Math.random() * 900);
    const chars = ['#', '@', '!', '*'];
    const char = chars[Math.floor(Math.random() * chars.length)];
    const generated = `${prefix}${num}${char}`;
    setPassword(generated);
    setShowPassword(true);
  };

  const setRoleDefaultPassword = () => {
    const def = role === 'admin' ? 'admin123' : role === 'guru' ? 'guru123' : role === 'kepsek' ? 'kepsek123' : 'siswa123';
    setPassword(def);
    setShowPassword(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!displayName.trim()) {
      Swal.fire({ icon: 'warning', title: 'Nama Lengkap Wajib Diisi' });
      return;
    }
    if (!email.trim()) {
      Swal.fire({ icon: 'warning', title: 'Email / Username Wajib Diisi' });
      return;
    }
    if (!password.trim() || password.trim().length < 4) {
      Swal.fire({ icon: 'warning', title: 'Kata Sandi Minimal 4 Karakter' });
      return;
    }

    if (isEditing && user) {
      updateUserCredential(user.uid, {
        displayName: displayName.trim(),
        email: email.trim(),
        role,
        nip: (role === 'guru' || role === 'kepsek') ? nip.replace(/\s+/g, '') : undefined,
        nisn: role === 'murid' ? nisn.trim() : undefined,
        className: role === 'murid' ? className : undefined,
        major: major.trim(),
        password: password.trim()
      });

      Swal.fire({
        icon: 'success',
        title: 'Akun & Kata Sandi Diperbarui',
        text: `Kredensial untuk ${displayName} berhasil disimpan. Sandi baru: ${password}`,
        timer: 2000,
        showConfirmButton: false
      });
    } else {
      addUserAccount({
        displayName: displayName.trim(),
        email: email.trim(),
        role,
        nip: (role === 'guru' || role === 'kepsek') ? nip.replace(/\s+/g, '') : undefined,
        nisn: role === 'murid' ? nisn.trim() : undefined,
        className: role === 'murid' ? className : undefined,
        major: major.trim(),
        password: password.trim()
      });

      Swal.fire({
        icon: 'success',
        title: 'Pengguna Baru Ditambahkan',
        text: `Akun ${displayName} siap digunakan dengan kata sandi: ${password}`,
        timer: 2000,
        showConfirmButton: false
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 space-y-5">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-300">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {isEditing ? 'Edit Akun & Reset Kata Sandi' : 'Tambah Akun Pengguna Baru'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isEditing ? `Kelola data login dan sandi untuk ${user?.displayName}` : 'Daftarkan guru, murid, atau staf baru'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Peran Pengguna (Role)
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full rounded-xl border border-slate-300 p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-medium"
              >
                <option value="guru">Guru Pengampu</option>
                <option value="murid">Peserta Didik (Siswa)</option>
                <option value="admin">Administrator</option>
                <option value="kepsek">Kepala Sekolah</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Nama Lengkap & Gelar
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Ahmad Heru, S.Pd"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Alamat Email / ID Pengguna untuk Login
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                required
                placeholder="user@smkn1sidayu.sch.id atau username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-300 pl-9 pr-3 py-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          {(role === 'guru' || role === 'kepsek') && (
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Nomor Induk Pegawai (NIP)
              </label>
              <input
                type="text"
                placeholder="19831216 202421 1 002"
                value={nip}
                onChange={(e) => setNip(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-mono"
              />
            </div>
          )}

          {role === 'murid' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  NISN (Nomor Induk Siswa)
                </label>
                <input
                  type="text"
                  placeholder="0075648921"
                  value={nisn}
                  onChange={(e) => setNisn(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Rombongan Belajar (Kelas)
                </label>
                <select
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name} ({c.major})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Password Section (Editable by Admin) */}
          <div className="rounded-2xl border border-purple-200/80 bg-purple-50/50 p-4 dark:border-purple-900/40 dark:bg-purple-950/20 space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-bold text-purple-900 dark:text-purple-300 flex items-center gap-1.5">
                <Lock className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                Kata Sandi Pengguna (Password)
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={setRoleDefaultPassword}
                  className="text-[11px] font-semibold text-purple-700 dark:text-purple-300 hover:underline flex items-center gap-1"
                >
                  <RotateCcw className="h-3 w-3" /> Standar
                </button>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <button
                  type="button"
                  onClick={generateRandomPassword}
                  className="text-[11px] font-semibold text-purple-700 dark:text-purple-300 hover:underline flex items-center gap-1"
                >
                  <Sparkles className="h-3 w-3 text-amber-500" /> Sandi Acak
                </button>
              </div>
            </div>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan kata sandi baru"
                className="w-full rounded-xl border border-purple-300 bg-white pr-10 pl-3 py-2.5 text-xs font-mono font-bold dark:border-purple-800 dark:bg-slate-900 dark:text-white tracking-wider"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <p className="text-[10px] text-purple-700/80 dark:text-purple-300/80">
              Pengguna dapat menggunakan kata sandi ini untuk login bersama Email, NIP, atau NISN.
            </p>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 pt-4 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-xl bg-purple-600 px-5 py-2 font-bold text-white shadow-md shadow-purple-600/30 hover:bg-purple-700"
            >
              <Check className="h-4 w-4" />
              {isEditing ? 'Simpan Kredensial' : 'Buat Akun'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
