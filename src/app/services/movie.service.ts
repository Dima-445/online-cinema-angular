import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Observable, catchError, tap } from 'rxjs';
import { Movie, TMDBResponse } from '../models/movie.model';

@Injectable({
  providedIn: 'root'
})
export class MovieService {
  private readonly apiUrl = 'https://api.themoviedb.org/3';
  private readonly apiKey = 'b1c506de03e03b3b4963b7f86b11a573';
  private readonly accessToken = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiMWM1MDZkZTAzZTAzYjNiNDk2M2I3Zjg2YjExYTU3MyIsIm5iZiI6MTc0NTI1MzY5Ny45MzUwMDAyLCJzdWIiOiI2ODA2NzU0MTNmODg4NTRjNDllZTZlZGMiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.YtRqnKJYYLxrzm6jWLTDbVuS7qZ7NoB8paGOZRRW404';

  private readonly imageBaseUrl = 'https://image.tmdb.org/t/p/';

  // Создаем сигналы для хранения состояния
  movies = signal<Movie[]>([]);
  searchResults = signal<Movie[]>([]);
  isLoading = signal<boolean>(false);
  isSearching = signal<boolean>(false);
  error = signal<string | null>(null);
  currentPage = signal<number>(1);
  isLoadingMore = signal<boolean>(false);

  constructor(private http: HttpClient) { }

  fetchPopularMovies(page: number = 1): void {
    this.isLoading.set(true);
    this.error.set(null);
    this.currentPage.set(page);

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json'
    });

    this.http.get<TMDBResponse>(`${this.apiUrl}/movie/popular?page=${page}`, { headers })
      .pipe(
        tap(response => {
          this.movies.set(response.results);
          this.isLoading.set(false);
        }),
        catchError(err => {
          console.error('Ошибка при загрузке фильмов:', err);
          this.error.set('Не удалось загрузить фильмы. Пожалуйста, попробуйте позже.');
          this.isLoading.set(false);
          throw err;
        })
      )
      .subscribe();
  }

  loadMoreMovies(): Observable<TMDBResponse> {
    const nextPage = this.currentPage() + 1;
    this.isLoadingMore.set(true);

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json'
    });

    return this.http.get<TMDBResponse>(`${this.apiUrl}/movie/popular?page=${nextPage}`, { headers })
      .pipe(
        tap(response => {
          // Добавляем новые фильмы к существующим
          const currentMovies = this.movies();
          this.movies.set([...currentMovies, ...response.results]);
          this.currentPage.set(nextPage);
          this.isLoadingMore.set(false);
        }),
        catchError(err => {
          console.error('Ошибка при загрузке дополнительных фильмов:', err);
          this.error.set('Не удалось загрузить дополнительные фильмы. Пожалуйста, попробуйте позже.');
          this.isLoadingMore.set(false);
          throw err;
        })
      );
  }

  searchMovies(query: string): void {
    if (!query.trim()) {
      this.searchResults.set([]);
      return;
    }

    this.isSearching.set(true);
    this.error.set(null);

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json'
    });

    this.http.get<TMDBResponse>(`${this.apiUrl}/search/movie?query=${encodeURIComponent(query)}`, { headers })
      .pipe(
        tap(response => {
          this.searchResults.set(response.results);
          this.isSearching.set(false);
        }),
        catchError(err => {
          console.error('Ошибка при поиске фильмов:', err);
          this.error.set('Не удалось найти фильмы. Пожалуйста, попробуйте позже.');
          this.isSearching.set(false);
          throw err;
        })
      )
      .subscribe();
  }


  getMovieDetails(id: number): Observable<Movie> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json'
    });

    return this.http.get<Movie>(`${this.apiUrl}/movie/${id}`, { headers });
  }

  getImageUrl(path: string, size: string = 'w500'): string {
    if (!path) {
      return 'assets/images/movie-banner.jpg';
    }
    return `${this.imageBaseUrl}${size}${path}`;
  }
}
