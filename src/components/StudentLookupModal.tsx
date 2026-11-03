import React, { useState } from 'react';
import { OFFICIAL_STUDENTS_ROSTER } from '../services/studentRoster';
import { UserProfile } from '../types';
import { Search, X, GraduationCap, CheckCircle2, User, Layers, KeyRound } from 'lucide-react';

interface StudentLookupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectStudent: (student: UserProfile) => void;
}

export const StudentLookupModal: React.FC<StudentLookupModalProps> = ({
  isOpen,
  onClose,
  onSelectStudent
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('all');

  if (!isOpen) return null;

  const classList = [
    'all',
    'X TKR 1',
    'X TKR 2',
    'X TKR 3',
    'X TKR 4',
    'X TITL 1',
    'X TITL 2',
    'X TKJ 1',
    'X TKJ 2',
    'X TKJ 3',
    'X APHPi 1',
    'X APHPi 2'
  ];

  const filteredStudents = OFFICIAL_STUDENTS_ROSTER.filter((s) => {
    const matchesClass = selectedClass === 'all' || s.className?.toLowerCase() === selectedClass.toLowerCase();
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesClass;
    const matchesName = (s.displayName || '').toLowerCase().includes(q);
    const matchesNisn = (s.nisn || '').includes(q);
    return matchesClass && (matchesName || matchesNisn);
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
            <div className="rounded-xl bg-emerald-100 p-2 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                Direktori Data Siswa SMKN 1 Sidayu
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
                  {OFFICIAL_STUDENTS_ROSTER.length} Siswa Terdaftar
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pilih atau cari nama Anda/siswa untuk mengisi NISN dan masuk secara instan ke portal murid.
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

        {/* Filters & Search */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Ketik Nama Siswa atau NISN (contoh: ADITYA, 0111447361, ZIDAN)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-emerald-500 focus:bg-white focus:outline-none"
              autoFocus
            />
          </div>

          {/* Class Filter Badges */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
              <Layers className="h-3 w-3" /> Rombel:
            </span>
            {classList.map((cls) => (
              <button
                key={cls}
                type="button"
                onClick={() => setSelectedClass(cls)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold shrink-0 transition-colors cursor-pointer ${
                  selectedClass === cls
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {cls === 'all' ? 'Semua Kelas' : cls}
              </button>
            ))}
          </div>
        </div>

        {/* Student List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 divide-y divide-slate-100 dark:divide-slate-800">
          {filteredStudents.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <User className="h-10 w-10 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
              <p className="text-sm font-bold text-slate-600 dark:text-slate-300">Data Siswa Tidak Ditemukan</p>
              <p className="text-xs text-slate-400 mt-1">
                Coba sesuaikan kata kunci nama atau filter rombel kelas.
              </p>
            </div>
          ) : (
            filteredStudents.map((s, idx) => (
              <div
                key={s.uid}
                className="pt-2 pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 p-2.5 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-9 w-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-xs font-bold text-emerald-700 dark:text-emerald-300 shrink-0">
                    {idx + 1}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {s.displayName}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                        NISN: {s.nisn}
                      </span>
                      <span>•</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {s.className}
                      </span>
                      <span className="hidden sm:inline">•</span>
                      <span className="hidden sm:inline text-slate-400 truncate max-w-[200px]">
                        {s.major}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectStudent(s)}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-1.5 shadow-sm shadow-emerald-600/30 transition-all shrink-0 cursor-pointer"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Pilih untuk Masuk</span>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer Info */}
        <div className="border-t border-slate-100 dark:border-slate-800 p-3.5 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <GraduationCap className="h-3.5 w-3.5 text-emerald-500" />
            <span>Terdaftar Resmi di Database Siswa SMKN 1 Sidayu (T.A. 2026/2027)</span>
          </span>
          <span className="text-[11px]">
            Ditemukan: <strong className="text-slate-800 dark:text-white">{filteredStudents.length}</strong> siswa
          </span>
        </div>
      </div>
    </div>
  );
};
