export type UserRole = 'admin' | 'guru' | 'murid' | 'kepsek';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  password?: string; // Stored user password (editable by Admin)
  avatarUrl?: string;
  nip?: string; // for guru / kepsek
  nisn?: string; // for murid
  classId?: string; // for murid
  className?: string; // e.g., "X PPLG 1"
  major?: string; // e.g., "Pengembangan Perangkat Lunak & Gim"
  subject?: string; // for guru: Mata pelajaran yang diampu (bisa multiple string koma)
  subjectsTaught?: string[]; // for guru: Daftar mata pelajaran yang diampu (1, 2, atau lebih)
  phone?: string;
  createdAt?: string;
}


export interface ClassGroup {
  id: string;
  name: string; // e.g. "X PPLG 1"
  major: string; // e.g. "PPLG"
  grade: 'X' | 'XI' | 'XII';
  academicYear: string;
  teacherId: string;
  teacherName: string;
  studentCount?: number;
}

export interface CapaianPembelajaran {
  id: string;
  code: string; // e.g., "CP-PPLG-01"
  phase: 'E' | 'F';
  subject: string; // e.g. "Pemrograman Berorientasi Objek" / "Dasar PPLG"
  element: string; // e.g. "Rekayasa Perangkat Lunak & AI Prompting"
  description: string;
  targetSemester: number;
  teacherId: string;
  teacherName: string;
  tpCount?: number;
}

export interface TujuanPembelajaran {
  id: string;
  cpId: string;
  cpCode: string;
  code: string; // e.g. "TP-01.1"
  description: string;
  order: number;
  indicators: string[];
  minimumMasteryScore: number; // e.g. 75
}

export type MaterialType = 'pdf' | 'docx' | 'ppt' | 'video' | 'image' | 'youtube';

export interface AttachmentItem {
  id: string;
  name: string;
  url: string;
  type: string; // 'pdf' | 'docx' | 'ppt' | 'image' | 'video' | 'link' | 'file'
  size?: string;
  uploadedAt?: string;
}

export interface LearningMaterial {
  id: string;
  title: string;
  description: string;
  subject: string;
  classIds: string[];
  type: MaterialType;
  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
  youtubeId?: string;
  externalLink?: string;
  attachments?: AttachmentItem[];
  tpId?: string;
  teacherId: string;
  teacherName: string;
  createdAt: string;
  views?: number;
}

export interface RubricCriterion {
  id: string;
  name: string; // e.g. "Pemahaman Konsep"
  weight: number; // e.g. 30 (percent)
  descriptors: {
    1: string; // Sangat Kurang
    2: string; // Kurang
    3: string; // Baik
    4: string; // Sangat Baik
  };
}

export interface Rubric {
  id: string;
  title: string;
  description: string;
  criteria: RubricCriterion[];
  teacherId: string;
  isDefault?: boolean;
}

export interface LKPDComponentOrientasi {
  type: 'video' | 'image' | 'text';
  contentUrl?: string;
  promptText: string;
}

export interface LKPDComponentEksplorasi {
  content: string; // rich text or instructions
  referenceLinks?: string[];
}

export interface LKPDComponentDiskusi {
  questions: {
    id: string;
    question: string;
    placeholder?: string;
  }[];
}

export interface LKPDComponentPraktik {
  instructions: string;
  allowedFormats: string[]; // ['pdf', 'zip', 'docx', 'jpg', 'png', 'link']
}

export interface LKPDComponentRefleksi {
  questions: string[];
}

export interface InteractiveLKPD {
  id: string;
  title: string;
  subject: string;
  classIds: string[];
  tpId: string;
  tpCode?: string;
  cpId: string;
  rubricId: string;
  durationMinutes: number;
  orientasi: LKPDComponentOrientasi;
  eksplorasi: LKPDComponentEksplorasi;
  diskusi: LKPDComponentDiskusi;
  praktik: LKPDComponentPraktik;
  refleksi: LKPDComponentRefleksi;
  teacherId: string;
  teacherName: string;
  createdAt: string;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  subject: string;
  classIds: string[];
  cpId: string;
  tpId: string;
  rubricId: string;
  lkpdId?: string;
  deadline: string;
  teacherId: string;
  teacherName: string;
  attachments?: AttachmentItem[];
  createdAt: string;
}

export type SubmissionStatus = 'submitted' | 'late' | 'not_submitted';

export interface LKPDAnswer {
  diskusiAnswers: Record<string, string>; // questionId -> answer
  praktikUrl?: string;
  praktikNote?: string;
  praktikFileName?: string;
  refleksiAnswers: Record<string, string>; // questionIndex -> answer
}

export interface Submission {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  studentId: string;
  studentName: string;
  studentNisn: string;
  classId: string;
  className: string;
  submittedAt: string;
  status: SubmissionStatus;
  note?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
  attachments?: AttachmentItem[];
  lkpdAnswers?: LKPDAnswer;
  scoreId?: string;
}

export type ScoreCategory = 'Sangat Baik' | 'Baik' | 'Cukup' | 'Perlu Bimbingan';

export interface ScoreBreakdown {
  criterionId: string;
  criterionName: string;
  weight: number;
  score: 1 | 2 | 3 | 4;
}

export interface Score {
  id: string;
  submissionId: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  studentNisn: string;
  classId: string;
  tpId: string;
  cpId: string;
  breakdown: ScoreBreakdown[];
  finalScore: number; // 0 - 100
  category: ScoreCategory;
  feedback: string;
  gradedBy: string;
  gradedAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'assignment' | 'material' | 'grade' | 'announcement';
  link?: string;
  createdAt: string;
  read: boolean;
}

export interface ChatMessage {
  id: string;
  channelId: string; // e.g. "class_X_PPLG_1" or "direct_GURU_MURID"
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  senderAvatar?: string;
  text: string;
  imageUrl?: string;
  fileUrl?: string;
  fileName?: string;
  timestamp: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  targetRole: 'all' | 'guru' | 'murid';
  authorName: string;
  createdAt: string;
  isImportant?: boolean;
}

export interface SubjectItem {
  id: string;
  name: string;
  category?: 'Umum' | 'Kejuruan' | 'Pilihan' | 'Muatan Lokal / Khusus' | 'Bimbingan';
}
