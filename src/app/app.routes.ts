import { Routes } from '@angular/router';
import {HomeComponent} from './pages/home/home.component';
import {MovieDetailPageComponent} from './pages/movie-detail-page/movie-detail-page.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'movie/:id',
    component: MovieDetailPageComponent,
  },
];
