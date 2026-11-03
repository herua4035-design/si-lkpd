import React, { useState, useRef } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { LearningMaterial, MaterialType, AttachmentItem } from '../types';
import { DocumentPreviewModal } from '../components/DocumentPreviewModal';
import {
  BookOpen,
  Plus,
  Edit2,
  FileText,
  Video,
  Presentation,
  Image as ImageIcon,
  Youtube,
  Trash2,
  ExternalLink,
  Download,
  Eye,
  Filter,
  X,
  Search,
  Paperclip,
  Upload,
  UploadCloud,
  UserCheck,
  CheckCircle2,
  FileSpreadsheet,
  Layers,
  GraduationCap
} from 'lucide-react';
import Swal from 'sweetalert2';

export const MateriPage: React.FC = () => {
  const { materials, addMaterial, updateMaterial, deleteMaterial, classes, tpList, subjects } = useData();
  const { role, currentUser } = useAuth();

  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyMyMaterials, setOnlyMyMaterials] = useState(role === 'guru');
  const [showAddModal, setShowAddModal] = useState(false);
  const [previewAttachment, setPreviewAttachment] = useState<any | null>(null);

  // Subjects taught by current logged-in teacher
  const teacherSubjects: string[] = currentUser.subjectsTaught && currentUser.subjectsTaught.length > 0
    ? currentUser.subjectsTaught
    : currentUser.subject
    ? currentUser.subject.split(',').map((s) => s.trim()).filter(Boolean)
    : ['Koding dan Kecerdasan Artifisial'];

  // New Material form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState(teacherSubjects[0] || 'Koding dan Kecerdasan Artifisial');
  const [type, setType] = useState<MaterialType>('pdf');
  const [youtubeId, setYoutubeId] = useState('jC4v5AS4RIM');
  const [selectedClassId, setSelectedClassId] = useState(classes[0]?.id || 'class-x-tkj-1');

  // Multi-attachment items
  const [attachments, setAttachments] = useState<AttachmentItem[]>([
    {
      id: 'att-default-1',
      name: 'Modul_Ajar_SMKN1Sidayu_2026.pdf',
      url: '#',
      type: 'pdf',
      size: '2.8 MB',
      uploadedAt: new Date().toISOString()
    }
  ]);
  const [externalLinkUrl, setExternalLinkUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit Material state
  const [editingMaterial, setEditingMaterial] = useState<LearningMaterial | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editSubject, setEditSubject] = useState('');
  const [editType, setEditType] = useState<MaterialType>('pdf');
  const [editYoutubeId, setEditYoutubeId] = useState('');
  const [editClassId, setEditClassId] = useState('');
  const [editAttachments, setEditAttachments] = useState<AttachmentItem[]>([]);
  const [editExternalLink, setEditExternalLink] = useState('');
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const canManage = role === 'guru' || role === 'admin';

  const filteredMaterials = materials.filter((m) => {
    const matchesType = filterType === 'all' || m.type === filterType;
    const matchesSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.teacherName && m.teacherName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      m.subject.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesMyMaterials =
      !onlyMyMaterials ||
      role !== 'guru' ||
      m.teacherId === currentUser.uid ||
      m.teacherName?.toLowerCase() === currentUser.displayName.toLowerCase();

    return matchesType && matchesSearch && matchesMyMaterials;
  });

  // Format bytes helper
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Extension to MaterialType helper
  const detectFileType = (filename: string): MaterialType => {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    if (ext === 'pdf') return 'pdf';
    if (['docx', 'doc'].includes(ext)) return 'docx';
    if (['pptx', 'ppt'].includes(ext)) return 'ppt';
    if (['mp4', 'mkv', 'mov', 'webm'].includes(ext)) return 'video';
    if (['png', 'jpg', 'jpeg', 'webp', 'svg'].includes(ext)) return 'image';
    return 'pdf';
  };

  // Real File Upload Handler using FileReader
  const handleFilesSelected = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      const detected = detectFileType(file.name);

      reader.onload = (e) => {
        const dataUrl = (e.target?.result as string) || '#';
        const newAtt: AttachmentItem = {
          id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          name: file.name,
          url: dataUrl,
          type: detected,
          size: formatFileSize(file.size),
          uploadedAt: new Date().toISOString()
        };

        setAttachments((prev) => {
          // If default placeholder is still the only item, replace it
          if (prev.length === 1 && prev[0].id === 'att-default-1') {
            return [newAtt];
          }
          return [...prev, newAtt];
        });

        // Auto-fill title if empty
        setTitle((prev) => {
          if (!prev.trim()) {
            return file.name.replace(/\.[^/.]+$/, '').replace(/[_\\-]/g, ' ');
          }
          return prev;
        });

        // Set type to match first uploaded file
        setType(detected);
      };

      reader.readAsDataURL(file);
    });

    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: `${files.length} file berhasil ditambahkan`,
      showConfirmButton: false,
      timer: 1500
    });
  };

  const handleAddExternalLink = () => {
    if (!externalLinkUrl.trim()) return;
    const newAtt: AttachmentItem = {
      id: `att-ext-${Date.now()}`,
      name: externalLinkUrl.includes('drive.google.com')
        ? 'Google Drive Dokumen Ajar'
        : externalLinkUrl.includes('youtube.com') || externalLinkUrl.includes('youtu.be')
        ? 'Tautan Video Pembelajaran'
        : 'Tautan Referensi Eksternal',
      url: externalLinkUrl.trim(),
      type: externalLinkUrl.includes('youtube.com') || externalLinkUrl.includes('youtu.be') ? 'youtube' : 'pdf',
      size: 'Cloud Link',
      uploadedAt: new Date().toISOString()
    };
    setAttachments((prev) => [...prev, newAtt]);
    setExternalLinkUrl('');
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Judul Wajib Diisi',
        text: 'Silakan ketikkan judul materi pembelajaran.'
      });
      return;
    }

    const mainFile = attachments[0];

    addMaterial({
      title,
      description: description || 'Modul pembelajaran resmi SMKN 1 Sidayu.',
      subject,
      classIds: [selectedClassId],
      type: mainFile ? (mainFile.type as MaterialType) : type,
      youtubeId: type === 'youtube' ? youtubeId : undefined,
      fileName: mainFile?.name || `${title.replace(/\s+/g, '_')}.pdf`,
      fileSize: mainFile?.size || '1.8 MB',
      attachments: attachments.length > 0 ? attachments : undefined,
      externalLink: externalLinkUrl || undefined,
      fileUrl: mainFile?.url || '#',
      tpId: 'tp-01',
      teacherId: currentUser.uid,
      teacherName: currentUser.displayName
    });

    setShowAddModal(false);
    setTitle('');
    setDescription('');
    setAttachments([
      {
        id: `att-${Date.now()}`,
        name: 'Modul_Ajar_SMKN1Sidayu_2026.pdf',
        url: '#',
        type: 'pdf',
        size: '2.8 MB',
        uploadedAt: new Date().toISOString()
      }
    ]);

    Swal.fire({
      icon: 'success',
      title: 'Materi Pembelajaran Berhasil Diunggah & Diterbitkan',
      text: 'Semua file lampiran telah siap diakses oleh siswa.',
      timer: 2000,
      showConfirmButton: false
    });
  };

  const handleDelete = (id: string, titleStr: string) => {
    Swal.fire({
      title: `Hapus materi?`,
      text: `"${titleStr}" akan dihapus dari repositori.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Ya, Hapus'
    }).then((r) => {
      if (r.isConfirmed) deleteMaterial(id);
    });
  };

  const handleOpenEdit = (mat: LearningMaterial) => {
    setEditingMaterial(mat);
    setEditTitle(mat.title);
    setEditDescription(mat.description);
    setEditSubject(mat.subject);
    setEditType(mat.type);
    setEditYoutubeId(mat.youtubeId || '');
    setEditClassId(mat.classIds[0] || 'all');
    const existingAtts: AttachmentItem[] =
      mat.attachments && mat.attachments.length > 0
        ? [...mat.attachments]
        : mat.fileName
        ? [{ id: 'main', name: mat.fileName, size: mat.fileSize || '2.8 MB', type: mat.type, url: mat.fileUrl }]
        : [];
    setEditAttachments(existingAtts);
    setEditExternalLink(mat.externalLink || (mat.fileUrl?.startsWith('http') ? mat.fileUrl : ''));
  };

  const handleEditFilesSelected = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      const detected = detectFileType(file.name);
      reader.onload = (e) => {
        const dataUrl = (e.target?.result as string) || '#';
        const newAtt: AttachmentItem = {
          id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          name: file.name,
          url: dataUrl,
          type: detected,
          size: formatFileSize(file.size),
          uploadedAt: new Date().toISOString()
        };
        setEditAttachments((prev) => [...prev, newAtt]);
        setEditType(detected);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSaveEditMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMaterial || !editTitle.trim()) return;

    const mainFile = editAttachments[0];
    updateMaterial(editingMaterial.id, {
      title: editTitle,
      description: editDescription,
      subject: editSubject,
      classIds: [editClassId],
      type: mainFile ? (mainFile.type as MaterialType) : editType,
      youtubeId: editType === 'youtube' ? editYoutubeId : undefined,
      fileName: mainFile?.name || editingMaterial.fileName,
      fileSize: mainFile?.size || editingMaterial.fileSize,
      attachments: editAttachments.length > 0 ? editAttachments : undefined,
      externalLink: editExternalLink || undefined,
      fileUrl: editType === 'link' ? editExternalLink : mainFile?.url || editingMaterial.fileUrl
    });

    setEditingMaterial(null);
    Swal.fire({
      icon: 'success',
      title: 'Materi Berhasil Diperbarui',
      text: `Perubahan modul/materi "${editTitle}" berhasil disimpan.`,
      timer: 1600,
      showConfirmButton: false
    });
  };

  const getFormatIcon = (format: MaterialType) => {
    switch (format) {
      case 'pdf':
        return <FileText className="h-5 w-5 text-rose-600" />;
      case 'docx':
        return <FileText className="h-5 w-5 text-blue-600" />;
      case 'ppt':
        return <Presentation className="h-5 w-5 text-orange-600" />;
      case 'video':
        return <Video className="h-5 w-5 text-purple-600" />;
      case 'youtube':
        return <Youtube className="h-5 w-5 text-red-600" />;
      case 'image':
      default:
        return <ImageIcon className="h-5 w-5 text-emerald-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-blue-100 px-3 py-0.5 text-xs font-bold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
              LMS ADVANCED REPOSITORY
            </span>
            <span className="rounded-full bg-indigo-100 px-3 py-0.5 text-xs font-bold text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
              SMKN 1 SIDAYU
            </span>
          </div>
          <h1 className="mt-2 text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Materi Pembelajaran Daring & Modul LMS
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Akses dan distribusi multi-lampiran dokumen modul PDF, slide presentasi PPTX, berkas DOCX, jobsheet, dan media interaktif.
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-700 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Upload & Terbitkan Materi</span>
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
            placeholder="Cari materi, nama guru, atau topik..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-medium"
          />
        </div>

        {/* Filter Pills & Scoping Toggle */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {role === 'guru' && (
            <button
              type="button"
              onClick={() => setOnlyMyMaterials(!onlyMyMaterials)}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-bold transition-all cursor-pointer ${
                onlyMyMaterials
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              <UserCheck className="h-3.5 w-3.5" />
              <span>⭐ Materi Saya</span>
            </button>
          )}

          {[
            { id: 'all', label: 'Semua' },
            { id: 'pdf', label: 'PDF Modul' },
            { id: 'ppt', label: 'Slide PPT' },
            { id: 'youtube', label: 'YouTube' },
            { id: 'docx', label: 'DOCX' },
            { id: 'video', label: 'Video MP4' },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setFilterType(pill.id)}
              className={`rounded-xl px-3 py-1.5 font-semibold transition-all ${
                filterType === pill.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* Materials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredMaterials.map((mat) => {
          const allAttachments = mat.attachments && mat.attachments.length > 0
            ? mat.attachments
            : mat.fileName
            ? [{ id: 'main', name: mat.fileName, size: mat.fileSize || '2.8 MB', type: mat.type, url: mat.fileUrl }]
            : [];

          return (
            <div
              key={mat.id}
              className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900 space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="rounded-2xl bg-slate-100 p-2.5 dark:bg-slate-800">
                      {getFormatIcon(mat.type)}
                    </div>
                    <div>
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300 uppercase">
                        {mat.type}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {new Date(mat.createdAt).toLocaleDateString('id-ID')}
                      </span>
                    </div>
                  </div>

                  {canManage && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(mat)}
                        className="rounded-lg p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors cursor-pointer"
                        title="Edit Materi"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(mat.id, mat.title)}
                        className="rounded-lg p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                        title="Hapus Materi"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-3">
                  <span className="inline-block rounded-md bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 px-2 py-0.5 text-[10px] font-bold mb-1">
                    {mat.subject}
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white line-clamp-2">
                    {mat.title}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                    {mat.description}
                  </p>
                </div>

                {/* YouTube Embed preview if applicable */}
                {mat.type === 'youtube' && mat.youtubeId && (
                  <div className="mt-3 aspect-video w-full overflow-hidden rounded-2xl bg-black">
                    <iframe
                      src={`https://www.youtube.com/embed/${mat.youtubeId}`}
                      title={mat.title}
                      className="h-full w-full border-0"
                      allowFullScreen
                    />
                  </div>
                )}

                {/* Attachments List */}
                {allAttachments.length > 0 && (
                  <div className="mt-3 space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <Paperclip className="h-3 w-3" /> Berkas Lampiran ({allAttachments.length}):
                    </span>
                    <div className="space-y-1">
                      {allAttachments.map((att, i) => (
                        <div
                          key={att.id || i}
                          className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-800/60 p-2 text-xs text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-800"
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <FileText className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                            <span className="truncate text-[11px] font-medium">{att.name}</span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-400 shrink-0 ml-2">
                            {att.size || '2.8 MB'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-500 text-[11px] font-medium truncate max-w-[130px]">
                  👤 {mat.teacherName}
                </span>

                <div className="flex items-center gap-2">
                  {mat.type === 'youtube' ? (
                    <a
                      href={`https://www.youtube.com/watch?v=${mat.youtubeId}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 font-bold text-red-600 hover:underline dark:text-red-400 text-xs"
                    >
                      <Youtube className="h-3.5 w-3.5" /> Buka YouTube
                    </a>
                  ) : (
                    <button
                      onClick={() =>
                        setPreviewAttachment({
                          name: allAttachments[0]?.name || `${mat.title}.pdf`,
                          size: allAttachments[0]?.size || mat.fileSize || '2.8 MB',
                          type: mat.type,
                          url: allAttachments[0]?.url || mat.fileUrl
                        })
                      }
                      className="flex items-center gap-1.5 rounded-xl bg-indigo-50 px-3 py-1.5 font-bold text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-300 transition-colors cursor-pointer"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>Buka & Unduh</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredMaterials.length === 0 && (
        <div className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center text-slate-400">
          <BookOpen className="h-12 w-12 mx-auto text-slate-300 mb-3" />
          <p className="font-bold text-sm text-slate-600 dark:text-slate-300">
            Tidak ada materi pembelajaran yang ditemukan.
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Gunakan tombol "Upload & Terbitkan Materi" untuk menambahkan modul ajar baru.
          </p>
        </div>
      )}

      {/* Modal Upload Materi (Advanced LMS Uploader) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Upload className="h-5 w-5 text-indigo-600" />
                Upload & Terbitkan Materi Pembelajaran Baru
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Judul Materi Pembelajaran
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Modul Ajar: Pembuatan REST API dengan Express.js & TypeScript"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 p-3 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Mata Pelajaran (Kurikulum Merdeka SMKN 1 Sidayu)
                </label>
                {teacherSubjects.length > 1 && (
                  <div className="mb-2">
                    <p className="text-[11px] font-semibold text-slate-500 mb-1">
                      Pilihan Cepat Mapel Ampuan Anda:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {teacherSubjects.map((sName) => (
                        <button
                          key={sName}
                          type="button"
                          onClick={() => setSubject(sName)}
                          className={`rounded-xl px-2.5 py-1 text-xs font-bold transition-all ${
                            subject === sName
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
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
                    Format Konten Utama
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as MaterialType)}
                    className="w-full rounded-2xl border border-slate-300 p-3 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="pdf">Dokumen PDF Modul</option>
                    <option value="ppt">Slide Presentasi PPTX</option>
                    <option value="docx">Dokumen Word DOCX</option>
                    <option value="youtube">Embed Video YouTube</option>
                    <option value="video">File Video MP4</option>
                    <option value="image">Infografis / Gambar</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Target Kelas Sasaran
                  </label>
                  <select
                    value={selectedClassId}
                    onChange={(e) => setSelectedClassId(e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 p-3 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.major})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {type === 'youtube' && (
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    YouTube Video ID atau URL Lengkap
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: jC4v5AS4RIM atau https://youtube.com/watch?v=..."
                    value={youtubeId}
                    onChange={(e) => setYoutubeId(e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 p-3 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              )}

              {/* Real Multi-Attachment File Uploader (Dropzone + Native File Input) */}
              <div className="rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/50 dark:bg-indigo-950/20 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-extrabold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                    <Paperclip className="h-4 w-4 text-indigo-600" />
                    Lampirkan Dokumen & Berkas Modul
                  </label>
                  <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">
                    {attachments.length} Berkas Terlampir
                  </span>
                </div>

                {/* Hidden Native File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.docx,.doc,.pptx,.ppt,.xlsx,.xls,.mp4,.zip,.png,.jpg,.jpeg"
                  onChange={(e) => {
                    handleFilesSelected(e.target.files);
                    if (e.target) e.target.value = '';
                  }}
                  className="hidden"
                />

                {/* Drag & Drop Upload Zone */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    handleFilesSelected(e.dataTransfer.files);
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-dashed cursor-pointer transition-all ${
                    isDragging
                      ? 'border-indigo-600 bg-indigo-100/70 dark:bg-indigo-950/60 scale-[1.01]'
                      : 'border-indigo-300 dark:border-indigo-800 bg-white/80 dark:bg-slate-800/80 hover:bg-white hover:border-indigo-500'
                  }`}
                >
                  <div className="rounded-2xl bg-indigo-100 dark:bg-indigo-900/60 p-3 text-indigo-600 dark:text-indigo-300 mb-2">
                    <UploadCloud className="h-6 w-6" />
                  </div>
                  <p className="font-bold text-xs text-slate-800 dark:text-slate-200 text-center">
                    Klik untuk memilih berkas dari perangkat Anda
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 text-center">
                    atau seret & letakkan file ke sini (Mendukung PDF, DOCX, PPTX, XLSX, MP4, ZIP, Gambar)
                  </p>
                  <div className="mt-2.5 flex flex-wrap justify-center gap-1">
                    {['PDF Modul', 'Word DOCX', 'Slide PPTX', 'Excel Jobsheet', 'Video MP4'].map((fmt) => (
                      <span key={fmt} className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-slate-600">
                        {fmt}
                      </span>
                    ))}
                  </div>
                </div>

                {/* List of currently attached files */}
                {attachments.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    {attachments.map((att) => (
                      <div
                        key={att.id}
                        className="flex items-center justify-between rounded-xl bg-white dark:bg-slate-800 p-2.5 border border-indigo-100 dark:border-indigo-900 shadow-xs"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <FileText className="h-4 w-4 text-indigo-600 shrink-0" />
                          <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs truncate">
                            {att.name}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">({att.size})</span>
                          <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                            {att.type}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveAttachment(att.id)}
                          className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer"
                          title="Hapus berkas ini"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Optional External Link (Google Drive / YouTube) */}
                <div className="pt-2 border-t border-indigo-100 dark:border-indigo-900/60">
                  <p className="text-[10px] font-bold text-slate-500 mb-1">
                    Atau sertakan tautan Google Drive / Cloud Storage (Opsional):
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="https://drive.google.com/file/d/..."
                      value={externalLinkUrl}
                      onChange={(e) => setExternalLinkUrl(e.target.value)}
                      className="flex-1 rounded-xl border border-slate-300 bg-white p-2 text-xs dark:border-slate-700 dark:bg-slate-800"
                    />
                    <button
                      type="button"
                      onClick={handleAddExternalLink}
                      disabled={!externalLinkUrl.trim()}
                      className="rounded-xl bg-slate-800 text-white px-3 py-2 font-bold hover:bg-slate-700 disabled:opacity-40 text-xs cursor-pointer"
                    >
                      + Tambah Tautan
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Deskripsi & Petunjuk Belajar Mandiri
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Tuliskan tujuan materi, langkah kegiatan belajar, dan referensi bacaan..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 p-3 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
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
                  Terbitkan Materi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Material Modal */}
      {editingMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div className="my-8 w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600">
                  <Edit2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                    Edit Materi / Modul Ajar
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Perbarui judul, mata pelajaran, target rombel, atau lampiran dokumen
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingMaterial(null)}
                className="rounded-xl p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditMaterial} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Judul Modul / Materi Pembelajaran
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 bg-slate-50 p-2.5 font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-indigo-500"
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
                    <option value="all">Semua Rombel Terbuka</option>
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
                    Tipe / Format Utama
                  </label>
                  <select
                    value={editType}
                    onChange={(e) => setEditType(e.target.value as MaterialType)}
                    className="w-full rounded-2xl border border-slate-300 bg-slate-50 p-2.5 font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    <option value="pdf">Dokumen PDF (Modul / Buku)</option>
                    <option value="docx">Microsoft Word (DOCX / Jobsheet)</option>
                    <option value="ppt">Presentasi PPTX (Slide Tayang)</option>
                    <option value="video">File Video MP4</option>
                    <option value="youtube">Tautan Video YouTube</option>
                    <option value="link">Tautan Eksternal / Web</option>
                  </select>
                </div>

                {editType === 'youtube' ? (
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      YouTube Video ID
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: jC4v5AS4RIM"
                      value={editYoutubeId}
                      onChange={(e) => setEditYoutubeId(e.target.value)}
                      className="w-full rounded-2xl border border-slate-300 bg-slate-50 p-2.5 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                ) : editType === 'link' ? (
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      URL Tautan Eksternal
                    </label>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={editExternalLink}
                      onChange={(e) => setEditExternalLink(e.target.value)}
                      className="w-full rounded-2xl border border-slate-300 bg-slate-50 p-2.5 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                ) : null}
              </div>

              {/* Attachments Section in Edit Modal */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-slate-700 dark:text-slate-300">
                    Berkas Lampiran Modul ({editAttachments.length})
                  </label>
                  <input
                    ref={editFileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.docx,.doc,.pptx,.ppt,.xlsx,.xls,.mp4,.zip,.png,.jpg,.jpeg"
                    onChange={(e) => {
                      handleEditFilesSelected(e.target.files);
                      if (e.target) e.target.value = '';
                    }}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => editFileInputRef.current?.click()}
                    className="flex items-center gap-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 cursor-pointer"
                  >
                    <Paperclip className="h-3 w-3" />
                    <span>+ Tambah / Unggah File</span>
                  </button>
                </div>

                {editAttachments.length > 0 ? (
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {editAttachments.map((file, idx) => (
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
                            setEditAttachments((prev) => prev.filter((_, i) => i !== idx))
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
                    Tidak ada berkas lampiran.
                  </p>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Deskripsi & Petunjuk Belajar Mandiri
                </label>
                <textarea
                  rows={3}
                  required
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 bg-slate-50 p-3 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-indigo-500 leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingMaterial(null)}
                  className="rounded-2xl px-4 py-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 cursor-pointer font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-2xl bg-indigo-600 px-5 py-2 font-bold text-white hover:bg-indigo-700 shadow-md shadow-indigo-600/30 cursor-pointer"
                >
                  Simpan Perubahan Materi
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
