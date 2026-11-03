import React, { useState, useEffect } from 'react';
import { Submission, Rubric, ScoreBreakdown } from '../types';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { calculateFinalScore, getScoreCategory, generateAutomatedFeedback, getCategoryBadgeColor } from '../utils/calculateScore';
import { X, Award, CheckCircle2, FileText, ExternalLink, Sparkles, User, HelpCircle } from 'lucide-react';
import Swal from 'sweetalert2';

interface PenilaianModalProps {
  submission: Submission;
  onClose: () => void;
  onGraded?: () => void;
}

export const PenilaianModal: React.FC<PenilaianModalProps> = ({ submission, onClose, onGraded }) => {
  const { rubrics, gradeSubmission, scores, lkpdList } = useData();
  const { currentUser } = useAuth();

  // Find existing score if already graded
  const existingScore = scores.find((s) => s.submissionId === submission.id);

  // Find corresponding rubric
  const rubric = rubrics[0] || {
    id: 'rubric-01',
    title: 'Rubrik Standar Evaluasi LKPD',
    criteria: [
      { id: 'crit-01', name: 'Pemahaman Konsep', weight: 30, descriptors: { 1: 'Sangat Kurang', 2: 'Kurang', 3: 'Baik', 4: 'Sangat Baik' } },
      { id: 'crit-02', name: 'Ketepatan Jawaban', weight: 30, descriptors: { 1: 'Sangat Kurang', 2: 'Kurang', 3: 'Baik', 4: 'Sangat Baik' } },
      { id: 'crit-03', name: 'Kreativitas', weight: 20, descriptors: { 1: 'Sangat Kurang', 2: 'Kurang', 3: 'Baik', 4: 'Sangat Baik' } },
      { id: 'crit-04', name: 'Kelengkapan', weight: 20, descriptors: { 1: 'Sangat Kurang', 2: 'Kurang', 3: 'Baik', 4: 'Sangat Baik' } },
    ]
  };

  // State of criteria scores (1-4)
  const [criterionScores, setCriterionScores] = useState<Record<string, 1 | 2 | 3 | 4>>(() => {
    if (existingScore) {
      const map: Record<string, 1 | 2 | 3 | 4> = {};
      existingScore.breakdown.forEach((b) => {
        map[b.criterionId] = b.score;
      });
      return map;
    }
    // Default initial scores: 3 (Baik)
    const defaults: Record<string, 1 | 2 | 3 | 4> = {};
    rubric.criteria.forEach((c) => {
      defaults[c.id] = 3;
    });
    return defaults;
  });

  const [feedback, setFeedback] = useState<string>(existingScore?.feedback || '');
  const [autoFeedbackEnabled, setAutoFeedbackEnabled] = useState(!existingScore);

  // Compute live score
  const breakdown: ScoreBreakdown[] = rubric.criteria.map((c) => ({
    criterionId: c.id,
    criterionName: c.name,
    weight: c.weight,
    score: criterionScores[c.id] || 3,
  }));

  const liveScore = calculateFinalScore(
    breakdown.map((b) => ({
      id: b.criterionId,
      name: b.criterionName,
      weight: b.weight,
      score: b.score,
    }))
  );

  const category = getScoreCategory(liveScore);
  const badgeStyle = getCategoryBadgeColor(category);

  // Auto-update feedback when scores change (if enabled)
  useEffect(() => {
    if (autoFeedbackEnabled) {
      const generated = generateAutomatedFeedback(liveScore, submission.studentName);
      setFeedback(generated);
    }
  }, [liveScore, autoFeedbackEnabled, submission.studentName]);

  const handleScoreChange = (criterionId: string, score: 1 | 2 | 3 | 4) => {
    setCriterionScores((prev) => ({ ...prev, [criterionId]: score }));
  };

  const handleSave = () => {
    try {
      gradeSubmission(submission.id, breakdown, feedback, currentUser.displayName);
      Swal.fire({
        icon: 'success',
        title: 'Penilaian Berhasil Disimpan',
        html: `<p>Nilai Akhir: <b>${liveScore}</b> (${category})</p><p class="text-xs text-slate-500 mt-2">Notifikasi otomatis telah dikirimkan ke siswa ${submission.studentName}.</p>`,
        confirmButtonColor: '#2563eb',
      });
      if (onGraded) onGraded();
      onClose();
    } catch (e: any) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal Menyimpan',
        text: e.message || 'Terjadi kesalahan sistem.',
      });
    }
  };

  const lkpdAnswers = submission.lkpdAnswers;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative my-8 w-full max-w-4xl rounded-2xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Lembar Penilaian & Rubrik LKPD
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {submission.assignmentTitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Student Info Card */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                {submission.studentName.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {submission.studentName}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  NISN: <span className="font-mono text-blue-600 dark:text-blue-400">{submission.studentNisn}</span> • Kelas: {submission.className}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 dark:text-slate-400 block">Dikumpulkan:</span>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {new Date(submission.submittedAt).toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          {/* Student Work Preview */}
          <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800 space-y-3 bg-white dark:bg-slate-900">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600" />
              Hasil Pengerjaan Peserta Didik
            </h3>

            {submission.note && (
              <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                <span className="font-semibold text-slate-900 dark:text-white">Catatan Siswa:</span> {submission.note}
              </div>
            )}

            {/* If LKPD Answers Present */}
            {lkpdAnswers ? (
              <div className="space-y-4 pt-2">
                {/* Bagian C: Diskusi */}
                <div className="rounded-lg border border-slate-100 p-3 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/30">
                  <h4 className="text-xs font-bold text-blue-600 dark:text-blue-400 mb-2">
                    Bagian C: Jawaban Diskusi Analitis
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(lkpdAnswers.diskusiAnswers || {}).map(([key, val], idx) => (
                      <div key={key} className="text-xs border-b border-slate-200/60 pb-2 last:border-0 dark:border-slate-700/60">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">Pertanyaan #{idx + 1}:</span>
                        <p className="mt-1 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 p-2 rounded border border-slate-100 dark:border-slate-700">
                          {val || '(Belum dijawab)'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bagian D: Praktik */}
                <div className="rounded-lg border border-slate-100 p-3 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/30">
                  <h4 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                    Bagian D: Hasil Praktik & Uji Coba
                  </h4>
                  {lkpdAnswers.praktikUrl && (
                    <div className="mt-1 flex items-center gap-2 text-xs">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Tautan Hasil:</span>
                      <a
                        href={lkpdAnswers.praktikUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-blue-600 hover:underline dark:text-blue-400 font-medium"
                      >
                        {lkpdAnswers.praktikUrl}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                  {lkpdAnswers.praktikNote && (
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                      <strong>Keterangan:</strong> {lkpdAnswers.praktikNote}
                    </p>
                  )}
                </div>

                {/* Bagian E: Refleksi */}
                <div className="rounded-lg border border-slate-100 p-3 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/30">
                  <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-2">
                    Bagian E: Refleksi Diri
                  </h4>
                  <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                    {Object.entries(lkpdAnswers.refleksiAnswers || {}).map(([idx, val]) => (
                      <div key={idx} className="bg-white dark:bg-slate-800 p-2 rounded border border-slate-100 dark:border-slate-700">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">Refleksi #{parseInt(idx, 10) + 1}:</span> {val}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">Pengerjaan tugas melalui berkas terlampir.</p>
            )}

            {submission.fileName && (
              <div className="mt-2 flex items-center gap-2 rounded-lg bg-blue-50/60 p-2.5 text-xs text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200/50">
                <FileText className="h-4 w-4" />
                <span className="font-semibold">Berkas Siswa:</span>
                <span>{submission.fileName}</span>
                <span className="ml-auto text-[11px] text-blue-600 underline cursor-pointer">Unduh Berkas</span>
              </div>
            )}
          </div>

          {/* Rubric Interactive Scorer */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Formulir Penilaian Rubrik Otomatis
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Bobot baku: Konsep (30%) + Ketepatan (30%) + Kreativitas (20%) + Kelengkapan (20%)
                </p>
              </div>
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2.5 py-1 rounded-lg">
                Skala 1 - 4
              </span>
            </div>

            <div className="space-y-4">
              {rubric.criteria.map((crit) => {
                const currentVal = criterionScores[crit.id] || 3;
                return (
                  <div
                    key={crit.id}
                    className="rounded-xl border border-slate-200 p-4 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {crit.name}
                        </span>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          Bobot {crit.weight}%
                        </span>
                      </div>
                      <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400">
                        Skor: {currentVal} / 4
                      </span>
                    </div>

                    {/* Scale Selector 1-4 */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                      {([1, 2, 3, 4] as (1 | 2 | 3 | 4)[]).map((level) => {
                        const isSelected = currentVal === level;
                        const labelMap = {
                          1: '1 - Sangat Kurang',
                          2: '2 - Kurang',
                          3: '3 - Baik',
                          4: '4 - Sangat Baik',
                        };

                        return (
                          <button
                            key={level}
                            type="button"
                            onClick={() => handleScoreChange(crit.id, level)}
                            className={`flex flex-col text-left p-2.5 rounded-xl border text-xs transition-all ${
                              isSelected
                                ? 'border-blue-600 bg-blue-50/80 text-blue-950 dark:border-blue-500 dark:bg-blue-950/50 dark:text-blue-100 ring-2 ring-blue-500/30'
                                : 'border-slate-200 hover:border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            <span className="font-bold flex items-center justify-between">
                              {labelMap[level]}
                              {isSelected && <CheckCircle2 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />}
                            </span>
                            <span className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                              {crit.descriptors[level]}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Real-time Result Preview */}
          <div className="rounded-2xl bg-gradient-to-br from-blue-50 via-indigo-50 to-white p-5 dark:from-slate-800 dark:via-slate-800/80 dark:to-slate-900 border border-blue-200/80 dark:border-slate-700 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Perhitungan Otomatis Sistem
                </span>
                <div className="mt-1 flex items-baseline gap-3">
                  <span className="text-4xl font-extrabold text-blue-600 dark:text-blue-400 tracking-tight">
                    {liveScore}
                  </span>
                  <span className="text-slate-400 text-sm">/ 100</span>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}>
                    {category}
                  </span>
                </div>
              </div>

              <div className="text-xs text-slate-500 dark:text-slate-400 bg-white/80 dark:bg-slate-900/80 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="font-mono text-[11px] block text-slate-700 dark:text-slate-300 font-semibold">
                  Rumus: (Konsep×30 + Ketepatan×30 + Kreativitas×20 + Kelengkapan×20) / 4
                </span>
                <span className="mt-0.5 block text-[10px] text-slate-400">
                  = ({criterionScores['crit-01'] || 3}×30 + {criterionScores['crit-02'] || 3}×30 + {criterionScores['crit-03'] || 3}×20 + {criterionScores['crit-04'] || 3}×20) / 4 = {liveScore}
                </span>
              </div>
            </div>

            {/* Feedback Box */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  Umpan Balik Guru & Rekomendasi Tindak Lanjut
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setAutoFeedbackEnabled(true);
                    setFeedback(generateAutomatedFeedback(liveScore, submission.studentName));
                  }}
                  className="text-[11px] text-blue-600 hover:underline dark:text-blue-400"
                >
                  Regenerasi Otomatis
                </button>
              </div>
              <textarea
                value={feedback}
                onChange={(e) => {
                  setAutoFeedbackEnabled(false);
                  setFeedback(e.target.value);
                }}
                rows={3}
                placeholder="Tuliskan umpan balik atau saran konstruktif untuk peserta didik..."
                className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs text-slate-800 shadow-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            Batal
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-600/30 hover:bg-blue-700 transition-colors"
            >
              <CheckCircle2 className="h-4 w-4" />
              Simpan & Kirim Nilai ke Siswa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
