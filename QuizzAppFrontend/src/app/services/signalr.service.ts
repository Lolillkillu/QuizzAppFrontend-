import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SignalrService {
  private hubConnection: signalR.HubConnection;
  
  public connectionStatus$ = new BehaviorSubject<string>('disconnected');
  public gameCreated$ = new Subject<string>();
  public playerJoined$ = new Subject<any[]>();
  public nextQuestion$ = new Subject<any>();
  public answerProcessed$ = new Subject<{playerId: string, isCorrect: boolean}>();
  public gameCompleted$ = new Subject<any[]>();
  public gameError$ = new Subject<string>();

  constructor() {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:7039/gamehub')
      .configureLogging(signalR.LogLevel.Information)
      .build();

    this.startConnection();
    this.registerHandlers();
  }

  private startConnection(): void {
    this.hubConnection.start()
      .then(() => {
        console.log('Połączono z hubem');
        this.connectionStatus$.next('connected');
      })
      .catch(err => {
        console.error('Błąd połączenia: ', err);
        this.connectionStatus$.next('error');
        setTimeout(() => this.startConnection(), 5000);
      });
  }

  private registerHandlers(): void {
    this.hubConnection.on('GameCreated', (gameId: string) => {
      this.gameCreated$.next(gameId);
    });

    this.hubConnection.on('PlayerJoined', (players: any[]) => {
      this.playerJoined$.next(players);
    });

    this.hubConnection.on('NextQuestion', (question: any) => {
      this.nextQuestion$.next(question);
    });

    this.hubConnection.on('AnswerProcessed', (playerId: string, isCorrect: boolean) => {
      this.answerProcessed$.next({ playerId, isCorrect });
    });

    this.hubConnection.on('GameCompleted', (results: any) => {
      this.gameCompleted$.next(results);
    });

    this.hubConnection.on('GameError', (error: string) => {
      this.gameError$.next(error);
    });
  }

  public createGame(playerName: string): Promise<string> {
    return this.hubConnection.invoke('CreateGame', playerName);
  }

  public joinGame(gameId: string, playerName: string): Promise<boolean> {
    return this.hubConnection.invoke('JoinGame', gameId, playerName);
  }

  public submitAnswer(gameId: string, questionId: number, answerId: number): void {
    this.hubConnection.send('SubmitAnswer', gameId, questionId, answerId);
  }
}