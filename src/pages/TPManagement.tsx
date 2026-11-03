import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { TujuanPembelajaran } from '../types';
import {
  Target,
  Plus,
  Edit2,
  Trash2,
  Layers,
  CheckCircle2,
  X,
  Award
} from 'lucide-react';
import Swal from 'sweetalert2';

export const TPManagement: React.FC = () => {
  const { tpList, cpList, addTP, updateTP, deleteTP } = useData();
  const { role } = useAuth();

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [cpId, setCpId] = useState(cpList[0]?.id || 'cp-01');
  const [code, setCode] = useState('TP-01.4');
  const [description, setDescription] = useState('');
  const [indicatorsStr, setIndicatorsStr] = useState('Murid mampu memahami konsep\nMurid mampu mengimplementasikan prompt');
  const [minimumMasteryScore, setMinimumMasteryScore] = useState(75);

  const canEdit = role === 'guru' || role === 'admin';

  const handleOpenAdd = () => {
    setEditingId(null);
    setCpId(cpList[0]?.id || 'cp-01');
    setCode(`TP-01.${tpList.length + 1}`);
    setDescription('');
    setIndicatorsStr('Murid mampu mengidentifikasi komponen prompt\nMurid mampu menguji kode keluaran AI');
    setMinimumMasteryScore(75);
    setShowModal(true);
  };

  const handleOpenEdit = (tp: TujuanPembelajaran) => {
    setEditingId(tp.id);
    setCpId(tp.cpId);
    setCode(tp.code);
    setDescription(tp.description);
    setIndicatorsStr(tp.indicators.join('\n'));
    setMinimumMasteryScore(tp.minimumMasteryScore || 75);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    const selectedCP = cpList.find((c) => c.id === cpId);
    const indicators = indicatorsStr
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    if (editingId) {
      updateTP(editingId, {
        cpId,
        cpCode: selectedCP?.code || 'CP-E-PPLG-01',
        code,
        description,
        indicators,
        minimumMasteryScore
      });
      Swal.fire({
        icon: 'success',
        title: 'TP Berhasil Diperbarui',
        timer: 1500,
        showConfirmButton: false
      });
    } else {
      addTP({
        cpId,
        cpCode: selectedCP?.code || 'CP-E-PPLG-01',
        code,
        description,
        order: tpList.length + 1,
        indicators,
        minimumMasteryScore
      });
      Swal.fire({
        icon: 'success',
        title: 'Tujuan Pembelajaran Ditambahkan',
        timer: 1500,
        showConfirmButton: false
      });
    }

    setShowModal(false);
  };

  const handleDelete = (id: string, codeStr: string) => {
    Swal.fire({
      title: `Hapus ${codeStr}?`,
      text: 'Tindakan ini tidak dapat dibatalkan.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    }).then((r) => {
      if (r.isConfirmed) {
        deleteTP(id);
        Swal.fire({
          icon: 'success',
          title: 'Terhapus',
          timer: 1200,
          showConfirmButton: false
        });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
              TUJUAN PEMBELAJARAN (TP)
            </span>
            <span className="rounded-md bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
              SMKN 1 SIDAYU
            </span>
          </div>
          <h1 className="mt-2 text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            Manajemen Tujuan Pembelajaran (TP)
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Setiap Tujuan Pembelajaran diturunkan langsung dari Capaian Pembelajaran (CP) dan menjadi acuan penilaian LKPD.
          </p>
        </div>

        {canEdit && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-600/30 hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Tambah TP Baru
          </button>
        )}
      </div>

      {/* TP List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tpList.map((tp) => {
          const parentCP = cpList.find((c) => c.id === tp.cpId);
          return (
            <div
              key={tp.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-lg bg-emerald-600 px-2.5 py-0.5 text-xs font-bold text-white">
                        {tp.code}
                      </span>
                      <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                        <Layers className="h-3 w-3" /> Induk: {parentCP?.code || tp.cpCode}
                      </span>
                    </div>
                    <span className="mt-1 block text-[10px] text-slate-400">
                      Target KKTP: <strong>{tp.minimumMasteryScore || 75}</strong> (Skala 100)
                    </span>
                  </div>

                  {canEdit && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(tp)}
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                        title="Edit TP"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(tp.id, tp.code)}
                        className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        title="Hapus TP"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-3">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                    {tp.description}
                  </h3>
                </div>

                {tp.indicators && tp.indicators.length > 0 && (
                  <div className="mt-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Indikator Ketercapaian Kompetensi:
                    </p>
                    <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                      {tp.indicators.map((ind, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{ind}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span>Elemen: {parentCP?.element || 'PPLG'}</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">Fase {parentCP?.phase || 'E'}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Add / Edit TP */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {editingId ? 'Edit Tujuan Pembelajaran' : 'Tambah Tujuan Pembelajaran (TP)'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Hubungkan ke Capaian Pembelajaran (CP) Induk
                </label>
                <select
                  value={cpId}
                  onChange={(e) => setCpId(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  {cpList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} - {c.element} (Fase {c.phase})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Kode TP
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
                    KKTP Minimum (0-100)
                  </label>
                  <input
                    type="number"
                    min="50"
                    max="100"
                    value={minimumMasteryScore}
                    onChange={(e) => setMinimumMasteryScore(parseInt(e.target.value, 10))}
                    className="w-full rounded-xl border border-slate-300 p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Deskripsi Tujuan Pembelajaran (TP)
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Contoh: Menganalisis struktur prompt pada kecerdasan artifisial..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Indikator Ketercapaian (Satu baris per indikator)
                </label>
                <textarea
                  rows={3}
                  value={indicatorsStr}
                  onChange={(e) => setIndicatorsStr(e.target.value)}
                  placeholder="Murid mampu mengidentifikasi komponen..."
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
                  Simpan TP
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
