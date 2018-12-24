import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService, SearchService, NotifyService, EventDetailsService,
  ApplicationStorageService,  ApplicationAuditService
} from '@srk/core';



@Component({
  selector: 'thm-card',
  templateUrl: './thm-card.component.html',
  styleUrls: ['./thm-card.component.scss']
})
export class ThmCardComponent implements OnInit {

  @Input() cardData: any;
  @Output() redirectLink = new EventEmitter();
  public cardMainNavigationTable: any;
  public cardLeftNavigationTable: any;
  public cardRightNavigationTable: any;

  constructor(
    private messageService: MessageService,
    private searchService: SearchService,
    private notify: NotifyService,
    private eventDetailsService: EventDetailsService,
    private route: Router,
    private appStore: ApplicationStorageService,
    private auditService: ApplicationAuditService) { }

  ngOnInit() {
    this.cardMainNavigationTable = {
      '2': (cardInfo) => { this.createDaypUrlParam(cardInfo); },
      '6': (cardInfo) => { this.createEventUrl(cardInfo.mainDisplayText, 'show-stock'); },
      '7': (cardInfo) => { this.getUploadedStones(cardInfo); },
      '8': () => { this.getRecommendedStoneInfo('total_stones'); },
    };
    this.cardLeftNavigationTable = {
      '2': (cardInfo) => { this.createLeftDaypUrlParam(cardInfo); },
      '8': (cardInfo) => { this.getRecommendedStoneInfo('twin_stones'); },
      '6': (cardInfo) => { this.createEventUrl(cardInfo.mainDisplayText, 'pre-selection'); },
    };
    this.cardRightNavigationTable = {
      '2': (cardInfo) => { this.createRightDaypUrlParam(cardInfo); },
      '8': (cardInfo) => { this.getRecommendedStoneInfo('newly_arrival'); },
    };
  }

  navigateTo(cardData) {
    const cardInfo = cardData;
    const cardValue = parseInt(cardInfo.mainDisplayValue, 10);
    const card_name = cardData.mainDisplayText;
    switch (card_name) {
      case 'Uploaded Stones': {
        this.auditService.storeActionAudit('CARD NEW ARRIVAL');
        break;
      }
      case 'Bid to Buy Stones': {
        this.auditService.storeActionAudit('CARD B2B');
        break;
      }
      case 'My Basket Stones': {
        this.auditService.storeActionAudit('CARD MY BASKET');
        break;
      }
      case 'My View Requested': {
        this.auditService.storeActionAudit('CARD VR');
        break;
      }
      case 'DDC Diamond Stones': {
        this.auditService.storeActionAudit('CARD DDC');
        break;
      }
      case 'DAYP Stones': {
        this.auditService.storeActionAudit('CARD DAYP');
        break;
      }
      case 'Recommended Stones': {
        this.auditService.storeActionAudit('CARD RECOMMENDED');
        break;
      }
      case 'Show Card Stones': {
        this.auditService.storeActionAudit('CARD EVENT');
        break;
      }
      default: break;
    }
    if (cardValue > 0) {
      const cardId = cardInfo.cardId;
      if (this.cardMainNavigationTable.hasOwnProperty(cardId)) {
        this.cardMainNavigationTable[cardInfo.cardId](cardInfo);
      } else {
        this.redirectLink.emit({ link: cardInfo.mainDisplayAction });
      }
    } else {
      this.messageService.showErrorGrowlMessage('NO_RESULT_DISPLAY');
    }
  }

  getUploadedStones(cardInfo) {
    this.auditService.storeActivityAudit('NewArrival');
    this.notify.showBlockUI({ 'message': 'PLEASE_WAIT' });
    this.searchService.getNewUploadedStones().subscribe(res => {
      if (!res.error_status && res.data && res.data.body && res.data.body.length > 0) {
        this.searchService.setCardFlag({ fullName: 'Uploaded', smallName: 'U' });
        this.navigateToSearchResult();
      } else {
        this.notify.hideBlockUI();
        this.messageService.showErrorGrowlMessage('NO_RESULT_DISPLAY');
      }
    }, error => {
      this.notify.hideBlockUI();
      this.messageService.showErrorGrowlMessage('SERVER_ERROR_OCCURRED');
    });
  }

