import { Component, OnInit, Output, EventEmitter, Input, OnChanges } from '@angular/core';
import { WebDashboardService } from '../web-dashboard.service';
import { Router } from '@angular/router';
import { SearchService, UserProfileService } from '@srk/core';
import { LoggerService } from '@srk/core';
import { NotifyService } from '@srk/core';
import { MessageService } from '@srk/core';
import { ApplicationStorageService } from '@srk/core';

@Component({
  selector: 'app-saved-searches-table',
  template: `
  <div id="searchTableId" class="ui-g-12 ui-g-nopad search-table-title">
    <div id="headerTextId" class="ui-g-8 card-front-heading">
      {{'Saved Searches' | translate}}
    </div>
    <div id="headerButtonId" class="ui-g-4 margint5" align="right" *ngIf="isSavedSearchData && savedSearchData">
      <button id="searchViewAllId" pbutton class="custom-btnBorder"
        *ngIf="isSavedSearchData && savedSearchData.length > 0"
        (click)="viewSavedSearchPage()">{{'View All' | translate}}
      </button>
    </div>
  </div>
  <div id="noSavedDataId" class="ui-g-12 ui-g-nopad row-border-table row-entry" *ngIf="!isSavedSearchData">
    {{'Loading..' | translate}}
  </div>
  <div id="searchDataContainer" *ngIf="isSavedSearchData && savedSearchData">
    <div id="noSavedDataId" class="ui-g-12 ui-g-nopad row-border-table row-entry"
        *ngIf="savedSearchData.length === 0; else savedSearchDataLoading">
      {{'NO_SAVED_SEARCH' | translate}}
    </div>
    <ng-template #savedSearchDataLoading>
      <div id="{{data.created_on}}SavedDataId" class="ui-g-12 row-border-table"
        *ngFor="let data of savedSearchData | slice:0:5; let i=index">
        <div id="{{data.created_on}}DataContainer" class="ui-g-5 ui-g-nopad row-entry">
          <div id={{data.created_on}}Id class="ui-g-12 ui-g-nopad main-text-table">
            {{data.saved_search_name | translate}}
          </div>
          <div id={{data.created_on}}Id class="ui-g-12 ui-g-nopad date-table">
          {{data.created_on | customDate:'timeAMPM'}},
          {{data.created_on | customDate:'dateWithMonth'}}
          {{data.created_on | customDate:'year'}}
          </div>
        </div>
        <div id="{{data.created_on}}Container" class="ui-g-7 ui-g-nopad value-container">
          <div id="{{data.created_on}}CREATEDDATEContainer" class="ui-g-nopad"
          [ngClass]="{'ui-g-3': (isDaypActive && isBtbAvailable),'ui-g-4': ((isDaypActive && !isBtbAvailable) || (!isDaypActive && isBtbAvailable)), 'ui-g-6': (!isDaypActive && !isBtbAvailable) }">
            <div id="{{data.created_on}}Id" class="stone-box-table box-content-table">
              <a id="{{data.created_on}}TotalSavedStone" [dirStoreAudit]="'SAVE SEARCH NORMAL'"  *ngIf="data._id;else searchByName"
              (click)="getSavedStoneDetails(data._id, data.criteria,'all',data.count_details.count)">
                {{data.count_details.comparison_symbol}}{{data.count_details.total_count}}
              </a>
              <ng-template #searchByName> <a id="{{data.created_on}}TotalNameStone" [dirStoreAudit]="'SAVE SEARCH NORMAL'"
              (click)="getSavedStoneDetails(data.saved_search_name, data.criteria,'all',data.count_details.count)">
              {{data.count_details.comparison_symbol}}{{data.count_details.total_count}}</a></ng-template>
            </div>
            <div id={{data.created_on}}StonesId class="stone-bottom-content-table">
              <label id="{{data.created_on}}StoneTextId" class="stone-text">{{'Stones' | translate}}</label>
            </div>
          </div>
          <div id="{{data.created_on}}NewContainer" class="ui-g-nopad"
          [ngClass]="{'ui-g-3': (isDaypActive && isBtbAvailable),'ui-g-4': ((isDaypActive && !isBtbAvailable) || (!isDaypActive && isBtbAvailable)), 'ui-g-6': (!isDaypActive && !isBtbAvailable) }">
            <div id="{{data.created_on}}Id" class="new-box-table box-content-table">
              <a id="{{data.created_on}}NewStone" [dirStoreAudit]="'SAVE SEARCH NEW ARRIVAL'" *ngIf="data._id;else searchByNewName"
              (click)="getSavedStoneDetails(data._id, data.criteria,'new',data.count_details.newArrival)">
                {{data.count_details.newArrival}}
              </a>
              <ng-template #searchByNewName> <a id="{{data.created_on}}NewSavedStone" [dirStoreAudit]="'SAVE SEARCH NEW ARRIVAL'"
              (click)="getSavedStoneDetails(data.saved_search_name, data.criteria,'new,data.count_details.newArrival')">
              {{data.count_details.newArrival}}</a></ng-template>
            </div>
            <div id="{{data.created_on}}newId" class="new-bottom-content-table">
              <label id="{{data.created_on}}NewTextId">{{'New' | translate}}</label>
              <span class="new-arrival-label-legend"></span>
            </div>
          </div>
          <div id="{{data.created_on}}NewContainer" class="ui-g-nopad"
          [ngClass]="{'ui-g-3': (isDaypActive && isBtbAvailable),'ui-g-4': ((isDaypActive && !isBtbAvailable) || (!isDaypActive && isBtbAvailable)),
          'ui-g-6': (!isDaypActive && !isBtbAvailable) }"
          *ngIf="isBtbAvailable">
          <div id="{{data.created_on}}Id" class="new-box-table box-content-table">
            <a id="{{data.created_on}}BtbStone" [dirStoreAudit]="'SAVE SEARCH B2B'"  *ngIf="data._id;else searchByBtbName"
            (click)="getSavedStoneDetails(data._id, data.criteria,'b2b',data.count_details.b2b)">
              {{data.count_details.b2b}}
            </a>
            <ng-template #searchByBtbName> <a id="{{data.created_on}}BtbSavedStone" [dirStoreAudit]="'SAVE SEARCH B2B'"
            (click)="getSavedStoneDetails(data.saved_search_name, data.criteria,'b2b',data.count_details.b2b)">
            {{data.count_details.b2b}}</a></ng-template>
          </div>
          <div id="{{data.created_on}}newId" class="new-bottom-content-table">
            <label id="{{data.created_on}}BtbTextId">{{'B2B' | translate}}</label>
            <span class="b2b-label-legend"></span>
          </div>
        </div>
        <div id="{{data.created_on}}NewContainer" class="ui-g-nopad"
        [ngClass]="{'ui-g-3': (isDaypActive && isBtbAvailable),'ui-g-4': ((isDaypActive && !isBtbAvailable) || (!isDaypActive && isBtbAvailable)),
        'ui-g-6': (!isDaypActive && !isBtbAvailable) }"
        *ngIf="isDaypActive">
        <div id="{{data.created_on}}Id" class="new-box-table box-content-table">
          <a id="{{data.created_on}}DaypStone" [dirStoreAudit]="'SAVE SEARCH DAYP'" *ngIf="data._id;else searchByDaypName"
          (click)="getSavedStoneDetails(data._id, data.criteria,'dayp',data.count_details.dayp)">
            {{data.count_details.dayp}}
          </a>
          <ng-template #searchByDaypName> <a id="{{data.created_on}}DaypSavedStone" [dirStoreAudit]="'SAVE SEARCH DAYP'"
          (click)="getSavedStoneDetails(data.saved_search_name, data.criteria,'dayp',data.count_details.dayp)">
          {{data.count_details.dayp}}</a></ng-template>
        </div>
        <div id="{{data.created_on}}newId" class="new-bottom-content-table">
          <label id="{{data.created_on}}DaypTextId">{{'DAYP' | translate}}</label>
        </div>
      </div>
        </div>
      </div>
    </ng-template>
  </div>`,
  styleUrls: ['saved-searches-table.component.scss', 'primary-dashboard-layout.component.scss']
})
export class SavedSearchesTableComponent implements OnInit, OnChanges {

