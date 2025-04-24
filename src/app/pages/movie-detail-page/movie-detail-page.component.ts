import { Component } from '@angular/core';
import { MovieDetailComponent } from '../../components/movie-detail/movie-detail.component';

@Component({
  selector: 'app-movie-detail-page',
  standalone: true,
  imports: [MovieDetailComponent],
  template: `
    <div class="movie-detail-page">
      <app-movie-detail></app-movie-detail>
    </div>
  `,
  styles: `
    .movie-detail-page {
      min-height: 100vh;
      background-color: #141414;
    }
  `
})
export class MovieDetailPageComponent {

}
