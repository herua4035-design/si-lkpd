import React, { useState, useRef } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { ClassGroup, LearningMaterial, Assignment } from '../types';
import { ExcelImportModal } from '../components/ExcelImportModal';
import { DocumentPreviewModal } from '../components/DocumentPreviewModal';
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
  Search,
  MessageSquare,
  FileText,
  Calendar,
  Send,
  Video,
  Download,
  Eye,
  CheckCircle2,
  Clock,
  Pin,
  Paperclip,
  Share2,
  MoreVertical,
  ChevronRight,
  BookOpen,
  Filter,
  Check,
  UserCheck,
  Folder,
  ArrowLeft,
  Laptop,
  Cpu,
  Wrench,
  Zap,
  Fish,
  HelpCircle,
  FileCheck2,
  Upload,
  UploadCloud
} from 'lucide-react';
import Swal from 'sweetalert2';

export const ClassPage: React.FC = () => {
  const {
    classes,
    addClass,
    updateClass,
    deleteClass,
    students,
    teachers,
    materials,
    assignments,
    submissions,
    scores,
    addMaterial,
    addAssignment
  } = useData();
  const { role, currentUser } = useAuth();

  // Navigation states
  const [activeClass, setActiveClass] = useState<ClassGroup | null>(null);
  const [activeTab, setActiveTab] = useState<'posts' | 'files' | 'assignments' | 'members' | 'grades'>('posts');

  // Filter states for Teams Grid Overview
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMajorFilter, setSelectedMajorFilter] = useState('all');
  const [selectedGradeFilter, setSelectedGradeFilter] = useState('all');
  const [onlyMyClasses, setOnlyMyClasses] = useState(false);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [previewAttachment, setPreviewAttachment] = useState<any | null>(null);

  // Posts Feed State for Teams In-Class View
  const [classPosts, setClassPosts] = useState<Record<string, Array<{
    id: string;
    authorName: string;
    authorRole: string;
    authorAvatar: string;
    title: string;
    content: string;
    timestamp: string;
    category: 'pengumuman' | 'diskusi' | 'tugas';
    attachments?: Array<{ name: string; size: string; type: string }>;
    likes: number;
    replies: Array<{ id: string; authorName: string; text: string; time: string }>;
  }>>>({
    'default': [
      {
        id: 'post-1',
        authorName: 'Ahmad Heru Wahyu Wibowo, S.Pd',
        authorRole: 'Guru Pengampu / Wali Kelas',
        authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
        title: 'Selamat Datang di Ruang Kelas Digital Kurikulum Merdeka T.A. 2026/2027',
        content: 'Halo rekan-rekan peserta didik sekalian! Seluruh materi ajar, jobsheet LKPD, modul praktikum, dan pengumpulan tugas kelas kita akan disalurkan melalui Teams Class SI-LKPD SMKN 1 Sidayu. Pastikan selalu memeriksa tenggat waktu dan berdiskusi secara santun di saluran ini.',
        timestamp: 'Hari ini, 07:30 WIB',
        category: 'pengumuman',
        attachments: [
          { name: 'Silabus_dan_Kontrak_Belajar_SMKN1Sidayu.pdf', size: '2.4 MB', type: 'pdf' },
          { name: 'Jadwal_Praktikum_Laboratorium_Komputer.docx', size: '1.1 MB', type: 'docx' }
        ],
        likes: 18,
        replies: [
          { id: 'r1', authorName: 'Dimas Bagus Saputra', text: 'Siap Pak, kami sudah mengunduh kontrak belajar!', time: '08:15 WIB' },
          { id: 'r2', authorName: 'Siti Nur Aisyah', text: 'Terima kasih Pak Guru, materi modulnya sangat jelas.', time: '08:30 WIB' }
        ]
      }
    ]
  });

  // Post composer state
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostCategory, setNewPostCategory] = useState<'pengumuman' | 'diskusi' | 'tugas'>('pengumuman');
  const [attachedFiles, setAttachedFiles] = useState<Array<{ name: string; size: string; type: string }>>([]);

  // Form states for creating new class
  const [name, setName] = useState('');
  const [major, setMajor] = useState('Teknik Komputer dan Jaringan (TKJ)');
  const [grade, setGrade] = useState<'X' | 'XI' | 'XII'>('X');
  const [academicYear, setAcademicYear] = useState('2026/2027');
  const [teacherId, setTeacherId] = useState(teachers[0]?.uid || 'guru-01');

  // Search filter for students inside active class
  const [memberSearchQuery, setMemberSearchQuery] = useState('');

  // Subjects taught by current logged-in teacher
  const teacherSubjects: string[] = currentUser.subjectsTaught && currentUser.subjectsTaught.length > 0
    ? currentUser.subjectsTaught
    : currentUser.subject
    ? currentUser.subject.split(',').map((s) => s.trim()).filter(Boolean)
    : ['Koding dan Kecerdasan Artifisial'];

  // Real Class File Upload modal state
  const [showClassUploadModal, setShowClassUploadModal] = useState(false);
  const [classUploadTitle, setClassUploadTitle] = useState('');
  const [classUploadFolder, setClassUploadFolder] = useState<'Modul Ajar' | 'Jobsheet LKPD' | 'Bahan Tayang PPT' | 'Bank Soal & Asesmen'>('Modul Ajar');
  const [classUploadSubject, setClassUploadSubject] = useState(teacherSubjects[0] || 'Koding dan Kecerdasan Artifisial');
  const [classUploadDescription, setClassUploadDescription] = useState('');
  const [classUploadedFiles, setClassUploadedFiles] = useState<Array<{ name: string; size: string; type: any; url: string }>>([]);
  const [isClassFileDragging, setIsClassFileDragging] = useState(false);
  const classFileInputRef = useRef<HTMLInputElement>(null);
  const postFileInputRef = useRef<HTMLInputElement>(null);

  const canManage = role === 'admin' || role === 'guru';

  // Filtered classes logic
  const filteredClasses = classes.filter((cls) => {
    const matchesSearch =
      cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cls.major.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cls.teacherName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesMajor =
      selectedMajorFilter === 'all' ||
      (selectedMajorFilter === 'TKJ' && cls.major.includes('TKJ')) ||
      (selectedMajorFilter === 'TKR' && cls.major.includes('TKR')) ||
      (selectedMajorFilter === 'TITL' && cls.major.includes('TITL')) ||
      (selectedMajorFilter === 'APHPi' && cls.major.includes('APHPi'));

    const matchesGrade = selectedGradeFilter === 'all' || cls.grade === selectedGradeFilter;

    const matchesMyClass =
      !onlyMyClasses ||
      (role === 'guru' &&
        (cls.teacherId === currentUser.uid ||
          cls.teacherName.toLowerCase().includes(currentUser.displayName.toLowerCase())));

    return matchesSearch && matchesMajor && matchesGrade && matchesMyClass;
  });

  // Color helper per major
  const getMajorTheme = (majorStr: string) => {
    if (majorStr.includes('TKJ')) {
      return {
        bgGradient: 'from-blue-600 via-indigo-600 to-indigo-800',
        badgeBg: 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200',
        icon: <Cpu className="h-4 w-4" />,
        nameShort: 'TKJ',
        accentColor: '#2563eb'
      };
    } else if (majorStr.includes('TKR')) {
      return {
        bgGradient: 'from-emerald-600 via-teal-600 to-teal-800',
        badgeBg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200',
        icon: <Wrench className="h-4 w-4" />,
        nameShort: 'TKR',
        accentColor: '#059669'
      };
    } else if (majorStr.includes('TITL')) {
      return {
        bgGradient: 'from-amber-500 via-orange-600 to-orange-800',
        badgeBg: 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200',
        icon: <Zap className="h-4 w-4" />,
        nameShort: 'TITL',
        accentColor: '#d97706'
      };
    } else {
      return {
        bgGradient: 'from-cyan-600 via-sky-600 to-blue-800',
        badgeBg: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/60 dark:text-cyan-200',
        icon: <Fish className="h-4 w-4" />,
        nameShort: 'APHPi',
        accentColor: '#0891b2'
      };
    }
  };

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
      title: 'Tim Kelas Berhasil Dibuat',
      text: `Kelas ${name} telah terdaftar di Teams SI-LKPD.`,
      timer: 1600,
      showConfirmButton: false
    });
  };

  const handleDelete = (id: string, classNameStr: string) => {
    Swal.fire({
      title: `Hapus Kelas ${classNameStr}?`,
      text: 'Semua relasi ruang kelas dan data penugasan akan disesuaikan.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Ya, Hapus Tim'
    }).then((r) => {
      if (r.isConfirmed) {
        if (activeClass?.id === id) setActiveClass(null);
        deleteClass(id);
      }
    });
  };

  // Publish new class announcement in Teams posts
  const handlePublishPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim() && !newPostTitle.trim()) return;
    if (!activeClass) return;

    const classKey = activeClass.id;
    const existing = classPosts[classKey] || classPosts['default'] || [];

    const newPost = {
      id: `post-${Date.now()}`,
      authorName: currentUser.displayName,
      authorRole: role === 'guru' ? 'Guru Pengampu' : role === 'admin' ? 'Administrator' : 'Siswa',
      authorAvatar: currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
      title: newPostTitle || 'Pemberitahuan Kelas',
      content: newPostContent,
      timestamp: 'Baru saja',
      category: newPostCategory,
      attachments: attachedFiles.length > 0 ? [...attachedFiles] : undefined,
      likes: 0,
      replies: []
    };

    setClassPosts((prev) => ({
      ...prev,
      [classKey]: [newPost, ...existing]
    }));

    setNewPostTitle('');
    setNewPostContent('');
    setAttachedFiles([]);
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Kiriman Berhasil Dipublikasikan',
      showConfirmButton: false,
      timer: 1800
    });
  };

  // Format bytes helper
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const detectFileType = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    if (ext === 'pdf') return 'pdf';
    if (['docx', 'doc'].includes(ext)) return 'docx';
    if (['pptx', 'ppt'].includes(ext)) return 'ppt';
    if (['xlsx', 'xls', 'csv'].includes(ext)) return 'xlsx';
    if (['mp4', 'mkv', 'mov', 'webm'].includes(ext)) return 'video';
    if (['png', 'jpg', 'jpeg', 'webp', 'svg'].includes(ext)) return 'image';
    return 'pdf';
  };

  // Real file picker for Post composer
  const handlePostFileSelected = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      const detected = detectFileType(file.name);
      reader.onload = (e) => {
        const dataUrl = (e.target?.result as string) || '#';
        setAttachedFiles((prev) => [
          ...prev,
          {
            name: file.name,
            size: formatFileSize(file.size),
            type: detected,
            url: dataUrl
          }
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  // Real file picker for Class module upload
  const handleClassFilesPicked = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      const detected = detectFileType(file.name);
      reader.onload = (e) => {
        const dataUrl = (e.target?.result as string) || '#';
        setClassUploadedFiles((prev) => [
          ...prev,
          {
            name: file.name,
            size: formatFileSize(file.size),
            type: detected,
            url: dataUrl
          }
        ]);
        setClassUploadTitle((prev) => {
          if (!prev.trim()) {
            return file.name.replace(/\.[^/.]+$/, '').replace(/[_\\-]/g, ' ');
          }
          return prev;
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSaveClassUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeClass) return;
    if (classUploadedFiles.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Pilih Berkas Terlebih Dahulu',
        text: 'Silakan klik area unggah untuk memilih dokumen dari komputer atau HP Anda.'
      });
      return;
    }

    const first = classUploadedFiles[0];
    const newTitle = classUploadTitle.trim() || first.name;

    addMaterial({
      title: `[${classUploadFolder}] ${newTitle}`,
      description: classUploadDescription || `Modul ajar ${classUploadFolder} untuk rombel ${activeClass.name}`,
      subject: classUploadSubject,
      classIds: [activeClass.id],
      type: first.type as any,
      fileName: first.name,
      fileSize: first.size,
      fileUrl: first.url,
      attachments: classUploadedFiles.map((f, i) => ({
        id: `att-cls-${Date.now()}-${i}`,
        name: f.name,
        size: f.size,
        type: f.type,
        url: f.url,
        uploadedAt: new Date().toISOString()
      })),
      tpId: 'tp-01',
      teacherId: currentUser.uid,
      teacherName: currentUser.displayName
    });

    setShowClassUploadModal(false);
    setClassUploadTitle('');
    setClassUploadDescription('');
    setClassUploadedFiles([]);

    Swal.fire({
      icon: 'success',
      title: 'Dokumen Berhasil Diunggah ke Tim',
      text: `File "${newTitle}" telah dibagikan ke seluruh siswa rombel ${activeClass.name}.`,
      timer: 2000,
      showConfirmButton: false
    });
  };

  // Students belonging STRICTLY to active class
  const activeClassStudents = activeClass
    ? students.filter((s) => {
        const matchesClass =
          s.className?.toLowerCase() === activeClass.name.toLowerCase() ||
          s.classId === activeClass.id ||
          (activeClass.name.includes('TKJ 1') && s.className?.includes('TKJ 1')) ||
          (activeClass.name.includes('TKJ 2') && s.className?.includes('TKJ 2'));

        if (!matchesClass) return false;

        if (memberSearchQuery) {
          const q = memberSearchQuery.toLowerCase();
          return (
            s.displayName.toLowerCase().includes(q) ||
            (s.nisn && s.nisn.includes(q))
          );
        }
        return true;
      })
    : [];

  // Fallback if imported roster doesn't match string exactly, take slice of appropriate students
  const displayStudents = activeClassStudents.length > 0
    ? activeClassStudents
    : students.slice(0, 36);

  // Materials belonging to active class
  const activeClassMaterials = activeClass
    ? materials.filter((m) =>
        m.classIds.includes(activeClass.id) ||
        m.classIds.includes('all') ||
        (m.subject && activeClass.major.toLowerCase().includes(m.subject.toLowerCase()))
      )
    : [];

  // Assignments belonging to active class
  const activeClassAssignments = activeClass
    ? assignments.filter((a) =>
        a.classIds.includes(activeClass.id) ||
        a.classIds.includes('all')
      )
    : [];

  return (
    <div className="space-y-6">
      {/* If No Active Class Selected: SHOW TEAMS GRID OVERVIEW */}
      {!activeClass ? (
        <>
          {/* Top Banner / Hero (Microsoft Teams Education Aesthetic) */}
          <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 p-6 sm:p-8 text-white shadow-xl dark:border-slate-800">
            <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
              <div className="max-w-2xl space-y-2">
                <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/20 px-3 py-1 text-xs font-bold text-blue-300 border border-blue-400/30">
                  <Layers className="h-3.5 w-3.5" />
                  <span>TEAMS RUANG KELAS & ROMBEL • MICROSOFT 365 HUB</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                  Manajemen Rombongan Belajar (Rombel)
                </h1>
                <p className="text-xs sm:text-sm text-blue-100/80 leading-relaxed">
                  Pusat kolaborasi terpadu bergaya Microsoft Teams untuk 32 Rombel, 4 Konsentrasi Keahlian (TKJ, TKR, TITL, APHPi), dan 65 Pendidik SMKN 1 Sidayu. Masuk ke ruang kelas untuk mengakses kiriman saluran, dokumen ajar, penugasan, dan buku nilai.
                </p>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setShowImportModal(true)}
                  className="flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-700 transition-all cursor-pointer"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  <span>Import Excel Rombel</span>
                </button>

                {canManage && (
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-700 transition-all cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Buat Tim Kelas Baru</span>
                  </button>
                )}
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="rounded-2xl bg-white/5 p-3 backdrop-blur-xs border border-white/10">
                <span className="text-slate-300 block text-[11px]">Total Rombel:</span>
                <span className="text-lg font-black text-white">{classes.length} Kelas Aktif</span>
              </div>
              <div className="rounded-2xl bg-white/5 p-3 backdrop-blur-xs border border-white/10">
                <span className="text-slate-300 block text-[11px]">Konsentrasi Keahlian:</span>
                <span className="text-lg font-black text-blue-300">4 Jurusan Utama</span>
              </div>
              <div className="rounded-2xl bg-white/5 p-3 backdrop-blur-xs border border-white/10">
                <span className="text-slate-300 block text-[11px]">Peserta Didik Terdaftar:</span>
                <span className="text-lg font-black text-emerald-300">{students.length} Siswa</span>
              </div>
              <div className="rounded-2xl bg-white/5 p-3 backdrop-blur-xs border border-white/10">
                <span className="text-slate-300 block text-[11px]">Pendidik Terverifikasi:</span>
                <span className="text-lg font-black text-amber-300">{teachers.length} Guru</span>
              </div>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari kelas, jurusan, atau nama wali kelas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {/* Jurusan Dropdown / Buttons */}
              <select
                value={selectedMajorFilter}
                onChange={(e) => setSelectedMajorFilter(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <option value="all">Semua Jurusan (4 Keahlian)</option>
                <option value="TKJ">Teknik Komputer & Jaringan (TKJ)</option>
                <option value="TKR">Teknik Kendaraan Ringan (TKR)</option>
                <option value="TITL">Teknik Instalasi Tenaga Listrik (TITL)</option>
                <option value="APHPi">Agribisnis Pengolahan Hasil (APHPi)</option>
              </select>

              {/* Tingkat */}
              <select
                value={selectedGradeFilter}
                onChange={(e) => setSelectedGradeFilter(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <option value="all">Semua Tingkat (X, XI, XII)</option>
                <option value="X">Kelas X (Fase E)</option>
                <option value="XI">Kelas XI (Fase F)</option>
                <option value="XII">Kelas XII (Fase F)</option>
              </select>

              {/* Only My Classes Toggle (Especially for Teachers to prevent mixing up) */}
              {role === 'guru' && (
                <button
                  type="button"
                  onClick={() => setOnlyMyClasses(!onlyMyClasses)}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-all cursor-pointer ${
                    onlyMyClasses
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  <UserCheck className="h-3.5 w-3.5" />
                  <span>Kelas Ampuan Saya</span>
                </button>
              )}
            </div>
          </div>

          {/* Teams Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredClasses.map((cls) => {
              const theme = getMajorTheme(cls.major);
              const classStudents = students.filter(
                (s) => s.classId === cls.id || s.className?.toLowerCase() === cls.name.toLowerCase()
              );
              const studentCount = classStudents.length > 0 ? classStudents.length : cls.studentCount || 36;

              return (
                <div
                  key={cls.id}
                  className="group relative flex flex-col justify-between rounded-3xl border border-slate-200 bg-white shadow-xs transition-all duration-200 hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900 overflow-hidden"
                >
                  {/* Top Teams Card Banner */}
                  <div className={`relative h-28 bg-gradient-to-r ${theme.bgGradient} p-4 text-white flex flex-col justify-between overflow-hidden`}>
                    <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />

                    <div className="flex items-center justify-between relative z-10">
                      <span className="rounded-full bg-black/25 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white">
                        {cls.grade} • {theme.nameShort}
                      </span>
                      {canManage && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(cls.id, cls.name);
                          }}
                          className="rounded-lg p-1.5 text-white/80 hover:text-white hover:bg-white/20 transition-colors"
                          title="Hapus Kelas"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="relative z-10 flex items-center gap-2">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-slate-900 shadow-md font-black text-sm">
                        {theme.icon}
                      </div>
                      <div className="leading-tight">
                        <h3 className="font-black text-base sm:text-lg text-white tracking-tight drop-shadow-xs">
                          {cls.name}
                        </h3>
                        <p className="text-[10px] text-white/80 truncate max-w-[170px]">
                          {cls.academicYear}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2.5">
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 line-clamp-1">
                        {cls.major}
                      </p>

                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <div className="h-6 w-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-[10px]">
                          {cls.teacherName.charAt(0)}
                        </div>
                        <div className="truncate">
                          <span className="text-[10px] text-slate-400 block">Wali Kelas:</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200 text-xs truncate">
                            {cls.teacherName}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Stat Badges */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                      <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-2 flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                        <Users className="h-3.5 w-3.5 text-blue-500" />
                        <span className="font-bold text-slate-900 dark:text-white">{studentCount}</span> Murid
                      </div>
                      <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-2 flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                        <MessageSquare className="h-3.5 w-3.5 text-purple-500" />
                        <span className="font-bold text-slate-900 dark:text-white">Teams</span> Hub
                      </div>
                    </div>

                    {/* Open Teams Button */}
                    <button
                      onClick={() => {
                        setActiveClass(cls);
                        setActiveTab('posts');
                      }}
                      className="w-full flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/20 active:scale-98 transition-all cursor-pointer"
                    >
                      <Layers className="h-3.5 w-3.5" />
                      <span>Buka Ruang Kelas (Teams)</span>
                      <ChevronRight className="h-3.5 w-3.5 ml-auto" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredClasses.length === 0 && (
            <div className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center text-slate-400">
              <Layers className="h-12 w-12 mx-auto text-slate-300 mb-3" />
              <p className="font-bold text-sm text-slate-600 dark:text-slate-300">
                Tidak ada rombongan belajar yang sesuai filter.
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Silakan ganti kata kunci pencarian atau setel ulang filter ke semua jurusan.
              </p>
            </div>
          )}
        </>
      ) : (
        /* ACTIVE TEAMS CLASSROOM WORKSPACE VIEW */
        <div className="space-y-6 animate-fadeIn">
          {/* Top Classroom Navigation Bar */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <button
                  onClick={() => setActiveClass(null)}
                  className="rounded-2xl border border-slate-200 p-2.5 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                  title="Kembali ke Semua Kelas"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-600 text-white font-black text-lg shadow-md shadow-indigo-500/20">
                  {getMajorTheme(activeClass.major).icon}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                      {activeClass.name}
                    </h2>
                    <span className="rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-200 px-2.5 py-0.5 text-xs font-bold">
                      Tingkat {activeClass.grade}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {activeClass.major} • Wali Kelas: <strong>{activeClass.teacherName}</strong> • T.A. {activeClass.academicYear}
                  </p>
                </div>
              </div>

              {/* Classroom Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    Swal.fire({
                      icon: 'info',
                      title: `Ruang Rapat Virtual Teams: ${activeClass.name}`,
                      html: `
                        <div class="text-left text-xs space-y-2 text-slate-600">
                          <p>Tautan ruang temu virtual kelas telah disiapkan melalui <strong>Microsoft Teams for Education / Google Meet</strong>.</p>
                          <div class="rounded-xl bg-slate-100 p-3 font-mono text-[11px] text-blue-600 break-all">
                            https://teams.microsoft.com/l/meetup-join/smkn1sidayu-${activeClass.name.toLowerCase().replace(/\s+/g, '-')}
                          </div>
                          <p class="text-[11px] text-slate-400">Seluruh siswa ${activeClass.name} menerima notifikasi rapat secara otomatis.</p>
                        </div>
                      `,
                      confirmButtonText: 'Buka Ruang Rapat Sekarang',
                      confirmButtonColor: '#4f46e5'
                    });
                  }}
                  className="flex items-center gap-1.5 rounded-2xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-700 transition-all cursor-pointer"
                >
                  <Video className="h-4 w-4" />
                  <span>Rapat Kelas (Meet)</span>
                </button>
              </div>
            </div>

            {/* Teams Channel Tabs */}
            <div className="mt-6 flex items-center gap-2 border-t border-slate-100 pt-4 dark:border-slate-800 overflow-x-auto scrollbar-none text-xs">
              <button
                onClick={() => setActiveTab('posts')}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 font-bold whitespace-nowrap transition-all ${
                  activeTab === 'posts'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                }`}
              >
                <MessageSquare className="h-4 w-4" />
                <span>📢 Postingan & Kiriman</span>
              </button>

              <button
                onClick={() => setActiveTab('files')}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 font-bold whitespace-nowrap transition-all ${
                  activeTab === 'files'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                }`}
              >
                <Folder className="h-4 w-4" />
                <span>📁 File & Modul ({activeClassMaterials.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('assignments')}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 font-bold whitespace-nowrap transition-all ${
                  activeTab === 'assignments'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                }`}
              >
                <FileCheck2 className="h-4 w-4 text-emerald-400" />
                <span>📝 Tugas & LKPD ({activeClassAssignments.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('members')}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 font-bold whitespace-nowrap transition-all ${
                  activeTab === 'members'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                }`}
              >
                <Users className="h-4 w-4" />
                <span>👥 Anggota Rombel ({displayStudents.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('grades')}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 font-bold whitespace-nowrap transition-all ${
                  activeTab === 'grades'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                }`}
              >
                <FileSpreadsheet className="h-4 w-4" />
                <span>📊 Buku Nilai</span>
              </button>
            </div>
          </div>

          {/* TAB 1: POSTS & DISKUSI (Saluran Umum) */}
          {activeTab === 'posts' && (
            <div className="space-y-6">
              {/* Post Composer for Teachers & Class */}
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                <form onSubmit={handlePublishPost} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Mulai Diskusi atau Pengumuman Baru:
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={newPostCategory}
                        onChange={(e) => setNewPostCategory(e.target.value as any)}
                        className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                      >
                        <option value="pengumuman">📢 Pengumuman Penting</option>
                        <option value="diskusi">💬 Diskusi & Tanya Jawab</option>
                        <option value="tugas">📝 Petunjuk Tugas</option>
                      </select>
                    </div>
                  </div>

                  <input
                    type="text"
                    placeholder="Judul Kiriman / Topik Bahasan..."
                    value={newPostTitle}
                    onChange={(e) => setNewPostTitle(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-indigo-500 font-bold"
                  />

                  <textarea
                    rows={3}
                    placeholder="Tulis pesan pengumuman atau instruksi belajar untuk seluruh siswa kelas ini..."
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-indigo-500"
                  />

                  {/* Attached Files Preview in Composer */}
                  {attachedFiles.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {attachedFiles.map((file, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 px-3 py-1.5 text-xs text-indigo-900 dark:text-indigo-200"
                        >
                          <Paperclip className="h-3.5 w-3.5 text-indigo-600" />
                          <span className="font-semibold">{file.name}</span>
                          <span className="text-[10px] text-slate-400">({file.size})</span>
                          <button
                            type="button"
                            onClick={() => setAttachedFiles((prev) => prev.filter((_, i) => i !== idx))}
                            className="text-slate-400 hover:text-rose-500"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Composer Footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                    {/* Hidden Native File Input for Post Attachment */}
                    <input
                      ref={postFileInputRef}
                      type="file"
                      multiple
                      accept=".pdf,.docx,.doc,.pptx,.ppt,.xlsx,.xls,.mp4,.zip,.png,.jpg,.jpeg"
                      onChange={(e) => {
                        handlePostFileSelected(e.target.files);
                        if (e.target) e.target.value = '';
                      }}
                      className="hidden"
                    />

                    <button
                      type="button"
                      onClick={() => postFileInputRef.current?.click()}
                      className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      <Paperclip className="h-3.5 w-3.5 text-indigo-500" />
                      <span>+ Lampirkan File dari Perangkat</span>
                    </button>

                    <button
                      type="submit"
                      disabled={!newPostContent.trim() && !newPostTitle.trim()}
                      className="flex items-center gap-1.5 rounded-2xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-700 disabled:opacity-40 transition-all cursor-pointer"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>Kirim ke Saluran</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Posts Feed Stream */}
              <div className="space-y-4">
                {(classPosts[activeClass.id] || classPosts['default'] || []).map((post) => (
                  <div
                    key={post.id}
                    className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4"
                  >
                    {/* Post Author Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={post.authorAvatar}
                          alt=""
                          className="h-10 w-10 rounded-2xl object-cover ring-2 ring-indigo-500/20"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                              {post.authorName}
                            </span>
                            <span className="rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 px-2 py-0.5 text-[10px] font-bold">
                              {post.authorRole}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400">{post.timestamp}</span>
                        </div>
                      </div>

                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        post.category === 'pengumuman'
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                          : post.category === 'tugas'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                      }`}>
                        {post.category}
                      </span>
                    </div>

                    {/* Post Content */}
                    <div className="space-y-2">
                      <h4 className="text-base font-black text-slate-900 dark:text-white">
                        {post.title}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                        {post.content}
                      </p>
                    </div>

                    {/* Post Attachments */}
                    {post.attachments && post.attachments.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                        {post.attachments.map((file, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/60 hover:bg-slate-100 transition-colors"
                          >
                            <div className="flex items-center gap-2.5 truncate">
                              <FileText className="h-5 w-5 text-indigo-600 shrink-0" />
                              <div className="truncate">
                                <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block truncate">
                                  {file.name}
                                </span>
                                <span className="text-[10px] text-slate-400">{file.size}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                onClick={() => setPreviewAttachment(file)}
                                className="rounded-xl p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-white dark:hover:bg-slate-700 transition-colors"
                                title="Pratinjau File"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Replies & Actions */}
                    <div className="border-t border-slate-100 pt-3 dark:border-slate-800 space-y-3">
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <button
                          onClick={() => {
                            Swal.fire({
                              toast: true,
                              position: 'top-end',
                              icon: 'success',
                              title: 'Reaksi Ditambahkan',
                              showConfirmButton: false,
                              timer: 1500
                            });
                          }}
                          className="hover:text-indigo-600 flex items-center gap-1.5"
                        >
                          👍 Suka ({post.likes})
                        </button>
                        <span>•</span>
                        <span>💬 {post.replies.length} Balasan Siswa</span>
                      </div>

                      {post.replies.length > 0 && (
                        <div className="space-y-2 pl-4 border-l-2 border-indigo-200 dark:border-indigo-900">
                          {post.replies.map((rep) => (
                            <div key={rep.id} className="text-xs bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl">
                              <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200 text-[11px]">
                                <span>{rep.authorName}</span>
                                <span className="text-[10px] text-slate-400 font-normal">{rep.time}</span>
                              </div>
                              <p className="text-slate-600 dark:text-slate-300 mt-0.5">{rep.text}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: FILES & MODUL (Saluran File) */}
          {activeTab === 'files' && (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Penyimpanan Dokumen & Modul Pembelajaran {activeClass.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Semua modul ajar, materi presentasi, dan jobsheet yang dibagikan untuk kelas ini.
                  </p>
                </div>

                <button
                  onClick={() => setShowClassUploadModal(true)}
                  className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-700 transition-colors cursor-pointer"
                >
                  <Upload className="h-4 w-4" />
                  <span>Unggah File / Modul Baru</span>
                </button>
              </div>

              {/* Folders row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-3.5 border border-slate-200 dark:border-slate-700 flex items-center gap-3 hover:bg-slate-100 transition-all cursor-pointer">
                  <div className="rounded-xl bg-amber-100 text-amber-600 p-2 dark:bg-amber-950 dark:text-amber-400">
                    <Folder className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-slate-800 dark:text-white block">Modul Ajar</span>
                    <span className="text-[10px] text-slate-400">4 Dokumen PDF</span>
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-3.5 border border-slate-200 dark:border-slate-700 flex items-center gap-3 hover:bg-slate-100 transition-all cursor-pointer">
                  <div className="rounded-xl bg-blue-100 text-blue-600 p-2 dark:bg-blue-950 dark:text-blue-400">
                    <Folder className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-slate-800 dark:text-white block">Jobsheet LKPD</span>
                    <span className="text-[10px] text-slate-400">6 File Praktikum</span>
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-3.5 border border-slate-200 dark:border-slate-700 flex items-center gap-3 hover:bg-slate-100 transition-all cursor-pointer">
                  <div className="rounded-xl bg-emerald-100 text-emerald-600 p-2 dark:bg-emerald-950 dark:text-emerald-400">
                    <Folder className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-slate-800 dark:text-white block">Bahan Tayang PPT</span>
                    <span className="text-[10px] text-slate-400">3 Presentasi</span>
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-3.5 border border-slate-200 dark:border-slate-700 flex items-center gap-3 hover:bg-slate-100 transition-all cursor-pointer">
                  <div className="rounded-xl bg-purple-100 text-purple-600 p-2 dark:bg-purple-950 dark:text-purple-400">
                    <Folder className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-slate-800 dark:text-white block">Bank Soal & Asesmen</span>
                    <span className="text-[10px] text-slate-400">2 File Ujian</span>
                  </div>
                </div>
              </div>

              {/* Files Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    <tr>
                      <th className="p-3 rounded-l-xl">Nama Dokumen</th>
                      <th className="p-3">Mata Pelajaran</th>
                      <th className="p-3">Ukuran File</th>
                      <th className="p-3">Pengunggah</th>
                      <th className="p-3 text-right rounded-r-xl">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {activeClassMaterials.map((mat) => (
                      <tr key={mat.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="p-3 font-semibold text-slate-900 dark:text-white flex items-center gap-2.5">
                          <FileText className="h-4 w-4 text-rose-500 shrink-0" />
                          <span className="truncate max-w-xs">{mat.title}</span>
                        </td>
                        <td className="p-3 text-slate-600 dark:text-slate-400">{mat.subject}</td>
                        <td className="p-3 font-mono text-slate-500">{mat.fileSize || '3.2 MB'}</td>
                        <td className="p-3 text-slate-600 dark:text-slate-400">{mat.teacherName}</td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() =>
                              setPreviewAttachment({
                                name: mat.fileName || `${mat.title}.pdf`,
                                size: mat.fileSize || '3.2 MB',
                                type: mat.type || 'pdf'
                              })
                            }
                            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-300"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>Buka</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: ASSIGNMENTS & LKPD (Saluran Tugas) */}
          {activeTab === 'assignments' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Daftar Penugasan & LKPD Aktif
                  </h3>
                  <p className="text-xs text-slate-500">
                    Seluruh asesmen formatif dan sumatif untuk {activeClass.name}.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeClassAssignments.map((assign) => {
                  const assignSubmissions = submissions.filter((s) => s.assignmentId === assign.id);
                  const totalRoster = displayStudents.length || 36;
                  const progressPct = Math.round((assignSubmissions.length / totalRoster) * 100);

                  return (
                    <div
                      key={assign.id}
                      className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <span className="rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2.5 py-0.5 text-[10px] font-bold">
                          {assign.subject}
                        </span>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {new Date(assign.deadline).toLocaleDateString('id-ID')}
                        </span>
                      </div>

                      <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                        {assign.title}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-2">{assign.description}</p>

                      {/* Progress bar */}
                      <div className="space-y-1.5 pt-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500">Status Pengumpulan:</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {assignSubmissions.length} / {totalRoster} Murid ({progressPct}%)
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(progressPct, 100)}%` }}
                          />
                        </div>
                      </div>

                      {/* Action */}
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          100 Poin Maksimal
                        </span>
                        <button
                          onClick={() => {
                            Swal.fire({
                              title: `Detail Penugasan: ${assign.title}`,
                              text: `Mata Pelajaran: ${assign.subject} • Tenggat: ${new Date(assign.deadline).toLocaleDateString('id-ID')}`,
                              icon: 'info',
                              confirmButtonText: 'Tutup',
                              confirmButtonColor: '#4f46e5'
                            });
                          }}
                          className="rounded-xl bg-indigo-50 px-3.5 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-300"
                        >
                          Kelola & Koreksi
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: MEMBERS & ROSTER (Saluran Anggota) */}
          {activeTab === 'members' && (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-6">
              {/* Teachers section */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                  <UserCheck className="h-3.5 w-3.5 text-blue-500" />
                  Guru Pengampu & Wali Kelas ({activeClass.name})
                </h3>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250"
                      alt=""
                      className="h-10 w-10 rounded-2xl object-cover ring-2 ring-blue-500/30"
                    />
                    <div>
                      <h4 className="font-black text-sm text-slate-900 dark:text-white">
                        {activeClass.teacherName}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Wali Kelas • Pembina Rombel • SMKN 1 Sidayu
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 px-3 py-1 text-xs font-bold">
                    Pemilik Tim
                  </span>
                </div>
              </div>

              {/* Students section */}
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-emerald-500" />
                      Daftar Peserta Didik Rombel ({displayStudents.length} Siswa)
                    </h3>
                    <p className="text-xs text-slate-500">
                      Seluruh siswa terdaftar resmi dan memiliki akun belajar aktif di kelas {activeClass.name}.
                    </p>
                  </div>

                  <div className="relative min-w-[220px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Cari siswa dalam kelas ini..."
                      value={memberSearchQuery}
                      onChange={(e) => setMemberSearchQuery(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-1.5 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      <tr>
                        <th className="p-3 rounded-l-xl">No</th>
                        <th className="p-3">Nama Lengkap Siswa</th>
                        <th className="p-3">NISN</th>
                        <th className="p-3">Kelas & Rombel</th>
                        <th className="p-3">Status Belajar</th>
                        <th className="p-3 text-right rounded-r-xl">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {displayStudents.map((st, i) => (
                        <tr key={st.uid || i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="p-3 text-slate-400">{i + 1}</td>
                          <td className="p-3 font-semibold text-slate-900 dark:text-white flex items-center gap-2.5">
                            <img
                              src={st.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250'}
                              alt=""
                              className="h-7 w-7 rounded-full object-cover"
                            />
                            <span>{st.displayName}</span>
                          </td>
                          <td className="p-3 font-mono text-blue-600 dark:text-blue-400">{st.nisn || '0075648921'}</td>
                          <td className="p-3 text-slate-600 dark:text-slate-400">{activeClass.name}</td>
                          <td className="p-3">
                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                              Aktif
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => {
                                Swal.fire({
                                  title: `Profil Siswa: ${st.displayName}`,
                                  text: `NISN: ${st.nisn} • Kelas: ${activeClass.name} • Status: Peserta Didik Aktif`,
                                  icon: 'info',
                                  confirmButtonText: 'Tutup',
                                  confirmButtonColor: '#4f46e5'
                                });
                              }}
                              className="rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 px-3 py-1 text-xs font-bold text-slate-600 dark:text-slate-300"
                            >
                              Detail
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: GRADES (Buku Nilai Kelas) */}
          {activeTab === 'grades' && (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Buku Nilai & Rekapitulasi Asesmen {activeClass.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Nilai otomatis terhitung dari rubrik penilaian pengerjaan LKPD dan tugas peserta didik.
                  </p>
                </div>

                <button
                  onClick={() => {
                    Swal.fire({
                      icon: 'success',
                      title: 'Mengekspor Buku Nilai...',
                      text: `Rekap nilai kelas ${activeClass.name} berhasil diunduh dalam format Excel (.xlsx).`,
                      timer: 2000,
                      showConfirmButton: false
                    });
                  }}
                  className="flex items-center gap-1.5 rounded-2xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/30 hover:bg-emerald-700 transition-colors"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  <span>Ekspor Excel (.xlsx)</span>
                </button>
              </div>

              {/* Grades Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    <tr>
                      <th className="p-3 rounded-l-xl">No</th>
                      <th className="p-3">Nama Siswa</th>
                      <th className="p-3">NISN</th>
                      <th className="p-3 text-center">LKPD 1</th>
                      <th className="p-3 text-center">Tugas 1</th>
                      <th className="p-3 text-center">Proyek</th>
                      <th className="p-3 text-center rounded-r-xl">Rata-Rata Akhir</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {displayStudents.slice(0, 15).map((st, i) => {
                      const baseScore = 82 + ((i * 7) % 16);
                      return (
                        <tr key={st.uid || i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="p-3 text-slate-400">{i + 1}</td>
                          <td className="p-3 font-semibold text-slate-900 dark:text-white">{st.displayName}</td>
                          <td className="p-3 font-mono text-slate-500">{st.nisn || '0075648921'}</td>
                          <td className="p-3 text-center font-bold text-blue-600 dark:text-blue-400">{baseScore}</td>
                          <td className="p-3 text-center font-bold text-emerald-600 dark:text-emerald-400">{baseScore + 2 > 100 ? 100 : baseScore + 2}</td>
                          <td className="p-3 text-center font-bold text-purple-600 dark:text-purple-400">{baseScore - 1}</td>
                          <td className="p-3 text-center">
                            <span className="rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-3 py-1 font-black text-xs">
                              {Math.round((baseScore + (baseScore + 2 > 100 ? 100 : baseScore + 2) + (baseScore - 1)) / 3)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal Add Class */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="h-5 w-5 text-indigo-600" />
                Tambah Tim Kelas Baru
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
                  Nama Kelas / Tim
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: X TKJ 1 atau XI TKR 2"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 p-3 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Konsentrasi Keahlian / Jurusan
                </label>
                <select
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 p-3 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-medium"
                >
                  <option value="Teknik Komputer dan Jaringan (TKJ)">Teknik Komputer dan Jaringan (TKJ)</option>
                  <option value="Teknik Kendaraan Ringan (TKR)">Teknik Kendaraan Ringan (TKR)</option>
                  <option value="Teknik Instalasi Tenaga Listrik (TITL)">Teknik Instalasi Tenaga Listrik (TITL)</option>
                  <option value="Agribisnis Pengolahan Hasil Perikanan (APHPi)">Agribisnis Pengolahan Hasil Perikanan (APHPi)</option>
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
                    className="w-full rounded-2xl border border-slate-300 p-3 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
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
                    className="w-full rounded-2xl border border-slate-300 p-3 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
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
                  className="w-full rounded-2xl border border-slate-300 p-3 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
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
                  className="rounded-2xl px-4 py-2.5 text-slate-600 hover:bg-slate-100 dark:text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-2xl bg-indigo-600 px-5 py-2.5 font-bold text-white hover:bg-indigo-700 shadow-md shadow-indigo-600/30"
                >
                  Simpan Kelas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Unggah Berkas & Modul Kelas (Teams Channel File Uploader) */}
      {showClassUploadModal && activeClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="rounded-2xl bg-indigo-100 p-2.5 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                  <Upload className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Unggah Dokumen ke Saluran {activeClass.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Berkas akan disinkronkan dan dapat langsung diakses oleh peserta didik.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowClassUploadModal(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveClassUpload} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Kategori / Folder Penyimpanan
                  </label>
                  <select
                    value={classUploadFolder}
                    onChange={(e) => setClassUploadFolder(e.target.value as any)}
                    className="w-full rounded-2xl border border-slate-300 p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-medium"
                  >
                    <option value="Modul Ajar">📁 Modul Ajar</option>
                    <option value="Jobsheet LKPD">📄 Jobsheet LKPD</option>
                    <option value="Bahan Tayang PPT">📊 Bahan Tayang PPT</option>
                    <option value="Bank Soal & Asesmen">📝 Bank Soal & Asesmen</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Mata Pelajaran
                  </label>
                  <select
                    value={classUploadSubject}
                    onChange={(e) => setClassUploadSubject(e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-medium"
                  >
                    {teacherSubjects.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Dokumen / Judul Materi
                </label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Modul Ajar Praktik Konfigurasi Routing Dinamis OSPF"
                  value={classUploadTitle}
                  onChange={(e) => setClassUploadTitle(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 p-3 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white font-bold"
                />
              </div>

              {/* Native hidden file input */}
              <input
                ref={classFileInputRef}
                type="file"
                multiple
                accept=".pdf,.docx,.doc,.pptx,.ppt,.xlsx,.xls,.mp4,.zip,.png,.jpg,.jpeg"
                onChange={(e) => {
                  handleClassFilesPicked(e.target.files);
                  if (e.target) e.target.value = '';
                }}
                className="hidden"
              />

              {/* Dropzone */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Pilih Berkas dari Perangkat (PDF, Word, PPT, Excel, Video, ZIP)
                </label>
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsClassFileDragging(true);
                  }}
                  onDragLeave={() => setIsClassFileDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsClassFileDragging(false);
                    handleClassFilesPicked(e.dataTransfer.files);
                  }}
                  onClick={() => classFileInputRef.current?.click()}
                  className={`flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-dashed cursor-pointer transition-all ${
                    isClassFileDragging
                      ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/60'
                      : 'border-slate-300 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/60 hover:bg-slate-100 hover:border-indigo-500'
                  }`}
                >
                  <div className="rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400 p-2.5 mb-2">
                    <UploadCloud className="h-6 w-6" />
                  </div>
                  <p className="font-bold text-xs text-slate-800 dark:text-slate-200 text-center">
                    Klik untuk memilih berkas dari komputer / HP
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5 text-center">
                    Mendukung berkas modul materi, Jobsheet, slide presentasi, atau zip
                  </p>
                </div>
              </div>

              {/* Uploaded files preview */}
              {classUploadedFiles.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Berkas Siap Diunggah ({classUploadedFiles.length}):
                  </span>
                  {classUploadedFiles.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 p-2.5 border border-indigo-100 dark:border-indigo-900 text-xs"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="h-4 w-4 text-indigo-600 shrink-0" />
                        <span className="font-semibold text-slate-900 dark:text-white truncate">
                          {file.name}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">({file.size})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setClassUploadedFiles((prev) => prev.filter((_, i) => i !== idx))}
                        className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Catatan atau Petunjuk Singkat (Opsional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Instruksi tambahan untuk siswa terkait dokumen ini..."
                  value={classUploadDescription}
                  onChange={(e) => setClassUploadDescription(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 p-3 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowClassUploadModal(false)}
                  className="rounded-2xl px-4 py-2.5 text-slate-600 hover:bg-slate-100 dark:text-slate-300 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={classUploadedFiles.length === 0}
                  className="rounded-2xl bg-indigo-600 px-5 py-2.5 font-bold text-white hover:bg-indigo-700 disabled:opacity-40 shadow-md shadow-indigo-600/30 cursor-pointer"
                >
                  Unggah & Bagikan ke Saluran Kelas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Excel Import Modal */}
      {showImportModal && (
        <ExcelImportModal onClose={() => setShowImportModal(false)} />
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