  navigateToSearchResult() {
    let count = 1;
    if (this.appStore.getData('GENERAL_SEARCH:count')) {
      count = this.appStore.getData('GENERAL_SEARCH:count');
      count++;
    }
    this.appStore.store('GENERAL_SEARCH:count', count);
    this.notify.hideBlockUI();
    this.route.navigate(['/web/search/search-result']);
  }

  createEventUrl(eventName, redirectTo) {
    const eventsList = this.eventDetailsService.getEventInfo();
    eventsList.forEach(event => {
      if (eventName === event.event_name) {
        this.eventDetailsService.setTabToBeOpen(redirectTo);
        this.redirectLink.emit({ link: '/web/event/' + event.country_code });
      }
    });
  }

  createDaypUrlParam(cardInfo) {
    cardInfo.actionTarget = 'search';
    this.redirectLink.emit({ link: cardInfo.mainDisplayAction, param: cardInfo.actionTarget });
  }

  getRecommendedStoneInfo(cardParamName) {
    this.notify.showBlockUI({ 'message': 'PLEASE_WAIT' });
    this.searchService.fetchRecommendedStones(cardParamName).subscribe(res => {
      if (!res.error_status && res.data && res.data && res.data.length > 0) {
        this.searchService.setCardFlag({ fullName: 'Recommendation', smallName: 'R' });
        this.navigateToSearchResult();
      } else {
        this.notify.hideBlockUI();
        this.messageService.showErrorGrowlMessage('NO_RESULT_DISPLAY');
      }
    }, error => {
      this.notify.hideBlockUI();
      this.messageService.showErrorGrowlMessage('SERVER_ERROR_OCCURRED');
    });
  }

  cardLeftFooterNavigation(cardData) {
    const cardInfo = cardData;
    let cardLeftParamName = '';
    for (const key in cardInfo.footerLeftParams) {
      if (cardInfo.footerLeftParams.hasOwnProperty(key)) {
        cardLeftParamName = key;
      }
    }
    if (cardLeftParamName !== '') {
      const cardLeftValue = parseInt(cardInfo.footerLeftParams[cardLeftParamName], 10);
      const cardId = cardInfo.cardId;
      if (this.cardLeftNavigationTable.hasOwnProperty(cardId)) {
        if (cardLeftValue > 0) {
          this.cardLeftNavigationTable[cardInfo.cardId](cardInfo);
        } else {
          this.messageService.showErrorGrowlMessage('NO_RESULT_DISPLAY');
        }
      }
    }
  }

  cardRightFooterNavigation(cardData) {
    const cardInfo = cardData;
    let cardRightName = '';
    for (const key in cardInfo.footerRightParams) {
      if (cardInfo.footerRightParams.hasOwnProperty(key)) {
        cardRightName = key;
      }
    }
    if (cardRightName !== '') {
      const cardLeftValue = parseInt(cardInfo.footerRightParams[cardRightName], 10);
      const cardId = cardInfo.cardId;
      if (this.cardRightNavigationTable.hasOwnProperty(cardId)) {
        if (cardLeftValue > 0) {
          this.cardRightNavigationTable[cardInfo.cardId](cardInfo);
        } else {
          this.messageService.showErrorGrowlMessage('NO_RESULT_DISPLAY');
        }
      }
    }
  }

  createLeftDaypUrlParam(cardData) {
    cardData.actionTarget = cardData.footerLeftDisplayAction.substring(cardData.footerLeftDisplayAction.lastIndexOf('=') + 1);
    this.redirectLink.emit({ link: cardData.mainDisplayAction, param: cardData.actionTarget });
  }

  createRightDaypUrlParam(cardData) {
    cardData.actionTarget = cardData.footerRightDisplayAction.substring(cardData.footerRightDisplayAction.lastIndexOf('=') + 1);
    this.redirectLink.emit({ link: cardData.mainDisplayAction, param: cardData.actionTarget });
  }
}
