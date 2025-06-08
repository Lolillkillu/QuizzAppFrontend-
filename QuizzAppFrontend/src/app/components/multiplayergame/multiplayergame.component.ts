import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SignalrService } from '../../services/signalr.service';
import { QuizService } from '../../services/quiz.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-multiplayer-game',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './multiplayergame.component.html',
  styleUrls: ['./multiplayergame.component.css']
})
export class MultiplayerGameComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  gameId: string | null = null;
  players: any[] = [];
  currentQuestion: any = null;
  gameStatus: 'waiting' | 'in-progress' | 'completed' = 'waiting';
  quizId: number | null = null;
  playerName = '';
  showNameInput = true;
  connectionStatus = '';
  selectedAnswer: any = null;
  isAnswerSelected = false;
  currentScore = 0;
  playerId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private signalrService: SignalrService,
    private quizService: QuizService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['quizId']) {
        this.quizId = Number(params['quizId']);
      }
    });

    if (this.route.snapshot.paramMap.get('gameId')) {
      this.gameId = this.route.snapshot.paramMap.get('gameId');
      this.showNameInput = true;
    } else if (this.quizId) {
      this.showNameInput = true;
    }
  }

  submitPlayerName(playerName: string) {
    this.playerName = playerName;
    this.showNameInput = false;

    if (this.gameId) {
      this.signalrService.joinGame(this.gameId, playerName)
        .then(success => {
          if (!success) {
            alert('Nie udało się dołączyć do gry');
            this.showNameInput = true;
          }
        });
    } else if (this.quizId) {
      this.signalrService.createGame(playerName, this.quizId)
        .then(gameId => {
          this.gameId = gameId;
          this.router.navigate(['/multiplayer', gameId], {
            queryParamsHandling: 'preserve'
          });
        })
        .catch(err => {
          console.error('Błąd tworzenia gry:', err);
          this.showNameInput = true;
        });
    }

    this.subscriptions.push(
      this.signalrService.playerJoined$.subscribe(players => {
        this.players = players;
        this.playerId = players.find(p => p.name === this.playerName)?.playerId;
      }),

      this.signalrService.nextQuestion$.subscribe(question => {
        this.currentQuestion = question;
        this.gameStatus = 'in-progress';
        this.selectedAnswer = null;
        this.isAnswerSelected = false;
      }),

      this.signalrService.answerProcessed$.subscribe(result => {
        if (result.playerId === this.playerId && result.isCorrect) {
          this.currentScore++;
        }
      }),

      this.signalrService.gameCompleted$.subscribe(results => {
        this.gameStatus = 'completed';
        this.players = results.map((r: any) => ({
          name: r.playerName,
          score: r.score
        }));
      })
    );
  }

  selectAnswer(answer: any) {
    if (!this.isAnswerSelected && this.gameId && this.currentQuestion) {
      this.selectedAnswer = answer;
      this.isAnswerSelected = true;
      this.signalrService.submitAnswer(
        this.gameId, 
        this.currentQuestion.questionId, 
        answer.answerId
      );
    }
  }

  restartGame() {
    if (this.quizId) {
      this.router.navigate(['/quiz-game', this.quizId]);
    } else {
      this.router.navigate(['/']);
    }
  }

  copyGameId() {
    const url = `${window.location.origin}/multiplayer/${this.gameId}`;
    navigator.clipboard.writeText(url)
      .then(() => alert('Link skopiowany do schowka!'))
      .catch(err => console.error('Błąd kopiowania:', err));
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}