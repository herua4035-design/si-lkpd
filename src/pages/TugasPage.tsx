import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Assignment } from '../types';
import {
  FileCheck2,
  Plus,
  Calendar,
  Clock,
  Compass,
  Layers,
  Target,
  Award,
  Upload,
  CheckCircle2,
  AlertCircle,
  X,
  FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';

export const TugasPage: React.FC = () => {
  const { assignments, addAssignment, deleteAssignment, submissions, submitAssignment, classes, cpList, tpList, lkpdList, rubrics, subjects } = useData();
  const { role, currentUser } = useAuth();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState<Assignment | null>(null);

  // Subjects taught by current logged-in teacher
  const teacherSubjects: string[] = currentUser.subjectsTaught && currentUser.subjectsTaught.length > 0
    ? currentUser.subjectsTaught
    : currentUser.subject
    ? currentUser.subject.split(',').map((s) => s.trim()).filter(Boolean)
    : ['Koding dan Kecerdasan Artifisial'];

  // New assignment form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState(teacherSubjects[0] || 'Koding dan Kecerdasan Artifisial');
  const [classId, setClassId] = useState(classes[0]?.id || 'class-x-tkj-1');
  const [cpId, setCpId] = useState(cpList[0]?.id || 'cp-01');
  const [tpId, setTpId] = useState(tpList[0]?.id || 'tp-01');
  const [lkpdId, setLkpdId] = useState(lkpdList[0]?.id || '');
  const [deadline, setDeadline] = useState('2026-11-20T23:59');

  // Student submission form states
  const [studentNote, setStudentNote] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('Tugas_Praktik_Murid.pdf');

  const canManage = role === 'guru' || role === 'admin';

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addAssignment({
      title,
      description,
      subject,
      classIds: [classId],
      cpId,
      tpId,
      rubricId: 'rubric-01',
      lkpdId: lkpdId || undefined,
      deadline: new Date(deadline).toISOString(),
      teacherId: currentUser.uid,
      teacherName: currentUser.displayName
    });

    setShowCreateModal(false);
    Swal.fire({
      icon: 'success',
      title: 'Tugas Berhasil Diterbitkan',
      text: 'Peserta didik telah menerima notifikasi penugasan baru.',
      timer: 1600,
      showConfirmButton: false
    });
  };

  const handleSubmitWork = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showSubmitModal) return;

    submitAssignment({
      assignmentId: showSubmitModal.id,
      assignmentTitle: showSubmitModal.title,
      studentId: currentUser.uid,
      studentName: currentUser.displayName,
      studentNisn: currentUser.nisn || '0075648921',
      classId: currentUser.classId || 'class-01',
      className: currentUser.className || 'X PPLG 1',
      note: studentNote,
      fileName: uploadedFileName
    });

    setShowSubmitModal(null);
    setStudentNote('');
    Swal.fire({
      icon: 'success',
      title: 'Tugas Berhasil Dikirimkan',
      text: 'Guru pengampu akan segera memeriksa dan memberikan nilai berbasis rubrik.',
      confirmButtonColor: '#2563eb'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
              MANAJEMEN PENUGASAN
            </span>
            <span className="rounded-md bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
              TERHUBUNG CP & TP
            </span>
          </div>
          <h1 className="mt-2 text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            Penugasan & Evaluasi LKPD
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Penugasan terintegrasi dengan Capaian Pembelajaran (CP), Tujuan Pembelajaran (TP), dan rubrik penilaian otomatis.
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-600/30 hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Buat Penugasan Baru
          </button>
        )}
      </div>

      {/* Assignment List */}
      <div className="space-y-4">
        {assignments.map((assign) => {
          const mySub = submissions.find(
            (s) => s.assignmentId === assign.id && s.studentId === currentUser.uid
          );
          const isOverdue = new Date(assign.deadline).getTime() < Date.now();

          let statusBadge = {
            label: 'Belum Dikumpulkan',
            color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800'
          };
          if (mySub) {
            statusBadge = {
              label: 'Sudah Dikumpulkan',
              color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800'
            };
          } else if (isOverdue) {
            statusBadge = {
              label: 'Terlambat',
              color: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800'
            };
          }

          const targetCP = cpList.find((c) => c.id === assign.cpId);
          const targetTP = tpList.find((t) => t.id === assign.tpId);

          return (
            <div
              key={assign.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-blue-600 px-2 py-0.5 text-xs font-bold text-white">
                      {assign.subject}
                    </span>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold border ${statusBadge.color}`}>
                      {statusBadge.label}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
                      <Clock className="h-3.5 w-3.5 text-orange-500" />
                      Batas: {new Date(assign.deadline).toLocaleString('id-ID')}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-2">
                    {assign.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
                    {assign.description}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {assign.lkpdId && (
                    <Link
                      to="/lkpd"
                      className="flex items-center gap-1.5 rounded-xl bg-blue-50 px-3.5 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300"
                    >
                      <Compass className="h-4 w-4" /> Buka LKPD Interaktif
                    </Link>
                  )}

                  {role === 'murid' && !mySub && (
                    <button
                      onClick={() => setShowSubmitModal(assign)}
                      className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700"
                    >
                      <Upload className="h-4 w-4" /> Kirim Tugas Sekarang
                    </button>
                  )}

                  {canManage && (
                    <button
                      onClick={() => deleteAssignment(assign.id)}
                      className="rounded-lg p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                      title="Hapus Penugasan"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Kurikulum Merdeka metadata links */}
              <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <Layers className="h-3.5 w-3.5 text-blue-500" />
                  CP: <strong>{targetCP?.code || 'CP-E-PPLG-01'}</strong> ({targetCP?.element || 'PPLG'})
                </span>
                <span className="flex items-center gap-1">
                  <Target className="h-3.5 w-3.5 text-emerald-500" />
                  TP: <strong>{targetTP?.code || 'TP-01.1'}</strong>
                </span>
                <span className="flex items-center gap-1">
                  <Award className="h-3.5 w-3.5 text-purple-500" />
                  Rubrik: <strong>Rubrik Standar SMKN 1 Sidayu</strong>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Guru Buat Tugas */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Buat Penugasan Baru
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAssignment} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Judul Tugas
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Tugas Praktik Mandiri: Penerapan Prompt Engineering..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
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
                          onClick={() => setSubject(sName)}
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Kelas Tujuan
                  </label>
                  <select
                    value={classId}
                    onChange={(e) => setClassId(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.major})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tenggat Waktu (Deadline)
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Capaian Pembelajaran (CP)
                  </label>
                  <select
                    value={cpId}
                    onChange={(e) => setCpId(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    {cpList.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.code} - {c.element.slice(0, 30)}...
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tujuan Pembelajaran (TP)
                  </label>
                  <select
                    value={tpId}
                    onChange={(e) => setTpId(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    {tpList.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.code} - {t.description.slice(0, 30)}...
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Hubungkan dengan LKPD Interaktif (Opsional)
                </label>
                <select
                  value={lkpdId}
                  onChange={(e) => setLkpdId(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="">-- Tidak Terhubung ke LKPD Khusus --</option>
                  {lkpdList.map((lk) => (
                    <option key={lk.id} value={lk.id}>
                      {lk.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Deskripsi / Petunjuk Pengerjaan
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Petunjuk detail tugas..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-xl px-4 py-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-5 py-2 font-bold text-white hover:bg-blue-700 shadow-md shadow-blue-600/30"
                >
                  Terbitkan Penugasan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Siswa Kirim Tugas */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Kirim Pengumpulan Tugas
              </h2>
              <button
                onClick={() => setShowSubmitModal(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitWork} className="mt-4 space-y-4 text-xs">
              <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
                <p className="font-bold text-slate-900 dark:text-white">{showSubmitModal.title}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Siswa: {currentUser.displayName} ({currentUser.className || 'X PPLG 1'})</p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Unggah Berkas Laporan (PDF, DOCX, JPG, PNG, PPTX, ZIP)
                </label>
                <input
                  type="file"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setUploadedFileName(e.target.files[0].name);
                    }
                  }}
                  className="text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-950 dark:file:text-blue-300"
                />
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">
                  Berkas terpilih: {uploadedFileName}
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Catatan untuk Guru
                </label>
                <textarea
                  rows={3}
                  value={studentNote}
                  onChange={(e) => setStudentNote(e.target.value)}
                  placeholder="Tuliskan catatan proses pengerjaan atau link referensi tambahan..."
                  className="w-full rounded-xl border border-slate-300 p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(null)}
                  className="rounded-xl px-4 py-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-5 py-2 font-bold text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/30"
                >
                  Serahkan Tugas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
