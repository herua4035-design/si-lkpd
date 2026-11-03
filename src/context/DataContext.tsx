import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  ClassGroup,
  CapaianPembelajaran,
  TujuanPembelajaran,
  LearningMaterial,
  Assignment,
  InteractiveLKPD,
  Rubric,
  Submission,
  Score,
  NotificationItem,
  ChatMessage,
  Announcement,
  UserProfile,
  ScoreBreakdown,
  SubjectItem
} from '../types';
import {
  INITIAL_CLASSES,
  INITIAL_CP,
  INITIAL_TP,
  INITIAL_MATERIALS,
  INITIAL_ASSIGNMENTS,
  INITIAL_LKPD,
  INITIAL_RUBRICS,
  INITIAL_SUBMISSIONS,
  INITIAL_SCORES,
  INITIAL_NOTIFICATIONS,
  INITIAL_MESSAGES,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_USERS,
  OFFICIAL_SUBJECTS
} from '../services/mockData';
import { OFFICIAL_STUDENTS_ROSTER } from '../services/studentRoster';
import { calculateFinalScore, getScoreCategory, generateAutomatedFeedback } from '../utils/calculateScore';
import confetti from 'canvas-confetti';
import Swal from 'sweetalert2';

interface DataContextType {
  classes: ClassGroup[];
  cpList: CapaianPembelajaran[];
  tpList: TujuanPembelajaran[];
  materials: LearningMaterial[];
  assignments: Assignment[];
  lkpdList: InteractiveLKPD[];
  rubrics: Rubric[];
  submissions: Submission[];
  scores: Score[];
  notifications: NotificationItem[];
  messages: ChatMessage[];
  announcements: Announcement[];
  students: UserProfile[];
  teachers: UserProfile[];
  allUsers: UserProfile[];
  subjects: SubjectItem[];

  // User & Password Credential Actions (Admin Editable)
  updateUserCredential: (uid: string, updates: Partial<UserProfile>) => void;
  addUserAccount: (user: Omit<UserProfile, 'uid'> & { uid?: string }) => void;
  deleteUserAccount: (uid: string) => void;

  // Subject Actions
  addSubject: (subj: Omit<SubjectItem, 'id'>) => void;

  updateSubject: (id: string, updates: Partial<SubjectItem>) => void;
  deleteSubject: (id: string) => void;

  // Teacher Actions
  addTeacher: (teacher: Omit<UserProfile, 'uid' | 'role'> & { nip?: string; subject?: string; subjectsTaught?: string[] }) => void;
  updateTeacher: (uid: string, updates: Partial<UserProfile>) => void;
  deleteTeacher: (uid: string) => void;
  resetTeachersAndSubjects: () => void;

  // Class Actions
  addClass: (cls: Omit<ClassGroup, 'id'>) => void;
  updateClass: (id: string, cls: Partial<ClassGroup>) => void;
  deleteClass: (id: string) => void;

  // CP Actions
  addCP: (cp: Omit<CapaianPembelajaran, 'id'>) => void;
  updateCP: (id: string, cp: Partial<CapaianPembelajaran>) => void;
  deleteCP: (id: string) => void;

  // TP Actions
  addTP: (tp: Omit<TujuanPembelajaran, 'id'>) => void;
  updateTP: (id: string, tp: Partial<TujuanPembelajaran>) => void;
  deleteTP: (id: string) => void;

  // Material Actions
  addMaterial: (mat: Omit<LearningMaterial, 'id' | 'createdAt' | 'views'>) => void;
  updateMaterial: (id: string, updates: Partial<LearningMaterial>) => void;
  deleteMaterial: (id: string) => void;

  // Assignment & LKPD Actions
  addAssignment: (assign: Omit<Assignment, 'id' | 'createdAt'>) => void;
  updateAssignment: (id: string, updates: Partial<Assignment>) => void;
  deleteAssignment: (id: string) => void;
  addLKPD: (lkpd: Omit<InteractiveLKPD, 'id' | 'createdAt'>) => void;
  updateLKPD: (id: string, lkpd: Partial<InteractiveLKPD>) => void;
  deleteLKPD: (id: string) => void;

