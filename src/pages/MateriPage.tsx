import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { LearningMaterial, MaterialType } from '../types';
import {
  BookOpen,
  Plus,
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
  Search
} from 'lucide-react';
import Swal from 'sweetalert2';

export const MateriPage: React.FC = () => {
  const { materials, addMaterial, deleteMaterial, classes, tpList, subjects } = useData();
  const { role, currentUser } = useAuth();

  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

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
  const [fileName, setFileName] = useState('Modul_Ajar_SMKN1Sidayu.pdf');
  const [selectedClassId, setSelectedClassId] = useState(classes[0]?.id || 'class-x-tkj-1');

  const canManage = role === 'guru' || role === 'admin';

  const filteredMaterials = materials.filter((m) => {
    const matchesType = filterType === 'all' || m.type === filterType;
    const matchesSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addMaterial({
      title,
      description,
      subject,
      classIds: [selectedClassId],
      type,
      youtubeId: type === 'youtube' ? youtubeId : undefined,
      fileName: type !== 'youtube' ? fileName : undefined,
      fileUrl: '#',
      tpId: 'tp-01',
      teacherId: currentUser.uid,
      teacherName: currentUser.displayName
    });

    setShowAddModal(false);
    Swal.fire({
      icon: 'success',
      title: 'Materi Diterbitkan',
      text: 'Peserta didik telah menerima notifikasi materi pembelajaran baru.',
      timer: 1600,
      showConfirmButton: false
    });
  };

  const handleDelete = (id: string, titleStr: string) => {
    Swal.fire({
      title: `Hapus materi?`,
      text: `"${titleStr}" akan dihapus.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Ya, Hapus'
    }).then((r) => {
      if (r.isConfirmed) deleteMaterial(id);
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
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
              REPOSITORI PEMBELAJARAN
            </span>
            <span className="rounded-md bg-orange-100 px-2.5 py-0.5 text-xs font-bold text-orange-700 dark:bg-orange-900/40 dark:text-orange-300">
              MULTI-FORMAT
            </span>
          </div>
          <h1 className="mt-2 text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            Materi Pembelajaran Daring
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Akses modul PDF, presentasi PPT, berkas DOCX, rekaman video, gambar, dan embed YouTube interaktif.
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-600/30 hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Upload Materi Baru
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative min-w-[260px] flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari materi atau topik bahasan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 shadow-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {[
            { id: 'all', label: 'Semua Format' },
            { id: 'pdf', label: 'PDF Modul' },
            { id: 'ppt', label: 'Slide PPT' },
            { id: 'youtube', label: 'YouTube Video' },
            { id: 'docx', label: 'DOCX' },
            { id: 'video', label: 'Video MP4' },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setFilterType(pill.id)}
              className={`rounded-xl px-3 py-1.5 font-semibold transition-all ${
                filterType === pill.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* Materials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredMaterials.map((mat) => (
          <div
            key={mat.id}
            className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="rounded-xl bg-slate-100 p-2.5 dark:bg-slate-800">
                    {getFormatIcon(mat.type)}
                  </div>
                  <div>
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300 uppercase">
                      {mat.type}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {new Date(mat.createdAt).toLocaleDateString('id-ID')}
                    </span>
                  </div>
                </div>

                {canManage && (
                  <button
                    onClick={() => handleDelete(mat.id, mat.title)}
                    className="rounded-lg p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    title="Hapus Materi"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>

              <h3 className="mt-3 text-sm font-bold text-slate-900 dark:text-white line-clamp-2">
                {mat.title}
              </h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                {mat.description}
              </p>

              {/* YouTube Embed preview if applicable */}
              {mat.type === 'youtube' && mat.youtubeId && (
                <div className="mt-3 aspect-video w-full overflow-hidden rounded-xl bg-black">
                  <iframe
                    src={`https://www.youtube.com/embed/${mat.youtubeId}`}
                    title={mat.title}
                    className="h-full w-full border-0"
                    allowFullScreen
                  />
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px] truncate max-w-[140px]">
                {mat.teacherName}
              </span>

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
                  onClick={() => {
                    Swal.fire({
                      icon: 'info',
                      title: 'Membuka Berkas Modul',
                      text: `Mengunduh berkas "${mat.fileName || mat.title}"`,
                      timer: 1500,
                      showConfirmButton: false
                    });
                  }}
                  className="flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 font-bold text-blue-700 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300"
                >
                  <Download className="h-3.5 w-3.5" /> Unduh Berkas
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal Upload Materi */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Upload & Terbitkan Materi Pembelajaran
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
                  Judul Materi
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Modul Ajar: Pembuatan API dengan Node.js..."
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
                    Format Konten
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as MaterialType)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="pdf">Dokumen PDF</option>
                    <option value="ppt">Slide Presentasi PPT</option>
                    <option value="docx">Dokumen Word DOCX</option>
                    <option value="youtube">Embed Video YouTube</option>
                    <option value="video">File Video MP4</option>
                    <option value="image">Gambar / Infografis</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Kelas Sasaran
                  </label>
                  <select
                    value={selectedClassId}
                    onChange={(e) => setSelectedClassId(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.major})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {type === 'youtube' ? (
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    YouTube Video ID atau URL
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: jC4v5AS4RIM"
                    value={youtubeId}
                    onChange={(e) => setYoutubeId(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              ) : (
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Nama Berkas Lampiran
                  </label>
                  <input
                    type="text"
                    required
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Deskripsi Singkat Materi
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Jelaskan ringkasan materi dan instruksi belajar mandiri..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
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
                  Terbitkan Materi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
