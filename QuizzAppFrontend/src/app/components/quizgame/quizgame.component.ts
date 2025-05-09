import { Component, OnInit } from '@angular/core';
import { QuizService } from '../../services/quiz.service';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { map } from 'rxjs/operators';

interface AnswerDto {
  $id: string;
  answerId: number;
  answerText: string;
  isCorrect: boolean;
}

interface QuestionWithAnswers {
  $id: string;
  questionId: number;
  questionText: string;
  answers: {
    $id: string;
    $values: AnswerDto[];
  };
}

@Component({
  selector: 'app-quiz-game',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './quizgame.component.html',
  styleUrls: ['./quizgame.component.css']
})
export class QuizGameComponent implements OnInit {
  question: QuestionWithAnswers | null = null;
  selectedAnswer: AnswerDto | null = null;
  isAnswerSelected = false;
  quizId!: number;

  constructor(
    private quizService: QuizService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.quizId = Number(this.route.snapshot.paramMap.get('quizId'));
    this.loadQuestion();
  }

  loadQuestion() {
    this.quizService.getRandomQuestion(this.quizId).subscribe({
      next: (response: any) => {
        this.question = this.mapResponseToQuestion(response);
        this.resetState();
      },
      error: (err) => console.error('Error:', err)
    });
  }

  private mapResponseToQuestion(response: any): QuestionWithAnswers {
    return {
      $id: response.$id,
      questionId: response.questionId,
      questionText: response.questionText,
      answers: {
        $id: response.answers.$id,
        $values: response.answers.$values.map((a: any) => ({
          $id: a.$id,
          answerId: a.answerId,
          answerText: a.answerText,
          isCorrect: a.isCorrect
        }))
      }
    };
  }

  selectAnswer(answer: AnswerDto) {
    if (!this.isAnswerSelected) {
      this.selectedAnswer = answer;
      this.isAnswerSelected = true;
    }
  }

  resetState() {
    this.selectedAnswer = null;
    this.isAnswerSelected = false;
  }

  get answerStatusClass() {
    if (!this.selectedAnswer) return '';
    return this.selectedAnswer.isCorrect ? 'correct' : 'incorrect';
  }
}