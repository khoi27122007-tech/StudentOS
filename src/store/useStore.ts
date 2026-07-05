import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Course {
  id: string;
  name: string;
  code: string;
  color: string;
  instructor: string;
  room: string;
  schedule: {
    day: number; // 1 = Thứ 2, 2 = Thứ 3, ..., 7 = Chủ Nhật
    startTime: string; // "HH:MM"
    endTime: string; // "HH:MM"
  }[];
}

export interface Task {
  id: string;
  courseId: string;
  title: string;
  description: string;
  deadline: string; // ISO date string (YYYY-MM-DD)
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'completed';
  attachment?: string;
}

export interface StudySession {
  id: string;
  taskId?: string;
  courseId?: string;
  startTime: string;
  endTime: string;
  duration: number; // in minutes
  type: 'pomodoro' | 'stopwatch';
}

export interface MoodLog {
  date: string; // YYYY-MM-DD
  mood: 'happy' | 'neutral' | 'tired' | 'stressed';
  sleepHours: number;
}

export interface Expense {
  id: string;
  amount: number;
  category: 'food' | 'study' | 'coffee' | 'transport' | 'other';
  date: string; // YYYY-MM-DD
  note: string;
}

export interface GpaModule {
  id: string;
  name: string;
  credits: number;
  midtermGrade?: number;
  finalGrade?: number;
  attendanceGrade?: number;
  weightAttendance: number; // percentage (e.g. 10)
  weightMidterm: number; // percentage (e.g. 30)
  weightFinal: number; // percentage (e.g. 60)
  expectedGrade?: number;
}

export interface UserProfile {
  name: string;
  level: number;
  exp: number;
  streak: number;
  lastActive: string; // YYYY-MM-DD
  avatar: string;
  apiKeys: {
    openai?: string;
    gemini?: string;
  };
  firebaseConfig?: {
    apiKey?: string;
    authDomain?: string;
    projectId?: string;
    storageBucket?: string;
    messagingSenderId?: string;
    appId?: string;
  };
}

export interface Account {
  email: string;
  password: string;
  name: string;
  courses: Course[];
  tasks: Task[];
  sessions: StudySession[];
  moods: MoodLog[];
  expenses: Expense[];
  gpaModules: GpaModule[];
  gpaTarget: number;
  budgetLimit: number;
  user: UserProfile;
}

interface AppState {
  // Authentication states
  accounts: Account[];
  currentUserEmail: string | null;

  // Active user states
  courses: Course[];
  tasks: Task[];
  sessions: StudySession[];
  moods: MoodLog[];
  expenses: Expense[];
  gpaModules: GpaModule[];
  gpaTarget: number;
  budgetLimit: number;
  user: UserProfile;
  
  // Actions
  login: (email: string, password: string) => boolean;
  register: (name: string, email: string, password: string) => boolean;
  logout: () => void;

  addCourse: (course: Omit<Course, 'id'>) => void;
  updateCourse: (id: string, course: Partial<Course>) => void;
  deleteCourse: (id: string) => void;
  
