import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { QuizService } from '../../services/quiz.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { QuestionWithAnswers } from '../../models/quiz.model';

@Component({
  selector: 'app-quiz-game',
  standalone: true,
  imports: [CommonModule, HttpClientModule, RouterModule],
  templateUrl: './quizgame.component.html',
  styleUrls: ['./quizgame.component.css']
})
export class QuizGameComponent implements OnInit {
  question?: QuestionWithAnswers;
  selectedAnswerId?: number;
  message?: string;
  isCorrect?: boolean;
  isLoading = true;
  error?: string;

  constructor(
    private route: ActivatedRoute,
    private quizService: QuizService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.loadQuestion(params['quizzId']);
    });
  }

  loadQuestion(quizId: number): void {
    this.isLoading = true;
    this.error = undefined;
    this.quizService.getRandomQuestion(quizId).subscribe({
      next: (question) => {
        this.question = question;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = err.error || 'Wystąpił błąd';
        this.isLoading = false;
      }
    });
  }

  checkAnswer(answerId: number, isCorrect: boolean): void {
    if (this.selectedAnswerId) return;
    
    this.selectedAnswerId = answerId;
    this.isCorrect = isCorrect;
    this.message = isCorrect ? 'Poprawna odpowiedź! 🎉' : 'Niestety to błędna odpowiedź 😞';

    if (isCorrect) {
      setTimeout(() => {
        this.loadQuestion(this.route.snapshot.params['quizzId']);
        this.selectedAnswerId = undefined;
      }, 2000);
    }
  }

  backToQuizzes(): void {
    this.router.navigate(['/quizzes']);
  }
}