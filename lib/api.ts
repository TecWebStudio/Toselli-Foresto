// DevHub IT - API Client Library

import type { Job, JobFilters, Course, Quiz, QuizResult, User, UserBadge, UserProgress, PlatformStats, NotificationsResponse, AuthUser, AuthSession, Listing, MapPoint, Post } from './types';

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

// Notifications
export async function getNotifications(userId = 1): Promise<NotificationsResponse> {
  return fetchAPI<NotificationsResponse>(`/notifications?user_id=${userId}`);
}

export async function markNotificationsRead(userId = 1, notificationId?: number): Promise<{ success: boolean }> {
  return fetchAPI<{ success: boolean }>('/notifications', {
    method: 'PATCH',
    body: JSON.stringify({ user_id: userId, ...(notificationId ? { notification_id: notificationId } : {}) }),
  });
}

// Auth
export async function registerUser(data: {
  email: string; password: string; role: string;
  display_name: string; username: string;
  city: string; region?: string; lat?: number; lng?: number;
  company_name?: string; company_website?: string;
}): Promise<AuthSession> {
  return fetchAPI<AuthSession>('/auth/register', { method: 'POST', body: JSON.stringify(data) });
}

export async function loginUser(email: string, password: string): Promise<AuthSession> {
  return fetchAPI<AuthSession>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
}

export async function getMe(): Promise<{ user: AuthUser | null }> {
  return fetchAPI<{ user: AuthUser | null }>('/auth/me');
}

export async function logoutUser(): Promise<{ success: boolean }> {
  return fetchAPI<{ success: boolean }>('/auth/me', { method: 'DELETE' });
}

// Listings (user-published)
export async function getListings(filters?: { type?: string; category?: string; city?: string }): Promise<Listing[]> {
  const params = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
  }
  const q = params.toString();
  return fetchAPI<Listing[]>(`/listings${q ? `?${q}` : ''}`);
}

export async function createListing(data: Partial<Listing>): Promise<{ id: number; success: boolean }> {
  return fetchAPI<{ id: number; success: boolean }>('/listings', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getMapPoints(type?: string, region?: string): Promise<MapPoint[]> {
  const params = new URLSearchParams();
  if (type) params.set('type', type);
  if (region) params.set('region', region);
  const q = params.toString();
  return fetchAPI<MapPoint[]>(`/listings/map${q ? `?${q}` : ''}`);
}

// Posts
export async function getPosts(limit = 30, offset = 0): Promise<Post[]> {
  return fetchAPI<Post[]>(`/posts?limit=${limit}&offset=${offset}`);
}

export async function createPost(data: { content: string; image_url?: string; post_type?: string; tags?: string[] }): Promise<{ id: number; success: boolean }> {
  return fetchAPI<{ id: number; success: boolean }>('/posts', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
