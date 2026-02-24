// DevHub IT - Type Definitions

export interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  type: 'remote' | 'hybrid' | 'onsite';
  salary_min: number;
  salary_max: number;
  level: 'junior' | 'mid' | 'senior' | 'lead';
  category: string;
  description: string;
  requirements: string[];
  benefits: string[];
  posted_date: string;
  logo_color: string;
}

export interface Course {
  id: number;
  title: string;
  description: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  duration: string;
  modules?: CourseModule[];
  badge_name: string;
  badge_description?: string;
  badge_color: string;
  company_tips?: string[];
  prerequisites?: string;
}

export interface CourseModule {
  title: string;
  description: string;
  content: string;
}

export interface Quiz {
  id: number;
  course_id: number;
  title: string;
  questions: QuizQuestion[];
  passing_score: number;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correct?: number;
  explanation?: string;
}

export interface QuizResult {
  score: number;
  correct: number;
  correct_count: number;
  total: number;
  passed: boolean;
  passing_score: number;
  details: {
    question: string;
    userAnswer: number;
    correctAnswer: number;
    isCorrect: boolean;
    explanation: string;
  }[];
}

export interface User {
  id: number;
  name: string;
  username: string;
  display_name: string;
  email: string;
  avatar_color: string;
  title: string;
  bio: string;
  joined_date: string;
}

export interface UserBadge {
  id: number;
  user_id: number;
  course_id: number;
  badge_name: string;
  earned_date: string;
  score: number;
  badge_color: string;
  category: string;
  course_level: string;
}

export interface UserProgress {
  id: number;
  user_id: number;
  course_id: number;
  completed_modules: number[];
  quiz_score: number;
  quiz_completed: number;
  total_modules: number;
  course_title: string;
  badge_name: string;
  badge_color: string;
  course_level: string;
}

export interface JobFilters {
  category?: string;
  level?: string;
  type?: string;
  salary_min?: number;
  salary_max?: number;
  search?: string;
}

export interface PlatformStats {
  jobs: number;
  courses: number;
  users: number;
  quizzes: number;
  badges_awarded: number;
  total_jobs: number;
  total_courses: number;
  total_quizzes: number;
  total_users: number;
}
