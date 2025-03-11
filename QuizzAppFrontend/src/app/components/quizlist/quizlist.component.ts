import { Component, OnInit } from '@angular/core';
import { QuizService } from '../../services/quiz.service';
import { Quiz } from '../../models/quiz.model';

@Component({
  selector: 'app-quizlist',
  standalone: true,
  templateUrl: './quizlist.component.html',
  styleUrls: ['./quizlist.component.css']
})
export class QuizListComponent implements OnInit {
  quizzes: Quiz[] = [];
  
  constructor(private quizService: QuizService) {}

  ngOnInit() {
    this.quizService.getQuizzes().subscribe({
      next: (data) => this.quizzes = data,
      error: (err) => console.error('Error fetching quizzes:', err)
    });
  }
}