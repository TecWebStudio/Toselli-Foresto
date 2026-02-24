// DevHub IT - API Client Library

import type { Job, JobFilters, Course, Quiz, QuizResult, User, UserBadge, UserProgress, PlatformStats } from './types';

const API_BASE = '/api';

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    throw new Error(`API Error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

// Jobs
export async function getJobs(filters?: JobFilters): Promise<Job[]> {
  const params = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== null) {
        params.set(key, String(value));
      }
    });
  }
  const query = params.toString();
  return fetchAPI<Job[]>(`/jobs${query ? `?${query}` : ''}`);
}

export async function getJob(id: number): Promise<Job> {
  return fetchAPI<Job>(`/jobs/${id}`);
}

// Courses
export async function getCourses(filters?: { category?: string; level?: string }): Promise<Course[]> {
  const params = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
  }
  const query = params.toString();
  return fetchAPI<Course[]>(`/courses${query ? `?${query}` : ''}`);
}

export async function getCourse(id: number): Promise<Course> {
  return fetchAPI<Course>(`/courses/${id}`);
}

// Quizzes
export async function getQuiz(courseId: number): Promise<Quiz> {
  return fetchAPI<Quiz>(`/quizzes/${courseId}`);
}

export async function submitQuiz(courseId: number, userId: number, answers: number[]): Promise<QuizResult> {
  return fetchAPI<QuizResult>(`/quizzes/${courseId}/submit`, {
    method: 'POST',
    body: JSON.stringify({ user_id: userId, answers }),
  });
}

// User
export async function getUser(id: number): Promise<User> {
  return fetchAPI<User>(`/user/${id}`);
}

export async function getUserBadges(userId: number): Promise<UserBadge[]> {
  return fetchAPI<UserBadge[]>(`/user/${userId}/badges`);
}

export async function getUserProgress(userId: number): Promise<UserProgress[]> {
  return fetchAPI<UserProgress[]>(`/user/${userId}/progress`);
}

export async function updateModuleProgress(userId: number, courseId: number, moduleIndex: number): Promise<{ success: boolean }> {
  return fetchAPI<{ success: boolean }>(`/user/${userId}/progress`, {
    method: 'POST',
    body: JSON.stringify({ course_id: courseId, module_index: moduleIndex }),
  });
}

// Stats
export async function getStats(): Promise<PlatformStats> {
  return fetchAPI<PlatformStats>('/stats');
}
