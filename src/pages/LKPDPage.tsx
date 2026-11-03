import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { InteractiveLKPD } from '../types';
import { InteractiveLKPDViewer } from '../components/InteractiveLKPDViewer';
import {
  Compass,
  Plus,
  Play,
  Edit2,
  Trash2,
  Clock,
  BookOpen,
  Video,
  FileCheck2,
  Sparkles,
  CheckCircle2,
  X,
  Target
} from 'lucide-react';
import Swal from 'sweetalert2';

export const LKPDPage: React.FC = () => {
  const { lkpdList, addLKPD, deleteLKPD, tpList, cpList, classes, subjects } = useData();
  const { role, currentUser } = useAuth();

  const [selectedLKPD, setSelectedLKPD] = useState<InteractiveLKPD | null>(
    lkpdList[0] || null
  );
  const [isSolvingMode, setIsSolvingMode] = useState(role === 'murid');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Subjects taught by current logged-in teacher
  const teacherSubjects: string[] = currentUser.subjectsTaught && currentUser.subjectsTaught.length > 0
    ? currentUser.subjectsTaught
    : currentUser.subject
    ? currentUser.subject.split(',').map((s) => s.trim()).filter(Boolean)
    : ['Koding dan Kecerdasan Artifisial'];

  // New LKPD form states
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState(teacherSubjects[0] || 'Koding dan Kecerdasan Artifisial');
  const [tpId, setTpId] = useState(tpList[0]?.id || 'tp-01');
  const [duration, setDuration] = useState(90);
  const [orientasiUrl, setOrientasiUrl] = useState('https://www.youtube.com/embed/jC4v5AS4RIM');
  const [orientasiPrompt, setOrientasiPrompt] = useState('Amati video penerapan AI di atas.');
  const [eksplorasiContent, setEksplorasiContent] = useState('Uraian materi anatomi prompt...');
  const [q1, setQ1] = useState('1. Jelaskan pentingnya instruksi role dalam prompt!');
  const [q2, setQ2] = useState('2. Berikan contoh revisi prompt spesifik!');
  const [q3, setQ3] = useState('3. Bagaimana mitigasi halusinasi model?');
  const [praktikInst, setPraktikInst] = useState('Rancang dokumen pengujian prompt dan unggah berkas laporan.');

  const canManage = role === 'guru' || role === 'admin';

  const handleCreateLKPD = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const selectedTP = tpList.find((t) => t.id === tpId);

    const newLKPDData: Omit<InteractiveLKPD, 'id' | 'createdAt'> = {
      title,
      subject,
      classIds: ['class-01', 'class-02'],
      tpId,
      tpCode: selectedTP?.code || 'TP-01.1',
      cpId: selectedTP?.cpId || 'cp-01',
      rubricId: 'rubric-01',
      durationMinutes: duration,
      orientasi: {
        type: 'video',
        contentUrl: orientasiUrl,
        promptText: orientasiPrompt
      },
      eksplorasi: {
        content: eksplorasiContent,
        referenceLinks: ['https://developers.googleblog.com/prompt-techniques']
      },
      diskusi: {
        questions: [
          { id: 'q1', question: q1, placeholder: 'Jawab secara komprehensif...' },
          { id: 'q2', question: q2, placeholder: 'Jawab secara komprehensif...' },
          { id: 'q3', question: q3, placeholder: 'Jawab secara komprehensif...' },
        ]
      },
      praktik: {
        instructions: praktikInst,
        allowedFormats: ['pdf', 'docx', 'zip', 'png', 'jpg', 'link']
      },
      refleksi: {
        questions: [
          'Apa wawasan baru paling berharga yang Anda peroleh?',
          'Kendala apa yang paling menantang saat menyusun solusi?',
          'Bagaimana rencana tindak lanjut implementasi Anda?'
        ]
      },
      teacherId: currentUser.uid,
      teacherName: currentUser.displayName
    };

    addLKPD(newLKPDData);
    setShowCreateModal(false);
    Swal.fire({
      icon: 'success',
      title: 'LKPD Interaktif Berhasil Dibuat',
      text: 'Peserta didik sekarang dapat mengakses dan mengerjakan lembar kerja ini.',
      confirmButtonColor: '#2563eb'
    });
  };

  const handleDelete = (id: string, titleStr: string) => {
    Swal.fire({
      title: `Hapus LKPD?`,
      text: `"${titleStr}" akan dihapus dari sistem.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Ya, Hapus'
    }).then((r) => {
      if (r.isConfirmed) {
        deleteLKPD(id);
        if (selectedLKPD?.id === id) {
          setSelectedLKPD(lkpdList[0] || null);
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
              SI-LKPD INTERAKTIF
            </span>
            <span className="rounded-md bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
              5 FASE KOMPONEN
            </span>
          </div>
          <h1 className="mt-2 text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            Lembar Kerja Peserta Didik (LKPD) Interaktif
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            A. Orientasi • B. Eksplorasi • C. Diskusi • D. Praktik • E. Refleksi (Tersimpan Otomatis ke Firestore)
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canManage && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-600/30 hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Buat LKPD Baru
            </button>
          )}

          {selectedLKPD && (
            <button
              onClick={() => setIsSolvingMode(!isSolvingMode)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
                isSolvingMode
                  ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200'
                  : 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 hover:bg-emerald-700'
              }`}
            >
              <Play className="h-4 w-4" />
              {isSolvingMode ? 'Mode Ringkasan LKPD' : 'Buka Simulator Lembar Pengerjaan'}
            </button>
          )}
        </div>
      </div>

      {/* Main Area: Solving Mode or Overview List */}
      {isSolvingMode && selectedLKPD ? (
        <InteractiveLKPDViewer
          lkpd={selectedLKPD}
          onFinish={() => setIsSolvingMode(false)}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LKPD Cards list */}
          <div className="lg:col-span-1 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Daftar Lembar Kerja ({lkpdList.length})
            </h3>
            {lkpdList.map((lk) => {
              const isSelected = selectedLKPD?.id === lk.id;
              return (
                <div
                  key={lk.id}
                  onClick={() => setSelectedLKPD(lk)}
                  className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/70 dark:border-blue-500 dark:bg-blue-950/40 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className="rounded bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white">
                      {lk.tpCode || 'TP-01.1'}
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {lk.durationMinutes} mnt
                    </span>
                  </div>

                  <h4 className="mt-2 text-sm font-bold text-slate-900 dark:text-white leading-snug">
                    {lk.title}
                  </h4>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {lk.subject}
                  </p>

                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                    <span className="text-slate-400">Guru: {lk.teacherName}</span>
                    {canManage && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(lk.id, lk.title);
                        }}
                        className="text-rose-500 hover:text-rose-700"
                        title="Hapus LKPD"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* LKPD Preview Panel */}
          {selectedLKPD && (
            <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
                <div>
                  <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                    Struktur LKPD Interaktif Kurikulum Merdeka
                  </span>
                  <h2 className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
                    {selectedLKPD.title}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Mata Pelajaran: <strong>{selectedLKPD.subject}</strong> • Alokasi Waktu: <strong>{selectedLKPD.durationMinutes} Menit</strong>
                  </p>
                </div>

                <button
                  onClick={() => setIsSolvingMode(true)}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-600/30 hover:bg-blue-700"
                >
                  <Play className="h-4 w-4" />
                  Mulai Kerjakan LKPD
                </button>
              </div>

              {/* 5 Component Overview Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="rounded-xl border border-slate-200 p-3.5 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 block mb-1">
                    A. Orientasi Stimulus
                  </span>
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3">
                    {selectedLKPD.orientasi.promptText}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-3.5 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 block mb-1">
                    B. Eksplorasi Konsep
                  </span>
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3">
                    {selectedLKPD.eksplorasi.content}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-3.5 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block mb-1">
                    C. Diskusi Analitis ({selectedLKPD.diskusi.questions.length} Pertanyaan)
                  </span>
                  <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                    {selectedLKPD.diskusi.questions.map((q) => (
                      <li key={q.id} className="line-clamp-1">• {q.question}</li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-xl border border-slate-200 p-3.5 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                  <span className="text-xs font-bold text-orange-600 dark:text-orange-400 block mb-1">
                    D. Praktik & E. Refleksi
                  </span>
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3">
                    Praktik: {selectedLKPD.praktik.instructions}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal Create LKPD */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="relative my-8 w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Buat Lembar Kerja Peserta Didik (LKPD) Interaktif
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLKPD} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Judul LKPD
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: LKPD 02: Perancangan Skema Database Relasional..."
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
                    Tujuan Pembelajaran (TP) Terkait
                  </label>
                  <select
                    value={tpId}
                    onChange={(e) => setTpId(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    {tpList.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.code} - {t.description.slice(0, 45)}...
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Alokasi Waktu (Menit)
                  </label>
                  <input
                    type="number"
                    min="15"
                    max="180"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value, 10))}
                    className="w-full rounded-xl border border-slate-300 p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              {/* 5 Komponen input */}
              <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                <span className="font-bold text-slate-900 dark:text-white block">
                  A. Orientasi (Video Embed & Stimulus)
                </span>
                <input
                  type="url"
                  placeholder="URL Embed YouTube (cth: https://www.youtube.com/embed/...)"
                  value={orientasiUrl}
                  onChange={(e) => setOrientasiUrl(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
                <textarea
                  rows={2}
                  placeholder="Pertanyaan pemantik orientasi..."
                  value={orientasiPrompt}
                  onChange={(e) => setOrientasiPrompt(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>

              <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="font-bold text-slate-900 dark:text-white block">
                  B. Eksplorasi (Materi Interaktif)
                </span>
                <textarea
                  rows={3}
                  placeholder="Rangkuman konsep dan instruksi eksplorasi..."
                  value={eksplorasiContent}
                  onChange={(e) => setEksplorasiContent(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>

              <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="font-bold text-slate-900 dark:text-white block">
                  C. Diskusi (Pertanyaan Teks Esai)
                </span>
                <input
                  type="text"
                  placeholder="Pertanyaan esai #1"
                  value={q1}
                  onChange={(e) => setQ1(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
                <input
                  type="text"
                  placeholder="Pertanyaan esai #2"
                  value={q2}
                  onChange={(e) => setQ2(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
                <input
                  type="text"
                  placeholder="Pertanyaan esai #3"
                  value={q3}
                  onChange={(e) => setQ3(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>

              <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="font-bold text-slate-900 dark:text-white block">
                  D. Praktik (Instruksi Upload Kerja)
                </span>
                <textarea
                  rows={2}
                  placeholder="Instruksi pengujian atau pembuatan proyek..."
                  value={praktikInst}
                  onChange={(e) => setPraktikInst(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
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
                  Terbitkan LKPD Interaktif
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
