import { Component, OnInit } from '@angular/core';
import { QuizService } from '../../services/quiz.service';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

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
  questions: QuestionWithAnswers[] = [];
  currentQuestionIndex: number = 0;
  selectedAnswer: AnswerDto | null = null;
  isAnswerSelected = false;
  quizId!: number;
  quizFinished = false;

  constructor(
    private quizService: QuizService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.quizId = Number(this.route.snapshot.paramMap.get('quizId'));
    this.loadQuestions();
  }

  loadQuestions() {
    this.quizService.getRandomQuestions(this.quizId).subscribe({
      next: (response: any) => {
        this.questions = response.$values.map((q: any) => this.mapQuestion(q));
        this.resetState();
      },
      error: (err) => console.error('Error:', err)
    });
  }

  private mapQuestion(question: any): QuestionWithAnswers {
    return {
      $id: question.$id,
      questionId: question.questionId,
      questionText: question.questionText,
      answers: {
        $id: question.answers.$id,
        $values: question.answers.$values.map((a: any) => ({
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

  nextQuestion() {
    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.currentQuestionIndex++;
      this.resetState();
    } else {
      this.quizFinished = true;
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