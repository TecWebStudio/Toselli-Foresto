'use client';

import { useState, useEffect } from 'react';
import TopBar from '@/components/TopBar';
import JobCard from '@/components/JobCard';
import CourseCard from '@/components/CourseCard';
import JobDetail from '@/components/JobDetail';
import { getJobs, getCourses, getStats } from '@/lib/api';
import type { Job, Course, PlatformStats } from '@/lib/types';
import Link from 'next/link';

export default function Home() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getJobs().catch(() => []),
      getCourses().catch(() => []),
      getStats().catch(() => null),
    ]).then(([jobsData, coursesData, statsData]) => {
      setJobs(jobsData.slice(0, 5));
      setCourses(coursesData.slice(0, 4));
      setStats(statsData);
      setLoading(false);
    });
  }, []);

  return (
    <>
      <TopBar />
      <div className="animate-fade-in">
        {/* Hero Section */}
        <div className="bg-linear-to-br from-indigo-600 via-purple-600 to-indigo-700 px-5 py-8 text-white">
          <h2 className="text-2xl font-bold leading-tight">
            La tua carriera IT
            <br />
            inizia qui. 🚀
          </h2>
          <p className="mt-2 text-sm text-indigo-200">
            Trova lavoro, impara nuove competenze e ottieni certificazioni nel mondo tech.
          </p>

          {/* Stats */}
          {stats && (
            <div className="mt-6 grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-white/10 backdrop-blur-sm p-3 text-center">
                <p className="text-xl font-bold">{stats.jobs}</p>
                <p className="text-xs text-indigo-200">Posizioni</p>
              </div>
              <div className="rounded-xl bg-white/10 backdrop-blur-sm p-3 text-center">
                <p className="text-xl font-bold">{stats.courses}</p>
                <p className="text-xs text-indigo-200">Corsi</p>
              </div>
              <div className="rounded-xl bg-white/10 backdrop-blur-sm p-3 text-center">
                <p className="text-xl font-bold">{stats.badges_awarded}</p>
                <p className="text-xs text-indigo-200">Badge</p>
              </div>
            </div>
          )}
        </div>

        {/* Latest Jobs */}
        <section className="px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Ultime posizioni</h3>
            <Link href="/jobs" className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
              Vedi tutte →
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-28 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-800" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} onSelect={setSelectedJob} />
              ))}
            </div>
          )}
        </section>

        {/* Featured Courses */}
        <section className="px-4 pb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Percorsi formativi</h3>
            <Link href="/learn" className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
              Vedi tutti →
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-32 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-800" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </section>

        {/* Quick tips section */}
        <section className="px-4 pb-6">
          <div className="rounded-2xl bg-linear-to-br from-amber-50 to-orange-50 border border-amber-200 p-5 dark:from-amber-900/10 dark:to-orange-900/10 dark:border-amber-800">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">💡</span>
              <h3 className="font-bold text-zinc-900 dark:text-white">Consiglio del giorno</h3>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Le aziende IT italiane nel 2026 cercano principalmente profili con competenze in{' '}
              <span className="font-semibold text-amber-700 dark:text-amber-400">Cloud (AWS/Azure)</span>,{' '}
              <span className="font-semibold text-amber-700 dark:text-amber-400">React + TypeScript</span> e{' '}
              <span className="font-semibold text-amber-700 dark:text-amber-400">Cybersecurity</span>.
              Investi nella formazione su queste tecnologie per aumentare le tue opportunità.
            </p>
          </div>
        </section>
      </div>

      {/* Job Detail Modal */}
      {selectedJob && <JobDetail job={selectedJob} onClose={() => setSelectedJob(null)} />}
    </>
  );
}
