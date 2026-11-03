import * as XLSX from 'xlsx';
import { UserProfile, Score } from '../types';

export interface ImportedStudentRow {
  displayName: string;
  nisn: string;
  className: string;
  major: string;
}

/**
 * Membaca file Excel/CSV data murid dan mengembalikan list murid siap simpan
 */
export async function parseStudentsExcel(file: File): Promise<ImportedStudentRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawJson = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet);

        const students: ImportedStudentRow[] = [];

        for (const row of rawJson) {
          // Normalisasi key
          const keys = Object.keys(row);
          const findKey = (candidates: string[]) => {
            const found = keys.find(k => candidates.some(c => k.toLowerCase().replace(/[\s_]/g, '').includes(c.toLowerCase().replace(/[\s_]/g, ''))));
            return found ? String(row[found] || '').trim() : '';
          };

          const name = findKey(['nama', 'namamurid', 'namasiswa', 'studentname', 'name']);
          const nisn = findKey(['nisn', 'nis', 'nomorinduk']);
          const className = findKey(['kelas', 'rombel', 'class', 'classname']);
          const major = findKey(['jurusan', 'konsentrasi', 'prodi', 'major']);

          if (name && nisn) {
            students.push({
              displayName: name,
              nisn: nisn,
              className: className || 'X PPLG 1',
              major: major || 'Pengembangan Perangkat Lunak & Gim'
            });
          }
        }

        resolve(students);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Generate Excel template untuk memudahkan guru/admin import murid
 */
export function downloadStudentTemplate() {
  const templateData = [
    {
      'Nama Murid': 'Ahmad Fauzi',
      'NISN': '0061234567',
      'Kelas': 'X PPLG 1',
      'Jurusan': 'PPLG'
    },
    {
      'Nama Murid': 'Bunga Citra Lestari',
      'NISN': '0061234568',
      'Kelas': 'X PPLG 1',
      'Jurusan': 'PPLG'
    },
    {
      'Nama Murid': 'Dimas Pratama',
      'NISN': '0061234569',
      'Kelas': 'X PPLG 2',
      'Jurusan': 'PPLG'
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(templateData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Format_Murid');
  XLSX.writeFile(workbook, 'Template_Import_Murid_SMKN1SIDAYU.xlsx');
}

/**
 * Export Rekap Nilai ke Excel
 */
export function exportGradesToExcel(
  scores: Score[], 
  assignmentTitle: string = 'Rekap_Nilai'
) {
  const formatted = scores.map((s, index) => ({
    'No': index + 1,
    'Nama Murid': s.studentName,
    'NISN': s.studentNisn,
    'Kelas': s.classId || '-',
    'Nilai Akhir': s.finalScore,
    'Kategori': s.category,
    'Catatan / Feedback': s.feedback,
    'Tanggal Dinilai': new Date(s.gradedAt).toLocaleDateString('id-ID')
  }));

  const worksheet = XLSX.utils.json_to_sheet(formatted);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Rekap_Nilai');
  XLSX.writeFile(workbook, `${assignmentTitle.replace(/\s+/g, '_')}_SMKN1SIDAYU.xlsx`);
}
