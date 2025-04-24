import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MovieComponent} from '../movie/movie.component';
import {HttpClientModule} from '@angular/common/http';
import {MovieService} from '../../services/movie.service';
import {FormsModule} from '@angular/forms';
import {debounceTime, distinctUntilChanged, Subject} from 'rxjs';

import {register} from 'swiper/element/bundle';
import {SwiperOptions} from 'swiper/types';

@Component({
  selector: 'app-movie-list',
  standalone: true,
  imports: [CommonModule, MovieComponent, HttpClientModule, FormsModule],
  templateUrl: './movie-list.component.html',
  styleUrl: './movie-list.component.scss',
  encapsulation: ViewEncapsulation.None,
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class MovieListComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('swiper') swiperElRef!: ElementRef;

  get movies() {
    return this.movieService.movies();
  }


  get searchResults() {
    return this.movieService.searchResults();
  }

  get isLoading() {
    return this.movieService.isLoading();
  }

  get isSearching() {
    return this.movieService.isSearching();
  }

  get error() {
    return this.movieService.error();
  }

  get isLoadingMore() {
    return this.movieService.isLoadingMore();
  }

  searchQuery: string = '';
  private searchTerms = new Subject<string>();
  carouselVisible: boolean = false;

  swiperConfig: SwiperOptions = {
    slidesPerView: 6,
    spaceBetween: 20,
    navigation: true,
    breakpoints: {
      0: {
        slidesPerView: 2,
        spaceBetween: 10,
      },
      768: {
        slidesPerView: 3,
        spaceBetween: 15,
      },
      1024: {
        slidesPerView: 4,
        spaceBetween: 15,
      },
      1920: {
        slidesPerView: 6,
        spaceBetween: 20,
      },
    },
  };

  constructor(
    public movieService: MovieService,
    private cdr: ChangeDetectorRef
  ) {
    register();
  }

  ngOnInit(): void {
    this.movieService.fetchPopularMovies();

    this.searchTerms.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => {
      this.performSearch(term);
    });
  }

  loadMoreMovies(): void {
    if (!this.swiperElRef?.nativeElement?.swiper) return;

    const loadMoreButtonIndex = this.movies.length;

    const swiper = this.swiperElRef.nativeElement.swiper;
    const originalAllowTouchMove = swiper.allowTouchMove;
    swiper.allowTouchMove = false;

    this.movieService.loadMoreMovies().subscribe({
      next: () => {
        setTimeout(() => {
          swiper.slideTo(loadMoreButtonIndex, 0, false);

          swiper.update();

          swiper.allowTouchMove = originalAllowTouchMove;

          this.cdr.detectChanges();
        }, 100);
      },
      error: (err) => {
        console.error('Ошибка при загрузке новых фильмов:', err);
        swiper.allowTouchMove = originalAllowTouchMove;
      }
    });
  }

  ngAfterViewInit(): void {
    this.initSwiper();
  }

  private initSwiper(): void {
    if (!this.swiperElRef || !this.swiperElRef.nativeElement) {
      console.error('Swiper элемент не найден');
      return;
    }

    this.carouselVisible = false;
    this.cdr.detectChanges();

    const swiperEl = this.swiperElRef.nativeElement;

    Object.assign(swiperEl, this.swiperConfig);

    if (typeof swiperEl.initialize === 'function') {
      swiperEl.initialize();
    } else {
      swiperEl.swiper?.init();
    }

    swiperEl.addEventListener('swiper:init', () => {
      this.carouselVisible = true;
      this.cdr.detectChanges();
    });

    setTimeout(() => {
      if (!this.carouselVisible) {
        this.carouselVisible = true;
        this.cdr.detectChanges();
      }
    }, 200);
  }

  onSearchInput(term: string): void {
    this.searchTerms.next(term);
  }

  performSearch(term: string): void {
    this.movieService.searchMovies(term);
  }

  ngOnDestroy(): void {
    this.searchTerms.complete();

    if (this.swiperElRef?.nativeElement?.swiper) {
      this.swiperElRef.nativeElement.swiper.destroy(true, true);
    }
  }
}

