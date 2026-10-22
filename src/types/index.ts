export type Priority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  subject: string;
  priority: Priority;
  estimatedPomodoros: number;
  completedPomodoros: number;
  completed: boolean;
  dueDate?: string;
  createdAt: string;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  hint?: string;
  masteryLevel: 'new' | 'learning' | 'mastered'; // 0, 1, 2
  lastReviewed?: string;
  reviewCount: number;
}

export interface Deck {
  id: string;
  title: string;
  description: string;
  subject: string;
  color: string;
  cards: Flashcard[];
  createdAt: string;
}

export interface Exam {
  id: string;
  subject: string;
  title: string;
  date: string; // ISO string or YYYY-MM-DD
  targetGrade?: string;
  progressPercent: number; // 0 to 100
  color: string;
}

export interface StudySessionLog {
  id: string;
  timestamp: string;
  durationMinutes: number;
  mode: 'focus' | 'shortBreak' | 'longBreak';
  subject?: string;
  taskId?: string;
}

export interface SavedNote {
  id: string;
  title: string;
  subject: string;
  summary: string;
  keyPoints: string[];
  analogy?: string;
  mnemonic?: string;
  studyTip?: string;
  createdAt: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface QuizResult {
  id: string;
  title: string;
  date: string;
  totalQuestions: number;
  score: number;
  questions: QuizQuestion[];
  userAnswers: number[]; // index of choice selected
}

export type PomodoroMode = 'focus' | 'shortBreak' | 'longBreak';

export interface PomodoroSettings {
  focusTime: number; // minutes, default 25
  shortBreakTime: number; // minutes, default 5
  longBreakTime: number; // minutes, default 15
  longBreakInterval: number; // default 4
  autoStartBreaks: boolean;
  autoStartFocus: boolean;
  soundEnabled: boolean;
  desktopNotificationsEnabled: boolean;
}
