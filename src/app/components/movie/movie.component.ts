import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Movie } from '../../models/movie.model';
import { MovieService } from '../../services/movie.service';

@Component({
  selector: 'app-movie',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './movie.component.html',
  styleUrl: './movie.component.scss'
})
export class MovieComponent {
  @Input() movie!: Movie;

  constructor(private movieService: MovieService) {}

  getPosterUrl(posterPath: string | null): string {
    if (posterPath) {
      return this.movieService.getImageUrl(posterPath);
    }
    return 'assets/images/no_photo.png';
  }

  formatRating(rating: number | undefined): string {
    if (rating !== undefined && rating !== null) {
      return rating.toFixed(1);
    }
    return '0.0';
  }
}
