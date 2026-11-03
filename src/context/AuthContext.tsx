import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { INITIAL_USERS } from '../services/mockData';
import Swal from 'sweetalert2';

interface AuthContextType {
  currentUser: UserProfile;
  isAuthenticated: boolean;
  role: UserRole;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  switchRole: (role: UserRole) => void;
  login: (email: string, password?: string, role?: UserRole) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  updateProfile: (data: Partial<UserProfile>) => void;
  changePassword: (oldPassword: string, newPassword: string) => Promise<{ success: boolean; message?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'si_lkpd_auth_user_v3';
const IS_AUTH_KEY = 'si_lkpd_is_authenticated_v3';
const THEME_STORAGE_KEY = 'si_lkpd_theme';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    return saved ? saved === 'dark' : false;
  });

  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = localStorage.getItem(IS_AUTH_KEY);
    return saved !== null ? saved === 'true' : true;
  });

  // User state - defaults to Guru (Ahmad Wibowo) for rich testing
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem(AUTH_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    // Default to Guru Ahmad Wibowo
    return INITIAL_USERS[1];
  });

  const role = currentUser.role;


  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem(THEME_STORAGE_KEY, 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(currentUser));
  }, [currentUser]);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  const switchRole = (newRole: UserRole) => {
    let userList: UserProfile[] = INITIAL_USERS;
    const savedDb = localStorage.getItem('si_lkpd_database_store_v5');
    if (savedDb) {
      try {
        const parsed = JSON.parse(savedDb);
        if (parsed.allUsers && Array.isArray(parsed.allUsers) && parsed.allUsers.length > 0) {
          userList = parsed.allUsers;
        }
      } catch (e) {}
    }

    const targetUser = userList.find((u) => u.role === newRole) || userList[0];
    setCurrentUser(targetUser);
    setIsAuthenticated(true);
    localStorage.setItem(IS_AUTH_KEY, 'true');
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: `Beralih peran ke: ${newRole.toUpperCase()} (${targetUser.displayName})`,
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
    });
  };

  const login = async (identifier: string, inputPassword?: string, preferredRole?: UserRole): Promise<{ success: boolean; message?: string }> => {
    const clean = identifier.trim().toLowerCase();

    // Read latest user accounts from persistent store
    let userList: UserProfile[] = INITIAL_USERS;
    const savedDb = localStorage.getItem('si_lkpd_database_store_v5');
    if (savedDb) {
      try {
        const parsed = JSON.parse(savedDb);
        if (parsed.allUsers && Array.isArray(parsed.allUsers) && parsed.allUsers.length > 0) {
          userList = parsed.allUsers;
        }
      } catch (e) {}
    }

    let matched = userList.find(
      (u) =>
        u.email.toLowerCase() === clean ||
        (clean.includes('heru') && u.uid === 'guru-ahmad-wibowo') ||
        (clean === 'admin' && u.role === 'admin') ||
        (clean === 'kepsek' && u.role === 'kepsek') ||
        (u.nip && u.nip.replace(/\s+/g, '') === clean.replace(/\s+/g, '')) ||
        (u.nisn && u.nisn === clean) ||
        (u.displayName.toLowerCase() === clean)
    );

    if (!matched) {
      return {
        success: false,
        message: 'Pengguna dengan email, NIP, NISN, atau Nama tersebut tidak terdaftar di sistem.'
      };
    }

    // Role category separation validation
    if (preferredRole && matched.role !== preferredRole) {
      const roleName =
        matched.role === 'guru'
          ? 'Guru'
          : matched.role === 'murid'
          ? 'Peserta Didik (Murid)'
          : matched.role === 'admin'
          ? 'Administrator'
          : 'Kepala Sekolah';
      return {
        success: false,
        message: `Akun ini terdaftar sebagai peran "${roleName}". Silakan pilih tab login yang sesuai (${roleName}) untuk masuk.`
      };
    }

    // Expected password check (supports Admin customized passwords)
    const expectedPassword = matched.password || (
      matched.role === 'admin' ? 'admin123' :
      matched.role === 'guru' ? 'guru123' :
      matched.role === 'kepsek' ? 'kepsek123' : 'siswa123'
    );

    if (inputPassword && inputPassword.trim() !== expectedPassword.trim()) {
      return {
        success: false,
        message: 'Kata sandi salah! Pastikan Anda memasukkan kata sandi yang telah ditetapkan oleh Administrator.'
      };
    }

    setCurrentUser(matched);
    setIsAuthenticated(true);
    localStorage.setItem(IS_AUTH_KEY, 'true');
    return { success: true };
  };

  const changePassword = async (oldPassword: string, newPassword: string): Promise<{ success: boolean; message?: string }> => {
    const currentPass = currentUser.password || (
      currentUser.role === 'admin' ? 'admin123' :
      currentUser.role === 'guru' ? 'guru123' :
      currentUser.role === 'kepsek' ? 'kepsek123' : 'siswa123'
    );

    if (oldPassword.trim() !== currentPass.trim()) {
      return { success: false, message: 'Kata sandi lama yang Anda masukkan tidak sesuai.' };
    }

    if (newPassword.trim().length < 4) {
      return { success: false, message: 'Kata sandi baru minimal 4 karakter.' };
    }

    const updatedUser = { ...currentUser, password: newPassword.trim() };
    setCurrentUser(updatedUser);

    // Also update database store in localStorage
    const savedDb = localStorage.getItem('si_lkpd_database_store_v5');
    if (savedDb) {
      try {
        const parsed = JSON.parse(savedDb);
        if (parsed.allUsers && Array.isArray(parsed.allUsers)) {
          parsed.allUsers = parsed.allUsers.map((u: UserProfile) =>
            u.uid === currentUser.uid ? { ...u, password: newPassword.trim() } : u
          );
          localStorage.setItem('si_lkpd_database_store_v5', JSON.stringify(parsed));
        }
      } catch (e) {}
    }

    return { success: true };
  };

  const logout = () => {
    Swal.fire({
      title: 'Keluar dari Sesi?',
      text: 'Anda akan keluar dari sistem SI-LKPD dan kembali ke halaman login.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#2563eb',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Keluar',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
        setIsAuthenticated(false);
        localStorage.setItem(IS_AUTH_KEY, 'false');
        Swal.fire({
          icon: 'success',
          title: 'Sesi Berakhir',
          text: 'Anda telah keluar dari akun.',
          timer: 1200,
          showConfirmButton: false
        });
      }
    });
  };

  const updateProfile = (data: Partial<UserProfile>) => {
    setCurrentUser((prev) => ({ ...prev, ...data }));
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        role,
        isDarkMode,
        toggleDarkMode,
        switchRole,
        login,
        logout,
        updateProfile,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
