import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { UserProfile, SubjectItem } from '../types';
import {
  Users,
  BookOpen,
  Layers,
  Search,
  FileSpreadsheet,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  Sparkles,
  Download,
  Filter,
  GraduationCap,
  ShieldCheck,
  RotateCcw,
  X,
  AlertCircle,
  Check,
  HelpCircle
} from 'lucide-react';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';

export const GuruDanMapelPage: React.FC = () => {
  const {
    subjects,
    addSubject,
    updateSubject,
    deleteSubject,
    classes,
    teachers,
    addTeacher,
    updateTeacher,
    deleteTeacher,
    resetTeachersAndSubjects
  } = useData();
  const { role, currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'guru' | 'mapel' | 'kelas'>('guru');
  const [searchGuru, setSearchGuru] = useState('');
  const [filterMapel, setFilterMapel] = useState('all');
  const [searchMapel, setSearchMapel] = useState('');
  const [filterJurusan, setFilterJurusan] = useState('all');

  // Teacher Modals
  const [editingTeacher, setEditingTeacher] = useState<UserProfile | null>(null);
  const [showAddTeacherModal, setShowAddTeacherModal] = useState(false);
  const [teacherFormData, setTeacherFormData] = useState<{
    displayName: string;
    nip: string;
    subjectsTaught: string[];
  }>({
    displayName: '',
    nip: '',
    subjectsTaught: []
  });

  // Mapel Modals
  const [editingSubject, setEditingSubject] = useState<SubjectItem | null>(null);
  const [showAddMapelModal, setShowAddMapelModal] = useState(false);
  const [mapelFormData, setMapelFormData] = useState<{
    name: string;
    category: 'Umum' | 'Kejuruan' | 'Pilihan' | 'Muatan Lokal / Khusus' | 'Bimbingan';
  }>({
    name: '',
    category: 'Kejuruan'
  });

  const canManage = role === 'admin' || role === 'guru';

  // Helper: Get subjects taught by teacher
  const getTeacherSubjects = (t: UserProfile): string[] => {
    if (t.subjectsTaught && t.subjectsTaught.length > 0) {
      return t.subjectsTaught;
    }
    const combined = t.subject || t.major || 'Pengajar SMKN 1 Sidayu';
    return combined.split(',').map((s) => s.trim()).filter(Boolean);
  };

  // Filter Teachers
  const filteredTeachers = teachers.filter((t) => {
    const q = searchGuru.toLowerCase().trim();
    if (!q) return true;
    const matchesName = (t.displayName || '').toLowerCase().includes(q);
    const matchesNip = (t.nip || '').replace(/\s/g, '').includes(q.replace(/\s/g, ''));
    const tSubjects = getTeacherSubjects(t).join(' ').toLowerCase();
    const matchesMapel = tSubjects.includes(q);
    return matchesName || matchesNip || matchesMapel;
  });

  // Filter Mapel
  const filteredSubjects = subjects.filter((s) => {
    const matchesCategory = filterMapel === 'all' || s.category === filterMapel;
    const matchesQuery = s.name.toLowerCase().includes(searchMapel.toLowerCase().trim());
    return matchesCategory && matchesQuery;
  });

  // Filter Classes
  const filteredClasses = classes.filter((c) => {
    if (filterJurusan === 'all') return true;
    return c.name.includes(filterJurusan);
  });

  // Toggle subject in teacher form
  const toggleSubjectInForm = (subjectName: string) => {
    setTeacherFormData((prev) => {
      const exists = prev.subjectsTaught.includes(subjectName);
      if (exists) {
        return {
          ...prev,
          subjectsTaught: prev.subjectsTaught.filter((s) => s !== subjectName)
        };
      } else {
        return {
          ...prev,
          subjectsTaught: [...prev.subjectsTaught, subjectName]
        };
      }
    });
  };

  // Export Data Guru to Excel
  const exportTeachersToExcel = () => {
    const formatted = teachers.map((t, index) => {
      const subjList = getTeacherSubjects(t);
      return {
        'No': index + 1,
        'Nama Guru & Gelar': t.displayName,
        'NIP': (t.nip || '-').replace(/\s+/g, ''),
        'Jumlah Mapel Diampu': subjList.length,
        'Daftar Mata Pelajaran Diampu': subjList.join('; ')
      };
    });

    const ws = XLSX.utils.json_to_sheet(formatted);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data_Guru_SMKN1SIDAYU');
    XLSX.writeFile(wb, `Data_${teachers.length}_Guru_SMKN_1_SIDAYU.xlsx`);

    Swal.fire({
      icon: 'success',
      title: 'Data Guru Diekspor',
      text: `File Excel Data ${teachers.length} Guru SMKN 1 Sidayu berhasil diunduh.`,
      timer: 1500,
      showConfirmButton: false
    });
  };

  // Export Data Mapel to Excel
  const exportSubjectsToExcel = () => {
    const formatted = subjects.map((s, index) => ({
      'No': index + 1,
      'Nama Mata Pelajaran': s.name,
      'Kelompok / Kategori': s.category || 'Umum'
    }));

    const ws = XLSX.utils.json_to_sheet(formatted);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Mata_Pelajaran');
    XLSX.writeFile(wb, `Daftar_${subjects.length}_Mata_Pelajaran_SMKN_1_SIDAYU.xlsx`);

    Swal.fire({
      icon: 'success',
      title: 'Data Mapel Diekspor',
      text: `File Excel ${subjects.length} Mata Pelajaran SMKN 1 Sidayu berhasil diunduh.`,
      timer: 1500,
      showConfirmButton: false
    });
  };

  // Reset to default official data
  const handleResetData = () => {
    Swal.fire({
      title: 'Muat Ulang Data Asli Sekolah?',
      text: 'Semua perubahan pada data 65 guru dan 17 mata pelajaran akan dikembalikan ke data resmi awal SMKN 1 Sidayu.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#2563eb',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Muat Ulang',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
        resetTeachersAndSubjects();
        Swal.fire({
          icon: 'success',
          title: 'Data Berhasil Direset',
          text: 'Data 65 Guru & 17 Mapel SMKN 1 Sidayu telah dikembalikan ke kondisi awal resmi.',
          timer: 1500,
          showConfirmButton: false
        });
      }
    });
  };

  // Teacher Handlers
  const openEditTeacher = (teacher: UserProfile) => {
    setEditingTeacher(teacher);
    const currentTaught = getTeacherSubjects(teacher);
    setTeacherFormData({
      displayName: teacher.displayName,
      nip: teacher.nip || '',
      subjectsTaught: currentTaught.length > 0 ? currentTaught : ['Koding dan Kecerdasan Artifisial']
    });
  };

  const handleUpdateTeacherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeacher || !teacherFormData.displayName.trim()) return;

    const subjectsToSave = teacherFormData.subjectsTaught.length > 0
      ? teacherFormData.subjectsTaught
      : ['Pengajar SMKN 1 Sidayu'];

    updateTeacher(editingTeacher.uid, {
      displayName: teacherFormData.displayName.trim(),
      nip: teacherFormData.nip.replace(/\s+/g, '') || '-',
      subjectsTaught: subjectsToSave,
      subject: subjectsToSave.join(', '),
      major: subjectsToSave.join(' & ')
    });

    setEditingTeacher(null);
    Swal.fire({
      icon: 'success',
      title: 'Data Guru Diperbarui',
      text: `${teacherFormData.displayName} kini mengampu ${subjectsToSave.length} mata pelajaran: ${subjectsToSave.join(', ')}`,
      timer: 2000,
      showConfirmButton: false
    });
  };

  const handleAddTeacherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherFormData.displayName.trim()) return;

    const email = teacherFormData.displayName.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 12) + '@guru.smkn1sidayu.sch.id';
    const subjectsToSave = teacherFormData.subjectsTaught.length > 0
      ? teacherFormData.subjectsTaught
      : ['Pengajar SMKN 1 Sidayu'];

    addTeacher({
      displayName: teacherFormData.displayName.trim(),
      email,
      nip: teacherFormData.nip.replace(/\s+/g, '') || '-',
      subjectsTaught: subjectsToSave,
      subject: subjectsToSave.join(', '),
      major: subjectsToSave.join(' & ')
    });

    setShowAddTeacherModal(false);
    setTeacherFormData({ displayName: '', nip: '', subjectsTaught: [] });
    Swal.fire({
      icon: 'success',
      title: 'Guru Berhasil Ditambahkan',
      text: `Guru baru mengampu ${subjectsToSave.length} mata pelajaran.`,
      timer: 1600,
      showConfirmButton: false
    });
  };

  const handleDeleteTeacher = (teacher: UserProfile) => {
    Swal.fire({
      title: `Hapus Guru?`,
      text: `Apakah Anda yakin ingin menghapus data ${teacher.displayName}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    }).then((res) => {
      if (res.isConfirmed) {
        deleteTeacher(teacher.uid);
        Swal.fire({
          icon: 'success',
          title: 'Guru Dihapus',
          timer: 1200,
          showConfirmButton: false
        });
      }
    });
  };

  // Mapel Handlers
  const openEditSubject = (subject: SubjectItem) => {
    setEditingSubject(subject);
    setMapelFormData({
      name: subject.name,
      category: subject.category || 'Kejuruan'
    });
  };

  const handleUpdateSubjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubject || !mapelFormData.name.trim()) return;

    updateSubject(editingSubject.id, {
      name: mapelFormData.name.trim(),
      category: mapelFormData.category
    });

    setEditingSubject(null);
    Swal.fire({
      icon: 'success',
      title: 'Mata Pelajaran Diperbarui',
      timer: 1300,
      showConfirmButton: false
    });
  };

  const handleAddSubjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mapelFormData.name.trim()) return;

    addSubject({
      name: mapelFormData.name.trim(),
      category: mapelFormData.category
    });

    setShowAddMapelModal(false);
    setMapelFormData({ name: '', category: 'Kejuruan' });
    Swal.fire({
      icon: 'success',
      title: 'Mata Pelajaran Ditambahkan',
      timer: 1300,
      showConfirmButton: false
    });
  };

  const handleDeleteSubject = (subject: SubjectItem) => {
    Swal.fire({
      title: `Hapus Mata Pelajaran?`,
      text: `Hapus mapel "${subject.name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    }).then((res) => {
      if (res.isConfirmed) {
        deleteSubject(subject.id);
        Swal.fire({
          icon: 'success',
          title: 'Mapel Dihapus',
          timer: 1200,
          showConfirmButton: false
        });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-yellow-300" />
              <span>Data Pokok Satuan Pendidikan • SMKN 1 SIDAYU</span>
            </div>
            <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight">
              Data Resmi Guru, Mata Pelajaran & Kelas
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-blue-100 max-w-2xl leading-relaxed">
              Memuat data resmi <strong>{teachers.length} Guru (lengkap NIP)</strong>, <strong>{subjects.length} Mata Pelajaran</strong> Kurikulum Merdeka, dan <strong>{classes.length} Rombongan Belajar (Kelas)</strong> SMK Negeri 1 Sidayu. Sistem mendukung <strong>1 Guru mengajar 2 atau lebih mata pelajaran</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {canManage && (
              <button
                onClick={handleResetData}
                className="flex items-center gap-2 rounded-xl bg-white/15 px-3.5 py-2.5 text-xs font-bold text-white hover:bg-white/25 transition-all backdrop-blur-sm border border-white/20"
                title="Kembalikan data ke kondisi awal resmi sekolah"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset Data Resmi
              </button>
            )}

            {activeTab === 'guru' && (
              <>
                <button
                  onClick={exportTeachersToExcel}
                  className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-500 transition-all"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  Ekspor Guru ({teachers.length})
                </button>
                {canManage && (
                  <button
                    onClick={() => {
                      setTeacherFormData({
                        displayName: '',
                        nip: '',
                        subjectsTaught: ['Koding dan Kecerdasan Artifisial', 'Informatika']
                      });
                      setShowAddTeacherModal(true);
                    }}
                    className="flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-orange-500 transition-all"
                  >
                    <Plus className="h-4 w-4" />
                    Tambah Guru
                  </button>
                )}
              </>
            )}

            {activeTab === 'mapel' && (
              <>
                <button
                  onClick={exportSubjectsToExcel}
                  className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-500 transition-all"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  Ekspor Mapel ({subjects.length})
                </button>
                {canManage && (
                  <button
                    onClick={() => {
                      setMapelFormData({ name: '', category: 'Kejuruan' });
                      setShowAddMapelModal(true);
                    }}
                    className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-500 transition-all"
                  >
                    <Plus className="h-4 w-4" />
                    Tambah Mapel
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Info Card: Multi-Mapel Guidance */}
      <div className="rounded-2xl border border-blue-100 bg-blue-50/80 p-4 dark:border-blue-900/50 dark:bg-blue-950/30">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-blue-600 p-2 text-white shrink-0 mt-0.5">
            <BookOpen className="h-4 w-4" />
          </div>
          <div className="text-xs text-slate-700 dark:text-slate-300">
            <p className="font-bold text-blue-900 dark:text-blue-200">
              💡 Fleksibilitas 1 Guru Mengajar 2 Mapel atau Lebih
            </p>
            <p className="mt-1 leading-relaxed">
              Di SMKN 1 Sidayu, seorang guru dapat mengampu <strong>1, 2, atau lebih mata pelajaran sekaligus</strong>. Contoh nyata pada akun aktif Anda: <strong>Ahmad Heru Wahyu Wibowo, S.Pd</strong> mengampu <strong>Koding dan Kecerdasan Artifisial</strong> serta <strong>Informatika</strong>. Anda dapat mengklik tombol <strong>Edit (pensil)</strong> pada tabel guru untuk menambah atau mengubah daftar mapel yang diampu oleh setiap guru.
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2">
        <button
          onClick={() => setActiveTab('guru')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'guru'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
          }`}
        >
          <Users className="h-4 w-4" />
          Data {teachers.length} Guru & NIP
          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
            {teachers.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('mapel')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'mapel'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
          }`}
        >
          <BookOpen className="h-4 w-4" />
          {subjects.length} Mata Pelajaran
          <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
            {subjects.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('kelas')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'kelas'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
          }`}
        >
          <Layers className="h-4 w-4" />
          {classes.length} Kelas (APHPi, TKR, TKJ, TITL)
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
            {classes.length}
          </span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: DATA GURU SMKN 1 SIDAYU                            */}
      {/* ========================================================= */}
      {activeTab === 'guru' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative min-w-[280px] flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama guru, NIP, atau mata pelajaran..."
                value={searchGuru}
                onChange={(e) => setSearchGuru(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 shadow-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Menampilkan <b>{filteredTeachers.length}</b> dari {teachers.length} Pendidik
              </span>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  <tr>
                    <th className="p-3.5" style={{ width: '4%' }}>No</th>
                    <th className="p-3.5" style={{ width: '28%' }}>Nama Guru & Gelar</th>
                    <th className="p-3.5" style={{ width: '20%' }}>Nomor Induk Pegawai (NIP)</th>
                    <th className="p-3.5" style={{ width: '36%' }}>Mata Pelajaran Diampu</th>
                    <th className="p-3.5 text-center" style={{ width: '6%' }}>Status</th>
                    {canManage && <th className="p-3.5 text-center" style={{ width: '6%' }}>Aksi</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredTeachers.map((t, idx) => {
                    const isCurrentAhmad = t.displayName.includes('Ahmad Heru Wahyu Wibowo');
                    const mapelList = getTeacherSubjects(t);
                    const isMultiMapel = mapelList.length >= 2;

                    return (
                      <tr
                        key={t.uid || idx}
                        className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                          isCurrentAhmad ? 'bg-blue-50/70 dark:bg-blue-950/40 font-semibold' : ''
                        }`}
                      >
                        <td className="p-3.5 text-slate-400 font-mono">{idx + 1}</td>
                        <td className="p-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
                              {t.displayName.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white">
                                {t.displayName}
                              </p>
                              {isCurrentAhmad && (
                                <span className="inline-flex items-center gap-1 text-[10px] text-blue-600 dark:text-blue-400 font-bold">
                                  <ShieldCheck className="h-3 w-3" /> Akun Pengguna Aktif
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5">
                          {t.nip && t.nip !== '-' ? (
                            <span className="font-mono text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded">
                              {t.nip.replace(/\s+/g, '')}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">Non-NIP / GTT</span>
                          )}
                        </td>
                        <td className="p-3.5">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {mapelList.map((m, mIdx) => {
                              // Alternate tag color for multiple mapel
                              const tagColor = mIdx % 2 === 0
                                ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800';

                              return (
                                <span
                                  key={mIdx}
                                  className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[11px] font-semibold border ${tagColor}`}
                                >
                                  <BookOpen className="h-3 w-3 shrink-0" />
                                  <span>{m}</span>
                                </span>
                              );
                            })}
                            {isMultiMapel && (
                              <span className="inline-flex items-center rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-extrabold text-orange-700 dark:bg-orange-950/60 dark:text-orange-300">
                                {mapelList.length} Mapel
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3.5 text-center">
                          <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                            Aktif
                          </span>
                        </td>
                        {canManage && (
                          <td className="p-3.5 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => openEditTeacher(t)}
                                className="rounded-lg p-1.5 text-slate-500 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-slate-800 transition-colors"
                                title="Edit Guru & Mapel Diampu"
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteTeacher(t)}
                                className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-slate-800 transition-colors"
                                title="Hapus Guru"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: MATA PELAJARAN RESMI SMKN 1 SIDAYU                  */}
      {/* ========================================================= */}
      {activeTab === 'mapel' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-[260px] max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari mata pelajaran..."
                  value={searchMapel}
                  onChange={(e) => setSearchMapel(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                />
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-1 text-xs">
                {['all', 'Umum', 'Kejuruan', 'Pilihan', 'Muatan Lokal / Khusus', 'Bimbingan'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilterMapel(cat)}
                    className={`rounded-lg px-2.5 py-1.5 font-medium transition-all ${
                      filterMapel === cat
                        ? 'bg-blue-600 text-white font-bold'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {cat === 'all' ? 'Semua Kategori' : cat}
                  </button>
                ))}
              </div>
            </div>

            <span className="text-xs text-slate-500">
              Total: <b>{filteredSubjects.length}</b> Mata Pelajaran
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSubjects.map((sub, i) => (
              <div
                key={sub.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <span className="rounded-lg bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                      MAPEL #{i + 1}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {sub.category || 'Kurikulum Merdeka'}
                    </span>
                  </div>

                  <h3 className="mt-2.5 text-sm font-bold text-slate-900 dark:text-white">
                    {sub.name}
                  </h3>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span>SMKN 1 SIDAYU</span>
                  {canManage && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditSubject(sub)}
                        className="rounded-md p-1 text-slate-500 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-slate-800"
                        title="Edit Mapel"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteSubject(sub)}
                        className="rounded-md p-1 text-slate-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-slate-800"
                        title="Hapus Mapel"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: 32 KELAS RESMI SMKN 1 SIDAYU                       */}
      {/* ========================================================= */}
      {activeTab === 'kelas' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 text-xs">
              <span className="font-semibold text-slate-500">Filter Jurusan:</span>
              {['all', 'APHPi', 'TKR', 'TKJ', 'TITL'].map((jur) => (
                <button
                  key={jur}
                  onClick={() => setFilterJurusan(jur)}
                  className={`rounded-lg px-3 py-1.5 font-bold transition-all ${
                    filterJurusan === jur
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300'
                  }`}
                >
                  {jur === 'all' ? `Semua (${classes.length} Kelas)` : jur}
                </button>
              ))}
            </div>

            <span className="text-xs text-slate-500">
              Menampilkan <b>{filteredClasses.length}</b> Rombel
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {filteredClasses.map((cls) => (
              <div
                key={cls.id}
                className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs dark:border-slate-800 dark:bg-slate-900 text-center hover:border-blue-500 transition-colors"
              >
                <span className="inline-block rounded-lg bg-blue-600 px-2.5 py-1 text-xs font-bold text-white mb-1.5">
                  {cls.name}
                </span>
                <p className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {cls.major}
                </p>
                <p className="text-[10px] text-slate-400 mt-1">
                  Wali: {cls.teacherName.split(' ')[0]}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: EDIT DATA GURU & MAPEL DIAMPU                      */}
      {/* ========================================================= */}
      {editingTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Edit3 className="h-4 w-4 text-blue-600" />
                  Edit Data Guru & Mapel Diampu
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Atur nama, NIP, serta centang 1, 2, atau lebih mata pelajaran yang diampu.
                </p>
              </div>
              <button
                onClick={() => setEditingTeacher(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateTeacherSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Nama Guru & Gelar
                </label>
                <input
                  type="text"
                  required
                  value={teacherFormData.displayName}
                  onChange={(e) => setTeacherFormData({ ...teacherFormData, displayName: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Nomor Induk Pegawai (NIP)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: 19831216 202421 1 002 atau -"
                  value={teacherFormData.nip}
                  onChange={(e) => setTeacherFormData({ ...teacherFormData, nip: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              {/* Multi-Select Mata Pelajaran Diampu */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Mata Pelajaran Diampu (Bisa Pilih 2 atau Lebih)
                  </label>
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                    {teacherFormData.subjectsTaught.length} Terpilih
                  </span>
                </div>

                {/* Selected Badges Preview */}
                <div className="mt-2 min-h-[38px] rounded-xl border border-dashed border-slate-200 p-2 dark:border-slate-700 flex flex-wrap gap-1.5 items-center bg-slate-50/50 dark:bg-slate-800/40">
                  {teacherFormData.subjectsTaught.length === 0 ? (
                    <span className="text-[11px] text-slate-400 italic">
                      Belum ada mapel dipilih. Klik pilihan di bawah untuk mencentang mapel.
                    </span>
                  ) : (
                    teacherFormData.subjectsTaught.map((sName) => (
                      <span
                        key={sName}
                        className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-2.5 py-1 text-xs font-bold text-white shadow-xs"
                      >
                        <BookOpen className="h-3 w-3" />
                        {sName}
                        <button
                          type="button"
                          onClick={() => toggleSubjectInForm(sName)}
                          className="hover:text-red-200 ml-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))
                  )}
                </div>

                {/* Available 17 Mapel Selector */}
                <p className="mt-2.5 text-[11px] font-medium text-slate-500">
                  Klik untuk menambah/menghapus mata pelajaran:
                </p>
                <div className="mt-1.5 grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
                  {subjects.map((s) => {
                    const isSelected = teacherFormData.subjectsTaught.includes(s.name);
                    return (
                      <button
                        type="button"
                        key={s.id}
                        onClick={() => toggleSubjectInForm(s.name)}
                        className={`flex items-center justify-between rounded-xl px-2.5 py-2 text-left text-xs transition-all border ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50 font-bold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        <span className="truncate pr-1">{s.name}</span>
                        {isSelected ? (
                          <div className="h-4 w-4 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                            <Check className="h-2.5 w-2.5" />
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400">({s.category || 'Mapel'})</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingTeacher(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-blue-500"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: TAMBAH DATA GURU BARU (MULTI-MAPEL)                */}
      {/* ========================================================= */}
      {showAddTeacherModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Plus className="h-4 w-4 text-orange-600" />
                  Tambah Pendidik / Guru Baru
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Dapat mengampu 1, 2, atau lebih mata pelajaran sekaligus.
                </p>
              </div>
              <button
                onClick={() => setShowAddTeacherModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddTeacherSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Nama Guru & Gelar
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Budi Santoso, S.Kom."
                  value={teacherFormData.displayName}
                  onChange={(e) => setTeacherFormData({ ...teacherFormData, displayName: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Nomor Induk Pegawai (NIP)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: 19850101 201001 1 001 atau -"
                  value={teacherFormData.nip}
                  onChange={(e) => setTeacherFormData({ ...teacherFormData, nip: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              {/* Multi-Select Mata Pelajaran Diampu */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Mata Pelajaran Diampu (Bisa Pilih 2 atau Lebih)
                  </label>
                  <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-bold text-orange-700 dark:bg-orange-950/50 dark:text-orange-300">
                    {teacherFormData.subjectsTaught.length} Terpilih
                  </span>
                </div>

                {/* Selected Badges Preview */}
                <div className="mt-2 min-h-[38px] rounded-xl border border-dashed border-slate-200 p-2 dark:border-slate-700 flex flex-wrap gap-1.5 items-center bg-slate-50/50 dark:bg-slate-800/40">
                  {teacherFormData.subjectsTaught.length === 0 ? (
                    <span className="text-[11px] text-slate-400 italic">
                      Pilih satu atau lebih mapel di bawah ini.
                    </span>
                  ) : (
                    teacherFormData.subjectsTaught.map((sName) => (
                      <span
                        key={sName}
                        className="inline-flex items-center gap-1 rounded-lg bg-orange-600 px-2.5 py-1 text-xs font-bold text-white shadow-xs"
                      >
                        <BookOpen className="h-3 w-3" />
                        {sName}
                        <button
                          type="button"
                          onClick={() => toggleSubjectInForm(sName)}
                          className="hover:text-red-200 ml-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))
                  )}
                </div>

                {/* Available 17 Mapel Selector */}
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
                  {subjects.map((s) => {
                    const isSelected = teacherFormData.subjectsTaught.includes(s.name);
                    return (
                      <button
                        type="button"
                        key={s.id}
                        onClick={() => toggleSubjectInForm(s.name)}
                        className={`flex items-center justify-between rounded-xl px-2.5 py-2 text-left text-xs transition-all border ${
                          isSelected
                            ? 'border-orange-600 bg-orange-50 font-bold text-orange-700 dark:bg-orange-950/60 dark:text-orange-300'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        <span className="truncate pr-1">{s.name}</span>
                        {isSelected ? (
                          <div className="h-4 w-4 rounded-full bg-orange-600 text-white flex items-center justify-center shrink-0">
                            <Check className="h-2.5 w-2.5" />
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400">({s.category || 'Mapel'})</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddTeacherModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-orange-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-orange-500"
                >
                  Tambah Guru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: EDIT MATA PELAJARAN                                */}
      {/* ========================================================= */}
      {editingSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Edit3 className="h-4 w-4 text-blue-600" />
                Edit Mata Pelajaran
              </h2>
              <button
                onClick={() => setEditingSubject(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateSubjectSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Nama Mata Pelajaran
                </label>
                <input
                  type="text"
                  required
                  value={mapelFormData.name}
                  onChange={(e) => setMapelFormData({ ...mapelFormData, name: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Kelompok / Kategori
                </label>
                <select
                  value={mapelFormData.category}
                  onChange={(e) =>
                    setMapelFormData({
                      ...mapelFormData,
                      category: e.target.value as any
                    })
                  }
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="Umum">Umum</option>
                  <option value="Kejuruan">Kejuruan</option>
                  <option value="Pilihan">Pilihan</option>
                  <option value="Muatan Lokal / Khusus">Muatan Lokal / Khusus</option>
                  <option value="Bimbingan">Bimbingan</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingSubject(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-blue-500"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: TAMBAH MATA PELAJARAN                              */}
      {/* ========================================================= */}
      {showAddMapelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="h-4 w-4 text-blue-600" />
                Tambah Mata Pelajaran Baru
              </h2>
              <button
                onClick={() => setShowAddMapelModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubjectSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Nama Mata Pelajaran
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pemrograman Mobile Lanjut"
                  value={mapelFormData.name}
                  onChange={(e) => setMapelFormData({ ...mapelFormData, name: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Kelompok / Kategori
                </label>
                <select
                  value={mapelFormData.category}
                  onChange={(e) =>
                    setMapelFormData({
                      ...mapelFormData,
                      category: e.target.value as any
                    })
                  }
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="Kejuruan">Kejuruan</option>
                  <option value="Umum">Umum</option>
                  <option value="Pilihan">Pilihan</option>
                  <option value="Muatan Lokal / Khusus">Muatan Lokal / Khusus</option>
                  <option value="Bimbingan">Bimbingan</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddMapelModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-blue-500"
                >
                  Tambah Mapel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
