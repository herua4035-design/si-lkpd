import { ScoreCategory } from '../types';

export interface RubricInputItem {
  id: string;
  name: string;
  weight: number; // e.g. 30 (percent)
  score: 1 | 2 | 3 | 4;
}

/**
 * Menghitung nilai akhir berbasis rubrik Kurikulum Merdeka SMKN 1 Sidayu:
 * Formula: nilaiAkhir = (sum(skor * bobot)) / 4
 * Max Skor = (4 * 100) / 4 = 100.
 */
export function calculateFinalScore(items: RubricInputItem[]): number {
  if (!items || items.length === 0) return 0;
  
  const totalWeighted = items.reduce((acc, curr) => {
    return acc + (curr.score * curr.weight);
  }, 0);

  const raw = totalWeighted / 4;
  return Math.round(raw * 10) / 10;
}

export function getScoreCategory(score: number): ScoreCategory {
  if (score >= 90) return 'Sangat Baik';
  if (score >= 80) return 'Baik';
  if (score >= 70) return 'Cukup';
  return 'Perlu Bimbingan';
}

export function generateAutomatedFeedback(score: number, studentName?: string): string {
  const prefix = studentName ? `${studentName}, ` : '';
  if (score >= 90) {
    return `${prefix}Sangat baik, pertahankan hasil belajar dan tingkatkan eksplorasi mandiri.`;
  }
  if (score >= 80) {
    return `${prefix}Sudah baik dan terus ditingkatkan. Kuasai implementasi lanjutan.`;
  }
  if (score >= 70) {
    return `${prefix}Cukup baik namun perlu penguatan materi pada aspek pemahaman konsep dan ketepatan.`;
  }
  return `${prefix}Perlu pendampingan dan latihan tambahan untuk mencapai ketuntasan tujuan pembelajaran.`;
}

export function getCategoryBadgeColor(category: ScoreCategory): {
  bg: string;
  text: string;
  border: string;
} {
  switch (category) {
    case 'Sangat Baik':
      return { bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800' };
    case 'Baik':
      return { bg: 'bg-blue-50 dark:bg-blue-950/40', text: 'text-blue-700 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800' };
    case 'Cukup':
      return { bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800' };
    case 'Perlu Bimbingan':
    default:
      return { bg: 'bg-rose-50 dark:bg-rose-950/40', text: 'text-rose-700 dark:text-rose-400', border: 'border-rose-200 dark:border-rose-800' };
  }
}
