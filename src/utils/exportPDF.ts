import { Score, CapaianPembelajaran, TujuanPembelajaran } from '../types';

export function printStudentReport(
  studentName: string,
  nisn: string,
  className: string,
  scores: Score[],
  cpList: CapaianPembelajaran[],
  tpList: TujuanPembelajaran[]
) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Pop-up terblokir. Izinkan pop-up browser untuk mencetak.');
    return;
  }

  const average = scores.length
    ? Math.round((scores.reduce((a, b) => a + b.finalScore, 0) / scores.length) * 10) / 10
    : 0;

  const html = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="utf-8">
      <title>Laporan Hasil Belajar - ${studentName}</title>
      <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; margin: 40px; color: #1e293b; }
        .header { text-align: center; border-bottom: 3px double #0284c7; padding-bottom: 12px; margin-bottom: 24px; }
        .header h1 { margin: 0; font-size: 20px; text-transform: uppercase; letter-spacing: 1px; color: #1e3a8a; }
        .header h2 { margin: 4px 0; font-size: 16px; font-weight: normal; }
        .header p { margin: 2px 0; font-size: 12px; color: #64748b; }
        .info-grid { display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 14px; }
        .info-col p { margin: 4px 0; }
        table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 13px; }
        th, td { border: 1px solid #cbd5e1; padding: 10px; text-align: left; }
        th { background-color: #f1f5f9; color: #334155; }
        .score { font-weight: bold; text-align: center; }
        .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; background: #e0f2fe; color: #0369a1; }
        .summary-box { margin-top: 24px; padding: 16px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; }
        .footer { margin-top: 40px; display: flex; justify-content: space-between; font-size: 13px; }
        .signature-box { text-align: center; width: 200px; }
        .signature-line { margin-top: 70px; border-top: 1px solid #64748b; }
        @media print {
          body { margin: 20px; }
          button { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>SMK NEGERI 1 SIDAYU - GRESIK</h1>
        <h2>LEMBAR LAPORAN CAPAIAN LKPD & PEMBELAJARAN DARING</h2>
        <p>Jl. Raya Wadeng, Sidayu, Kabupaten Gresik, Jawa Timur 61153 | NSS: 401050106001</p>
      </div>

      <div class="info-grid">
        <div class="info-col">
          <p><strong>Nama Murid:</strong> ${studentName}</p>
          <p><strong>NISN:</strong> ${nisn}</p>
        </div>
        <div class="info-col">
          <p><strong>Rombel / Kelas:</strong> ${className}</p>
          <p><strong>Tahun Ajaran:</strong> 2026/2027 (Genap)</p>
        </div>
      </div>

      <h3>Daftar Evaluasi Tugas & LKPD Interaktif</h3>
      <table>
        <thead>
          <tr>
            <th style="width: 5%">No</th>
            <th>Materi / Judul LKPD</th>
            <th style="width: 15%">Capaian (CP/TP)</th>
            <th style="width: 12%">Nilai Akhir</th>
            <th style="width: 16%">Kategori</th>
            <th>Umpan Balik Guru</th>
          </tr>
        </thead>
        <tbody>
          ${scores.map((s, idx) => `
            <tr>
              <td style="text-align: center;">${idx + 1}</td>
              <td><strong>Penugasan LKPD #${idx + 1}</strong></td>
              <td>Fase E / ${s.tpId || 'TP-01'}</td>
              <td class="score">${s.finalScore}</td>
              <td><span class="badge">${s.category}</span></td>
              <td style="font-size: 12px; color: #475569;">${s.feedback}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="summary-box">
        <strong>Ringkasan Hasil Belajar:</strong>
        <p>Total Tugas & LKPD Tuntas: ${scores.length} | Nilai Rata-rata: <strong>${average}</strong> (${average >= 75 ? 'TUNTAS' : 'BELUM TUNTAS'})</p>
      </div>

      <div class="footer">
        <div class="signature-box">
          <p>Orang Tua / Wali,</p>
          <div class="signature-line"></div>
        </div>
        <div class="signature-box">
          <p>Sidayu, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}<br>Guru Mata Pelajaran,</p>
          <div class="signature-line">Guru Pengampu, S.Kom.</div>
        </div>
      </div>

      <script>
        window.onload = function() {
          window.print();
        }
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}
