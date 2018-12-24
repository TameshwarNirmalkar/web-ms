import { Component, OnInit, ViewChild, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from '@srk/core';
import { NotifyService } from '@srk/core';
import { MessageCodes, MessageCodesComparator } from '@srk/core';
import { ApplicationDataService } from '@srk/core';
import { SearchService } from '@srk/core';
import { ApplicationStorageService, CustomTranslateService } from '@srk/core';

@Component({
  selector: 'thm-page-search',
  templateUrl: './thm-page-search.component.html',
  styleUrls: ['./thm-page-search.component.scss']
})
export class ThmPageSearchComponent implements OnInit,OnChanges {
  @ViewChild('searchField') searchField: any;
  @Input() searchType: any;
  @Input() eventCode: any;
  @Input() clearGolableSearch: boolean;
  @Output() pageSearchResult = new EventEmitter();
  public searchForm: FormGroup;
  public isSearchFieldSelected = false;
  public searchName: any;
  public showBox = true;
  public placeHolderText:any;
  public globalStoneId : any;
  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    public messageSvc: MessageService,
    private appDataSvc: ApplicationDataService,
    private notify: NotifyService,
    private appStore: ApplicationStorageService,
    private searchSvc: SearchService,
  private customTranslateSvc: CustomTranslateService) { }

  ngOnInit() {
    this.searchForm = this.formBuilder.group({
      search_value: ['', Validators.required]
    });
    if (this.searchType === "B2B_SEARCH") {
      this.searchName = "B2B Stone Search";
      this.placeHolderText=this.customTranslateSvc.translateString('Search B2B Stone ID');
      this.placeHolderText.trans
    } else if (this.searchType === "DAYP_SEARCH") {
      this.placeHolderText=this.customTranslateSvc.translateString('Search DAYP Stone ID');
      this.searchName = "DAYP Stone Search";
    } else if (this.searchType === "EVENT_SEARCH") {
      this.placeHolderText=this.customTranslateSvc.translateString('Search Event Stone ID');
      this.searchName = "Event Search";
    }
    this.globalStoneId = this.appStore.getData('Page_Global_Search');
  }

  ngOnChanges(){
    if(this.clearGolableSearch){
      this.globalStoneId = "";
    }
  }

  onSubmit(value) {
    this.checkValidInput(value.search_value);
    this.appStore.store('Page_Global_Search',value.search_value);
  }

  pageSearch(value) {
    this.appStore.store('Page_Global_Search',value);
    this.isSearchFieldSelected = true;
    this.checkValidInput(value);
  }

  checkValidInput(value) {
    if (value !== '' && value !== null && this.isSearchFieldSelected) {
      const searchArray = this.searchSvc.initializeSearchValues(value);
      this.searchField.nativeElement.blur();
      this.isSearchFieldSelected = false;
      this.createSearchInPage(searchArray);
    } else {
      this.messageSvc.showErrorGrowlMessage('ENTER_VALID_STONEID');
    }
  }

  createSearchInPage(searchArray) {
    const searchCount = this.searchSvc.checkResultCount(this.appStore.getData('resultArray'));
    if (searchCount < this.appDataSvc.getSearchResultLimit()) {
      this.notify.showBlockUI({ 'message': 'PLEASE_WAIT' });
      this.searchSvc.getSearchInPage(searchArray, this.searchType, this.eventCode).subscribe((response) => {
        this.notify.hideBlockUI();
        if (response && !response.error_status) {
          if (response.data && response.data.body && response.data.body.length > 0) {
            this.pageSearchResult.emit({ isResult: true });
          } else {
            this.pageSearchResult.emit({ isResult: false });
          }
        } else {
          this.pageSearchResult.emit({ isResult: false });
        }
      }, error => {
        this.notify.hideBlockUI();
        this.messageSvc.showErrorGrowlMessage('SERVER_ERROR_OCCURRED');
      });
    } else {
      this.messageSvc.showErrorGrowlMessage('ERR_REACHED_SEARCH_TAB_LIMIT');
    }
  }

  onFocus() {
    this.isSearchFieldSelected = true;
  }

}
