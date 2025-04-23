import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Quiz } from '../models/quiz.model';
import { CreateQuiz } from '../models/createquiz.model';
import { Question } from '../models/question.model';

@Injectable({ providedIn: 'root' })
export class QuizService {
  private apiUrl = 'https://localhost:7039/api/Quizz';

  constructor(private http: HttpClient) { }

  getQuizzes(): Observable<Quiz[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map(response => response.$values)
    );
  }

  createQuiz(quizData: CreateQuiz): Observable<Quiz> {
    return this.http.post<Quiz>(this.apiUrl, quizData);
  }

  addQuestionToQuiz(quizId: number, questionText: string): Observable<Question> {
    const url = `${this.apiUrl}/${quizId}/Question`;
    return this.http.post<Question>(url, { question: questionText });
  }
  
}