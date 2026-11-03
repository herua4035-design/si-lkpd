import React, { useState, useEffect } from 'react';
import { InteractiveLKPD, Assignment } from '../types';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import {
  Compass,
  CheckCircle2,
  Clock,
  Sparkles,
  Save,
  Send,
  Video,
  BookOpen,
  MessageSquare,
  Wrench,
  HeartHandshake,
  User,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import Swal from 'sweetalert2';

interface InteractiveLKPDViewerProps {
  lkpd: InteractiveLKPD;
  assignment?: Assignment;
  onFinish?: () => void;
}

export const InteractiveLKPDViewer: React.FC<InteractiveLKPDViewerProps> = ({
  lkpd,
  assignment,
  onFinish
}) => {
  const { currentUser } = useAuth();
  const { submitAssignment, submissions } = useData();

  // Find existing submission for this student and assignment
  const existingSub = submissions.find(
    (s) => s.studentId === currentUser.uid && (assignment ? s.assignmentId === assignment.id : true)
  );

  // Autosave storage key
  const autoSaveKey = `lkpd_draft_${lkpd.id}_${currentUser.uid}`;

  // Form states initialized from saved draft or existing submission
  const [diskusiAnswers, setDiskusiAnswers] = useState<Record<string, string>>(() => {
    if (existingSub?.lkpdAnswers?.diskusiAnswers) return existingSub.lkpdAnswers.diskusiAnswers;
    const saved = localStorage.getItem(autoSaveKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.diskusiAnswers) return parsed.diskusiAnswers;
      } catch (e) {}
    }
    return {};
  });

  const [praktikUrl, setPraktikUrl] = useState<string>(() => {
    if (existingSub?.lkpdAnswers?.praktikUrl) return existingSub.lkpdAnswers.praktikUrl;
    const saved = localStorage.getItem(autoSaveKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.praktikUrl) return parsed.praktikUrl;
      } catch (e) {}
    }
    return '';
  });

  const [praktikNote, setPraktikNote] = useState<string>(() => {
    if (existingSub?.lkpdAnswers?.praktikNote) return existingSub.lkpdAnswers.praktikNote;
    const saved = localStorage.getItem(autoSaveKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.praktikNote) return parsed.praktikNote;
      } catch (e) {}
    }
    return '';
  });

  const [refleksiAnswers, setRefleksiAnswers] = useState<Record<string, string>>(() => {
    if (existingSub?.lkpdAnswers?.refleksiAnswers) return existingSub.lkpdAnswers.refleksiAnswers;
    const saved = localStorage.getItem(autoSaveKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.refleksiAnswers) return parsed.refleksiAnswers;
      } catch (e) {}
    }
    return {};
  });

  const [uploadedFileName, setUploadedFileName] = useState<string>(
    existingSub?.fileName || 'Praktik_Prompt_SMKN1Sidayu.pdf'
  );
  const [lastSavedTime, setLastSavedTime] = useState<string>('Tersimpan di Cloud');
  const [activeTab, setActiveTab] = useState<'A' | 'B' | 'C' | 'D' | 'E'>('A');

  // Autosave to localStorage on changes
  useEffect(() => {
    const draft = {
      diskusiAnswers,
      praktikUrl,
      praktikNote,
      refleksiAnswers,
      uploadedFileName,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem(autoSaveKey, JSON.stringify(draft));
    setLastSavedTime(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  }, [diskusiAnswers, praktikUrl, praktikNote, refleksiAnswers, uploadedFileName, autoSaveKey]);

  // Submission handler
  const handleSubmit = () => {
    // Validation
    const answeredCount = Object.keys(diskusiAnswers).filter((k) => diskusiAnswers[k]?.trim()).length;
    if (answeredCount === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Bagian C Belum Lengkap',
        text: 'Mohon isi jawaban pada bagian Diskusi analitis terlebih dahulu.',
        confirmButtonColor: '#2563eb'
      });
      setActiveTab('C');
      return;
    }

    Swal.fire({
      title: 'Kirimkan Lembar Kerja LKPD?',
      html: `<p class="text-sm text-slate-600">Jawaban Anda untuk <b>${lkpd.title}</b> akan diserahkan kepada guru pengampu untuk dilakukan penilaian rubrik otomatis.</p>`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#2563eb',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Kirim Sekarang',
      cancelButtonText: 'Periksa Kembali'
    }).then((result) => {
      if (result.isConfirmed) {
        submitAssignment({
          assignmentId: assignment ? assignment.id : 'assign-01',
          assignmentTitle: assignment ? assignment.title : lkpd.title,
          studentId: currentUser.uid,
          studentName: currentUser.displayName,
          studentNisn: currentUser.nisn || '0075648921',
          classId: currentUser.classId || 'class-01',
          className: currentUser.className || 'X PPLG 1',
          note: praktikNote || 'Tugas LKPD telah diselesaikan dengan lengkap.',
          fileName: uploadedFileName,
          lkpdAnswers: {
            diskusiAnswers,
            praktikUrl: praktikUrl || 'https://github.com/smkn1sidayu/tugas-murid',
            praktikNote,
            refleksiAnswers
          }
        });

        // Clear local draft
        localStorage.removeItem(autoSaveKey);

        Swal.fire({
          icon: 'success',
          title: 'LKPD Berhasil Dikirimkan!',
          text: 'Tugas Anda telah tersimpan ke sistem. Notifikasi telah diteruskan kepada guru.',
          confirmButtonColor: '#2563eb'
        });

        if (onFinish) onFinish();
      }
    });
  };

  const sections = [
    { key: 'A', label: 'A. Orientasi', icon: Video, desc: 'Stimulus Pemantik' },
    { key: 'B', label: 'B. Eksplorasi', icon: BookOpen, desc: 'Materi Interaktif' },
    { key: 'C', label: 'C. Diskusi', icon: MessageSquare, desc: 'Analisis & Esai' },
    { key: 'D', label: 'D. Praktik', icon: Wrench, desc: 'Uji Coba & Bukti' },
    { key: 'E', label: 'E. Refleksi', icon: HeartHandshake, desc: 'Evaluasi Diri' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner & Student Identity (Auto-filled) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                LKPD INTERAKTIF
              </span>
              <span className="rounded-md bg-orange-100 px-2 py-0.5 text-xs font-bold text-orange-700 dark:bg-orange-900/40 dark:text-orange-300">
                Fase E • SMKN 1 SIDAYU
              </span>
            </div>
            <h1 className="mt-2 text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              {lkpd.title}
            </h1>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Mata Pelajaran: <strong>{lkpd.subject}</strong> • Alokasi Waktu: <strong>{lkpd.durationMinutes} Menit</strong> • Guru: <strong>{lkpd.teacherName}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-200/50">
            <ShieldCheck className="h-4 w-4" />
            <span>Autosave Aktif ({lastSavedTime})</span>
          </div>
        </div>

        {/* Auto-filled Student Identity Card */}
        <div className="mt-4 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 text-blue-600" />
            Identitas Peserta Didik (Terisi Otomatis Dari Sistem Akun)
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="rounded-lg bg-white p-2.5 border border-slate-200/80 dark:bg-slate-900 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 block font-medium">Nama Lengkap Murid:</span>
              <span className="font-bold text-slate-900 dark:text-white">{currentUser.displayName}</span>
            </div>
            <div className="rounded-lg bg-white p-2.5 border border-slate-200/80 dark:bg-slate-900 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 block font-medium">NISN:</span>
              <span className="font-bold font-mono text-blue-600 dark:text-blue-400">
                {currentUser.nisn || '0075648921'}
              </span>
            </div>
            <div className="rounded-lg bg-white p-2.5 border border-slate-200/80 dark:bg-slate-900 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 block font-medium">Kelas / Rombongan Belajar:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {currentUser.className || 'X PPLG 1'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stepper / Section Tab Navigation */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {sections.map((sec) => {
          const Icon = sec.icon;
          const isActive = activeTab === sec.key;
          return (
            <button
              key={sec.key}
              onClick={() => setActiveTab(sec.key as any)}
              className={`flex items-center gap-2.5 rounded-xl p-3 text-left transition-all border ${
                isActive
                  ? 'border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
              }`}
            >
              <div className={`rounded-lg p-2 ${isActive ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800'}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold leading-none">{sec.label}</p>
                <p className={`text-[10px] mt-0.5 ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>
                  {sec.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Section Content Area */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 min-h-[400px]">
        {/* BAGIAN A: ORIENTASI */}
        {activeTab === 'A' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="rounded-lg bg-blue-100 p-2 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
                <Video className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Bagian A: Orientasi Stimulus Pembelajaran
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Amati video stimulus atau gambar pemantik sebelum melanjutkan ke eksplorasi konsep.
                </p>
              </div>
            </div>

            {/* Video Player */}
            {lkpd.orientasi.contentUrl && (
              <div className="aspect-video w-full max-w-3xl overflow-hidden rounded-2xl bg-black shadow-lg">
                <iframe
                  src={lkpd.orientasi.contentUrl}
                  title="Orientasi LKPD Video"
                  className="h-full w-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}

            {/* Prompt text */}
            <div className="rounded-xl bg-blue-50/70 p-4 text-xs text-blue-900 dark:bg-blue-950/40 dark:text-blue-200 border border-blue-200/60 dark:border-blue-900/50">
              <p className="font-bold flex items-center gap-1.5 mb-1 text-sm text-blue-800 dark:text-blue-300">
                <Sparkles className="h-4 w-4 text-orange-500" />
                Pertanyaan Pemantik Orientasi:
              </p>
              <p className="leading-relaxed">{lkpd.orientasi.promptText}</p>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => setActiveTab('B')}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-sm"
              >
                Lanjut ke Bagian B (Eksplorasi) &rarr;
              </button>
            </div>
          </div>
        )}

        {/* BAGIAN B: EKSPLORASI */}
        {activeTab === 'B' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="rounded-lg bg-indigo-100 p-2 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Bagian B: Eksplorasi Konsep & Teori Terapan
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Pelajari panduan interaktif dan referensi materi di bawah ini.
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 p-5 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs sm:text-sm text-slate-700 dark:text-slate-300 space-y-3 leading-relaxed whitespace-pre-line">
              {lkpd.eksplorasi.content}
            </div>

            {lkpd.eksplorasi.referenceLinks && (
              <div className="rounded-xl border border-slate-200 p-3.5 dark:border-slate-800 bg-white dark:bg-slate-900">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Tautan Referensi Bacaan Tambahan:
                </span>
                <div className="space-y-1">
                  {lkpd.eksplorasi.referenceLinks.map((link, i) => (
                    <a
                      key={i}
                      href={link}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline block truncate"
                    >
                      🔗 {link}
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setActiveTab('A')}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
              >
                &larr; Kembali ke Bagian A
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('C')}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-sm"
              >
                Lanjut ke Bagian C (Diskusi) &rarr;
              </button>
            </div>
          </div>
        )}

        {/* BAGIAN C: DISKUSI */}
        {activeTab === 'C' && (
          <div className="space-y-5 animate-fade-in">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="rounded-lg bg-emerald-100 p-2 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Bagian C: Diskusi Analitis & Pertanyaan Konsep
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Tuliskan jawaban analitis Anda pada kolom isian di bawah. Setiap jawaban disimpan otomatis.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {lkpd.diskusi.questions.map((q) => (
                <div
                  key={q.id}
                  className="rounded-xl border border-slate-200 p-4 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2 shadow-xs"
                >
                  <label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 block">
                    {q.question}
                  </label>
                  <textarea
                    rows={4}
                    value={diskusiAnswers[q.id] || ''}
                    onChange={(e) =>
                      setDiskusiAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                    }
                    placeholder={q.placeholder || 'Tuliskan jawaban Anda secara runtut dan sistematis...'}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 p-3 text-xs text-slate-800 focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                  <div className="flex justify-between items-center text-[10px] text-slate-400">
                    <span>Minimal 1-2 paragraf analitis</span>
                    <span>{(diskusiAnswers[q.id] || '').length} karakter</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setActiveTab('B')}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
              >
                &larr; Kembali ke Bagian B
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('D')}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-sm"
              >
                Lanjut ke Bagian D (Praktik) &rarr;
              </button>
            </div>
          </div>
        )}

        {/* BAGIAN D: PRAKTIK */}
        {activeTab === 'D' && (
          <div className="space-y-5 animate-fade-in">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="rounded-lg bg-orange-100 p-2 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400">
                <Wrench className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Bagian D: Hasil Praktik & Unggah Bukti Kerja
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Unggah berkas hasil kerja atau sertakan tautan repositori proyek Anda.
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
              <p className="text-xs font-bold text-slate-900 dark:text-white mb-1">
                Petunjuk Praktik:
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {lkpd.praktik.instructions}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Tautan URL Praktik */}
              <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Tautan Hasil Praktik (GitHub / Google Drive / Figma / Demo)
                </label>
                <input
                  type="url"
                  value={praktikUrl}
                  onChange={(e) => setPraktikUrl(e.target.value)}
                  placeholder="https://github.com/username/project-lkpd"
                  className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
                <p className="text-[10px] text-slate-400">
                  Pastikan akses tautan bersifat publik / dapat dibuka oleh guru pengampu.
                </p>
              </div>

              {/* Upload Berkas / File */}
              <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Unggah Berkas Laporan (.PDF, .ZIP, .DOCX, Gambar)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setUploadedFileName(e.target.files[0].name);
                      }
                    }}
                    className="text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-950 dark:file:text-blue-300"
                  />
                </div>
                {uploadedFileName && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Berkas terlampir: {uploadedFileName}
                  </p>
                )}
              </div>
            </div>

            {/* Catatan Praktik */}
            <div>
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">
                Catatan Tambahan untuk Guru
              </label>
              <textarea
                rows={2}
                value={praktikNote}
                onChange={(e) => setPraktikNote(e.target.value)}
                placeholder="Tuliskan catatan proses pengujian, kendala teknis, atau instruksi khusus..."
                className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setActiveTab('C')}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
              >
                &larr; Kembali ke Bagian C
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('E')}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-sm"
              >
                Lanjut ke Bagian E (Refleksi Diri) &rarr;
              </button>
            </div>
          </div>
        )}

        {/* BAGIAN E: REFLEKSI */}
        {activeTab === 'E' && (
          <div className="space-y-5 animate-fade-in">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="rounded-lg bg-purple-100 p-2 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400">
                <HeartHandshake className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Bagian E: Refleksi Pembelajaran Bermakna
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Refleksikan pemahaman Anda untuk penguatan kompetensi berkelanjutan.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {lkpd.refleksi.questions.map((q, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-200 p-4 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2 shadow-xs"
                >
                  <label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 block">
                    {idx + 1}. {q}
                  </label>
                  <textarea
                    rows={3}
                    value={refleksiAnswers[idx] || ''}
                    onChange={(e) =>
                      setRefleksiAnswers((prev) => ({ ...prev, [idx]: e.target.value }))
                    }
                    placeholder="Tuliskan refleksi jujur berdasarkan pengalaman Anda..."
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 p-2.5 text-xs text-slate-800 focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              ))}
            </div>

            {/* Submission Action Bar */}
            <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 p-5 text-white shadow-lg flex flex-wrap items-center justify-between gap-4 mt-6">
              <div>
                <h3 className="font-bold text-sm flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Seluruh 5 Komponen LKPD Telah Ditinjau
                </h3>
                <p className="text-xs text-blue-100 mt-0.5">
                  Pastikan jawaban Anda lengkap sebelum menekan tombol serahkan tugas di samping.
                </p>
              </div>
              <button
                type="button"
                onClick={handleSubmit}
                className="flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-xs font-extrabold text-blue-700 hover:bg-blue-50 shadow-md transition-all active:scale-95"
              >
                <Send className="h-4 w-4" />
                KIRIM JAWABAN LKPD SEKARANG
              </button>
            </div>

            <div className="flex justify-start pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('D')}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
              >
                &larr; Kembali ke Bagian D
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
