'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import TopBar from '@/components/TopBar';
import { getQuiz, submitQuiz, getCourse } from '@/lib/api';
import type { Quiz, Course, QuizResult } from '@/lib/types';

interface Props {
  params: Promise<{ courseId: string }>;
}

export default function QuizPage({ params }: Props) {
  const { courseId } = use(params);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showExplanation, setShowExplanation] = useState<number | null>(null);

  useEffect(() => {
    const id = parseInt(courseId);
    Promise.all([
      getQuiz(id).catch(() => null),
      getCourse(id).catch(() => null),
    ]).then(([quizData, courseData]) => {
      setQuiz(quizData);
      setCourse(courseData);
      setLoading(false);
    });
  }, [courseId]);

  const handleAnswer = (questionIndex: number, optionIndex: number) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [questionIndex]: optionIndex }));
  };

  const handleSubmit = async () => {
    if (!quiz) return;
    setSubmitting(true);
    try {
      const answerArray = quiz.questions.map((_, i) => answers[i] ?? -1);
      const res = await submitQuiz(1, quiz.id, answerArray);
      setResult(res);
      setSubmitted(true);
      setCurrentQuestion(0);
    } catch {
      // handle error
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <TopBar />
        <div className="p-4 space-y-4">
          <div className="h-40 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-800" />
          <div className="h-60 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-800" />
        </div>
      </>
    );
  }

  if (!quiz) {
    return (
      <>
        <TopBar />
        <div className="flex flex-col items-center justify-center py-20">
          <span className="text-4xl mb-3">📝</span>
          <h3 className="font-semibold text-zinc-900 dark:text-white">Quiz non disponibile</h3>
          <Link href={`/learn/${courseId}`} className="mt-3 text-sm text-indigo-600 hover:underline">
            Torna al corso
          </Link>
        </div>
      </>
    );
  }

  const totalQuestions = quiz.questions.length;
  const answeredCount = Object.keys(answers).length;
  const question = quiz.questions[currentQuestion];

  // Results view
  if (submitted && result) {
    const passed = result.passed;
    return (
      <>
        <TopBar />
        <div className="animate-fade-in p-4">
          {/* Result Header */}
          <div className={`rounded-2xl p-6 text-center ${
            passed
              ? 'bg-linear-to-br from-emerald-500 to-teal-600 text-white'
              : 'bg-linear-to-br from-orange-500 to-red-500 text-white'
          }`}>
            <div className="text-5xl mb-3">{passed ? '🏆' : '📚'}</div>
            <h2 className="text-2xl font-bold">{passed ? 'Congratulazioni!' : 'Quasi...'}</h2>
            <p className="mt-2 text-sm opacity-90">
              {passed
                ? `Hai ottenuto il badge "${course?.badge_name}"!`
                : `Hai bisogno di almeno ${quiz.passing_score}% per superare il quiz.`
              }
            </p>
            <div className="mt-4 inline-flex items-center justify-center h-24 w-24 rounded-full bg-white/20 backdrop-blur-sm">
              <div className="text-3xl font-black">{result.score}%</div>
            </div>
            <p className="mt-2 text-sm opacity-80">
              {result.correct_count}/{totalQuestions} risposte corrette
            </p>
          </div>

          {/* Badge earned */}
          {passed && course && (
            <div className="mt-4 rounded-2xl border border-zinc-200 p-5 dark:border-zinc-700 animate-pulse-badge text-center">
              <div
                className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold text-white shadow-lg"
                style={{ background: `linear-gradient(135deg, ${course.badge_color}, ${course.badge_color}cc)` }}
              >
                ★
              </div>
              <h3 className="font-bold text-zinc-900 dark:text-white">{course.badge_name}</h3>
              <p className="mt-1 text-xs text-zinc-500">Badge aggiunto al tuo profilo!</p>
            </div>
          )}

          {/* Review answers */}
          <div className="mt-6">
            <h3 className="font-bold text-zinc-900 dark:text-white mb-3">Revisione risposte</h3>
            <div className="space-y-3">
              {quiz.questions.map((q, i) => {
                const userAnswer = answers[i] ?? -1;
                const isCorrect = userAnswer === q.correct;
                return (
                  <div key={i} className="rounded-xl border border-zinc-200 p-3 dark:border-zinc-700">
                    <div className="flex items-start gap-2">
                      <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        isCorrect
                          ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                          : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {isCorrect ? '✓' : '✗'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-zinc-900 dark:text-white">{q.question}</p>
                        <div className="mt-1 space-y-1">
                          {q.options.map((opt, oi) => (
                            <p key={oi} className={`text-xs px-2 py-1 rounded ${
                              oi === q.correct
                                ? 'bg-emerald-50 text-emerald-700 font-semibold dark:bg-emerald-900/20 dark:text-emerald-400'
                                : oi === userAnswer && !isCorrect
                                  ? 'bg-red-50 text-red-600 line-through dark:bg-red-900/20 dark:text-red-400'
                                  : 'text-zinc-500'
                            }`}>
                              {String.fromCharCode(65 + oi)}. {opt}
                            </p>
                          ))}
                        </div>

                        <button
                          onClick={() => setShowExplanation(showExplanation === i ? null : i)}
                          className="mt-1 text-xs text-indigo-600 dark:text-indigo-400"
                        >
                          {showExplanation === i ? 'Nascondi' : 'Mostra'} spiegazione
                        </button>
                        {showExplanation === i && (
                          <p className="mt-1 text-xs text-zinc-500 bg-zinc-50 dark:bg-zinc-800 p-2 rounded">
                            {q.explanation}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 space-y-2 pb-6">
            {!passed && (
              <button
                onClick={() => {
                  setSubmitted(false);
                  setResult(null);
                  setAnswers({});
                  setCurrentQuestion(0);
                  setShowExplanation(null);
                }}
                className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:bg-indigo-700 active:scale-[0.98]"
              >
                Riprova il quiz
              </button>
            )}
            <Link
              href={`/learn/${courseId}`}
              className="block w-full text-center rounded-xl border border-zinc-300 py-3 text-sm font-semibold text-zinc-900 dark:border-zinc-600 dark:text-white transition-all hover:bg-zinc-50 dark:hover:bg-zinc-800"
            >
              Torna al corso
            </Link>
            <Link
              href="/profile"
              className="block w-full text-center rounded-xl py-3 text-sm font-semibold text-indigo-600 dark:text-indigo-400"
            >
              Vedi il tuo profilo
            </Link>
          </div>
        </div>
      </>
    );
  }

  // Quiz view
  return (
    <>
      <TopBar />
      <div className="animate-fade-in">
        {/* Header */}
        <div className="px-4 pt-4 pb-3">
          <Link href={`/learn/${courseId}`} className="inline-flex items-center gap-1 text-sm text-indigo-600 dark:text-indigo-400 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
            Torna al corso
          </Link>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white">{quiz.title}</h2>
          <p className="text-xs text-zinc-500 mt-1">Punteggio minimo: {quiz.passing_score}%</p>
        </div>

        {/* Progress bar */}
        <div className="px-4 pb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-zinc-500">Domanda {currentQuestion + 1}/{totalQuestions}</span>
            <span className="text-xs text-zinc-500">{answeredCount}/{totalQuestions} risposte</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-zinc-200 dark:bg-zinc-700">
            <div
              className="h-1.5 rounded-full bg-indigo-500 transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / totalQuestions) * 100}%` }}
            />
          </div>
        </div>

        {/* Question dots */}
        <div className="px-4 pb-4">
          <div className="flex flex-wrap gap-1.5">
            {quiz.questions.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentQuestion(i)}
                className={`h-7 w-7 rounded-full text-xs font-semibold transition-all ${
                  currentQuestion === i
                    ? 'bg-indigo-600 text-white shadow-md'
                    : answers[i] !== undefined
                      ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                      : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Question */}
        <div className="px-4 pb-4">
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-900">
            <p className="text-sm font-semibold text-zinc-900 dark:text-white leading-relaxed">
              {question.question}
            </p>
            <div className="mt-4 space-y-2">
              {question.options.map((option, oi) => (
                <button
                  key={oi}
                  onClick={() => handleAnswer(currentQuestion, oi)}
                  className={`w-full text-left rounded-xl border p-3 text-sm transition-all ${
                    answers[currentQuestion] === oi
                      ? 'border-indigo-400 bg-indigo-50 text-indigo-900 dark:border-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-200'
                      : 'border-zinc-200 text-zinc-700 hover:border-zinc-300 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-600'
                  }`}
                >
                  <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full mr-2 text-xs font-bold ${
                    answers[currentQuestion] === oi
                      ? 'bg-indigo-600 text-white'
                      : 'bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400'
                  }`}>
                    {String.fromCharCode(65 + oi)}
                  </span>
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="px-4 pb-8 flex gap-2">
          <button
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
            className="flex-1 rounded-xl border border-zinc-300 py-3 text-sm font-semibold text-zinc-700 transition-all hover:bg-zinc-50 disabled:opacity-30 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            ← Precedente
          </button>
          {currentQuestion < totalQuestions - 1 ? (
            <button
              onClick={() => setCurrentQuestion(currentQuestion + 1)}
              className="flex-1 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:bg-indigo-700 active:scale-[0.98]"
            >
              Successiva →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={answeredCount < totalQuestions || submitting}
              className="flex-1 rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:bg-emerald-700 active:scale-[0.98] disabled:opacity-50"
            >
              {submitting ? 'Invio...' : answeredCount < totalQuestions ? `Rispondi a tutte (${answeredCount}/${totalQuestions})` : 'Invia risposte ✓'}
            </button>
          )}
        </div>
      </div>
    </>
  );
}
