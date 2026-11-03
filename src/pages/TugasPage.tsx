import React, { useState, useRef } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Assignment, AttachmentItem } from '../types';
import { DocumentPreviewModal } from '../components/DocumentPreviewModal';
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
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  X,
  Edit2,
  FileText,
  Paperclip,
  Eye,
  Download,
  ExternalLink,
  UserCheck,
  Search,
  Filter
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';

export const TugasPage: React.FC = () => {
  const {
    assignments,
    addAssignment,
    updateAssignment,
    deleteAssignment,
    submissions,
    submitAssignment,
    classes,
    cpList,
    tpList,
    lkpdList,
    rubrics,
    subjects
  } = useData();
  const { role, currentUser } = useAuth();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState<Assignment | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyMyAssignments, setOnlyMyAssignments] = useState(role === 'guru');
  const [previewAttachment, setPreviewAttachment] = useState<any | null>(null);

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

  // Teacher attachments during assignment creation
  const [assignmentAttachments, setAssignmentAttachments] = useState<AttachmentItem[]>([
    {
      id: 'att-guide-1',
      name: 'Panduan_Praktikum_dan_Rubrik_Penilaian.pdf',
      url: '#',
      size: '1.8 MB',
      type: 'pdf',
      uploadedAt: new Date().toISOString()
    }
  ]);

  // Edit assignment state
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editSubject, setEditSubject] = useState('');
  const [editClassId, setEditClassId] = useState('');
  const [editCpId, setEditCpId] = useState('');
  const [editTpId, setEditTpId] = useState('');
  const [editLkpdId, setEditLkpdId] = useState('');
  const [editDeadline, setEditDeadline] = useState('');
  const [editAssignmentAttachments, setEditAssignmentAttachments] = useState<AttachmentItem[]>([]);
  const editAssignmentFileInputRef = useRef<HTMLInputElement>(null);

  // Student submission form states
  const [studentNote, setStudentNote] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('Laporan_Praktikum_Mandiri.pdf');
  const [submissionFileUrl, setSubmissionFileUrl] = useState('#');
  const [submissionLink, setSubmissionLink] = useState('');
  const [isSubmissionDragging, setIsSubmissionDragging] = useState(false);

  const assignmentFileInputRef = useRef<HTMLInputElement>(null);
  const submissionFileInputRef = useRef<HTMLInputElement>(null);

  const canManage = role === 'guru' || role === 'admin';

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleAssignmentFilesPicked = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      const ext = file.name.split('.').pop()?.toLowerCase() || 'pdf';
      const detectedType = ext === 'docx' ? 'docx' : ext === 'pptx' ? 'pptx' : 'pdf';
      reader.onload = (e) => {
        const dataUrl = (e.target?.result as string) || '#';
        const newAtt: AttachmentItem = {
          id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          name: file.name,
          url: dataUrl,
          size: formatFileSize(file.size),
          type: detectedType,
          uploadedAt: new Date().toISOString()
        };
        setAssignmentAttachments((prev) => [...prev, newAtt]);
        setTitle((prev) => {
          if (!prev.trim()) {
            return `Tugas Praktik: ${file.name.replace(/\.[^/.]+$/, '').replace(/[_\\-]/g, ' ')}`;
          }
          return prev;
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const handleStudentFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = (e.target?.result as string) || '#';
      setUploadedFileName(file.name);
      setSubmissionFileUrl(dataUrl);
    };
    reader.readAsDataURL(file);
  };

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
      attachments: assignmentAttachments.length > 0 ? assignmentAttachments : undefined,
      teacherId: currentUser.uid,
      teacherName: currentUser.displayName
    });

    setShowCreateModal(false);
    setTitle('');
    setDescription('');
    setAssignmentAttachments([
      {
        id: `att-${Date.now()}`,
        name: 'Panduan_Praktikum_dan_Rubrik_Penilaian.pdf',
        url: '#',
        size: '1.8 MB',
        type: 'pdf',
        uploadedAt: new Date().toISOString()
      }
    ]);

    Swal.fire({
      icon: 'success',
      title: 'Penugasan Berhasil Diterbitkan',
      text: 'Peserta didik rombel telah menerima notifikasi penugasan beserta lampiran panduan.',
      timer: 1800,
      showConfirmButton: false
    });
  };

  const handleOpenEditAssignment = (assign: Assignment) => {
    setEditingAssignment(assign);
    setEditTitle(assign.title);
    setEditDescription(assign.description);
    setEditSubject(assign.subject);
    setEditClassId(assign.classIds[0] || classes[0]?.id || '');
    setEditCpId(assign.cpId || cpList[0]?.id || '');
    setEditTpId(assign.tpId || tpList[0]?.id || '');
    setEditLkpdId(assign.lkpdId || '');
    setEditDeadline(assign.deadline ? assign.deadline.slice(0, 16) : '2026-11-20T23:59');
    setEditAssignmentAttachments(assign.attachments ? [...assign.attachments] : []);
  };

  const handleEditAssignmentFilesPicked = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      const ext = file.name.split('.').pop()?.toLowerCase() || 'pdf';
      const detectedType = ext === 'docx' ? 'docx' : ext === 'pptx' ? 'pptx' : 'pdf';
      reader.onload = (e) => {
        const dataUrl = (e.target?.result as string) || '#';
        const newAtt: AttachmentItem = {
          id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          name: file.name,
          url: dataUrl,
          size: formatFileSize(file.size),
          type: detectedType,
          uploadedAt: new Date().toISOString()
        };
        setEditAssignmentAttachments((prev) => [...prev, newAtt]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSaveEditAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAssignment || !editTitle.trim()) return;

    updateAssignment(editingAssignment.id, {
      title: editTitle,
      description: editDescription,
      subject: editSubject,
      classIds: [editClassId],
      cpId: editCpId,
      tpId: editTpId,
      lkpdId: editLkpdId || undefined,
      deadline: new Date(editDeadline).toISOString(),
      attachments: editAssignmentAttachments.length > 0 ? editAssignmentAttachments : undefined
    });

    setEditingAssignment(null);
    Swal.fire({
      icon: 'success',
      title: 'Penugasan Berhasil Diperbarui',
      text: `Perubahan tugas "${editTitle}" berhasil disimpan.`,
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
      className: currentUser.className || 'X TKJ 1',
      note: studentNote,
      fileName: uploadedFileName,
      fileUrl: submissionFileUrl !== '#' ? submissionFileUrl : (submissionLink || '#')
    });

    setShowSubmitModal(null);
    setStudentNote('');
    setSubmissionLink('');
    setSubmissionFileUrl('#');
    Swal.fire({
      icon: 'success',
      title: 'Tugas Berhasil Dikirimkan',
      text: 'Berkas laporan dan lampiran tugas telah diserahkan ke guru pengampu.',
      confirmButtonColor: '#4f46e5'
    });
  };

  const filteredAssignments = assignments.filter((assign) => {
    const matchesSearch =
      assign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assign.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (assign.teacherName && assign.teacherName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesMyAssignments =
      !onlyMyAssignments ||
      role !== 'guru' ||
      assign.teacherId === currentUser.uid ||
      assign.teacherName?.toLowerCase() === currentUser.displayName.toLowerCase();

    return matchesSearch && matchesMyAssignments;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-blue-100 px-3 py-0.5 text-xs font-bold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
              LMS ADVANCED ASSIGNMENTS
            </span>
            <span className="rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
              KURIKULUM MERDEKA
            </span>
          </div>
          <h1 className="mt-2 text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Penugasan, Jobsheet & Evaluasi LKPD
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Penugasan pembelajaran daring terintegrasi dengan Capaian Pembelajaran (CP), Tujuan Pembelajaran (TP), multi-lampiran panduan, dan rubrik asesmen otomatis.
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-700 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Buat Penugasan Baru</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
        {/* Search */}
        <div className="relative min-w-[240px] flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari tugas, mata pelajaran, atau guru..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-medium"
          />
        </div>

        {/* Scoping Toggle */}
        {role === 'guru' && (
          <button
            type="button"
            onClick={() => setOnlyMyAssignments(!onlyMyAssignments)}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              onlyMyAssignments
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            <UserCheck className="h-3.5 w-3.5" />
            <span>⭐ Tugas Ampuan Saya</span>
          </button>
        )}
      </div>

      {/* Assignment List */}
      <div className="space-y-4">
        {filteredAssignments.map((assign) => {
          const mySub = submissions.find(
            (s) => s.assignmentId === assign.id && s.studentId === currentUser.uid
          );
          const isOverdue = new Date(assign.deadline).getTime() < Date.now();

          let statusBadge = {
            label: 'Belum Dikumpulkan',
            color: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
          };
          if (mySub) {
            statusBadge = {
              label: 'Sudah Dikumpulkan',
              color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
            };
          } else if (isOverdue) {
            statusBadge = {
              label: 'Batas Berakhir',
              color: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
            };
          }

          const targetCP = cpList.find((c) => c.id === assign.cpId);
          const targetTP = tpList.find((t) => t.id === assign.tpId);
          const assignSubmissions = submissions.filter((s) => s.assignmentId === assign.id);

          return (
            <div
              key={assign.id}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900 space-y-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
                <div className="space-y-1.5 max-w-3xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-blue-100 px-3 py-0.5 text-xs font-bold text-blue-800 dark:bg-blue-900/60 dark:text-blue-200">
                      {assign.subject}
                    </span>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${statusBadge.color}`}>
                      {statusBadge.label}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
                      <Clock className="h-3.5 w-3.5 text-orange-500" />
                      Tenggat: {new Date(assign.deadline).toLocaleString('id-ID')}
                    </span>
                    {assign.teacherName && (
                      <span className="text-[11px] text-slate-400">
                        • Guru: <strong>{assign.teacherName}</strong>
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    {assign.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {assign.description}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {assign.lkpdId && (
                    <Link
                      to="/lkpd"
                      className="flex items-center gap-1.5 rounded-2xl bg-indigo-50 px-3.5 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-300 transition-colors"
                    >
                      <Compass className="h-4 w-4" /> Buka LKPD Interaktif
                    </Link>
                  )}

                  {role === 'murid' && !mySub && (
                    <button
                      onClick={() => setShowSubmitModal(assign)}
                      className="flex items-center gap-1.5 rounded-2xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition-all cursor-pointer"
                    >
                      <Upload className="h-4 w-4" /> Kumpulkan Tugas
                    </button>
                  )}

                  {canManage && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditAssignment(assign)}
                        className="flex items-center gap-1.5 rounded-xl bg-slate-100 hover:bg-indigo-100 text-slate-600 hover:text-indigo-700 dark:bg-slate-800 dark:hover:bg-indigo-950/60 dark:text-slate-300 dark:hover:text-indigo-300 px-3 py-2 text-xs font-bold transition-colors cursor-pointer"
                        title="Edit Penugasan"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => deleteAssignment(assign.id)}
                        className="rounded-xl p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                        title="Hapus Penugasan"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Attachments Section if teacher attached files */}
              {assign.attachments && assign.attachments.length > 0 && (
                <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/40 p-3 border border-slate-100 dark:border-slate-800 space-y-2">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Paperclip className="h-3.5 w-3.5 text-indigo-600" />
                    Berkas Lampiran Panduan Guru ({assign.attachments.length}):
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {assign.attachments.map((att, i) => (
                      <div
                        key={att.id || i}
                        className="flex items-center gap-2 rounded-xl bg-white dark:bg-slate-800 px-3 py-1.5 border border-slate-200 dark:border-slate-700 text-xs shadow-2xs"
                      >
                        <FileText className="h-4 w-4 text-blue-500" />
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{att.name}</span>
                        <span className="text-[10px] text-slate-400">({att.size || '1.8 MB'})</span>
                        <button
                          type="button"
                          onClick={() => setPreviewAttachment(att)}
                          className="text-indigo-600 hover:underline font-bold text-[11px] ml-1 cursor-pointer"
                        >
                          Buka
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Teacher grading status badge */}
              {canManage && (
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-500">
                    Pengumpulan Siswa: <strong>{assignSubmissions.length} Berkas Masuk</strong>
                  </span>
                  <Link
                    to="/penilaian"
                    className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                  >
                    Buka Halaman Penilaian & Rubrik →
                  </Link>
                </div>
              )}

              {/* Kurikulum Merdeka metadata links */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1">
                <span className="flex items-center gap-1">
                  <Layers className="h-3.5 w-3.5 text-blue-500" />
                  CP: <strong>{targetCP?.code || 'CP-E-TKJ-01'}</strong> ({targetCP?.element || 'Kejuruan'})
                </span>
                <span className="flex items-center gap-1">
                  <Target className="h-3.5 w-3.5 text-emerald-500" />
                  TP: <strong>{targetTP?.code || 'TP-01.1'}</strong>
                </span>
                <span className="flex items-center gap-1">
                  <Award className="h-3.5 w-3.5 text-purple-500" />
                  Rubrik: <strong>Rubrik Asesmen SMKN 1 Sidayu</strong>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {filteredAssignments.length === 0 && (
        <div className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center text-slate-400">
          <FileCheck2 className="h-12 w-12 mx-auto text-slate-300 mb-3" />
          <p className="font-bold text-sm text-slate-600 dark:text-slate-300">
            Tidak ada penugasan yang sesuai pencarian.
          </p>
        </div>
      )}

      {/* Modal Guru Buat Tugas dengan Multi-Attachment */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="h-5 w-5 text-indigo-600" />
                Buat Penugasan Siswa Baru
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="rounded-xl p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAssignment} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Judul Penugasan
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Jobsheet Praktikum Mandiri: Konfigurasi Routing Dinamis..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 p-3 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Mata Pelajaran (17 Mapel Resmi SMKN 1 Sidayu)
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 p-3 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
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
                    Kelas Sasaran
                  </label>
                  <select
                    value={classId}
                    onChange={(e) => setClassId(e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 p-3 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
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
                    Tenggat Waktu
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 p-3 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
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
                    className="w-full rounded-2xl border border-slate-300 p-3 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    {cpList.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.code} - {c.element.slice(0, 25)}...
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
                    className="w-full rounded-2xl border border-slate-300 p-3 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    {tpList.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.code} - {t.description.slice(0, 25)}...
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Multi-Attachment for Assignment Guide */}
              <div className="rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/50 dark:bg-indigo-950/20 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-extrabold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                    <Paperclip className="h-4 w-4 text-indigo-600" />
                    Lampirkan Dokumen Panduan / Jobsheet Tugas
                  </label>
                  <span className="text-[10px] text-indigo-600 font-semibold">
                    {assignmentAttachments.length} Berkas
                  </span>
                </div>

                {assignmentAttachments.map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center justify-between rounded-xl bg-white dark:bg-slate-800 p-2.5 border border-indigo-100 dark:border-indigo-900"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="h-4 w-4 text-indigo-600 shrink-0" />
                      <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs truncate">
                        {att.name}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">({att.size})</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setAssignmentAttachments((prev) => prev.filter((a) => a.id !== att.id))}
                      className="text-slate-400 hover:text-rose-500 p-1"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}

                {/* Native hidden input */}
                <input
                  ref={assignmentFileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.docx,.doc,.pptx,.ppt,.xlsx,.xls,.mp4,.zip,.png,.jpg,.jpeg"
                  onChange={(e) => {
                    handleAssignmentFilesPicked(e.target.files);
                    if (e.target) e.target.value = '';
                  }}
                  className="hidden"
                />

                <div
                  onClick={() => assignmentFileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-indigo-300 dark:border-indigo-800 bg-white/70 dark:bg-slate-800/60 hover:bg-white hover:border-indigo-500 cursor-pointer transition-all"
                >
                  <UploadCloud className="h-5 w-5 text-indigo-600 mb-1" />
                  <p className="font-bold text-xs text-slate-800 dark:text-slate-200">
                    Pilih Dokumen Panduan / Jobsheet Tugas dari Perangkat
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Mendukung PDF, Word DOCX, Slide PPT, Excel (Maks. 50 MB)
                  </p>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Petunjuk & Kriteria Tugas
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Jelaskan kriteria pengerjaan tugas, format berkas yang diminta, dan panduan teknis..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 p-3 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-2xl px-4 py-2.5 text-slate-600 hover:bg-slate-100 dark:text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-2xl bg-indigo-600 px-5 py-2.5 font-bold text-white hover:bg-indigo-700 shadow-md shadow-indigo-600/30"
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
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Upload className="h-5 w-5 text-emerald-600" />
                Kirim Pengumpulan Tugas Siswa
              </h2>
              <button
                onClick={() => setShowSubmitModal(null)}
                className="rounded-xl p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitWork} className="mt-4 space-y-4 text-xs">
              <div className="rounded-2xl bg-slate-50 p-3.5 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
                <p className="font-extrabold text-slate-900 dark:text-white">{showSubmitModal.title}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Siswa: {currentUser.displayName} ({currentUser.className || 'X TKJ 1'}) • NISN: {currentUser.nisn || '0075648921'}
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Pilih Berkas Tugas (PDF, DOCX, XLSX, PPTX, ZIP, Gambar)
                </label>
                <input
                  type="file"
                  accept=".pdf,.docx,.doc,.pptx,.ppt,.xlsx,.xls,.mp4,.zip,.png,.jpg,.jpeg"
                  onChange={(e) => handleStudentFileSelect(e.target.files)}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-950 dark:file:text-indigo-300 cursor-pointer"
                />
                <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold mt-1">
                  Berkas siap diunggah: {uploadedFileName}
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Tautan Tambahan (Google Drive, GitHub, atau Canva — Opsional)
                </label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/... atau https://github.com/..."
                  value={submissionLink}
                  onChange={(e) => setSubmissionLink(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Catatan untuk Guru Pengampu
                </label>
                <textarea
                  rows={3}
                  value={studentNote}
                  onChange={(e) => setStudentNote(e.target.value)}
                  placeholder="Tuliskan catatan proses pengerjaan atau kendala yang dihadapi..."
                  className="w-full rounded-2xl border border-slate-300 p-3 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(null)}
                  className="rounded-2xl px-4 py-2.5 text-slate-600 hover:bg-slate-100 dark:text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-2xl bg-emerald-600 px-5 py-2.5 font-bold text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/30"
                >
                  Serahkan Tugas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Assignment Modal */}
      {editingAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div className="my-8 w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600">
                  <Edit2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                    Edit Penugasan Pembelajaran & Asesmen
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Perbarui judul, instruksi, tenggat waktu, CP/TP, atau berkas panduan tugas
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingAssignment(null)}
                className="rounded-xl p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditAssignment} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Judul Penugasan / Jobsheet
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 bg-slate-50 p-2.5 font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Instruksi Kerja & Deskripsi Tugas
                </label>
                <textarea
                  rows={3}
                  required
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 bg-slate-50 p-3 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-indigo-500 leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Mata Pelajaran
                  </label>
                  <select
                    value={editSubject}
                    onChange={(e) => setEditSubject(e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 bg-slate-50 p-2.5 font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    {subjects && subjects.length > 0 ? (
                      subjects.map((s) => (
                        <option key={s.id} value={s.name}>
                          {s.name}
                        </option>
                      ))
                    ) : (
                      <option value={editSubject}>{editSubject}</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Target Kelas Rombel
                  </label>
                  <select
                    value={editClassId}
                    onChange={(e) => setEditClassId(e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 bg-slate-50 p-2.5 font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.major})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Capaian Pembelajaran (CP)
                  </label>
                  <select
                    value={editCpId}
                    onChange={(e) => setEditCpId(e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 bg-slate-50 p-2.5 font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    {cpList.map((cp) => (
                      <option key={cp.id} value={cp.id}>
                        {cp.code} - {cp.element}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tujuan Pembelajaran (TP)
                  </label>
                  <select
                    value={editTpId}
                    onChange={(e) => setEditTpId(e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 bg-slate-50 p-2.5 font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    {tpList.map((tp) => (
                      <option key={tp.id} value={tp.id}>
                        {tp.code} - {tp.description.slice(0, 45)}...
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tenggat Pengumpulan (Deadline)
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={editDeadline}
                    onChange={(e) => setEditDeadline(e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 bg-slate-50 p-2.5 font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tautkan Modul LKPD Interaktif
                  </label>
                  <select
                    value={editLkpdId}
                    onChange={(e) => setEditLkpdId(e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 bg-slate-50 p-2.5 font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    <option value="">-- Tanpa Tautan LKPD Langsung --</option>
                    {lkpdList.map((lk) => (
                      <option key={lk.id} value={lk.id}>
                        {lk.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Attachments Section in Edit Assignment Modal */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-slate-700 dark:text-slate-300">
                    Berkas Lampiran Panduan Guru ({editAssignmentAttachments.length})
                  </label>
                  <input
                    ref={editAssignmentFileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.docx,.doc,.pptx,.ppt,.xlsx,.xls,.mp4,.zip,.png,.jpg,.jpeg"
                    onChange={(e) => {
                      handleEditAssignmentFilesPicked(e.target.files);
                      if (e.target) e.target.value = '';
                    }}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => editAssignmentFileInputRef.current?.click()}
                    className="flex items-center gap-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 cursor-pointer"
                  >
                    <Paperclip className="h-3 w-3" />
                    <span>+ Tambah / Unggah File</span>
                  </button>
                </div>

                {editAssignmentAttachments.length > 0 ? (
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {editAssignmentAttachments.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-800/60 p-2.5 border border-slate-200 dark:border-slate-700 text-xs"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <FileText className="h-4 w-4 text-indigo-500 shrink-0" />
                          <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                            {file.name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">({file.size})</span>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setEditAssignmentAttachments((prev) =>
                              prev.filter((_, i) => i !== idx)
                            )
                          }
                          className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer"
                          title="Hapus Lampiran"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 italic">
                    Tidak ada berkas lampiran panduan.
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingAssignment(null)}
                  className="rounded-2xl px-4 py-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 cursor-pointer font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-2xl bg-indigo-600 px-5 py-2 font-bold text-white hover:bg-indigo-700 shadow-md shadow-indigo-600/30 cursor-pointer"
                >
                  Simpan Perubahan Penugasan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Document Preview Modal */}
      <DocumentPreviewModal
        isOpen={!!previewAttachment}
        onClose={() => setPreviewAttachment(null)}
        attachment={previewAttachment}
      />
    </div>
  );
};
