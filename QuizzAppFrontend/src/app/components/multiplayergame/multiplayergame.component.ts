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
  connectionStatus = 'disconnected';
  selectedAnswer: any = null;
  isAnswerSelected = false;
  currentScore = 0;
  playerId: string | null = null;
  isSubmitting = false;
  errorMessage = '';
  gameLink = '';
  isHost = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private signalrService: SignalrService,
    private quizService: QuizService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.gameId = params['gameId'] || null;
      // Określ czy użytkownik jest hostem (twórcą gry)
      this.isHost = !this.gameId;
    });

    this.route.queryParams.subscribe(params => {
      this.quizId = Number(params['quizId']);
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

  submitPlayerName(playerName: string) {
    if (!this.quizId && !this.gameId) {
      this.errorMessage = 'Brak identyfikatora quizu.';
      return;
    }
    
    if (this.connectionStatus !== 'connected') {
      this.errorMessage = 'Brak połączenia z serwerem. Poczekaj na połączenie.';
      return;
    }

    if (!playerName.trim()) {
      this.errorMessage = 'Nazwa użytkownika nie może być pusta';
      return;
    }

    this.playerName = playerName;
    this.isSubmitting = true;
    this.errorMessage = '';

    if (this.gameId) {
      this.joinExistingGame(playerName);
    } else if (this.quizId) {
      this.createNewGame(playerName);
    }

    this.setupSignalrSubscriptions();
  }

  private joinExistingGame(playerName: string) {
    this.signalrService.joinGame(this.gameId!, playerName, false)
      .then(playerId => {
        this.playerId = playerId;
        this.isSubmitting = false;
        this.showNameInput = false;
      })
      .catch(err => {
        this.isSubmitting = false;
        this.errorMessage = 'Nie udało się dołączyć do gry: ' + (err.error || 'Serwer nie odpowiada');
        console.error('Błąd dołączania do gry:', err);
        this.showNameInput = true;
      });
  }

  private createNewGame(playerName: string) {
    this.signalrService.createGame(this.quizId!)
      .then(gameId => {
        this.gameId = gameId;
        this.gameLink = `${window.location.origin}/multiplayer/${gameId}`;
        
        // Po utworzeniu gry, host dołącza do niej
        return this.signalrService.joinGame(gameId, playerName, true);
      })
      .then(playerId => {
        this.playerId = playerId;
        this.showNameInput = false;
        this.isSubmitting = false;

        // Aktualizujemy URL, aby zawierał gameId
        this.router.navigate(['/multiplayer', this.gameId], {
          queryParamsHandling: 'preserve'
        });
      })
      .catch(err => {
        this.isSubmitting = false;
        this.errorMessage = 'Nie udało się utworzyć gry: ' + (err.error || 'Serwer nie odpowiada');
        console.error('Błąd tworzenia gry:', err);
      });
  }

  private setupSignalrSubscriptions() {
    this.subscriptions.push(
      this.signalrService.playerJoined$.subscribe(players => {
        this.players = players;
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
      }),

      this.signalrService.gameError$.subscribe(error => {
        this.errorMessage = error;
      }),

      this.signalrService.quizIdSet$.subscribe(() => {
        if (this.gameId) {
          this.signalrService.startGame(this.gameId);
        }
      })
    );
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

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}