'use client';

import { use, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import TopBar from '@/components/TopBar';
import { PageTransition, Confetti, ShimmerSkeleton } from '@/lib/animations';
import { getQuiz, submitQuiz } from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
import type { Quiz, QuizResult } from '@/lib/types';

export default function QuizPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = use(params);
  const { user: authUser } = useAuth();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showExplanation, setShowExplanation] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    getQuiz(Number(courseId))
      .then(q => {
        setQuiz(q);
        setAnswers(new Array(q.questions.length).fill(-1));
      })
      .catch(() => null)
      .finally(() => setLoading(false));
  }, [courseId]);

  const handleAnswer = (questionIdx: number, optionIdx: number) => {
    if (result) return;
    setAnswers(prev => {
      const next = [...prev];
      next[questionIdx] = optionIdx;
      return next;
    });
  };

  const handleSubmit = async () => {
    if (!quiz || submitting) return;
    if (answers.some(a => a === -1)) return;

    setSubmitting(true);
    try {
      if (!authUser) return;
      const r = await submitQuiz(Number(courseId), authUser.id, answers);
      setResult(r);
      if (r.passed) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 4000);
      }
    } catch { /* ignore */ }
    setSubmitting(false);
  };

  const answeredCount = answers.filter(a => a !== -1).length;
  const totalQuestions = quiz?.questions.length || 0;

  if (loading) {
    return (
      <>
        <TopBar />
        <div className="p-4 space-y-4">
          <ShimmerSkeleton className="h-32 w-full" rounded="rounded-2xl" />
          <ShimmerSkeleton className="h-64 w-full" rounded="rounded-2xl" />
        </div>
      </>
    );
  }

  if (!quiz) {
    return (
      <>
        <TopBar />
        <div className="flex flex-col items-center justify-center py-24 text-center px-4">
          <span className="text-5xl mb-3">📝</span>
          <h2 className="font-bold text-zinc-900 dark:text-white">Quiz non disponibile</h2>
          <Link href={`/learn/${courseId}`} className="mt-3 text-sm font-semibold text-indigo-600">
            ← Torna al corso
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <TopBar />
      <Confetti active={showConfetti} />
      <PageTransition>
        {!result ? (
          /* Quiz Taking Mode */
          <>
            {/* Header */}
            <div className="px-4 pt-4 pb-3">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 mb-3"
              >
                <Link
                  href={`/learn/${courseId}`}
                  className="flex items-center gap-1 text-sm font-semibold text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" />
                  </svg>
                  Corso
                </Link>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-lg font-black text-zinc-900 dark:text-white"
              >
                {quiz.title}
              </motion.h2>

              {/* Progress dots */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="flex gap-1.5 mt-3 overflow-x-auto pb-1"
              >
                {quiz.questions.map((_, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setCurrentQuestion(i)}
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold transition-all shrink-0 ${
                      i === currentQuestion
                        ? 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-md shadow-indigo-500/25 scale-110'
                        : answers[i] !== -1
                          ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                          : 'bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500'
                    }`}
                  >
                    {i + 1}
                  </motion.button>
                ))}
              </motion.div>

              {/* Progress bar */}
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 h-1 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <span className="text-[10px] text-zinc-500 font-bold">{answeredCount}/{totalQuestions}</span>
              </div>
            </div>

            {/* Question */}
            <div className="px-4 pb-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentQuestion}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-700/80 p-5">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
                      Domanda {currentQuestion + 1} di {totalQuestions}
                    </p>
                    <h3 className="text-base font-bold text-zinc-900 dark:text-white leading-snug">
                      {quiz.questions[currentQuestion].question}
                    </h3>

                    <div className="mt-4 space-y-2.5">
                      {quiz.questions[currentQuestion].options.map((option, oi) => {
                        const isSelected = answers[currentQuestion] === oi;
                        return (
                          <motion.button
                            key={oi}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 + oi * 0.05 }}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => handleAnswer(currentQuestion, oi)}
                            className={`w-full text-left rounded-xl border-2 p-3.5 text-sm transition-all ${
                              isSelected
                                ? 'border-indigo-500 bg-indigo-50 text-zinc-900 shadow-md shadow-indigo-500/10 dark:bg-indigo-900/20 dark:border-indigo-400 dark:text-white'
                                : 'border-zinc-200 text-zinc-700 hover:border-zinc-300 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-600'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`flex h-6 w-6 items-center justify-center rounded-full border-2 shrink-0 text-xs font-bold ${
                                isSelected
                                  ? 'border-indigo-500 bg-indigo-500 text-white'
                                  : 'border-zinc-300 text-zinc-400 dark:border-zinc-600'
                              }`}>
                                {String.fromCharCode(65 + oi)}
                              </div>
                              <span className="font-medium">{option}</span>
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Navigation */}
                  <div className="flex gap-3 mt-4">
                    {currentQuestion > 0 && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setCurrentQuestion(currentQuestion - 1)}
                        className="flex-1 rounded-xl border border-zinc-200 dark:border-zinc-700 py-3 text-sm font-bold text-zinc-700 dark:text-zinc-300"
                      >
                        ← Precedente
                      </motion.button>
                    )}
                    {currentQuestion < totalQuestions - 1 ? (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setCurrentQuestion(currentQuestion + 1)}
                        className="flex-1 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/25"
                      >
                        Successiva →
                      </motion.button>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSubmit}
                        disabled={answeredCount < totalQuestions || submitting}
                        className="flex-1 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:shadow-none"
                      >
                        {submitting ? 'Invio in corso...' : 'Invia Quiz ✨'}
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </>
        ) : (
          /* Result Mode */
          <div className="px-4 pt-4 pb-8">
            {/* Result Header */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className={`rounded-3xl p-6 text-center text-white relative overflow-hidden ${
                result.passed
                  ? 'bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500'
                  : 'bg-gradient-to-br from-orange-500 via-red-500 to-pink-500'
              }`}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-2xl" />

              <div className="relative z-10">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
                  className="text-6xl mb-3"
                >
                  {result.passed ? '🏆' : '💪'}
                </motion.div>
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl font-black"
                >
                  {result.passed ? 'Complimenti!' : 'Quasi!'}
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-sm opacity-90 mt-1"
                >
                  {result.passed
                    ? 'Hai superato il quiz con successo!'
                    : `Hai bisogno di almeno ${result.passing_score}% per superare il quiz`}
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.5 }}
                  className="mt-4 inline-block bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-3"
                >
                  <div className="text-4xl font-black">{result.score}%</div>
                  <div className="text-xs opacity-80">{result.correct_count}/{result.total} risposte corrette</div>
                </motion.div>
              </div>
            </motion.div>

            {/* Answer Review */}
            <motion.h3
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2 mt-6 mb-3"
            >
              <span className="w-1 h-4 rounded-full bg-gradient-to-b from-indigo-500 to-purple-500" />
              Riepilogo risposte
            </motion.h3>

            <div className="space-y-3">
              {result.details.map((detail, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + i * 0.05 }}
                  className={`rounded-xl border p-4 ${
                    detail.isCorrect
                      ? 'border-emerald-200/80 bg-emerald-50/60 dark:border-emerald-800/40 dark:bg-emerald-900/10'
                      : 'border-red-200/80 bg-red-50/60 dark:border-red-800/40 dark:bg-red-900/10'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <div className={`flex h-5 w-5 items-center justify-center rounded-full shrink-0 mt-0.5 ${
                      detail.isCorrect ? 'bg-emerald-500' : 'bg-red-500'
                    }`}>
                      {detail.isCorrect ? (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="white" className="w-3 h-3">
                          <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="white" className="w-3 h-3">
                          <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-zinc-900 dark:text-white">{detail.question}</p>
                      {!detail.isCorrect && quiz?.questions[i] && (
                        <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                          Risposta corretta: {quiz.questions[i].options[detail.correctAnswer]}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Explanation toggle */}
                  {detail.explanation && (
                    <div className="mt-2 ml-7">
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowExplanation(showExplanation === i ? null : i)}
                        className="text-xs font-bold text-indigo-600 dark:text-indigo-400"
                      >
                        {showExplanation === i ? 'Nascondi spiegazione' : 'Mostra spiegazione'}
                      </motion.button>
                      <AnimatePresence>
                        {showExplanation === i && (
                          <motion.p
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed overflow-hidden"
                          >
                            {detail.explanation}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="mt-6 space-y-2.5"
            >
              {!result.passed && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setResult(null);
                    setAnswers(new Array(totalQuestions).fill(-1));
                    setCurrentQuestion(0);
                    setShowExplanation(null);
                  }}
                  className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/25"
                >
                  Riprova il quiz 🔄
                </motion.button>
              )}
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href={result.passed ? '/profile' : `/learn/${courseId}`}
                  className="block w-full rounded-xl border border-zinc-200 dark:border-zinc-700 py-3 text-sm font-bold text-zinc-700 dark:text-zinc-300 text-center"
                >
                  {result.passed ? 'Vai al profilo 🏅' : '← Torna al corso'}
                </Link>
              </motion.div>
            </motion.div>
          </div>
        )}
      </PageTransition>
    </>
  );
}
