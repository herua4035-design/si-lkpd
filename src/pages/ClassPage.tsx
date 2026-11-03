import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { ClassGroup } from '../types';
import { ExcelImportModal } from '../components/ExcelImportModal';
import {
  Layers,
  Plus,
  Users,
  Edit2,
  Trash2,
  FileSpreadsheet,
  GraduationCap,
  Sparkles,
  X,
  Search
} from 'lucide-react';
import Swal from 'sweetalert2';

export const ClassPage: React.FC = () => {
  const { classes, addClass, updateClass, deleteClass, students, teachers } = useData();
  const { role, currentUser } = useAuth();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedClassForStudents, setSelectedClassForStudents] = useState<ClassGroup | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [major, setMajor] = useState('Teknik Komputer dan Jaringan (TKJ)');
  const [grade, setGrade] = useState<'X' | 'XI' | 'XII'>('X');
  const [academicYear, setAcademicYear] = useState('2026/2027');
  const [teacherId, setTeacherId] = useState(teachers[0]?.uid || 'guru-01');

  const canManage = role === 'admin' || role === 'guru';

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const teacher = teachers.find((t) => t.uid === teacherId);

    addClass({
      name,
      major,
      grade,
      academicYear,
      teacherId,
      teacherName: teacher?.displayName || currentUser.displayName
    });

    setShowAddModal(false);
    setName('');
    Swal.fire({
      icon: 'success',
      title: 'Kelas Berhasil Dibuat',
      timer: 1500,
      showConfirmButton: false
    });
  };

  const handleDelete = (id: string, classNameStr: string) => {
    Swal.fire({
      title: `Hapus Kelas ${classNameStr}?`,
      text: 'Data kelas dan relasi penugasan akan disesuaikan.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Ya, Hapus'
    }).then((r) => {
      if (r.isConfirmed) deleteClass(id);
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
              MANAJEMEN ROMBEL
            </span>
            <span className="rounded-md bg-purple-100 px-2.5 py-0.5 text-xs font-bold text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
              SMKN 1 SIDAYU
            </span>
          </div>
          <h1 className="mt-2 text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            Data Kelas & Rombongan Belajar
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Kelola data kelas, jurusan keahlian, pembagian murid, dan integrasi import Excel.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/30 hover:bg-emerald-700 transition-colors"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Import Excel
          </button>

          {canManage && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-600/30 hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Tambah Kelas
            </button>
          )}
        </div>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {classes.map((cls) => {
          const classStudents = students.filter(
            (s) => s.classId === cls.id || s.className === cls.name
          );

          return (
            <div
              key={cls.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
            >
              <div>
                <div className="flex items-start justify-between">
                  <span className="rounded-lg bg-blue-600 px-3 py-1 text-xs font-bold text-white">
                    {cls.name}
                  </span>
                  <div className="flex items-center gap-1">
                    {canManage && (
                      <button
                        onClick={() => handleDelete(cls.id, cls.name)}
                        className="rounded-lg p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        title="Hapus Kelas"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white">
                  {cls.major}
                </h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Wali Kelas: <strong>{cls.teacherName}</strong>
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Tahun Pelajaran: {cls.academicYear} • Tingkat {cls.grade}
                </p>

                <div className="mt-4 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                  <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                    Jumlah Peserta Didik:
                  </span>
                  <span className="text-sm font-extrabold text-blue-600 dark:text-blue-400">
                    {classStudents.length || cls.studentCount || 36} Murid
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setSelectedClassForStudents(cls)}
                  className="w-full rounded-xl bg-blue-50 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300 transition-colors flex items-center justify-center gap-2"
                >
                  <Users className="h-3.5 w-3.5" />
                  Lihat Daftar Siswa Kelas
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Add Class */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Tambah Rombongan Belajar (Kelas) Baru
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Kelas
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: X PPLG 3 atau XI TKJ 2"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Konsentrasi Keahlian / Jurusan
                </label>
                <select
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="Agribisnis Pengolahan Hasil Perikanan (APHPi)">Agribisnis Pengolahan Hasil Perikanan (APHPi)</option>
                  <option value="Teknik Kendaraan Ringan (TKR)">Teknik Kendaraan Ringan (TKR)</option>
                  <option value="Teknik Komputer dan Jaringan (TKJ)">Teknik Komputer dan Jaringan (TKJ)</option>
                  <option value="Teknik Instalasi Tenaga Listrik (TITL)">Teknik Instalasi Tenaga Listrik (TITL)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tingkat / Fase
                  </label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="X">Kelas X (Fase E)</option>
                    <option value="XI">Kelas XI (Fase F)</option>
                    <option value="XII">Kelas XII (Fase F)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tahun Pelajaran
                  </label>
                  <input
                    type="text"
                    required
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Guru Wali Kelas
                </label>
                <select
                  value={teacherId}
                  onChange={(e) => setTeacherId(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  {teachers.map((t) => (
                    <option key={t.uid} value={t.uid}>
                      {t.displayName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl px-4 py-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-5 py-2 font-bold text-white hover:bg-blue-700 shadow-md shadow-blue-600/30"
                >
                  Simpan Kelas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal View Class Students */}
      {selectedClassForStudents && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Daftar Peserta Didik Kelas {selectedClassForStudents.name}
                </h2>
                <p className="text-xs text-slate-500">
                  {selectedClassForStudents.major} • Wali Kelas: {selectedClassForStudents.teacherName}
                </p>
              </div>
              <button
                onClick={() => setSelectedClassForStudents(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 flex-1 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 sticky top-0">
                  <tr>
                    <th className="p-3">No</th>
                    <th className="p-3">Nama Lengkap</th>
                    <th className="p-3">NISN</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {students.map((st, i) => (
                    <tr key={st.uid} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="p-3 text-slate-400">{i + 1}</td>
                      <td className="p-3 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <img
                          src={st.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250'}
                          alt=""
                          className="h-6 w-6 rounded-full object-cover"
                        />
                        {st.displayName}
                      </td>
                      <td className="p-3 font-mono text-blue-600 dark:text-blue-400">{st.nisn || '0075648921'}</td>
                      <td className="p-3">
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                          Aktif
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {showImportModal && (
        <ExcelImportModal onClose={() => setShowImportModal(false)} />
      )}
    </div>
  );
};
