import { Component } from '@angular/core';
import { QuizService } from '../../services/quiz.service';
import { CreateQuiz } from '../../models/createquiz.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

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

  constructor(private quizService: QuizService) {}

  onSubmit() {
    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.quizService.createQuiz(this.quizzData).subscribe({
      next: (response) => {
        this.successMessage = 'Quiz został pomyślnie utworzony';
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