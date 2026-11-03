import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { CapaianPembelajaran } from '../types';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  Target,
  Sparkles,
  BookOpen,
  CheckCircle2,
  X
} from 'lucide-react';
import Swal from 'sweetalert2';
import { Link } from 'react-router-dom';

export const CPManagement: React.FC = () => {
  const { cpList, addCP, updateCP, deleteCP, tpList, subjects } = useData();
  const { currentUser, role } = useAuth();

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterSubject, setFilterSubject] = useState('all');

  // Subjects taught by current logged-in teacher
  const teacherSubjects: string[] = currentUser.subjectsTaught && currentUser.subjectsTaught.length > 0
    ? currentUser.subjectsTaught
    : currentUser.subject
    ? currentUser.subject.split(',').map((s) => s.trim()).filter(Boolean)
    : ['Koding dan Kecerdasan Artifisial'];

  // Form states
  const [code, setCode] = useState('');
  const [phase, setPhase] = useState<'E' | 'F'>('E');
  const [subject, setSubject] = useState(teacherSubjects[0] || 'Koding dan Kecerdasan Artifisial');
  const [element, setElement] = useState('Prompt Engineering & Pemanfaatan AI Generatif');
  const [description, setDescription] = useState(
    'Pada akhir Fase E murid mampu menerapkan prompt engineering pada kecerdasan artifisial generatif sebagai evaluasi pemahaman terhadap proses perencanaan proyek, desain dan pengembangan produk.'
  );
  const [targetSemester, setTargetSemester] = useState(2);

  const canEdit = role === 'guru' || role === 'admin';

  const handleOpenAdd = () => {
    setEditingId(null);
    setCode(`CP-${phase}-AI-0${cpList.length + 1}`);
    setSubject('Koding dan Kecerdasan Artifisial');
    setElement('Prompt Engineering & Rekayasa Perangkat Lunak');
    setDescription(
      'Pada akhir Fase E murid mampu menerapkan prompt engineering pada kecerdasan artifisial generatif sebagai evaluasi pemahaman terhadap proses perencanaan proyek, desain dan pengembangan produk.'
    );
    setShowModal(true);
  };

  const handleOpenEdit = (cp: CapaianPembelajaran) => {
    setEditingId(cp.id);
    setCode(cp.code);
    setPhase(cp.phase);
    setSubject(cp.subject);
    setElement(cp.element);
    setDescription(cp.description);
    setTargetSemester(cp.targetSemester);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !code.trim()) return;

    if (editingId) {
      updateCP(editingId, {
        code,
        phase,
        subject,
        element,
        description,
        targetSemester
      });
      Swal.fire({
        icon: 'success',
        title: 'CP Berhasil Diperbarui',
        timer: 1500,
        showConfirmButton: false
      });
    } else {
      addCP({
        code,
        phase,
        subject,
        element,
        description,
        targetSemester,
        teacherId: currentUser.uid,
        teacherName: currentUser.displayName
      });
      Swal.fire({
        icon: 'success',
        title: 'Capaian Pembelajaran Ditambahkan',
        timer: 1500,
        showConfirmButton: false
      });
    }

    setShowModal(false);
  };

  const handleDelete = (id: string, codeStr: string) => {
    Swal.fire({
      title: `Hapus ${codeStr}?`,
      text: 'Semua Tujuan Pembelajaran (TP) yang terhubung ke CP ini juga akan terhapus.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    }).then((r) => {
      if (r.isConfirmed) {
        deleteCP(id);
        Swal.fire({
          icon: 'success',
          title: 'Terhapus',
          timer: 1200,
          showConfirmButton: false
        });
      }
    });
  };

  const filteredCPList = cpList.filter((cp) => {
    if (filterSubject === 'all') return true;
    return cp.subject === filterSubject;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
              KURIKULUM MERDEKA SMK
            </span>
            <span className="rounded-md bg-purple-100 px-2.5 py-0.5 text-xs font-bold text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
              SMKN 1 SIDAYU
            </span>
          </div>
          <h1 className="mt-2 text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            Manajemen Capaian Pembelajaran (CP)
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Standar kompetensi pembelajaran yang harus dicapai peserta didik pada setiap fase keahlian.
          </p>
        </div>

        {canEdit && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-600/30 hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Tambah Capaian Pembelajaran (CP)
          </button>
        )}
      </div>

      {/* Multi-Mapel Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Saring Mapel:</span>
          <button
            onClick={() => setFilterSubject('all')}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              filterSubject === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            Semua Mapel ({cpList.length})
          </button>
          {teacherSubjects.map((sName) => {
            const count = cpList.filter((c) => c.subject === sName).length;
            return (
              <button
                key={sName}
                onClick={() => setFilterSubject(sName)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                  filterSubject === sName
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/60 dark:text-blue-300'
                }`}
              >
                <span>⭐ {sName}</span>
                <span className="rounded-full bg-white/30 px-1.5 py-0.2 text-[10px] font-black">
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <span className="text-xs text-slate-400">
          Menampilkan <b>{filteredCPList.length}</b> CP
        </span>
      </div>

      {/* CP List */}
      <div className="space-y-4">
        {filteredCPList.map((cp) => {
          const connectedTPs = tpList.filter((t) => t.cpId === cp.id);
          return (
            <div
              key={cp.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded-lg bg-blue-600 px-2.5 py-1 text-xs font-bold text-white">
                      {cp.code}
                    </span>
                    <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      Fase {cp.phase} (Kelas {cp.phase === 'E' ? 'X' : 'XI/XII'})
                    </span>
                    <span className="text-xs text-slate-400">
                      Semester {cp.targetSemester}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-2">
                    Elemen: {cp.element}
                  </h3>
                  <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
                    Mata Pelajaran: {cp.subject}
                  </p>
                </div>

                {canEdit && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(cp)}
                      className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                      title="Edit CP"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(cp.id, cp.code)}
                      className="rounded-lg p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                      title="Hapus CP"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Description Body */}
              <div className="mt-4 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70">
                <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-serif italic">
                  "{cp.description}"
                </p>
              </div>

              {/* Connected TP Mini Bar */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-medium">
                  <Target className="h-4 w-4 text-emerald-600" />
                  <span>
                    Terhubung dengan <strong>{connectedTPs.length}</strong> Tujuan Pembelajaran (TP)
                  </span>
                </div>

                <Link
                  to="/tp"
                  className="font-bold text-blue-600 hover:underline dark:text-blue-400"
                >
                  Kelola TP Terkait &rarr;
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Tambah / Edit CP */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {editingId ? 'Edit Capaian Pembelajaran' : 'Tambah Capaian Pembelajaran Baru'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Kode CP
                  </label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Fase Pembelajaran
                  </label>
                  <select
                    value={phase}
                    onChange={(e) => setPhase(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="E">Fase E (Kelas X SMK)</option>
                    <option value="F">Fase F (Kelas XI & XII SMK)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Mata Pelajaran (17 Mapel Resmi SMKN 1 Sidayu)
                </label>
                {teacherSubjects.length > 1 && (
                  <div className="mb-2">
                    <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                      Pilihan Cepat Mapel Anda:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {teacherSubjects.map((sName) => (
                        <button
                          key={sName}
                          type="button"
                          onClick={() => {
                            setSubject(sName);
                            if (sName.toLowerCase().includes('koding') || sName.toLowerCase().includes('artifisial')) {
                              setCode(`CP-${phase}-AI-0${cpList.length + 1}`);
                            } else if (sName.toLowerCase().includes('informatika')) {
                              setCode(`CP-${phase}-INF-0${cpList.length + 1}`);
                            } else {
                              setCode(`CP-${phase}-MAPEL-0${cpList.length + 1}`);
                            }
                          }}
                          className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                            subject === sName
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/60 dark:text-blue-300'
                          }`}
                        >
                          ⭐ {sName}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name} ({s.category || 'Kurikulum Merdeka'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Elemen Capaian
                </label>
                <input
                  type="text"
                  required
                  value={element}
                  onChange={(e) => setElement(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Deskripsi Naratif CP
                </label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl px-4 py-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-5 py-2 font-bold text-white hover:bg-blue-700 shadow-md shadow-blue-600/30"
                >
                  Simpan CP
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
