# SI-LKPD SMKN 1 SIDAYU
### Sistem LKPD Interaktif dan Pembelajaran Daring Terintegrasi
**SMK Negeri 1 Sidayu — Gresik, Jawa Timur**

Aplikasi pembelajaran modern dan manajemen LKPD interaktif berbasis Kurikulum Merdeka (Capaian Pembelajaran / CP dan Tujuan Pembelajaran / TP), dilengkapi dengan sistem penilaian otomatis, formula rubrik terstandar, umpan balik naratif instan, analitik belajar Recharts, komunikasi chat daring, serta import data murid dari Excel.

---

## 🚀 Fitur Unggulan

1. **Multi-Role System (4 Peran):**
   - **Guru**: Manajemen CP & TP, LKPD Interaktif 5 Komponen, Penugasan, Materi Multi-Format (PDF, DOCX, PPT, Video, YouTube), Penilaian Berbasis Rubrik Otomatis, Analitik.
   - **Murid**: Pengerjaan LKPD 5-Tahap (Orientasi, Eksplorasi, Diskusi, Praktik, Refleksi) dengan autosave, Pengumpulan Tugas, Transkrip Rapor Nilai, Progress CP & TP.
   - **Admin**: Master data pengguna (Guru & Murid), Manajemen Kelas, Import Excel Murid, Backup & Restore Database JSON.
   - **Kepala Sekolah (Kepsek)**: Monitoring mutu sekolah, ketuntasan TP & CP, perbandingan rombel, dan distribusi nilai.

2. **LKPD Interaktif 5 Fase (Kurikulum Merdeka):**
   - **Identitas Murid**: Nama, NISN, Kelas (Terisi otomatis dari akun).
   - **Bagian A (Orientasi)**: Video pemantik (YouTube) & pertanyaan stimulus.
   - **Bagian B (Eksplorasi)**: Materi interaktif dan referensi konsep.
   - **Bagian C (Diskusi)**: Kolom esai analisis kritis dengan autosave.
   - **Bagian D (Praktik)**: Unggah berkas hasil kerja (PDF/ZIP/DOCX/Gambar) atau link repositori GitHub.
   - **Bagian E (Refleksi)**: Evaluasi diri peserta didik.

3. **Formula Penilaian Rubrik Otomatis:**
   - Standar Bobot:
     - Pemahaman Konsep (30%)
     - Ketepatan Jawaban (30%)
     - Kreativitas (20%)
     - Kelengkapan (20%)
   - Formula: `nilaiAkhir = (Konsep*30 + Ketepatan*30 + Kreativitas*20 + Kelengkapan*20) / 4`
   - Kategori & Feedback Otomatis:
     - `90 - 100`: **Sangat Baik** ("Sangat baik, pertahankan hasil belajar...")
     - `80 - 89`: **Baik** ("Sudah baik dan terus ditingkatkan...")
     - `70 - 79`: **Cukup** ("Cukup baik namun perlu penguatan materi...")
     - `< 70`: **Perlu Bimbingan** ("Perlu pendampingan dan latihan tambahan...")

4. **Import Data Murid dari Excel:**
   - Membaca kolom `Nama Murid`, `NISN`, `Kelas`, dan `Jurusan` secara otomatis.
   - Tersedia tombol unduh template standar `.xlsx`.

---

## 🛠️ Panduan Instalasi & Menjalankan Lokal

```bash
# 1. Clone repositori
git clone <url-repo>
cd si-lkpd-smkn1sidayu

# 2. Install dependensi
npm install

# 3. Jalankan development server
npm run dev
```

Buka peramban di `http://localhost:3000`.

---

## ☁️ Panduan Deploy ke Firebase Hosting

```bash
# 1. Pastikan Firebase CLI terpasang
npm install -g firebase-tools

# 2. Login ke akun Firebase Google
firebase login

# 3. Inisialisasi Firebase (jika belum)
firebase init

# 4. Build aplikasi
npm run build

# 5. Deploy hosting dan rules
firebase deploy --only hosting,firestore:rules,storage:rules
```

---

## ⚡ Panduan Deploy ke Vercel

```bash
# 1. Pasang Vercel CLI atau hubungkan ke GitHub
npm install -g vercel

# 2. Deploy
vercel
```
Atau cukup import repository ini langsung ke dashboard Vercel, framework akan terdeteksi sebagai **Vite**.

---

## 👥 Akun Demo Pengujian

Anda dapat berganti peran secara langsung melalui tombol **"Mode Demo"** pada Navbar di bagian atas:
- **Guru**: Ahmad Wibowo, S.Kom., M.T. (`wibowo@guru.smkn1sidayu.sch.id`)
- **Murid**: M. Hafiz Al-Fathir (`hafiz.siswa@smkn1sidayu.sch.id`)
- **Admin**: Bambang Sudarsono, M.Pd. (`admin@smkn1sidayu.sch.id`)
- **Kepala Sekolah**: Drs. H. Miftakhul Huda, M.M. (`kepsek@smkn1sidayu.sch.id`)
