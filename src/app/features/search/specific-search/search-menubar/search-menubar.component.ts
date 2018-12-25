import { Component, OnInit, Input, OnDestroy, Output, EventEmitter, HostListener } from '@angular/core';
import { OrderByPipe } from '../order-by.pipe';
import { Subscription } from 'rxjs/Subscription';
import { NotifyService } from '@srk/core';
import 'jquery';

declare var jQuery: any;

@Component({
  selector: 'app-search-menubar',
  templateUrl: './search-menubar.component.html',
  styleUrls: ['./search-menubar.component.scss']
})
export class SearchMenubarComponent implements OnInit, OnDestroy {

  @Output() filterSelected = new EventEmitter();
  @Input() menuList: any[];
  private subscription: Subscription;
  private currentScroll: Number;
  private menuDistanceFromTop: Number;

  constructor(private notifyService: NotifyService) { }

  ngOnInit() {
    this.observeForCarouselResize();

    // Changes For Menu
    this.menuDistanceFromTop = jQuery('#search-carousel-container').offset().top > 0 ? jQuery('#search-carousel-container').offset().top : 0;

  }

  @HostListener('window:scroll', [])
  @HostListener('window:resize', ['$event'])

  onWindowScroll() {

    this.currentScroll = window.scrollY;
    const containerWidth = $('#search-carousel-container').outerWidth();
    this.menuDistanceFromTop = jQuery('#search-carousel-container').offset().top > 0 ? jQuery('#search-carousel-container').offset().top : 0;
    if (this.currentScroll > this.menuDistanceFromTop) {
      jQuery('#searchFilterMenuBox').addClass('stuck').innerWidth(containerWidth).css('padding-top', '0');
    } else {
      jQuery('#searchFilterMenuBox').removeClass('stuck').innerWidth(containerWidth).css('padding-top', '10px');
    }

  }

  onWindowResize() {

    // Trigger the scroll Handler so the menu does not look
    // malformed when window is re-sized.
    this.onWindowScroll();

  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  scrollToFilter(filter) {
    this.filterSelected.emit(filter);
  }

  observeForCarouselResize() {
    this.subscription = this.notifyService.notifyMenuToggleObservable$.subscribe((res) => {
      if (res.hasOwnProperty('component')) {
        this.refreshCarouselData();
      }
    });
  }

  refreshCarouselData() {
    const $carousel = $('.owl-carousel');
    const carsouselData = $carousel.data('owl.carousel');
    if (carsouselData !== undefined) {
      carsouselData._invalidated.width = true;
      setTimeout(() => {
        $carousel.trigger('refresh.owl.carousel');
      }, 300);
    }
  }
}
