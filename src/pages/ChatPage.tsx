import React, { useState, useRef, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import {
  MessageSquare,
  Send,
  Image as ImageIcon,
  Paperclip,
  Users,
  Search,
  CheckCheck,
  Smile,
  X,
  Download,
  Eye,
  FileText,
  FileSpreadsheet,
  FileCode,
  File as FileIcon,
  Sparkles,
  Info
} from 'lucide-react';

interface StagedAttachment {
  name: string;
  sizeFormatted: string;
  type: string;
  dataUrl: string;
  isImage: boolean;
}

// Categorized Emojis for school & learning chat
const EMOJI_CATEGORIES = [
  {
    name: 'Wajah & Emosi',
    emojis: [
      '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃',
      '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😋', '😜', '🤪',
      '🤗', '🤔', '🤫', '🤠', '🥳', '😎', '🤓', '🧐', '😴', '🤯'
    ]
  },
  {
    name: 'Tangan & Jempol',
    emojis: [
      '👍', '👎', '👏', '🙌', '🤝', '👊', '✌️', '🤞', '🤟', '🤘',
      '👌', '👈', '👉', '👆', '👇', '✍️', '💪', '🙏', '🫡', '🫶',
      '❤️', '💙', '💚', '💛', '💜', '🔥', '⭐', '✨', '💯', '🎯'
    ]
  },
  {
    name: 'Sekolah & Koding',
    emojis: [
      '📚', '📖', '📝', '✏️', '🖊️', '📐', '📏', '🎒', '🎓', '🏫',
      '💻', '🖥️', '⌨️', '🖱️', '📊', '📈', '📉', '📋', '📌', '📍',
      '💡', '🧠', '🏆', '🥇', '🥈', '🥉', '🔬', '🔭', '🧪', '🚀'
    ]
  },
  {
    name: 'Simbol & Status',
    emojis: [
      '✅', '❌', '❓', '❗', '⚠️', '🚨', '🔔', '📣', '📢', '💬',
      '💭', '🕒', '⏰', '📅', '🛠️', '⚙️', '🔒', '🔓', '🏷️', '🔗',
      '📦', '📂', '📁', '🎉', '☕', '☕', '💡', '🌟', '⚡', '🤖'
    ]
  }
];

const POPULAR_QUICK_EMOJIS = ['👍', '👏', '😊', '🙏', '💡', '📚', '🚀', '🔥', '✅', '❤️'];

export const ChatPage: React.FC = () => {
  const { messages, sendMessage, classes } = useData();
  const { currentUser } = useAuth();

  // Dynamic channels matching school classes + 1 consultation channel
  const dynamicChannels = [
    ...(classes && classes.length > 0
      ? classes.map((c) => ({
          id: c.id,
          name: `Diskusi ${c.name} (${c.major})`,
          type: 'class',
          memberCount: c.studentCount || 36
        }))
      : [
          { id: 'class-x-tkj-1', name: 'Diskusi Kelas X TKJ 1', type: 'class', memberCount: 36 },
          { id: 'class-x-pplg-1', name: 'Diskusi Kelas X PPLG 1', type: 'class', memberCount: 34 }
        ]),
    { id: 'direct-guru', name: 'Konsultasi Belajar Guru & Murid', type: 'direct', memberCount: 2 }
  ];

  const [activeChannelId, setActiveChannelId] = useState<string>(
    dynamicChannels[0]?.id || 'class-x-tkj-1'
  );
  const [inputText, setInputText] = useState('');
  const [stagedAttachment, setStagedAttachment] = useState<StagedAttachment | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [activeEmojiCategory, setActiveEmojiCategory] = useState<string>('Wajah & Emosi');
  const [emojiSearch, setEmojiSearch] = useState('');
  const [previewImageModal, setPreviewImageModal] = useState<string | null>(null);
  const [searchChannelQuery, setSearchChannelQuery] = useState('');

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const emojiPickerRef = useRef<HTMLDivElement | null>(null);

  const activeChannel = dynamicChannels.find((c) => c.id === activeChannelId) || dynamicChannels[0];
  const channelMessages = messages.filter((m) => m.channelId === activeChannelId);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [channelMessages]);

  // Click outside listener for emoji popover
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

  // File size formatter
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  // Handle local file selection (images or documents)
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, forceImageOnly = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran berkas melebihi 5MB. Silakan pilih berkas yang lebih kecil untuk efisiensi penyimpanan.');
      e.target.value = '';
      return;
    }

    const isImg = forceImageOnly || file.type.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setStagedAttachment({
          name: file.name,
          sizeFormatted: formatFileSize(file.size),
          type: file.type || 'application/octet-stream',
          dataUrl: reader.result,
          isImage: isImg
        });
      }
    };
    reader.readAsDataURL(file);

    // Reset input value so same file can be re-selected if removed
    e.target.value = '';
  };

  // Add emoji to chat input
  const handleInsertEmoji = (emoji: string) => {
    setInputText((prev) => prev + emoji);
    inputRef.current?.focus();
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && !stagedAttachment) return;

    sendMessage(
      activeChannelId,
      inputText.trim(),
      currentUser,
      stagedAttachment?.dataUrl,
      stagedAttachment?.name
    );

    setInputText('');
    setStagedAttachment(null);
    setShowEmojiPicker(false);
  };

  // Helper to determine file icon
  const getFileIcon = (fileName?: string) => {
    if (!fileName) return <Paperclip className="h-4 w-4" />;
    const lower = fileName.toLowerCase();
    if (lower.endsWith('.pdf')) return <FileText className="h-4 w-4 text-red-500" />;
    if (lower.endsWith('.xlsx') || lower.endsWith('.xls') || lower.endsWith('.csv')) {
      return <FileSpreadsheet className="h-4 w-4 text-emerald-500" />;
    }
    if (lower.endsWith('.js') || lower.endsWith('.ts') || lower.endsWith('.html') || lower.endsWith('.py')) {
      return <FileCode className="h-4 w-4 text-blue-500" />;
    }
    return <FileIcon className="h-4 w-4 text-amber-500" />;
  };

  const isAttachmentImage = (fileUrl?: string, fileName?: string) => {
    if (!fileUrl && !fileName) return false;
    if (fileUrl?.startsWith('data:image/')) return true;
    if (fileUrl?.includes('images.unsplash.com')) return true;
    if (fileName && /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(fileName)) return true;
    return false;
  };

  const filteredChannels = dynamicChannels.filter((ch) =>
    ch.name.toLowerCase().includes(searchChannelQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Hidden file inputs for attachments */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => handleFileSelect(e, false)}
        className="hidden"
        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip"
      />
      <input
        type="file"
        ref={imageInputRef}
        onChange={(e) => handleFileSelect(e, true)}
        className="hidden"
        accept="image/png,image/jpeg,image/webp,image/gif"
      />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
              KOMUNIKASI REALTIME
            </span>
            <span className="rounded-md bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
              KIRIM BERKAS & EMOTE AKTIF
            </span>
          </div>
          <h1 className="mt-2 text-xl font-extrabold text-slate-900 dark:text-white">
            Ruang Diskusi & Konsultasi Belajar Daring
          </h1>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Fasilitas tanya-jawab interaktif antar guru dan peserta didik seputar materi, tugas LKPD, serta pengiriman berkas pendukung.
          </p>
        </div>
      </div>

      {/* Main Chat Box Container */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[680px] rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        {/* Left Sidebar: Channels */}
        <div className="border-r border-slate-200 p-4 dark:border-slate-800 flex flex-col justify-between h-full bg-slate-50/40 dark:bg-slate-950/20">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Saluran Diskusi
              </span>
              <span className="text-[10px] font-bold text-slate-500 bg-slate-200/70 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                {dynamicChannels.length} Ruang
              </span>
            </div>

            {/* Channel search */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari saluran..."
                value={searchChannelQuery}
                onChange={(e) => setSearchChannelQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              />
            </div>

            <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
              {filteredChannels.map((ch) => {
                const isActive = ch.id === activeChannelId;
                return (
                  <button
                    key={ch.id}
                    onClick={() => setActiveChannelId(ch.id)}
                    className={`flex w-full items-center justify-between rounded-xl p-3 text-left transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/25'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800/70 text-slate-700 dark:text-slate-300 text-xs font-semibold'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`rounded-lg p-2 shrink-0 ${isActive ? 'bg-white/20' : 'bg-slate-200 dark:bg-slate-800'}`}>
                        <MessageSquare className="h-4 w-4" />
                      </div>
                      <div className="truncate">
                        <p className="truncate text-xs">{ch.name}</p>
                        <p className={`text-[10px] ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>
                          {ch.memberCount} Anggota
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
              {filteredChannels.length === 0 && (
                <p className="text-center py-6 text-xs text-slate-400">Saluran tidak ditemukan</p>
              )}
            </div>
          </div>

          <div className="rounded-xl bg-blue-50/70 p-3 text-xs text-blue-900 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/40">
            <p className="font-bold flex items-center gap-1.5 text-xs">
              <Info className="h-3.5 w-3.5 shrink-0 text-blue-600 dark:text-blue-400" />
              Etika Diskusi Sekolah:
            </p>
            <p className="text-[10px] mt-1 text-slate-600 dark:text-slate-400">
              Gunakan bahasa yang santun, kirim berkas materi atau kode yang relevan dengan pembelajaran LKPD.
            </p>
          </div>
        </div>

        {/* Right Area: Messages & Input */}
        <div className="md:col-span-2 flex flex-col h-full bg-slate-50/50 dark:bg-slate-900/40 relative">
          {/* Channel Header */}
          <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-3.5 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {activeChannel.name}
              </h3>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Saluran Aktif • SMKN 1 Sidayu
              </p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              {activeChannel.memberCount} Peserta
            </span>
          </div>

          {/* Messages Flow */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {channelMessages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-slate-800 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-2">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Belum ada pesan di saluran ini</p>
                <p className="text-xs text-slate-500 mt-1">Mulai diskusi pertama Anda atau ajukan pertanyaan kepada guru dan teman sekelas!</p>
              </div>
            )}

            {channelMessages.map((msg) => {
              const isMe = msg.senderId === currentUser.uid;
              const hasImage = isAttachmentImage(msg.fileUrl, msg.fileName);

              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 max-w-[85%] ${
                    isMe ? 'ml-auto flex-row-reverse' : ''
                  }`}
                >
                  <img
                    src={msg.senderAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250'}
                    alt={msg.senderName}
                    className="h-8 w-8 rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-700 shrink-0"
                  />

                  <div
                    className={`rounded-2xl p-3.5 text-xs shadow-xs transition-all ${
                      isMe
                        ? 'bg-blue-600 text-white rounded-tr-none'
                        : 'bg-white text-slate-800 dark:bg-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700 rounded-tl-none'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[11px] font-bold ${
                            isMe ? 'text-blue-100' : 'text-blue-600 dark:text-blue-400'
                          }`}
                        >
                          {msg.senderName}
                        </span>
                        <span
                          className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded font-extrabold ${
                            isMe
                              ? 'bg-blue-700/60 text-blue-200'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {msg.senderRole}
                        </span>
                      </div>
                      <span
                        className={`text-[9px] ${
                          isMe ? 'text-blue-200' : 'text-slate-400'
                        }`}
                      >
                        {new Date(msg.timestamp).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>

                    {/* Text message */}
                    {msg.text && (
                      <p className="leading-relaxed whitespace-pre-wrap break-words text-[13px]">{msg.text}</p>
                    )}

                    {/* Image Attachment Preview */}
                    {hasImage && msg.fileUrl && (
                      <div className="mt-2.5">
                        <div
                          onClick={() => setPreviewImageModal(msg.fileUrl || null)}
                          className="group relative cursor-pointer overflow-hidden rounded-xl border border-slate-200/60 dark:border-slate-700 bg-slate-900/10 max-w-sm"
                        >
                          <img
                            src={msg.fileUrl}
                            alt={msg.fileName || 'Lampiran Gambar'}
                            className="max-h-56 w-full object-cover rounded-xl transition-transform duration-200 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 text-white transition-opacity duration-200">
                            <span className="flex items-center gap-1 text-[11px] font-semibold bg-black/60 px-3 py-1.5 rounded-lg backdrop-blur-xs">
                              <Eye className="h-3.5 w-3.5" /> Perbesar Gambar
                            </span>
                          </div>
                        </div>
                        {msg.fileName && (
                          <p className={`mt-1 text-[10px] truncate ${isMe ? 'text-blue-200' : 'text-slate-400'}`}>
                            {msg.fileName}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Document / Non-Image Attachment */}
                    {!hasImage && msg.fileUrl && (
                      <div
                        className={`mt-2.5 rounded-xl p-2.5 flex items-center justify-between gap-3 border ${
                          isMe
                            ? 'bg-blue-700/50 border-blue-500/40 text-white'
                            : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`p-2 rounded-lg ${isMe ? 'bg-blue-800/80' : 'bg-slate-200 dark:bg-slate-800'}`}>
                            {getFileIcon(msg.fileName)}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-xs font-semibold">{msg.fileName || 'Lampiran Berkas'}</p>
                            <p className={`text-[10px] ${isMe ? 'text-blue-200' : 'text-slate-400'}`}>
                              Lampiran Berkas Belajar
                            </p>
                          </div>
                        </div>
                        <a
                          href={msg.fileUrl}
                          download={msg.fileName || 'dokumen'}
                          className={`p-1.5 rounded-lg hover:opacity-80 transition-opacity shrink-0 ${
                            isMe ? 'bg-white/20 text-white' : 'bg-blue-600 text-white'
                          }`}
                          title="Unduh Berkas"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Reaction Bar */}
          <div className="px-4 py-1.5 bg-slate-100/70 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-amber-500" /> Emote Cepat:
            </span>
            {POPULAR_QUICK_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => handleInsertEmoji(emoji)}
                className="hover:scale-125 transition-transform text-base px-1.5 py-0.5 rounded-md hover:bg-white dark:hover:bg-slate-700"
                title={`Kirim emote ${emoji}`}
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Staged Attachment Preview Banner */}
          {stagedAttachment && (
            <div className="px-4 py-2.5 bg-blue-50 dark:bg-blue-950/60 border-t border-blue-200 dark:border-blue-900/60 flex items-center justify-between text-xs text-blue-900 dark:text-blue-200 animate-fadeIn">
              <div className="flex items-center gap-3 min-w-0">
                {stagedAttachment.isImage ? (
                  <img
                    src={stagedAttachment.dataUrl}
                    alt="Preview"
                    className="h-9 w-9 rounded-lg object-cover ring-1 ring-blue-300 dark:ring-blue-700 shrink-0"
                  />
                ) : (
                  <div className="p-2 rounded-lg bg-blue-200 dark:bg-blue-900/80 shrink-0">
                    {getFileIcon(stagedAttachment.name)}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate font-bold text-xs">{stagedAttachment.name}</p>
                  <p className="text-[10px] text-blue-600 dark:text-blue-400">
                    Siap dikirim • {stagedAttachment.sizeFormatted}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStagedAttachment(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                title="Batalkan Lampiran"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Emoji Popover Picker */}
          {showEmojiPicker && (
            <div
              ref={emojiPickerRef}
              className="absolute bottom-16 left-4 z-50 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl dark:border-slate-700 dark:bg-slate-900 animate-in fade-in zoom-in-95 duration-150"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-white">
                  <Smile className="h-4 w-4 text-amber-500" /> Pilih Emote & Reaksi
                </div>
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Emoji Search */}
              <div className="mt-2.5 mb-2 relative">
                <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari emote (senyum, jempol, buku, api)..."
                  value={emojiSearch}
                  onChange={(e) => setEmojiSearch(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              {/* Category Tabs */}
              {!emojiSearch && (
                <div className="flex items-center gap-1 overflow-x-auto pb-1.5 scrollbar-none border-b border-slate-100 dark:border-slate-800 mb-2">
                  {EMOJI_CATEGORIES.map((cat) => (
                    <button
                      key={cat.name}
                      type="button"
                      onClick={() => setActiveEmojiCategory(cat.name)}
                      className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg shrink-0 transition-colors ${
                        activeEmojiCategory === cat.name
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              )}

              {/* Emoji Grid */}
              <div className="grid grid-cols-8 gap-1.5 max-h-48 overflow-y-auto p-1">
                {(emojiSearch
                  ? EMOJI_CATEGORIES.flatMap((c) => c.emojis).filter((em) => em.includes(emojiSearch))
                  : EMOJI_CATEGORIES.find((c) => c.name === activeEmojiCategory)?.emojis || []
                ).map((emoji, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleInsertEmoji(emoji)}
                    className="h-8 w-8 text-lg flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 hover:scale-125 transition-transform"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chat Input Bar */}
          <form
            onSubmit={handleSend}
            className="flex items-center gap-2 border-t border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900"
          >
            {/* Emote Button */}
            <button
              type="button"
              onClick={() => setShowEmojiPicker((prev) => !prev)}
              className={`rounded-xl p-2.5 transition-colors ${
                showEmojiPicker
                  ? 'bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400'
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-amber-500'
              }`}
              title="Pilih Emote / Emoji"
            >
              <Smile className="h-5 w-5" />
            </button>

            {/* Image picker button */}
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              className="rounded-xl p-2.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 transition-colors"
              title="Lampirkan Gambar / Foto"
            >
              <ImageIcon className="h-5 w-5" />
            </button>

            {/* Document / File picker button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-xl p-2.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 transition-colors"
              title="Lampirkan Dokumen (PDF, Excel, Word, ZIP)"
            >
              <Paperclip className="h-5 w-5" />
            </button>

            {/* Text Input */}
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ketik pertanyaan atau tanggapan diskusi di sini..."
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-800 focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={!inputText.trim() && !stagedAttachment}
              className="flex items-center justify-center rounded-xl bg-blue-600 p-2.5 text-white shadow-md shadow-blue-600/30 hover:bg-blue-700 disabled:opacity-40 transition-colors shrink-0"
              title="Kirim Pesan"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Fullscreen Image Preview Lightbox */}
      {previewImageModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-fadeIn"
          onClick={() => setPreviewImageModal(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 shadow-2xl p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
              <a
                href={previewImageModal}
                download="gambar_chat"
                className="p-2 rounded-xl bg-black/60 text-white hover:bg-blue-600 transition-colors"
                title="Unduh Gambar"
              >
                <Download className="h-4 w-4" />
              </a>
              <button
                onClick={() => setPreviewImageModal(null)}
                className="p-2 rounded-xl bg-black/60 text-white hover:bg-red-600 transition-colors"
                title="Tutup Preview"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <img
              src={previewImageModal}
              alt="Perbesaran Lampiran"
              className="max-h-[80vh] w-auto max-w-full object-contain rounded-xl mx-auto"
            />
          </div>
        </div>
      )}
    </div>
  );
};