  addTask: (task: Omit<Task, 'id' | 'status'>) => void;
  updateTask: (id: string, task: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskStatus: (id: string) => void;
  
  addStudySession: (session: Omit<StudySession, 'id'>) => void;
  addMoodLog: (log: MoodLog) => void;
  
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  deleteExpense: (id: string) => void;
  setBudgetLimit: (limit: number) => void;
  
  addGpaModule: (module: Omit<GpaModule, 'id'>) => void;
  updateGpaModule: (id: string, module: Partial<GpaModule>) => void;
  deleteGpaModule: (id: string) => void;
  setGpaTarget: (target: number) => void;
  
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  gainXp: (amount: number) => void;
  checkStreak: () => void;
  resetAllData: () => void;
}

const defaultCourses: Course[] = [
  {
    id: 'c1',
    name: 'Lập trình Java',
    code: 'INT2204',
    color: '#3b82f6',
    instructor: 'TS. Nguyễn Văn A',
    room: 'A2-302',
    schedule: [{ day: 1, startTime: '08:00', endTime: '10:00' }]
  },
  {
    id: 'c2',
    name: 'Triết học Mác - Lênin',
    code: 'PHI1001',
    color: '#ef4444',
    instructor: 'ThS. Trần Thị B',
    room: 'B1-101',
    schedule: [{ day: 3, startTime: '13:00', endTime: '15:00' }]
  },
  {
    id: 'c3',
    name: 'Toán chuyên đề',
    code: 'MAT3001',
    color: '#10b981',
    instructor: 'GS. Lê Văn C',
    room: 'A2-504',
    schedule: [{ day: 5, startTime: '10:00', endTime: '12:00' }]
  }
];

const defaultTasks: Task[] = [
  {
    id: 't1',
    courseId: 'c1',
    title: 'Bài tập lớn Java Socket',
    description: 'Xây dựng ứng dụng Chat Server-Client truyền tải file',
    deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 days from now
    priority: 'high',
    status: 'pending'
  },
  {
    id: 't2',
    courseId: 'c2',
    title: 'Tiểu luận Triết học',
    description: 'Phân tích cặp phạm trù Nguyên nhân và Kết quả',
    deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5 days from now
    priority: 'medium',
    status: 'pending'
  }
];

const defaultGpaModules: GpaModule[] = [
  {
    id: 'm1',
    name: 'Lập trình Java',
    credits: 3,
    midtermGrade: 8.5,
    attendanceGrade: 10,
    weightAttendance: 10,
    weightMidterm: 30,
    weightFinal: 60
  },
  {
    id: 'm2',
    name: 'Triết học Mác - Lênin',
    credits: 3,
    midtermGrade: 7.0,
    attendanceGrade: 9.0,
    weightAttendance: 10,
    weightMidterm: 30,
    weightFinal: 60
  },
  {
    id: 'm3',
    name: 'Toán chuyên đề',
    credits: 4,
    midtermGrade: 9.0,
    attendanceGrade: 10,
    weightAttendance: 10,
    weightMidterm: 30,
    weightFinal: 60
  }
];

// Helper to sync current active state changes back to accounts array
const syncCurrentAccount = (state: AppState) => {
  if (!state.currentUserEmail) return {};
  return {
    accounts: state.accounts.map((acc) =>
      acc.email === state.currentUserEmail
        ? {
            ...acc,
            courses: state.courses,
            tasks: state.tasks,
            sessions: state.sessions,
            moods: state.moods,
            expenses: state.expenses,
            gpaModules: state.gpaModules,
            gpaTarget: state.gpaTarget,
            budgetLimit: state.budgetLimit,
            user: state.user
          }
        : acc
    )
  };
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      accounts: [],
      currentUserEmail: null,

      // Initial active user states
      courses: defaultCourses,
      tasks: defaultTasks,
      sessions: [],
      moods: [
        { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], mood: 'happy', sleepHours: 7 },
        { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], mood: 'neutral', sleepHours: 6 },
        { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], mood: 'tired', sleepHours: 5.5 },
      ],
      expenses: [
        { id: 'e1', amount: 50000, category: 'food', date: new Date().toISOString().split('T')[0], note: 'Cơm trưa' },
        { id: 'e2', amount: 35000, category: 'coffee', date: new Date().toISOString().split('T')[0], note: 'Cà phê học bài' }
      ],
      gpaModules: defaultGpaModules,
      gpaTarget: 3.2,
      budgetLimit: 3000000,
      user: {
        name: 'Khách Trải Nghiệm',
        level: 4,
        exp: 320,
        streak: 5,
        lastActive: new Date().toISOString().split('T')[0],
        avatar: '🎓',
        apiKeys: {},
      },

      // Auth actions
      login: (email, password) => {
        const found = get().accounts.find(
          (acc) => acc.email.toLowerCase() === email.toLowerCase() && acc.password === password
        );
        if (found) {
          set({
            currentUserEmail: found.email,
            courses: found.courses,
            tasks: found.tasks,
            sessions: found.sessions,
            moods: found.moods,
            expenses: found.expenses,
            gpaModules: found.gpaModules,
            gpaTarget: found.gpaTarget,
            budgetLimit: found.budgetLimit,
            user: found.user
          });
          return true;
        }
        return false;
      },

      register: (name, email, password) => {
        const normalizedEmail = email.toLowerCase();
        const exists = get().accounts.some((acc) => acc.email.toLowerCase() === normalizedEmail);
        if (exists) return false;

        const newAccount: Account = {
          email: normalizedEmail,
          password,
          name,
          courses: defaultCourses,
          tasks: defaultTasks,
          sessions: [],
          moods: [],
          expenses: [],
          gpaModules: defaultGpaModules,
          gpaTarget: 3.2,
          budgetLimit: 3000000,
          user: {
            name,
            level: 1,
            exp: 0,
            streak: 1,
            lastActive: new Date().toISOString().split('T')[0],
            avatar: '🎓',
            apiKeys: {}
          }
        };

        set((state) => ({
          accounts: [...state.accounts, newAccount]
        }));
        return true;
      },

      logout: () => {
        set({
          currentUserEmail: null,
          courses: [],
          tasks: [],
          sessions: [],
          moods: [],
          expenses: [],
          gpaModules: [],
          gpaTarget: 3.2,
          budgetLimit: 3000000,
          user: {
            name: 'Khách Trải Nghiệm',
            level: 1,
            exp: 0,
            streak: 1,
            lastActive: new Date().toISOString().split('T')[0],
            avatar: '🎓',
            apiKeys: {}
          }
        });
      },

      addCourse: (course) => set((state) => {
        const nextState = {
          courses: [...state.courses, { ...course, id: 'course_' + Math.random().toString(36).substr(2, 9) }]
        };
        return { ...nextState, ...syncCurrentAccount({ ...state, ...nextState }) };
      }),
      
      updateCourse: (id, updated) => set((state) => {
        const nextState = {
          courses: state.courses.map((c) => c.id === id ? { ...c, ...updated } : c)
        };
        return { ...nextState, ...syncCurrentAccount({ ...state, ...nextState }) };
      }),
      
      deleteCourse: (id) => set((state) => {
        const nextState = {
          courses: state.courses.filter((c) => c.id !== id),
          tasks: state.tasks.filter((t) => t.courseId !== id)
        };
        return { ...nextState, ...syncCurrentAccount({ ...state, ...nextState }) };
      }),

      addTask: (task) => set((state) => {
        const nextState = {
          tasks: [...state.tasks, { ...task, id: 'task_' + Math.random().toString(36).substr(2, 9), status: 'pending' as const }]
        };
        return { ...nextState, ...syncCurrentAccount({ ...state, ...nextState }) };
      }),

      updateTask: (id, updated) => set((state) => {
        const nextState = {
          tasks: state.tasks.map((t) => t.id === id ? { ...t, ...updated } : t)
        };
        return { ...nextState, ...syncCurrentAccount({ ...state, ...nextState }) };
      }),

      deleteTask: (id) => set((state) => {
        const nextState = {
          tasks: state.tasks.filter((t) => t.id !== id)
        };
        return { ...nextState, ...syncCurrentAccount({ ...state, ...nextState }) };
      }),

      toggleTaskStatus: (id) => set((state) => {
        const nextTasks = state.tasks.map((t) => {
          if (t.id === id) {
            const nextStatus: 'pending' | 'completed' = t.status === 'pending' ? 'completed' : 'pending';
            if (nextStatus === 'completed') {
              const xpReward = t.priority === 'high' ? 100 : t.priority === 'medium' ? 50 : 20;
              setTimeout(() => get().gainXp(xpReward), 100);
            }
            return { ...t, status: nextStatus };
          }
          return t;
        });
        const nextState = { tasks: nextTasks };
        return { ...nextState, ...syncCurrentAccount({ ...state, ...nextState }) };
      }),

      addStudySession: (session) => set((state) => {
        const id = 'session_' + Math.random().toString(36).substr(2, 9);
        const xpGained = Math.round(session.duration * 4);
        setTimeout(() => get().gainXp(xpGained), 100);
        const nextState = {
          sessions: [...state.sessions, { ...session, id }]
        };
        return { ...nextState, ...syncCurrentAccount({ ...state, ...nextState }) };
      }),

      addMoodLog: (log) => set((state) => {
        const filteredMoods = state.moods.filter((m) => m.date !== log.date);
        const nextState = {
          moods: [...filteredMoods, log]
        };
        return { ...nextState, ...syncCurrentAccount({ ...state, ...nextState }) };
      }),

      addExpense: (expense) => set((state) => {
        const nextState = {
          expenses: [...state.expenses, { ...expense, id: 'exp_' + Math.random().toString(36).substr(2, 9) }]
        };
        return { ...nextState, ...syncCurrentAccount({ ...state, ...nextState }) };
      }),

      deleteExpense: (id) => set((state) => {
        const nextState = {
          expenses: state.expenses.filter((e) => e.id !== id)
        };
        return { ...nextState, ...syncCurrentAccount({ ...state, ...nextState }) };
      }),

      setBudgetLimit: (limit) => set((state) => {
        const nextState = { budgetLimit: limit };
        return { ...nextState, ...syncCurrentAccount({ ...state, ...nextState }) };
      }),

      addGpaModule: (module) => set((state) => {
        const nextState = {
          gpaModules: [...state.gpaModules, { ...module, id: 'mod_' + Math.random().toString(36).substr(2, 9) }]
        };
        return { ...nextState, ...syncCurrentAccount({ ...state, ...nextState }) };
      }),

      updateGpaModule: (id, updated) => set((state) => {
        const nextState = {
          gpaModules: state.gpaModules.map((m) => m.id === id ? { ...m, ...updated } : m)
        };
        return { ...nextState, ...syncCurrentAccount({ ...state, ...nextState }) };
      }),

      deleteGpaModule: (id) => set((state) => {
        const nextState = {
          gpaModules: state.gpaModules.filter((m) => m.id !== id)
        };
        return { ...nextState, ...syncCurrentAccount({ ...state, ...nextState }) };
      }),

      setGpaTarget: (target) => set((state) => {
        const nextState = { gpaTarget: target };
        return { ...nextState, ...syncCurrentAccount({ ...state, ...nextState }) };
      }),

      updateUserProfile: (profile) => set((state) => {
        const nextState = {
          user: { ...state.user, ...profile }
        };
        return { ...nextState, ...syncCurrentAccount({ ...state, ...nextState }) };
      }),

      gainXp: (amount) => set((state) => {
        let { level, exp } = state.user;
        exp += amount;
        
        const xpNeeded = level * 300;
        
        if (exp >= xpNeeded) {
          exp -= xpNeeded;
          level += 1;
        }

        const nextState = {
          user: {
            ...state.user,
            level,
            exp
          }
        };
        return { ...nextState, ...syncCurrentAccount({ ...state, ...nextState }) };
      }),

      checkStreak: () => set((state) => {
        const todayStr = new Date().toISOString().split('T')[0];
        const lastActive = state.user.lastActive;
        
        if (lastActive === todayStr) {
          return {};
        }
        
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        let newStreak = state.user.streak;
        if (lastActive === yesterdayStr) {
          newStreak += 1;
        } else {
          newStreak = 1;
        }

        const nextState = {
          user: {
            ...state.user,
            streak: newStreak,
            lastActive: todayStr
          }
        };
        return { ...nextState, ...syncCurrentAccount({ ...state, ...nextState }) };
      }),

      resetAllData: () => set((state) => {
        const nextState = {
          courses: defaultCourses,
          tasks: defaultTasks,
          sessions: [],
          moods: [],
          expenses: [],
          gpaModules: defaultGpaModules,
          gpaTarget: 3.2,
          budgetLimit: 3000000,
          user: {
            name: state.user.name,
            level: 1,
            exp: 0,
            streak: 1,
            lastActive: new Date().toISOString().split('T')[0],
            avatar: '🎓',
            apiKeys: {},
          }
        };
        return { ...nextState, ...syncCurrentAccount({ ...state, ...nextState }) };
      })
    }),
    {
      name: 'student-os-store',
    }
  )
);
