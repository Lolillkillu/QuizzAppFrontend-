import { Question } from './question.model';

export interface Quiz {
  quizzId: number;
  title: string;
  description?: string;
  scienceId?: number;
  author: string;
  questions: Question[];
}

export interface QuestionWithAnswers {
  questionId: number;
  questionText: string;
  answers: AnswerDto[];
}

export interface AnswerDto {
  answerId: number;
  answerText: string;
  isCorrect: boolean;
}