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

export interface Notification {
  id: number;
  user_id: number;
  actor_id: number | null;
  type: 'system' | 'badge' | 'job' | 'follow' | 'like' | 'comment' | 'message';
  title: string;
  body: string | null;
  link: string | null;
  is_read: number;
  created_at: string;
  actor_username?: string;
  actor_name?: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  unread_count: number;
}

export interface Post {
  id: number;
  user_id: number;
  content: string;
  image_url: string | null;
  post_type: string;
  tags: string[];
  likes_count: number;
  comments_count: number;
  created_at: string;
  username?: string;
  display_name?: string;
  avatar_color?: string;
}

// Auth types
export interface AuthUser {
  id: number;
  email: string;
  role: 'worker' | 'company';
  display_name: string;
  username: string;
  avatar_color: string;
  avatar_url: string | null;       // uploaded profile picture (base64 data URL or path)
  theme_color: string;             // whole-app accent colour (defaults to avatar_color)
  title: string;
  bio: string;
  company_name: string | null;
  company_website: string | null;
  lat: number | null;
  lng: number | null;
  city: string;
  region: string;
  country: string;
  created_at: string;
  language: string;
  is_private: number; // 0 = public, 1 = private
}

export interface Comment {
  id: number;
  user_id: number;
  post_id: number;
  content: string;
  created_at: string;
  username?: string;
  display_name?: string;
  avatar_color?: string;
  avatar_url?: string | null;
}

export interface SearchResult {
  id: number;
  username: string;
  display_name: string;
  avatar_color: string;
  avatar_url: string | null;
  theme_color: string;
  title: string;
  bio: string;
  city: string;
  region: string;
  role: 'worker' | 'company';
  company_name: string | null;
}

export interface FollowRequest {
  id: number;
  requester_id: number;
  target_id: number;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  requester_username?: string;
  requester_display_name?: string;
  requester_avatar_color?: string;
}

export interface AuthSession {
  user: AuthUser;
  token: string;
}

export interface Listing {
  id: number;
  author_id: number;
  listing_type: 'job_offer' | 'service_proposal';
  title: string;
  description: string;
  category: string;
  level: string;
  work_type: string;
  salary_min: number | null;
  salary_max: number | null;
  tags: string[];
  lat: number | null;
  lng: number | null;
  city: string;
  region: string;
  country: string;
  is_active: number;
  created_at: string;
  // Joined fields
  author_name?: string;
  author_username?: string;
  author_avatar_color?: string;
  author_role?: string;
  author_company_name?: string;
}

export interface MapPoint {
  id: number;
  lat: number;
  lng: number;
  listing_type: 'job_offer' | 'service_proposal';
  title: string;
  city: string;
  region: string;
  category: string;
  description: string;
  level: string;
  work_type: string;
  salary_min: number | null;
  salary_max: number | null;
  author_name: string;
  author_role: string;
  author_avatar_color: string;
}
