import { Component } from '@angular/core';
import { QuizService } from '../../services/quiz.service';
import { CreateQuiz } from '../../models/createquiz.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Quiz } from '../../models/quiz.model';

@Component({
  selector: 'app-createquiz-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './createquiz-form.component.html',
  styleUrls: ['./createquiz-form.component.css']
})
export class CreateQuizFormComponent {
  quizzData: CreateQuiz = {
    Title: '',
    Author: '',
    Description: ''
  };
  isLoading = false;
  successMessage = '';
  errorMessage = '';
  createdQuizId: number | null = null;

  constructor(private quizService: QuizService) {}

  onSubmit() {
    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';
    this.createdQuizId = null;

    this.quizService.createQuiz(this.quizzData).subscribe({
      next: (createdQuiz: Quiz) => {
        this.successMessage = 'Quiz został pomyślnie utworzony';
        this.createdQuizId = createdQuiz.quizId;
        this.quizzData = { Title: '', Author: '', Description: '' };
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Wystąpił błąd. Spróbuj ponownie... Do widzenia';
        this.isLoading = false;
      }
    });
  }
}