  // Submission & Grading
  submitAssignment: (sub: Omit<Submission, 'id' | 'submittedAt' | 'status'>) => void;
  gradeSubmission: (
    submissionId: string,
    breakdown: ScoreBreakdown[],
    customFeedback?: string,
    teacherName?: string
  ) => Score;

  // Chat & Notification
  sendMessage: (channelId: string, text: string, sender: UserProfile, fileUrl?: string, fileName?: string) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;

  // Import Murid
  importStudentsBatch: (newStudents: { displayName: string; nisn: string; className: string; major: string }[]) => number;

  // Backup & Restore
  exportDatabaseJSON: () => string;
  restoreDatabaseJSON: (json: string) => boolean;
  resetToDefaultData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'si_lkpd_database_store_v5';

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial data from localStorage if exists, else defaults
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.classes && parsed.teachers && parsed.subjects && parsed.teachers.length >= 65) {
          if (!parsed.allUsers || !Array.isArray(parsed.allUsers) || parsed.allUsers.length < 200) {
            parsed.allUsers = INITIAL_USERS;
          } else {
            const existingNisns = new Set(parsed.allUsers.map((u: any) => u.nisn).filter(Boolean));
            const missing = OFFICIAL_STUDENTS_ROSTER.filter((s) => !existingNisns.has(s.nisn));
            if (missing.length > 0) {
              parsed.allUsers = [...parsed.allUsers, ...missing];
            }
          }
          if (parsed.allUsers && Array.isArray(parsed.allUsers)) {
            parsed.allUsers = parsed.allUsers.map((u: any) => ({
              ...u,
              nip: u.nip && u.nip !== '-' ? u.nip.replace(/\s+/g, '') : u.nip
            }));
          }
          if (parsed.teachers && Array.isArray(parsed.teachers)) {
            parsed.teachers = parsed.teachers.map((t: any) => ({
              ...t,
              nip: t.nip && t.nip !== '-' ? t.nip.replace(/\s+/g, '') : t.nip
            }));
          }
          parsed.students = parsed.allUsers.filter((u: any) => u.role === 'murid');
          parsed.teachers = parsed.allUsers.filter((u: any) => u.role === 'guru');
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse saved database:', e);
      }
    }
    return {
      classes: INITIAL_CLASSES,
      cpList: INITIAL_CP,
      tpList: INITIAL_TP,
      materials: INITIAL_MATERIALS,
      assignments: INITIAL_ASSIGNMENTS,
      lkpdList: INITIAL_LKPD,
      rubrics: INITIAL_RUBRICS,
      submissions: INITIAL_SUBMISSIONS,
      scores: INITIAL_SCORES,
      notifications: INITIAL_NOTIFICATIONS,
      messages: INITIAL_MESSAGES,
      announcements: INITIAL_ANNOUNCEMENTS,
      students: INITIAL_USERS.filter((u) => u.role === 'murid'),
      teachers: INITIAL_USERS.filter((u) => u.role === 'guru'),
      allUsers: INITIAL_USERS,
      subjects: OFFICIAL_SUBJECTS,
    };
  });


  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  // User Account & Credential Handlers (Admin Editable)
  const updateUserCredential = (uid: string, updates: Partial<UserProfile>) => {
    setData((prev: any) => {
      const currentList: UserProfile[] = prev.allUsers && prev.allUsers.length > 0 ? prev.allUsers : INITIAL_USERS;
      const updatedAll = currentList.map((u: UserProfile) => {
        if (u.uid === uid) {
          const cleanUpdates = { ...updates };
          if (cleanUpdates.nip && cleanUpdates.nip !== '-') {
            cleanUpdates.nip = cleanUpdates.nip.replace(/\s+/g, '');
          }
          return { ...u, ...cleanUpdates };
        }
        return u;
      });
      return {
        ...prev,
        allUsers: updatedAll,
        students: updatedAll.filter((u: UserProfile) => u.role === 'murid'),
        teachers: updatedAll.filter((u: UserProfile) => u.role === 'guru'),
      };
    });

    // Also update AuthContext active session if the target user is currently logged in
    const savedAuth = localStorage.getItem('si_lkpd_auth_user_v3');
    if (savedAuth) {
      try {
        const parsed = JSON.parse(savedAuth);
        if (parsed.uid === uid) {
          const cleanUpdates = { ...updates };
          if (cleanUpdates.nip && cleanUpdates.nip !== '-') {
            cleanUpdates.nip = cleanUpdates.nip.replace(/\s+/g, '');
          }
          localStorage.setItem('si_lkpd_auth_user_v3', JSON.stringify({ ...parsed, ...cleanUpdates }));
        }
      } catch (e) {}
    }
  };

  const addUserAccount = (newUser: Omit<UserProfile, 'uid'> & { uid?: string }) => {
    const defaultPass = newUser.password || (
      newUser.role === 'admin' ? 'admin123' :
      newUser.role === 'guru' ? 'guru123' :
      newUser.role === 'kepsek' ? 'kepsek123' : 'siswa123'
    );

    const cleanNip = newUser.nip && newUser.nip !== '-' ? newUser.nip.replace(/\s+/g, '') : newUser.nip;

    const created: UserProfile = {
      ...newUser,
      nip: cleanNip,
      uid: newUser.uid || `${newUser.role}-${Date.now()}`,
      password: defaultPass,
      avatarUrl: newUser.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(newUser.displayName)}&background=2563eb&color=fff&size=256&bold=true`
    };

    setData((prev: any) => {
      const currentList: UserProfile[] = prev.allUsers && prev.allUsers.length > 0 ? prev.allUsers : INITIAL_USERS;
      const updatedAll = [created, ...currentList];
      return {
        ...prev,
        allUsers: updatedAll,
        students: updatedAll.filter((u: UserProfile) => u.role === 'murid'),
        teachers: updatedAll.filter((u: UserProfile) => u.role === 'guru'),
      };
    });
  };

  const deleteUserAccount = (uid: string) => {
    setData((prev: any) => {
      const currentList: UserProfile[] = prev.allUsers && prev.allUsers.length > 0 ? prev.allUsers : INITIAL_USERS;
      const updatedAll = currentList.filter((u: UserProfile) => u.uid !== uid);
      return {
        ...prev,
        allUsers: updatedAll,
        students: updatedAll.filter((u: UserProfile) => u.role === 'murid'),
        teachers: updatedAll.filter((u: UserProfile) => u.role === 'guru'),
      };
    });
  };

  // Subject Handlers
  const addSubject = (subj: Omit<SubjectItem, 'id'>) => {

    const newSubj: SubjectItem = {
      ...subj,
      id: 'mapel-' + Date.now()
    };
    setData((prev: any) => ({ ...prev, subjects: [...prev.subjects, newSubj] }));
  };

  const updateSubject = (id: string, updates: Partial<SubjectItem>) => {
    setData((prev: any) => ({
      ...prev,
      subjects: prev.subjects.map((s: SubjectItem) => (s.id === id ? { ...s, ...updates } : s))
    }));
  };

  const deleteSubject = (id: string) => {
    setData((prev: any) => ({
      ...prev,
      subjects: prev.subjects.filter((s: SubjectItem) => s.id !== id)
    }));
  };

  // Teacher Handlers (Supports 1, 2, or more subjects)
  const addTeacher = (teacherData: Omit<UserProfile, 'uid' | 'role'> & { nip?: string; subject?: string; subjectsTaught?: string[] }) => {
    const taught = teacherData.subjectsTaught && teacherData.subjectsTaught.length > 0
      ? teacherData.subjectsTaught
      : teacherData.subject
      ? teacherData.subject.split(',').map((s) => s.trim()).filter(Boolean)
      : ['Pengajar SMKN 1 Sidayu'];

    const cleanNip = teacherData.nip && teacherData.nip !== '-' ? teacherData.nip.replace(/\s+/g, '') : teacherData.nip;

    const newTeacher: UserProfile = {
      ...teacherData,
      nip: cleanNip,
      uid: 'guru-' + Date.now(),
      role: 'guru',
      subjectsTaught: taught,
      subject: taught.join(', '),
      major: taught.join(' & '),
      avatarUrl: teacherData.avatarUrl || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250`
    };
    setData((prev: any) => ({ ...prev, teachers: [newTeacher, ...prev.teachers] }));
  };

  const updateTeacher = (uid: string, updates: Partial<UserProfile>) => {
    setData((prev: any) => ({
      ...prev,
      teachers: prev.teachers.map((t: UserProfile) => {
        if (t.uid !== uid) return t;

        let updatedTaught = updates.subjectsTaught;
        if (!updatedTaught && updates.subject) {
          updatedTaught = updates.subject.split(',').map((s) => s.trim()).filter(Boolean);
        } else if (!updatedTaught) {
          updatedTaught = t.subjectsTaught || (t.subject ? t.subject.split(',').map((s) => s.trim()).filter(Boolean) : []);
        }

        const combinedSubject = updatedTaught && updatedTaught.length > 0 ? updatedTaught.join(', ') : updates.subject || t.subject;
        const combinedMajor = updatedTaught && updatedTaught.length > 0 ? updatedTaught.join(' & ') : updates.major || t.major;

        const cleanNip = updates.nip !== undefined
          ? (updates.nip && updates.nip !== '-' ? updates.nip.replace(/\s+/g, '') : updates.nip)
          : t.nip;

        return {
          ...t,
          ...updates,
          nip: cleanNip,
          subjectsTaught: updatedTaught,
          subject: combinedSubject,
          major: combinedMajor
        };
      })
    }));
  };

  const deleteTeacher = (uid: string) => {
    setData((prev: any) => ({
      ...prev,
      teachers: prev.teachers.filter((t: UserProfile) => t.uid !== uid)
    }));
  };

  const resetTeachersAndSubjects = () => {
    setData((prev: any) => ({
      ...prev,
      teachers: INITIAL_USERS.filter((u) => u.role === 'guru'),
      subjects: OFFICIAL_SUBJECTS,
      classes: INITIAL_CLASSES
    }));
  };

  // Class Handlers
  const addClass = (cls: Omit<ClassGroup, 'id'>) => {
    const newClass: ClassGroup = {
      ...cls,
      id: 'class-' + Date.now(),
      studentCount: 0
    };
    setData((prev: any) => ({ ...prev, classes: [newClass, ...prev.classes] }));
  };

  const updateClass = (id: string, cls: Partial<ClassGroup>) => {
    setData((prev: any) => ({
      ...prev,
      classes: prev.classes.map((c: ClassGroup) => (c.id === id ? { ...c, ...cls } : c))
    }));
  };

  const deleteClass = (id: string) => {
    setData((prev: any) => ({
      ...prev,
      classes: prev.classes.filter((c: ClassGroup) => c.id !== id)
    }));
  };

  // CP Handlers
  const addCP = (cp: Omit<CapaianPembelajaran, 'id'>) => {
    const newCP: CapaianPembelajaran = {
      ...cp,
      id: 'cp-' + Date.now(),
      tpCount: 0
    };
    setData((prev: any) => ({ ...prev, cpList: [newCP, ...prev.cpList] }));
  };

  const updateCP = (id: string, cp: Partial<CapaianPembelajaran>) => {
    setData((prev: any) => ({
      ...prev,
      cpList: prev.cpList.map((item: CapaianPembelajaran) => (item.id === id ? { ...item, ...cp } : item))
    }));
  };

  const deleteCP = (id: string) => {
    setData((prev: any) => ({
      ...prev,
      cpList: prev.cpList.filter((c: CapaianPembelajaran) => c.id !== id),
      tpList: prev.tpList.filter((t: TujuanPembelajaran) => t.cpId !== id)
    }));
  };

  // TP Handlers
  const addTP = (tp: Omit<TujuanPembelajaran, 'id'>) => {
    const newTP: TujuanPembelajaran = {
      ...tp,
      id: 'tp-' + Date.now()
    };
    setData((prev: any) => {
      const updatedTp = [newTP, ...prev.tpList];
      const updatedCp = prev.cpList.map((cp: CapaianPembelajaran) => {
        if (cp.id === tp.cpId) {
          return { ...cp, tpCount: (cp.tpCount || 0) + 1 };
        }
        return cp;
      });
      return { ...prev, tpList: updatedTp, cpList: updatedCp };
    });
  };

  const updateTP = (id: string, tp: Partial<TujuanPembelajaran>) => {
    setData((prev: any) => ({
      ...prev,
      tpList: prev.tpList.map((t: TujuanPembelajaran) => (t.id === id ? { ...t, ...tp } : t))
    }));
  };

  const deleteTP = (id: string) => {
    setData((prev: any) => {
      const target = prev.tpList.find((t: TujuanPembelajaran) => t.id === id);
      const updatedTp = prev.tpList.filter((t: TujuanPembelajaran) => t.id !== id);
      const updatedCp = prev.cpList.map((cp: CapaianPembelajaran) => {
        if (target && cp.id === target.cpId) {
          return { ...cp, tpCount: Math.max(0, (cp.tpCount || 1) - 1) };
        }
        return cp;
      });
      return { ...prev, tpList: updatedTp, cpList: updatedCp };
    });
  };

  // Material Handlers
  const addMaterial = (mat: Omit<LearningMaterial, 'id' | 'createdAt' | 'views'>) => {
    const newMat: LearningMaterial = {
      ...mat,
      id: 'mat-' + Date.now(),
      createdAt: new Date().toISOString(),
      views: 0
    };
    // Add notification for students in those classes
    const notif: NotificationItem = {
      id: 'notif-' + Date.now(),
      userId: 'murid-01',
      title: 'Materi Baru Diterbitkan',
      message: `${mat.teacherName} mengunggah materi "${mat.title}".`,
      type: 'material',
      link: '/materi',
      createdAt: new Date().toISOString(),
      read: false
    };

    setData((prev: any) => ({
      ...prev,
      materials: [newMat, ...prev.materials],
      notifications: [notif, ...prev.notifications]
    }));
  };

  const updateMaterial = (id: string, updates: Partial<LearningMaterial>) => {
    setData((prev: any) => ({
      ...prev,
      materials: prev.materials.map((m: LearningMaterial) => (m.id === id ? { ...m, ...updates } : m))
    }));
  };

  const deleteMaterial = (id: string) => {
    setData((prev: any) => ({
      ...prev,
      materials: prev.materials.filter((m: LearningMaterial) => m.id !== id)
    }));
  };

  // Assignment & LKPD Handlers
  const addAssignment = (assign: Omit<Assignment, 'id' | 'createdAt'>) => {
    const newAssign: Assignment = {
      ...assign,
      id: 'assign-' + Date.now(),
      createdAt: new Date().toISOString()
    };
    const notif: NotificationItem = {
      id: 'notif-' + Date.now(),
      userId: 'murid-01',
      title: 'Tugas Baru Diterbitkan',
      message: `${assign.teacherName} menerbitkan tugas "${assign.title}". Batas waktu: ${new Date(assign.deadline).toLocaleDateString('id-ID')}`,
      type: 'assignment',
      link: '/tugas',
      createdAt: new Date().toISOString(),
      read: false
    };

    setData((prev: any) => ({
      ...prev,
      assignments: [newAssign, ...prev.assignments],
      notifications: [notif, ...prev.notifications]
    }));
  };

  const updateAssignment = (id: string, updates: Partial<Assignment>) => {
    setData((prev: any) => ({
      ...prev,
      assignments: prev.assignments.map((a: Assignment) => (a.id === id ? { ...a, ...updates } : a))
    }));
  };

  const deleteAssignment = (id: string) => {
    setData((prev: any) => ({
      ...prev,
      assignments: prev.assignments.filter((a: Assignment) => a.id !== id),
      submissions: prev.submissions.filter((s: Submission) => s.assignmentId !== id)
    }));
  };

  const addLKPD = (lkpd: Omit<InteractiveLKPD, 'id' | 'createdAt'>) => {
    const newLKPD: InteractiveLKPD = {
      ...lkpd,
      id: 'lkpd-' + Date.now(),
      createdAt: new Date().toISOString()
    };
    setData((prev: any) => ({
      ...prev,
      lkpdList: [newLKPD, ...prev.lkpdList]
    }));
  };

  const updateLKPD = (id: string, lkpd: Partial<InteractiveLKPD>) => {
    setData((prev: any) => ({
      ...prev,
      lkpdList: prev.lkpdList.map((item: InteractiveLKPD) => (item.id === id ? { ...item, ...lkpd } : item))
    }));
  };

  const deleteLKPD = (id: string) => {
    setData((prev: any) => ({
      ...prev,
      lkpdList: prev.lkpdList.filter((item: InteractiveLKPD) => item.id !== id)
    }));
  };

  // Submissions
  const submitAssignment = (sub: Omit<Submission, 'id' | 'submittedAt' | 'status'>) => {
    const newSub: Submission = {
      ...sub,
      id: 'sub-' + Date.now(),
      submittedAt: new Date().toISOString(),
      status: 'submitted'
    };

    const notif: NotificationItem = {
      id: 'notif-' + Date.now(),
      userId: 'guru-01',
      title: 'Pengumpulan Tugas Baru',
      message: `${sub.studentName} (${sub.className}) telah mengumpulkan tugas "${sub.assignmentTitle}".`,
      type: 'assignment',
      link: '/penilaian',
      createdAt: new Date().toISOString(),
      read: false
    };

    setData((prev: any) => {
      // replace if existing submission for same student & assignment
      const filtered = prev.submissions.filter(
        (s: Submission) => !(s.assignmentId === sub.assignmentId && s.studentId === sub.studentId)
      );
      return {
        ...prev,
        submissions: [newSub, ...filtered],
        notifications: [notif, ...prev.notifications]
      };
    });
  };

  // Automated Rubric Grading System
  const gradeSubmission = (
    submissionId: string,
    breakdown: ScoreBreakdown[],
    customFeedback?: string,
    teacherName?: string
  ): Score => {
    const targetSub = data.submissions.find((s: Submission) => s.id === submissionId);
    if (!targetSub) {
      throw new Error('Submission not found');
    }

    const targetAssign = data.assignments.find((a: Assignment) => a.id === targetSub.assignmentId);

    // Formula calculation: nilaiAkhir = sum(score * weight) / 4
    const finalScore = calculateFinalScore(
      breakdown.map((b) => ({
        id: b.criterionId,
        name: b.criterionName,
        weight: b.weight,
        score: b.score
      }))
    );

    const category = getScoreCategory(finalScore);
    const feedback = customFeedback || generateAutomatedFeedback(finalScore, targetSub.studentName);

    const newScore: Score = {
      id: 'score-' + Date.now(),
      submissionId,
      assignmentId: targetSub.assignmentId,
      studentId: targetSub.studentId,
      studentName: targetSub.studentName,
      studentNisn: targetSub.studentNisn,
      classId: targetSub.classId,
      tpId: targetAssign?.tpId || 'tp-01',
      cpId: targetAssign?.cpId || 'cp-01',
      breakdown,
      finalScore,
      category,
      feedback,
      gradedBy: teacherName || 'Ahmad Wibowo, S.Kom., M.T.',
      gradedAt: new Date().toISOString()
    };

    // Trigger celebration if high score
    if (finalScore >= 85) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // ignore
      }
    }

    // Student notification
    const studentNotif: NotificationItem = {
      id: 'notif-' + Date.now(),
      userId: targetSub.studentId,
      title: 'Nilai Tugas LKPD Diberikan',
      message: `Tugas "${targetSub.assignmentTitle}" telah dinilai oleh guru. Nilai: ${finalScore} (${category}).`,
      type: 'grade',
      link: '/nilai-saya',
      createdAt: new Date().toISOString(),
      read: false
    };

    setData((prev: any) => {
      // update submission scoreId
      const updatedSubmissions = prev.submissions.map((s: Submission) =>
        s.id === submissionId ? { ...s, scoreId: newScore.id } : s
      );
      // update scores
      const filteredScores = prev.scores.filter((sc: Score) => sc.submissionId !== submissionId);
      return {
        ...prev,
        submissions: updatedSubmissions,
        scores: [newScore, ...filteredScores],
        notifications: [studentNotif, ...prev.notifications]
      };
    });

    return newScore;
  };

  // Chat
  const sendMessage = (
    channelId: string,
    text: string,
    sender: UserProfile,
    fileUrl?: string,
    fileName?: string
  ) => {
    const newMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      channelId,
      senderId: sender.uid,
      senderName: sender.displayName,
      senderRole: sender.role,
      senderAvatar: sender.avatarUrl,
      text,
      fileUrl,
      fileName,
      timestamp: new Date().toISOString()
    };

    setData((prev: any) => ({
      ...prev,
      messages: [...prev.messages, newMsg]
    }));
  };

  // Notifications
  const markNotificationAsRead = (id: string) => {
    setData((prev: any) => ({
      ...prev,
      notifications: prev.notifications.map((n: NotificationItem) => (n.id === id ? { ...n, read: true } : n))
    }));
  };

  const markAllNotificationsAsRead = () => {
    setData((prev: any) => ({
      ...prev,
      notifications: prev.notifications.map((n: NotificationItem) => ({ ...n, read: true }))
    }));
  };

  // Import batch students
  const importStudentsBatch = (newStudents: { displayName: string; nisn: string; className: string; major: string }[]) => {
    const formatted: UserProfile[] = newStudents.map((s, idx) => ({
      uid: 'murid-import-' + Date.now() + '-' + idx,
      displayName: s.displayName,
      email: `${s.nisn}@siswa.smkn1sidayu.sch.id`,
      role: 'murid',
      nisn: s.nisn,
      className: s.className,
      major: s.major,
      avatarUrl: `https://images.unsplash.com/photo-${1534528741775 + idx}?auto=format&fit=crop&q=80&w=250`
    }));

    setData((prev: any) => {
      // Merge students without duplicating NISN
      const existingNisns = new Set(prev.students.map((st: UserProfile) => st.nisn));
      const filtered = formatted.filter((st) => !existingNisns.has(st.nisn));
      return {
        ...prev,
        students: [...filtered, ...prev.students]
      };
    });

    return formatted.length;
  };

  // Backup & Restore
  const exportDatabaseJSON = () => {
    return JSON.stringify(data, null, 2);
  };

  const restoreDatabaseJSON = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.classes && parsed.cpList && parsed.assignments) {
        setData(parsed);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(parsed));
        return true;
      }
      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const resetToDefaultData = () => {
    const defaultData = {
      classes: INITIAL_CLASSES,
      cpList: INITIAL_CP,
      tpList: INITIAL_TP,
      materials: INITIAL_MATERIALS,
      assignments: INITIAL_ASSIGNMENTS,
      lkpdList: INITIAL_LKPD,
      rubrics: INITIAL_RUBRICS,
      submissions: INITIAL_SUBMISSIONS,
      scores: INITIAL_SCORES,
      notifications: INITIAL_NOTIFICATIONS,
      messages: INITIAL_MESSAGES,
      announcements: INITIAL_ANNOUNCEMENTS,
      students: INITIAL_USERS.filter((u) => u.role === 'murid'),
      teachers: INITIAL_USERS.filter((u) => u.role === 'guru'),
      subjects: OFFICIAL_SUBJECTS,
    };
    setData(defaultData);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(defaultData));
    Swal.fire({
      icon: 'success',
      title: 'Database Berhasil Di-Reset',
      text: 'Semua data kembali ke konfigurasi bawaan SMKN 1 Sidayu.',
      timer: 1800,
      showConfirmButton: false
    });
  };

  return (
    <DataContext.Provider
      value={{
        classes: data.classes,
        cpList: data.cpList,
        tpList: data.tpList,
        materials: data.materials,
        assignments: data.assignments,
        lkpdList: data.lkpdList,
        rubrics: data.rubrics,
        submissions: data.submissions,
        scores: data.scores,
        notifications: data.notifications,
        messages: data.messages,
        announcements: data.announcements,
        students: data.students,
        teachers: data.teachers,
        allUsers: data.allUsers || INITIAL_USERS,
        subjects: data.subjects || OFFICIAL_SUBJECTS,

        updateUserCredential,
        addUserAccount,
        deleteUserAccount,

        addSubject,

        updateSubject,
        deleteSubject,

        addTeacher,
        updateTeacher,
        deleteTeacher,
        resetTeachersAndSubjects,

        addClass,
        updateClass,
        deleteClass,

        addCP,
        updateCP,
        deleteCP,

        addTP,
        updateTP,
        deleteTP,

        addMaterial,
        updateMaterial,
        deleteMaterial,

        addAssignment,
        updateAssignment,
        deleteAssignment,

        addLKPD,
        updateLKPD,
        deleteLKPD,

        submitAssignment,
        gradeSubmission,

        sendMessage,
        markNotificationAsRead,
        markAllNotificationsAsRead,

        importStudentsBatch,

        exportDatabaseJSON,
        restoreDatabaseJSON,
        resetToDefaultData
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
