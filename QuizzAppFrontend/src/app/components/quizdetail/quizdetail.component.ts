import { Component, OnInit } from '@angular/core';
import { QuizService } from '../../services/quiz.service';
import { Quiz } from '../../models/quiz.model';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-quiz-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quizdetail.component.html',
  styleUrls: ['./quizdetail.component.css'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class QuizDetailComponent implements OnInit {
  quiz?: Quiz;
  isLoading = true;
  error?: string;

  constructor(
    private quizService: QuizService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = +params['id'];
      this.quizService.getQuiz(id).subscribe({
        next: (data) => {
          this.quiz = data;
          this.isLoading = false;
        },
        error: (err) => {
          this.error = 'Nie znaleziono quizu';
          this.isLoading = false;
        }
      });
    });
  }
}