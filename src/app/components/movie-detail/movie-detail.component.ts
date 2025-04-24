import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {MovieService} from '../../services/movie.service';
import {Genre, Movie} from '../../models/movie.model';

@Component({
  selector: 'app-movie-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './movie-detail.component.html',
  styleUrl: './movie-detail.component.scss'
})
export class MovieDetailComponent implements OnInit {
  movie?: Movie;
  loading = true;
  error = false;

  constructor(
    private route: ActivatedRoute,
    private movieService: MovieService
  ) {
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadMovie(parseInt(id, 10));
      }
    });
  }

  loadMovie(id: number): void {
    this.loading = true;
    this.error = false;
    this.movieService.getMovieDetails(id).subscribe({
      next: (movie: Movie) => {
        this.movie = movie;
        this.loading = false;
      },
      error: (err: unknown) => {
        console.error('Error loading movie:', err);
        this.error = true;
        this.loading = false;
      }
    });
  }

  getPosterUrl(posterPath: string | null): string {
    if (posterPath) {
      return this.movieService.getImageUrl(posterPath);
    }
    return 'assets/images/no_photo.png';
  }

  getGenresList(genres: Genre[]): string {
    if (!genres || genres.length === 0) {
      return 'N/A';
    }
    return genres.map(genre => genre.name).join(', ');
  }
}
