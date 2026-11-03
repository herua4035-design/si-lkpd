import React, { useState } from 'react';
import { OFFICIAL_TEACHERS } from '../services/mockData';
import { Search, X, BookOpen, ShieldCheck, UserCheck, Layers } from 'lucide-react';

interface TeacherLookupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTeacher: (teacher: { name: string; nip: string; mapel?: string; email?: string }) => void;
}

export const TeacherLookupModal: React.FC<TeacherLookupModalProps> = ({
  isOpen,
  onClose,
  onSelectTeacher
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMapelFilter, setSelectedMapelFilter] = useState('all');

  if (!isOpen) return null;

  // Extract unique mapel categories
  const mapelCategories = Array.from(
    new Set(OFFICIAL_TEACHERS.map((t) => t.mapel).filter(Boolean))
  ) as string[];

  const filteredTeachers = OFFICIAL_TEACHERS.filter((t) => {
    const matchesMapel = selectedMapelFilter === 'all' || t.mapel === selectedMapelFilter;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesMapel;
    const matchesName = t.name.toLowerCase().includes(q);
    const matchesNip = t.nip.replace(/\s+/g, '').includes(q.replace(/\s+/g, ''));
    const matchesSubject = (t.mapel || '').toLowerCase().includes(q);
    return matchesMapel && (matchesName || matchesNip || matchesSubject);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
      <div
        className="w-full max-w-3xl rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 overflow-hidden flex flex-col max-h-[88vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-5 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-100 p-2 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                Direktori Data Guru & Tenaga Pendidik
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                  {OFFICIAL_TEACHERS.length} Guru Resmi
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Cari nama Anda atau NIP untuk mengisi identitas akun pendidik SMKN 1 Sidayu.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-600 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search & Filter */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari Nama Guru, NIP, atau Mata Pelajaran (contoh: Ahmad Heru, Matematika, 19831216...)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-blue-500 focus:bg-white focus:outline-none"
              autoFocus
            />
          </div>

          {/* Quick Mapel Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
              <Layers className="h-3 w-3" /> Mapel:
            </span>
            <button
              type="button"
              onClick={() => setSelectedMapelFilter('all')}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedMapelFilter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              Semua ({OFFICIAL_TEACHERS.length})
            </button>
            {mapelCategories.slice(0, 8).map((mapel) => (
              <button
                key={mapel}
                type="button"
                onClick={() => setSelectedMapelFilter(mapel)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold whitespace-nowrap transition-colors truncate max-w-[200px] ${
                  selectedMapelFilter === mapel
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {mapel}
              </button>
            ))}
          </div>
        </div>

        {/* Teacher List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredTeachers.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <p className="text-sm font-semibold">Tidak ada data guru yang cocok</p>
              <p className="text-xs mt-1">Coba kata kunci pencarian nama atau NIP lain.</p>
            </div>
          ) : (
            filteredTeachers.map((t, idx) => {
              const nipDigits = t.nip && t.nip !== '-' ? t.nip.slice(-4) : `${1000 + idx}`;
              const isAhmadHeru = t.name.includes('Ahmad Heru Wahyu Wibowo');
              const email = isAhmadHeru
                ? 'ahmadwibowo62@guru.sma.belajar.id'
                : t.name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 12) + '@guru.smkn1sidayu.sch.id';

              return (
                <div
                  key={t.nip || idx}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-3.5 hover:border-blue-300 hover:bg-blue-50/40 dark:border-slate-800 dark:bg-slate-850 dark:hover:bg-slate-800 transition-all shadow-2xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 font-bold text-sm">
                      {t.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {t.name}
                      </p>
                      <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {t.nip && t.nip !== '-' ? (
                          <span className="font-mono bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 px-1.5 py-0.2 rounded font-semibold">
                            NIP: {t.nip}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Non-NIP / GTT</span>
                        )}
                        <span>•</span>
                        <span className="text-slate-700 dark:text-slate-300 font-medium truncate max-w-[260px]">
                          {t.mapel || 'Pengajar'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectTeacher({ ...t, email })}
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3.5 py-1.5 shadow-sm shadow-blue-600/30 transition-all shrink-0 cursor-pointer"
                  >
                    <UserCheck className="h-3.5 w-3.5" />
                    <span>Pilih Akun</span>
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Info */}
        <div className="border-t border-slate-100 dark:border-slate-800 p-3.5 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
            <span>Terdaftar di Data Pendidik & Tenaga Kependidikan SMKN 1 Sidayu</span>
          </span>
          <span className="text-[11px]">
            Menampilkan: <strong className="text-slate-800 dark:text-white">{filteredTeachers.length}</strong> Pendidik
          </span>
        </div>
      </div>
    </div>
  );
};
