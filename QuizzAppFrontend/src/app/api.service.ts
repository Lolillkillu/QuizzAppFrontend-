import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://localhost:5027'; // adres backend 

  constructor(private http: HttpClient) { }

  getProducts(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/products`);
  }
}