  @Input() isDaypActive = false;
  @Output() navigateSearch = new EventEmitter();
  @Output() navigateToResult = new EventEmitter();
  public savedSearchData = [];
  public isSavedSearchData = false;
  public isBtbAvailable = false;

  constructor(
    private userProfileService: UserProfileService,
    private webDashboardService: WebDashboardService,
    private searchService: SearchService,
    private router: Router,
    private notify: NotifyService,
    private logger: LoggerService,
    private messageService: MessageService,
    private appStore: ApplicationStorageService) { }

  ngOnInit() {
    this.searchService.getDetailedSavedSearchList().subscribe(res => {
      if (res !== undefined) {
        this.isBtbAvailable = this.userProfileService.checkBTBVersion();
        this.isSavedSearchData = true;
        this.savedSearchData = this.searchService.sortByDateTime(res);
        this.isBtbAvailable = this.userProfileService.checkBTBVersion();
      }
    }, error => {
      this.logger.logError('SavedSearchesTableComponent', 'End:- Error in receiving Saved Search List');
    });
  }

  ngOnChanges() { }

  viewSavedSearchPage() {
    const link = ['/web/search/saved-search'];
    this.router.navigate(link);
  }

  getSavedStoneDetails(name, criteria, btnType, count) {
    if (count > 0) {
      this.notify.showBlockUI({ 'message': 'PLEASE_WAIT' });
      this.searchService.getSavedStonesList(name, criteria, btnType).subscribe(res => {
        this.notify.hideBlockUI();
        if (!res.error_status && res.data.body && res.data.body.length > 0) {
          if (btnType === 'dayp') {
            const daypSearchObject = {
              result: this.searchService.getSearchResultData(),
              searchConfig: this.searchService.getSearchConfigData(),
              selectedSearchValue: this.searchService.getSelectedFiltersValue()
            };
            this.appStore.store('DAYP-Saved-Search', daypSearchObject);
            this.navigateToResult.emit({ link: '/web/dayp/' });
          } else if (btnType === 'b2b') {
            const btbSearchObject = {
              result: this.searchService.getSearchResultData(),
              searchConfig: this.searchService.getSearchConfigData(),
              selectedSearchValue: this.searchService.getSelectedFiltersValue()
            };
            this.appStore.store('B2B-Saved-Search', btbSearchObject);
            this.navigateToResult.emit({ link: '/web/bid-to-buy' });
          } else {
            this.navigateSearch.emit({ status: true });
          }
        } else {
          this.navigateSearch.emit({ status: false });
        }
      }, error => {
        this.notify.hideBlockUI();
        this.messageService.showErrorGrowlMessage('SERVER_ERROR_OCCURRED');
      });
    } else {
      this.messageService.showErrorGrowlMessage('Sorry! No data found');
    }
  }

}
