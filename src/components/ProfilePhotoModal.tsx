import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import {
  Camera,
  Upload,
  Sparkles,
  Link2,
  Trash2,
  Check,
  X,
  User,
  Image as ImageIcon,
  RotateCcw
} from 'lucide-react';
import Swal from 'sweetalert2';

interface ProfilePhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Preset avatars curated for Indonesian vocational school teachers & students
const PRESET_AVATARS = [
  {
    category: 'Pendidik / Guru Pria',
    avatars: [
      { name: 'Guru Pria 1', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250' },
      { name: 'Guru Pria Kacamata', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250' },
      { name: 'Guru Profesional', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250' },
      { name: 'Pendidik Muda', url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=250' }
    ]
  },
  {
    category: 'Pendidik / Guru Wanita',
    avatars: [
      { name: 'Guru Hijab Formal', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250' },
      { name: 'Guru Wanita 2', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=250' },
      { name: 'Pendidik Ramah', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=250' },
      { name: 'Guru Konselor', url: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=250' }
    ]
  },
  {
    category: 'Siswa & Siswi SMK',
    avatars: [
      { name: 'Siswa SMK 1', url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=250' },
      { name: 'Siswi SMK 1', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250' },
      { name: 'Siswa Teknik', url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=250' },
      { name: 'Siswi Aktif', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=250' }
    ]
  }
];

export const ProfilePhotoModal: React.FC<ProfilePhotoModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, updateProfile, role } = useAuth();
  const { updateTeacher } = useData();

  const [activeTab, setActiveTab] = useState<'upload' | 'preset' | 'url'>('upload');
  const [previewUrl, setPreviewUrl] = useState<string>(
    currentUser.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250'
  );
  const [customUrl, setCustomUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Compress & crop to square using HTML5 canvas
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      Swal.fire({
        icon: 'error',
        title: 'Format Tidak Didukung',
        text: 'Silakan pilih file gambar (JPG, PNG, WEBP, atau GIF).'
      });
      return;
    }

    // Limit to 5MB raw
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({
        icon: 'warning',
        title: 'Ukuran Terlalu Besar',
        text: 'Ukuran file maksimal 5 MB. Sistem akan otomatis mengompres foto Anda.'
      });
    }

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxSize = 320; // 320x320 px optimal for crisp web avatars
        let width = img.width;
        let height = img.height;

        // Crop to square from center
        const minDim = Math.min(width, height);
        const startX = (width - minDim) / 2;
        const startY = (height - minDim) / 2;

        canvas.width = maxSize;
        canvas.height = maxSize;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, startX, startY, minDim, minDim, 0, 0, maxSize, maxSize);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.88);
          setPreviewUrl(compressedDataUrl);
        }
        setIsProcessing(false);
      };
      img.onerror = () => {
        setIsProcessing(false);
        Swal.fire({ icon: 'error', title: 'Gagal Membaca Gambar' });
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleApplyUrl = () => {
    if (!customUrl.trim()) return;
    setPreviewUrl(customUrl.trim());
  };

  const handleSave = () => {
    updateProfile({ avatarUrl: previewUrl });
    // If current user is a teacher, also sync with teachers list
    if (role === 'guru') {
      updateTeacher(currentUser.uid, { avatarUrl: previewUrl });
    }

    Swal.fire({
      icon: 'success',
      title: 'Foto Profil Diperbarui',
      text: 'Foto profil Anda berhasil disimpan ke sistem.',
      timer: 1800,
      showConfirmButton: false
    });
    onClose();
  };

  const handleResetToDefault = () => {
    const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
      currentUser.displayName
    )}&background=2563eb&color=fff&size=256&bold=true`;
    setPreviewUrl(defaultAvatar);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300">
              <Camera className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Ganti Foto Profil
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pilih atau unggah foto untuk akun {currentUser.displayName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Live Preview Area */}
        <div className="flex flex-col sm:flex-row items-center gap-4 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
          <div className="relative group">
            <img
              src={previewUrl}
              alt="Pratinjau Foto"
              className="h-24 w-24 rounded-2xl object-cover ring-4 ring-white dark:ring-slate-800 shadow-md transition-transform group-hover:scale-105"
            />
            <div className="absolute -bottom-2 -right-2 rounded-full bg-blue-600 p-1.5 text-white shadow-md">
              <Camera className="h-3.5 w-3.5" />
            </div>
          </div>

          <div className="text-center sm:text-left flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Pratinjau Tampilan
            </p>
            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
              {currentUser.displayName}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">
              {role === 'kepsek' ? 'Kepala Sekolah' : role} • {currentUser.className || 'SMKN 1 Sidayu'}
            </p>
            <div className="mt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
              <button
                type="button"
                onClick={handleResetToDefault}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              >
                <RotateCcw className="h-3 w-3" /> Inisial Otomatis
              </button>
            </div>
          </div>
        </div>

        {/* Tab selection */}
        <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'upload'
                ? 'bg-white text-blue-600 shadow-xs dark:bg-slate-900 dark:text-blue-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Upload className="h-3.5 w-3.5" />
            Unggah Berkas
          </button>
          <button
            onClick={() => setActiveTab('preset')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'preset'
                ? 'bg-white text-blue-600 shadow-xs dark:bg-slate-900 dark:text-blue-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Galeri Avatar
          </button>
          <button
            onClick={() => setActiveTab('url')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'url'
                ? 'bg-white text-blue-600 shadow-xs dark:bg-slate-900 dark:text-blue-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Link2 className="h-3.5 w-3.5" />
            Tautan URL
          </button>
        </div>

        {/* Tab 1: File Upload */}
        {activeTab === 'upload' && (
          <div className="space-y-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/png,image/jpeg,image/jpg,image/webp"
              className="hidden"
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 p-6 text-center hover:border-blue-500 hover:bg-blue-50/50 cursor-pointer dark:border-slate-700 dark:hover:border-blue-400 dark:hover:bg-blue-950/20 transition-all"
            >
              <div className="rounded-full bg-blue-100 p-3 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300">
                <Upload className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {isProcessing ? 'Mengompresi Foto...' : 'Klik untuk Pilih Foto dari Perangkat'}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Mendukung format JPG, PNG, atau WEBP (otomatis dipotong rasio 1:1)
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Preset Avatar Grid */}
        {activeTab === 'preset' && (
          <div className="max-h-56 overflow-y-auto space-y-4 pr-1">
            {PRESET_AVATARS.map((grp) => (
              <div key={grp.category} className="space-y-2">
                <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  {grp.category}
                </p>
                <div className="grid grid-cols-4 gap-2.5">
                  {grp.avatars.map((av) => {
                    const isSelected = previewUrl === av.url;
                    return (
                      <button
                        key={av.name}
                        type="button"
                        onClick={() => setPreviewUrl(av.url)}
                        className={`relative rounded-xl overflow-hidden border-2 transition-all group ${
                          isSelected
                            ? 'border-blue-600 ring-2 ring-blue-500/40 scale-105'
                            : 'border-transparent hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <img
                          src={av.url}
                          alt={av.name}
                          className="h-16 w-full object-cover"
                        />
                        {isSelected && (
                          <div className="absolute inset-0 bg-blue-600/30 flex items-center justify-center">
                            <Check className="h-5 w-5 text-white drop-shadow-md" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: URL Input */}
        {activeTab === 'url' && (
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Masukkan URL Gambar:
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://example.com/foto-saya.jpg"
                className="flex-1 rounded-xl border border-slate-300 p-2.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
              <button
                type="button"
                onClick={handleApplyUrl}
                className="rounded-xl bg-slate-800 px-3 py-2 text-xs font-bold text-white hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600"
              >
                Pratinjau
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              Pastikan tautan dapat diakses publik (Direct Image URL).
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 pt-4 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isProcessing}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-blue-600/30 hover:bg-blue-700 disabled:opacity-50"
          >
            <Check className="h-4 w-4" />
            Terapkan & Simpan Foto
          </button>
        </div>
      </div>
    </div>
  );
};
