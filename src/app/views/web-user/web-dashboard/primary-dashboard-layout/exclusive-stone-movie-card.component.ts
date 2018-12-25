import { Component, OnInit, Output, EventEmitter, Input, OnChanges } from '@angular/core';
import { SearchService, MessageService, NotifyService } from '@srk/core';

@Component({
    selector: 'app-exclusive-stone-movie-card',
    templateUrl: 'exclusive-stone-movie-card.component.html',
    styleUrls: ['exclusive-stone-movie-card.component.scss', 'primary-dashboard-layout.component.scss']
})
export class ExclusiveStoneMovieCardComponent implements OnInit, OnChanges {

    @Input() fetchStoneDetails;
    @Input() stoneID;
    @Output() navigateSearch = new EventEmitter();
    public showLoder = true;
    public slideIndex = 1;
    public showStoneInfo: boolean = false;

    constructor(
        private searchService: SearchService,
        private messageService: MessageService,
        private notify: NotifyService,
    ) { }

    ngOnInit() {
    }

    ngOnChanges() {
        this.showLoder = true;
        if (this.fetchStoneDetails) {
            this.showLoder = false;
        }
    }

    stoneInfo() {
        this.showStoneInfo = !this.showStoneInfo;
    }

    videoReverseNavigation(n) {
        n = (n === 1) ? this.fetchStoneDetails.length : (n -= 1);
        this.slideIndex = n;
    }

    videoForwardNavigation(n) {
        n = (n < this.fetchStoneDetails.length && n > 0) ? (n += 1) : (n = 1);
        this.slideIndex = n;
    }

    showExclusiveStoneDetail() {
        this.notify.showBlockUI({ 'message': 'PLEASE_WAIT' });
        this.searchService.fetchExclusiveStoneDetails(this.stoneID).subscribe(response => {
            this.notify.hideBlockUI();
            if (!response.error_status && response.code === 'ELS#200') {
                this.searchService.setCardFlag({ fullName: 'Exclusive', smallName: 'E' });
                this.navigateSearch.emit({ status: true });
            }
        }, error => {
            this.notify.hideBlockUI();
            this.messageService.showErrorGrowlMessage('SERVER_ERROR_OCCURRED');
        });
    }
}