import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;
    const input = await request.json();

    if (!input.answers || !input.user_id) {
      return NextResponse.json({ error: 'Missing answers or user_id' }, { status: 400 });
    }

    // Get quiz with answers
    const quizResult = await db.execute({
      sql: 'SELECT * FROM quizzes WHERE course_id = ?',
      args: [Number(courseId)],
    });

    if (quizResult.rows.length === 0) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    const quiz = quizResult.rows[0];
    const questions: Array<{ question: string; correct: number; explanation: string; options: string[] }> =
      typeof quiz.questions === 'string' ? JSON.parse(quiz.questions as string) : quiz.questions;
    const answers: number[] = input.answers;
    let correctCount = 0;
    const total = questions.length;
    const details: Array<{
      question: string;
      userAnswer: number;
      correctAnswer: number;
      isCorrect: boolean;
      explanation: string;
    }> = [];

    questions.forEach((q, i) => {
      const userAnswer = answers[i] ?? -1;
      const isCorrect = userAnswer === q.correct;
      if (isCorrect) correctCount++;
      details.push({
        question: q.question,
        userAnswer,
        correctAnswer: q.correct,
        isCorrect,
        explanation: q.explanation,
      });
    });

    const score = Math.round((correctCount / total) * 100);
    const passingScore = Number(quiz.passing_score);
    const passed = score >= passingScore;

    // Update user progress
    const userId = Number(input.user_id);
    const cid = Number(courseId);

    const existing = await db.execute({
      sql: 'SELECT * FROM user_progress WHERE user_id = ? AND course_id = ?',
      args: [userId, cid],
    });

    if (existing.rows.length > 0) {
      await db.execute({
        sql: 'UPDATE user_progress SET quiz_score = ?, quiz_completed = 1 WHERE user_id = ? AND course_id = ?',
        args: [score, userId, cid],
      });
    } else {
      await db.execute({
        sql: "INSERT INTO user_progress (user_id, course_id, completed_modules, quiz_score, quiz_completed) VALUES (?, ?, '[]', ?, 1)",
        args: [userId, cid, score],
      });
    }

    // Award badge if passed
    if (passed) {
      const courseResult = await db.execute({
        sql: 'SELECT badge_name FROM courses WHERE id = ?',
        args: [cid],
      });

      const badgeCheck = await db.execute({
        sql: 'SELECT id FROM user_badges WHERE user_id = ? AND course_id = ?',
        args: [userId, cid],
      });

      if (badgeCheck.rows.length === 0 && courseResult.rows.length > 0) {
        const today = new Date().toISOString().split('T')[0];
        await db.execute({
          sql: 'INSERT INTO user_badges (user_id, course_id, badge_name, earned_date, score) VALUES (?, ?, ?, ?, ?)',
          args: [userId, cid, courseResult.rows[0].badge_name as string, today, score],
        });
      }
    }

    return NextResponse.json({
      score,
      correct: correctCount,
      correct_count: correctCount,
      total,
      passed,
      passing_score: passingScore,
      details,
    });
  } catch (error) {
    console.error('Error submitting quiz:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
