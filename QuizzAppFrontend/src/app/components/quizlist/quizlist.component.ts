import { Component, OnInit, OnDestroy } from '@angular/core';
import { QuizService } from '../../services/quiz.service';
import { Quiz } from '../../models/quiz.model';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-quizlist',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quizlist.component.html',
  styleUrls: ['./quizlist.component.css']
})
export class QuizListComponent implements OnInit, OnDestroy {
  quizzes: Quiz[] = [];
  private ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor(private quizService: QuizService) {}

  ngOnInit() {
    this.quizService.getQuizzes()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (data: Quiz[]) => {
            console.log('Odebrane dane:', data);
            this.quizzes = data;
          },
        error: (err: any) => console.error('Error:', err)
      });
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}