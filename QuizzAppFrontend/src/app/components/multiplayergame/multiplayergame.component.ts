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
  connectionStatus = 'disconnected';
  selectedAnswer: any = null;
  isAnswerSelected = false;
  currentScore = 0;
  playerId: string | null = null;
  isSubmitting = false;
  isJoining = false;
  errorMessage = '';
  gameLink = '';
  isHost = false;
  viewState: 'init' | 'gameCreated' | 'nameInput' | 'inGame' = 'init';
  isPlayerReady = false;
  playerCompleted = false;
  currentQuestionIndex = -1;
  questionStatuses: Array<'unanswered' | 'correct' | 'incorrect'> = [];
  allPlayersReady = false;
  playerStatus: 'playing' | 'completed' = 'playing';
  expandedPlayers: { [playerId: string]: boolean } = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private signalrService: SignalrService,
    private quizService: QuizService
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.gameId = params['gameId'] || null;
      this.updateViewState();
    });

    this.route.queryParams.subscribe(params => {
      this.quizId = Number(params['quizId']);
      this.isHost = params['host'] === 'true';
      this.updateViewState();
    });

    const connectionTimeout = setTimeout(() => {
      if (this.connectionStatus === 'disconnected') {
        this.errorMessage = 'Błąd połączenia z serwerem. Odśwież stronę.';
      }
    }, 10000);

    this.subscriptions.push(
      this.signalrService.connectionStatus$.subscribe(status => {
        if (status === 'connected') {
          clearTimeout(connectionTimeout);
        }
        this.connectionStatus = status;
      })
    );
  }

  private updateViewState() {
    if (this.gameId) {
      this.gameLink = `${window.location.origin}/multiplayer/${this.gameId}`;
      if (this.isHost) {
        this.viewState = 'gameCreated';
      } else {
        this.viewState = 'nameInput';
      }
    } else {
      this.viewState = 'init';
    }
  }

  createGame() {
    if (!this.quizId) {
      this.errorMessage = 'Brak identyfikatora quizu.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    this.signalrService.createGame(this.quizId)
      .then(gameId => {
        this.gameId = gameId;
        this.gameLink = `${window.location.origin}/multiplayer/${gameId}`;
        this.isSubmitting = false;
        this.router.navigate(['/multiplayer', gameId], {
          queryParams: { quizId: this.quizId, host: true },
          queryParamsHandling: 'merge'
        });
      })
      .catch(err => {
        this.isSubmitting = false;
        this.errorMessage = 'Nie udało się utworzyć gry: ' + (err.error || 'Serwer nie odpowiada');
        console.error('Błąd tworzenia gry:', err);
      });
  }

  joinGame(playerName: string) {
    this.isJoining = true;
    this.errorMessage = '';

    if (!playerName.trim()) {
      this.errorMessage = 'Nazwa użytkownika nie może być pusta';
      this.isJoining = false;
      return;
    }

    if (!this.gameId) {
      this.errorMessage = 'Brak identyfikatora gry';
      this.isJoining = false;
      return;
    }

    this.playerName = playerName;

    this.setupSignalrSubscriptions();

    this.signalrService.joinGame(this.gameId, playerName, this.isHost)
      .then(playerId => {
        this.playerId = playerId;
        this.isJoining = false;
        this.viewState = 'inGame';
      })
      .catch(err => {
        this.isJoining = false;
        this.errorMessage = 'Nie udało się dołączyć do gry: ' + (err.error || 'Serwer nie odpowiada');
        console.error('Błąd dołączania do gry:', err);
      });
  }

  private setupSignalrSubscriptions() {
    this.subscriptions.push(
      this.signalrService.playerCompleted$.subscribe((playerId: string) => {
        const player = this.players.find(p => p.id === playerId);
        if (player) {
          player.completed = true;
        }
        
        if (playerId === this.playerId) {
          this.playerCompleted = true;
          this.playerStatus = 'completed';
        }
      })
    );

    this.subscriptions.push(
      this.signalrService.playerJoined$.subscribe(players => {
        this.players = players;
        this.checkAllPlayersReady();
      })
    );

    this.subscriptions.push(
      this.signalrService.nextQuestion$.subscribe(question => {
        this.currentQuestion = question;
        this.gameStatus = 'in-progress';
        this.selectedAnswer = null;
        this.isAnswerSelected = false;
        this.isPlayerReady = false;
        this.playerStatus = 'playing';
        
        this.currentQuestionIndex++;
        
        if (this.currentQuestionIndex === 0) {
          this.questionStatuses = Array(10).fill('unanswered');
        }
      })
    );

    this.subscriptions.push(
      this.signalrService.answerProcessed$.subscribe(result => {
        if (result.playerId === this.playerId) {
          const status = result.isCorrect ? 'correct' : 'incorrect';
          this.questionStatuses[this.currentQuestionIndex] = status;
          
          if (result.isCorrect) {
            this.currentScore++;
          }
        }
      })
    );

    this.subscriptions.push(
      this.signalrService.gameCompleted$.subscribe(results => {
        this.gameStatus = 'completed';
        this.playerCompleted = true;
        this.playerStatus = 'completed';
        this.players = results
          .map((r: any) => ({
            id: r.playerId,
            name: r.playerName,
            score: r.score,
            answers: r.answers
          }))
          .sort((a, b) => b.score - a.score);
      })
    );

    this.subscriptions.push(
      this.signalrService.gameError$.subscribe(error => {
        this.errorMessage = error;
      })
    );

    this.subscriptions.push(
      this.signalrService.playerReady$.subscribe((playerId) => {
        const player = this.players.find(p => p.id === playerId);
        if (player) {
          player.isReady = true;
        }
        this.checkAllPlayersReady();
      })
    );
  }

  private checkAllPlayersReady() {
    if (this.players.length >= 2) {
      this.allPlayersReady = this.players.filter(p => p.isReady).length >= 2;
    }
  }

  markPlayerReady() {
    if (!this.gameId) return;
    this.isPlayerReady = true;
    this.signalrService.sendPlayerReady(this.gameId);
  }

  getConnectionStatusText(): string {
    switch (this.connectionStatus) {
      case 'connected': return 'Połączono';
      case 'connecting': return 'Łączenie...';
      case 'disconnected': return 'Rozłączono';
      default: return this.connectionStatus;
    }
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

  copyGameLink() {
    if (!this.gameLink && this.gameId) {
      this.gameLink = `${window.location.origin}/multiplayer/${this.gameId}`;
    }

    navigator.clipboard.writeText(this.gameLink)
      .then(() => alert('Link skopiowany do schowka!'))
      .catch(err => {
        this.errorMessage = 'Błąd kopiowania linku';
        console.error('Błąd kopiowania:', err);
      });
  }

  togglePlayerAnswers(playerId: string): void {
    this.expandedPlayers[playerId] = !this.expandedPlayers[playerId];
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}