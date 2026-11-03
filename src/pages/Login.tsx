import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import {
  GraduationCap,
  Sparkles,
  BookOpen,
  Shield,
  UserCheck,
  ArrowRight,
  Sun,
  Moon,
  Lock,
  Mail,
  Search,
  School,
  Eye,
  EyeOff,
  ShieldCheck,
  KeyRound,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  Cpu,
  Wrench,
  Zap,
  Fish,
  Layers,
  PhoneCall
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { StudentLookupModal } from '../components/StudentLookupModal';
import { TeacherLookupModal } from '../components/TeacherLookupModal';
import { UserProfile } from '../types';

export const Login: React.FC = () => {
  const { login, isDarkMode, toggleDarkMode } = useAuth();
  const navigate = useNavigate();

  // Active Role Category Tab: 'guru' | 'murid' | 'admin_kepsek'
  const [roleCategory, setRoleCategory] = useState<'guru' | 'murid' | 'admin_kepsek'>('guru');

  // Input states
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showStudentLookup, setShowStudentLookup] = useState(false);
  const [showTeacherLookup, setShowTeacherLookup] = useState(false);
  const [selectedTeacherInfo, setSelectedTeacherInfo] = useState<{ name: string; nip: string; mapel?: string } | null>(null);

  // When switching role category, clear input fields to prevent unauthorized access
  const handleCategoryChange = (cat: 'guru' | 'murid' | 'admin_kepsek') => {
    setRoleCategory(cat);
    setErrorMsg('');
    setIdentifier('');
    setPassword('');
    setSelectedTeacherInfo(null);
  };

  const handleSelectTeacher = (teacher: { name: string; nip: string; mapel?: string; email?: string }) => {
    const cleanNip = teacher.nip.replace(/\s+/g, '');
    setIdentifier(cleanNip);
    setPassword('');
    setSelectedTeacherInfo(teacher);
    setShowTeacherLookup(false);
    setErrorMsg('');
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'info',
      title: `Pendidik Dipilih: ${teacher.name}`,
      text: `NIP: ${teacher.nip} (${teacher.mapel || 'Guru Pengampu'}). Format sandi: Guru${cleanNip.slice(-4)}!`,
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true
    });
  };

  const handleSelectStudent = (student: UserProfile) => {
    setIdentifier(student.nisn || student.displayName);
    setPassword('');
    setShowStudentLookup(false);
    setErrorMsg('');
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'info',
      title: `Siswa Dipilih: ${student.displayName}`,
      text: `NISN: ${student.nisn} (${student.className}). Silakan masukkan kata sandi akun siswa Anda.`,
      showConfirmButton: false,
      timer: 2500,
      timerProgressBar: true
    });
  };

  const handleCustomLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setErrorMsg('Silakan masukkan email, NIP, atau NISN Anda.');
      return;
    }
    if (!password.trim()) {
      setErrorMsg('Silakan masukkan kata sandi akun Anda.');
      return;
    }

    setErrorMsg('');
    setIsLoading(true);

    const targetRole: UserRole =
      roleCategory === 'guru'
        ? 'guru'
        : roleCategory === 'murid'
        ? 'murid'
        : identifier.toLowerCase().includes('kepsek')
        ? 'kepsek'
        : 'admin';

    const res = await login(identifier, password, targetRole);
    setIsLoading(false);

    if (res.success) {
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Berhasil Masuk!',
        text: 'Selamat datang di SI-LKPD SMKN 1 Sidayu.',
        showConfirmButton: false,
        timer: 1800,
        timerProgressBar: true
      });
      navigate('/');
    } else {
      setErrorMsg(res.message || 'Login gagal. Periksa kembali email/identitas dan kata sandi Anda.');
      Swal.fire({
        icon: 'error',
        title: 'Gagal Masuk',
        text: res.message || 'Kredensial login atau kata sandi tidak sesuai.',
        confirmButtonColor: '#2563eb'
      });
    }
  };

  const handleForgotPassword = () => {
    Swal.fire({
      icon: 'info',
      title: 'Lupa Kata Sandi?',
      html: `
        <div class="text-left text-xs space-y-2 text-slate-600">
          <p>Seluruh kata sandi akun pengguna dikelola secara terpusat oleh <strong>Administrator SI-LKPD</strong>.</p>
          <div class="rounded-xl bg-slate-100 p-3 text-slate-700">
            <p class="font-bold mb-1">Cara Reset Sandi:</p>
            <ul class="list-disc pl-4 space-y-1">
              <li>Hubungi Admin Sekolah di Ruang Laboratorium Komputer / Tata Usaha.</li>
              <li>Atau hubungi admin via WhatsApp: <strong>0812-3456-7890</strong>.</li>
              <li>Sebutkan Nama Lengkap dan NIP / NISN Anda.</li>
            </ul>
          </div>
          <p class="text-[11px] text-slate-400 mt-2">Kredensial Bawaan Standar: Guru (<code>guru123</code>), Siswa (<code>siswa123</code>), Admin (<code>admin123</code>), Kepsek (<code>kepsek123</code>).</p>
        </div>
      `,
      confirmButtonText: 'Tutup & Mengerti',
      confirmButtonColor: '#2563eb'
    });
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Top Header Bar */}
      <header className="w-full flex items-center justify-between px-4 sm:px-8 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-slate-900 dark:text-white">
                SI-LKPD
              </span>
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                SMKN 1 SIDAYU
              </span>
            </div>
            <p className="hidden sm:block text-[11px] text-slate-500 dark:text-slate-400">
              Sistem Lembar Kerja Peserta Didik & Pembelajaran Daring Terpadu
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleForgotPassword}
            className="hidden sm:flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <HelpCircle className="h-3.5 w-3.5 text-blue-500" />
            Bantuan Login
          </button>
          <button
            onClick={toggleDarkMode}
            title={isDarkMode ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900 transition-colors"
          >
            {isDarkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </header>

      {/* Main Login Body: Split Screen */}
      <main className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 gap-8 items-center justify-center">
        {/* Left Side: School Branding & Showcase */}
        <div className="hidden lg:flex flex-col justify-between flex-1 h-[680px] rounded-3xl bg-gradient-to-br from-blue-900 via-indigo-950 to-slate-950 p-10 text-white shadow-2xl relative overflow-hidden border border-blue-800/50">
          {/* Subtle Background Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Identity */}
          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/20 px-3.5 py-1 text-xs font-bold text-blue-300 border border-blue-400/30">
              <School className="h-4 w-4" />
              <span>SMK PUSAT KEUNGGULAN • GRESIK</span>
            </div>

            <h1 className="text-3xl xl:text-4xl font-extrabold tracking-tight leading-tight">
              Sistem Informasi LKPD Interaktif
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
                SMK Negeri 1 Sidayu
              </span>
            </h1>

            <p className="text-sm text-blue-100/90 leading-relaxed max-w-xl">
              Platform pembelajaran daring Kurikulum Merdeka terintegrasi untuk 32 Rombongan Belajar, 65 Tenaga Pendidik, dan 17 Mata Pelajaran Kejuruan & Umum.
            </p>
          </div>

          {/* Middle: 4 Kejuruan Cards */}
          <div className="relative z-10 grid grid-cols-2 gap-3.5 my-6">
            <div className="rounded-2xl bg-white/10 p-3.5 backdrop-blur-md border border-white/10 hover:bg-white/15 transition-all">
              <div className="flex items-center gap-2 text-blue-300 font-bold text-xs mb-1">
                <Cpu className="h-4 w-4" />
                <span>Teknik Komputer & Jaringan</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Pemrograman, Jaringan Komputer, Koding & Kecerdasan Artifisial
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 p-3.5 backdrop-blur-md border border-white/10 hover:bg-white/15 transition-all">
              <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs mb-1">
                <Wrench className="h-4 w-4" />
                <span>Teknik Kendaraan Ringan</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Pemeliharaan Mesin Otomotif, Kelistrikan, dan Chassis Kendaraan
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 p-3.5 backdrop-blur-md border border-white/10 hover:bg-white/15 transition-all">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-xs mb-1">
                <Zap className="h-4 w-4" />
                <span>Teknik Instalasi Tenaga Listrik</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Instalasi Penerangan, Tenaga, dan Pengendali Motor Listrik
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 p-3.5 backdrop-blur-md border border-white/10 hover:bg-white/15 transition-all">
              <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs mb-1">
                <Fish className="h-4 w-4" />
                <span>Agribisnis Pengolahan Hasil</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Pengolahan Produk Perikanan Modern, Mutu, dan Kewirausahaan
              </p>
            </div>
          </div>

          {/* Bottom Info: Address */}
          <div className="relative z-10 border-t border-white/10 pt-4 flex items-center justify-between text-xs text-blue-200/80">
            <div>
              <p className="font-semibold text-white">SMK Negeri 1 Sidayu</p>
              <p className="text-[11px]">Jl. Raya Wadeng, Sidayu, Kabupaten Gresik, Jawa Timur</p>
            </div>
            <div className="text-right text-[11px]">
              <span className="inline-block rounded-md bg-emerald-500/20 px-2 py-0.5 text-emerald-300 font-mono font-bold">
                NPSN: 20500473
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: High-Conversion Portal Form */}
        <div className="w-full max-w-lg space-y-5">
          {/* Form Container */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            {/* Header Form */}
            <div className="text-center sm:text-left space-y-1.5 mb-6">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                Masuk ke SI-LKPD
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Gunakan kredensial akun belajar atau data resmi sekolah untuk masuk.
              </p>
            </div>

            {/* Error Banner */}
            {errorMsg && (
              <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300 flex items-start gap-2.5 animate-in fade-in duration-150">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
                <div className="flex-1">
                  <p className="font-bold">Akses Ditolak</p>
                  <p className="text-[11px] mt-0.5">{errorMsg}</p>
                </div>
              </div>
            )}

            {/* Role Category Tabs */}
            <div className="grid grid-cols-3 gap-1.5 rounded-2xl bg-slate-100 p-1 dark:bg-slate-800 mb-5">
              <button
                type="button"
                onClick={() => handleCategoryChange('guru')}
                className={`flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-bold rounded-xl transition-all ${
                  roleCategory === 'guru'
                    ? 'bg-white text-blue-600 shadow-sm dark:bg-slate-900 dark:text-blue-400'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <BookOpen className="h-3.5 w-3.5" />
                <span className="truncate">Guru / Tendik</span>
              </button>

              <button
                type="button"
                onClick={() => handleCategoryChange('murid')}
                className={`flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-bold rounded-xl transition-all ${
                  roleCategory === 'murid'
                    ? 'bg-white text-emerald-600 shadow-sm dark:bg-slate-900 dark:text-emerald-400'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <GraduationCap className="h-3.5 w-3.5" />
                <span className="truncate">Siswa</span>
              </button>

              <button
                type="button"
                onClick={() => handleCategoryChange('admin_kepsek')}
                className={`flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-bold rounded-xl transition-all ${
                  roleCategory === 'admin_kepsek'
                    ? 'bg-white text-purple-600 shadow-sm dark:bg-slate-900 dark:text-purple-400'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <Shield className="h-3.5 w-3.5" />
                <span className="truncate">Admin / Kepsek</span>
              </button>
            </div>

            {/* Login Form */}
            <form onSubmit={handleCustomLogin} className="space-y-4 text-xs">
              {/* Identifier Input */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {roleCategory === 'guru'
                    ? 'Email Akun Belajar atau NIP Guru'
                    : roleCategory === 'murid'
                    ? 'NISN Siswa atau Email Belajar'
                    : 'Email Resmi Administrator / Kepala Sekolah'}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder={
                      roleCategory === 'guru'
                        ? 'ahmadwibowo62@guru.sma.belajar.id atau NIP (198312162024211002)'
                        : roleCategory === 'murid'
                        ? '0075648921 atau dimas.siswa@smkn1sidayu.sch.id'
                        : 'admin@smkn1sidayu.sch.id atau kepsek@smkn1sidayu.sch.id'
                    }
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 pl-10 pr-4 py-3 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 outline-none transition-all font-medium"
                  />
                </div>
                {roleCategory === 'guru' && (
                  <div className="mt-2.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setShowTeacherLookup(true)}
                        className="inline-flex items-center gap-1.5 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                      >
                        <Search className="h-3 w-3" /> Cari Nama / NIP Guru (65 Pendidik Resmi SMKN 1 Sidayu)
                      </button>
                      <span className="text-[10px] text-slate-400">Pilih Identitas</span>
                    </div>
                    {selectedTeacherInfo && (
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-[11px] animate-fadeIn">
                        <div>
                          <span className="font-bold text-blue-900 dark:text-blue-200">{selectedTeacherInfo.name}</span>
                          <span className="text-slate-500 dark:text-slate-400 block text-[10px]">
                            NIP: {selectedTeacherInfo.nip} • {selectedTeacherInfo.mapel || 'Guru Pengampu'}
                          </span>
                        </div>
                        <span className="text-[10px] bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200 font-mono font-bold px-2 py-0.5 rounded-lg border border-blue-200 dark:border-blue-700">
                          Format: Guru{selectedTeacherInfo.nip.replace(/\s+/g, '').slice(-4)}!
                        </span>
                      </div>
                    )}
                  </div>
                )}
                {roleCategory === 'murid' && (
                  <div className="mt-2 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setShowStudentLookup(true)}
                      className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                    >
                      <Search className="h-3 w-3" /> Cari Nama / NISN Siswa (394 Siswa Terdaftar)
                    </button>
                    <span className="text-[10px] text-slate-400">Gunakan Sandi Siswa</span>
                  </div>
                )}
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Kata Sandi Akun
                  </label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                  >
                    Lupa Sandi?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder={
                      roleCategory === 'guru'
                        ? 'Contoh: Guru1002! (Guru + 4 digit akhir NIP + !)'
                        : roleCategory === 'murid'
                        ? 'Kata sandi siswa (default: siswa123)'
                        : 'Kata sandi administrator'
                    }
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 pl-10 pr-11 py-3 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 outline-none transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                    title={showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                  {roleCategory === 'guru'
                    ? 'Format kata sandi guru: Guru + 4 digit akhir NIP + tanda seru ! (Misal NIP berakhiran 1002 kata sandi adalah Guru1002!).'
                    : roleCategory === 'murid'
                    ? 'Default kata sandi siswa: siswa123 (kecuali telah diubah di profil).'
                    : 'Gunakan kredensial akun administrator resmi SMKN 1 Sidayu.'}
                </p>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-[11px] text-slate-600 dark:text-slate-400">
                    Ingat sesi login saya
                  </span>
                </label>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Autentikasi Terenkripsi</span>
                </div>
              </div>

              {/* Security Isolation Notice for Murid */}
              {roleCategory === 'murid' && (
                <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 p-3 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
                  <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                  <div>
                    <span className="font-bold">Keamanan Akses Peserta Didik (Siswa):</span>
                    <p className="text-[10px] text-amber-700 dark:text-amber-300/90 mt-0.5 leading-relaxed">
                      Siswa hanya diizinkan mengakses materi, pengerjaan LKPD, pengumpulan tugas, dan nilai rapor pribadi. Akses ke portal Guru dan Administrator diblokir otomatis demi integritas data asesmen.
                    </p>
                  </div>
                </div>
              )}

              {/* Security Isolation Notice for Guru */}
              {roleCategory === 'guru' && (
                <div className="rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 p-3 text-xs text-blue-900 dark:text-blue-200 flex items-start gap-2.5">
                  <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
                  <div>
                    <span className="font-bold">Keamanan Akses Guru Pengampu:</span>
                    <p className="text-[10px] text-blue-700 dark:text-blue-300/90 mt-0.5 leading-relaxed">
                      Portal ini dikhususkan bagi pendidik untuk manajemen pembelajaran, CP/TP, dan penilaian kelas. Kredensial siswa ditolak. Akun guru juga tidak diizinkan masuk ke portal Administrator.
                    </p>
                  </div>
                </div>
              )}

              {/* Security Isolation Notice for Admin & Kepsek */}
              {roleCategory === 'admin_kepsek' && (
                <div className="rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 p-3 text-xs text-purple-900 dark:text-purple-200 flex items-start gap-2.5">
                  <Lock className="h-4 w-4 shrink-0 mt-0.5 text-purple-600 dark:text-purple-400" />
                  <div>
                    <span className="font-bold">Keamanan Ketat Administrator Sistem:</span>
                    <p className="text-[10px] text-purple-700 dark:text-purple-300/90 mt-0.5 leading-relaxed">
                      Portal ini memiliki hak kelola tingkat tinggi (manajemen akun, database, dan struktur kurikulum). Akses dibatasi secara eksklusif untuk Admin & Kepala Sekolah. Kredensial Siswa dan Guru diblokir total.
                    </p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3.5 text-xs font-bold text-white shadow-lg shadow-blue-500/30 hover:from-blue-700 hover:to-indigo-700 active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <span>Memverifikasi Hak Akses & Kredensial...</span>
                ) : (
                  <>
                    <span>Masuk ke Portal SI-LKPD</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            {/* Security Isolation Policy Card */}
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-3 border border-slate-200/70 dark:border-slate-800 flex items-start gap-2.5">
                <Lock className="h-4 w-4 text-slate-500 dark:text-slate-400 shrink-0 mt-0.5" />
                <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Pemisahan Hak Akses Role-Based Access Control (RBAC):</span> Sistem secara aktif memverifikasi kesesuaian peran saat login. Siswa tidak dapat mengakses modul Guru atau Admin, dan Guru tidak dapat mengakses modul Admin.
                </div>
              </div>
            </div>
          </div>

          {/* Security & System Status Footer */}
          <div className="rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 p-3.5 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span>Autentikasi Terenkripsi & Terpusat</span>
            </div>
            <span className="text-[11px] font-mono">T.A. 2026/2027</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full text-center py-4 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-400">
        © 2026 SMK NEGERI 1 SIDAYU — GRESIK • Kurikulum Merdeka Terpadu
      </footer>

      {/* Official Student Lookup Modal (394 Students) */}
      <StudentLookupModal
        isOpen={showStudentLookup}
        onClose={() => setShowStudentLookup(false)}
        onSelectStudent={handleSelectStudent}
      />

      {/* Official Teacher Lookup Modal (65 Official SMKN 1 Sidayu Teachers) */}
      <TeacherLookupModal
        isOpen={showTeacherLookup}
        onClose={() => setShowTeacherLookup(false)}
        onSelectTeacher={handleSelectTeacher}
      />
    </div>
  );
};
