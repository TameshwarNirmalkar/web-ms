import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class NotifyService {

  private showBlockUINotify = new Subject<any>();
  notifyShowBlockUIObservable$ = this.showBlockUINotify.asObservable();

  private hideBlockUINotify = new Subject<any>();
  notifyHideBlockUIObservable$ = this.hideBlockUINotify.asObservable();

  private showGrowlMsgNotify = new Subject<any>();
  notifyShowGrowlMsgObservable$ = this.showGrowlMsgNotify.asObservable();

  private translateNotify = new Subject<any>();
  notifyTranslateObservable$ = this.translateNotify.asObservable();

  private errorNotify = new Subject<any>();
  notifyErrorObservable$ = this.errorNotify.asObservable();

  private notifyToggleMenuBar = new Subject<any>();
  notifyMenuToggleObservable$ = this.notifyToggleMenuBar.asObservable();

  private notifyChangeScreen = new Subject<any>();
  notifyChangeScreenObservable$ = this.notifyChangeScreen.asObservable();

  private notifySearchOccured = new Subject<any>();
  notifySearchOccuredObservable$ = this.notifySearchOccured.asObservable();

  private notifySearchElementTouchOccurred = new Subject<any>();
  notifySearchElementTouchedObservable$ = this.notifySearchElementTouchOccurred.asObservable();

  private notifyPacketCountOccured = new Subject<any>();
  notifyPacketCountOccuredObservable$ = this.notifyPacketCountOccured.asObservable();

  private notifyShowPacketBtnOccured = new Subject<any>();
  notifyShowPacketBtnOccuredObservable$ = this.notifyShowPacketBtnOccured.asObservable();

  private notifyShowPacketEventOccured = new Subject<any>();
  notifyShowPacketEventOccuredObservable$ = this.notifyShowPacketEventOccured.asObservable();

  private notifyStoneStateUpdatedAction = new Subject<any>();
  notifyStoneStateUpdatedObservable$ = this.notifyStoneStateUpdatedAction.asObservable();

  private notifyStoneSelectedForInvoiceGenerationAction = new Subject<any>();
  notifyStoneSelectedForInvoiceGenerationObservable$ = this.notifyStoneSelectedForInvoiceGenerationAction.asObservable();

  private notifyGlobalSearchAction = new Subject<any>();
  notifyGlobalSearchObservable$ = this.notifyGlobalSearchAction.asObservable();

  private notifySearchResultPageAction = new Subject<any>();
  notifySearchResultPageObservable$ = this.notifySearchResultPageAction.asObservable();

  private notifyMessageRecieedFromPushAction = new Subject<any>();
  notifyMessageRecieedFromPushObservable$ = this.notifyMessageRecieedFromPushAction.asObservable();

  private notifyAddNewCommentAction = new Subject<any>();
  notifyAddNewCommentActionObservable$ = this.notifyAddNewCommentAction.asObservable();

  private notifySearchResultFromSelectedstonePageAction = new Subject<any>();
  notifySearchResultFromSelectedstonePageActionObservable$ = this.notifySearchResultFromSelectedstonePageAction.asObservable();

  private notifyBasketPacketUpdatePageAction = new Subject<any>();
  notifyBasketPacketUpdatePageActionObservable$ = this.notifyBasketPacketUpdatePageAction.asObservable();

  private notifyPacketPageStoneDetailTabAction = new Subject<any>();
  notifyPacketPageStoneDetailTabActionObservable$ = this.notifyPacketPageStoneDetailTabAction.asObservable();

  private notifyViewRequestPageStoneDetailTabAction = new Subject<any>();
  notifyViewRequestPageStoneDetailTabActionObservable$ = this.notifyViewRequestPageStoneDetailTabAction.asObservable();

  private notifyViewRequestTodayVisitPageStoneDetailTabAction = new Subject<any>();
  notifyViewRequestTodayVisitPageStoneDetailTabActionObservable$ = this.notifyViewRequestTodayVisitPageStoneDetailTabAction.asObservable();

  private notifyMyConfirmationPageStoneDetailTabAction = new Subject<any>();
  notifyMyConfirmationPageStoneDetailTabActionObservable$ = this.notifyMyConfirmationPageStoneDetailTabAction.asObservable();

  private notifyMyBasketPageStoneDetailTabAction = new Subject<any>();
  notifyMyBasketPageStoneDetailTabActionObservable$ = this.notifyMyBasketPageStoneDetailTabAction.asObservable();

  private notifyHoldListPageStoneDetailTabAction = new Subject<any>();
  notifyHoldListPageStoneDetailTabActionObservable$ = this.notifyHoldListPageStoneDetailTabAction.asObservable();

  private notifyDaypPageStoneDetailTabAction = new Subject<any>();
  notifyDaypPageStoneDetailTabActionObservable$ = this.notifyDaypPageStoneDetailTabAction.asObservable();

  private notifyNoteUpdateToChildViewAction = new Subject<any>();
  notifyNoteUpdateToChildViewActionObservable$ = this.notifyNoteUpdateToChildViewAction.asObservable();

  private notifyViewRequestForPacketUpdateAction = new Subject<any>();
  notifyViewRequestForPacketUpdateActionObservable$ = this.notifyViewRequestForPacketUpdateAction.asObservable();

  private notifyDaypForPacketUpdateAction = new Subject<any>();
  notifyDAypForPacketUpdateActionObservable$ = this.notifyDaypForPacketUpdateAction.asObservable();

  private notifyCheckDaypStatusAction = new Subject<any>();
  notifyCheckDaypStatusActionObservable$ = this.notifyCheckDaypStatusAction.asObservable();

  private notifyUpdatePacketinTableAction = new Subject<any>();
  notifyUpdatePacketinTableActionObservable$ = this.notifyUpdatePacketinTableAction.asObservable();

  private notifyUpdateAppointmentList = new Subject<any>();
  notifyUpdateAppointmentListObservable$ = this.notifyUpdateAppointmentList.asObservable();

  private notifyB2BForPacketUpdateAction = new Subject<any>();
  notifyB2BForPacketUpdateActionObservable$ = this.notifyB2BForPacketUpdateAction.asObservable();

  private notifyCardCountUpdateAction = new Subject<any>();
  notifyCardCountUpdateActionObservable$ = this.notifyCardCountUpdateAction.asObservable();

  private notifyDownloadProgressAction = new Subject<any>();
  notifyDownloadProgressActionObservable$ = this.notifyDownloadProgressAction.asObservable();

  private notifyTabChangeAction = new Subject<any>();
  notifyTabChangeActionObservable$ = this.notifyTabChangeAction.asObservable();

  private notifyBGMClickAction = new Subject<any>();
  notifyBGMClickActionObservable$ = this.notifyBGMClickAction.asObservable();

  private notifyEXFinishingClickAction = new Subject<any>();
  notifyEXFinishingClickActionObservable$ = this.notifyEXFinishingClickAction.asObservable();

  private notifyVGFinishingClickAction = new Subject<any>();
  notifyVGFinishingClickActionObservable$ = this.notifyVGFinishingClickAction.asObservable();

  private notifyFinishingValueChangeAction = new Subject<any>();
  notifyFinishingValueChangeActionObservable$ = this.notifyFinishingValueChangeAction.asObservable();

  private notifyBGMChangeAction = new Subject<any>();
  notifyBGMChangeActionObservable$ = this.notifyBGMChangeAction.asObservable();

  private notifyDaypBtbPageonLogout = new Subject<any>();
  notifyDaypBtbPageonLogoutObservable$ = this.notifyDaypBtbPageonLogout.asObservable();

  private notifyToLogout = new Subject<any>();
  notifyToLogoutObservable$ = this.notifyToLogout.asObservable();

  private addNewNotesForIggrid = new Subject<any>();
  addNewNotesForIggridObservable$ = this.addNewNotesForIggrid.asObservable();

  constructor() { }


  public showBlockUI(data: any) {
    if (data) {
      this.showBlockUINotify.next(data);
    }
  }

  public hideBlockUI() {
    this.hideBlockUINotify.next();
  }

  public showGrowlMsg(data: any) {
    if (data) {
      this.showGrowlMsgNotify.next(data);
    }
  }

  public notifyTranslate(data: any) {
    if (data) {
      this.translateNotify.next(data);
    }
  }

  public notifyErrorLogger(data: any) {
    if (data) {
      this.errorNotify.next(data);
    }
  }

  public notifyToggleMenu(data: any) {
    if (data) {
      this.notifyToggleMenuBar.next(data);
    }
  }

  public notifyScreen(data: any) {
    if (data) {
      this.notifyChangeScreen.next(data);
    }
  }

  public notifySearch(data) {
    if (data) {
      this.notifySearchOccured.next(data);
    }
  }

  public notifySearchElementTouched(data) {
    if (data) {
      this.notifySearchElementTouchOccurred.next(data);
    }
  }

  public notifyPacketCount(data) {
    if (data) {
      this.notifyPacketCountOccured.next(data);
    }
  }

  public notifyShowPacketBtn(data) {
    if (data) {
      this.notifyShowPacketBtnOccured.next(data);
    }
  }

  public notifyShowPacketEvent(data) {
    if (data) {
      this.notifyShowPacketEventOccured.next(data);
    }
  }

  public notifyStoneStateUpdated(data) {
    if (data) {
      this.notifyStoneStateUpdatedAction.next(data);
    }
  }

  public notifyStoneSelectedForInvoiceGeneration(data) {
    if (data) {
      this.notifyStoneSelectedForInvoiceGenerationAction.next(data);
    }
  }

  public notifyGlobalSearch(data) {
    if (data) {
      this.notifyGlobalSearchAction.next(data);
    }
  }

  public notifySearchResultPage(data) {
    if (data) {
      this.notifySearchResultPageAction.next(data);
    }
  }

  public notifyUpdateNotifictionCount(data) {
    if (data) {
      this.notifyMessageRecieedFromPushAction.next(data);
    }
  }

  public notifyAddNewComment() {
    this.notifyAddNewCommentAction.next();

  }

  public notifySearchResultPageFromSelectedStone(data) {
    if (data) {
      this.notifySearchResultFromSelectedstonePageAction.next(data);
    }
  }

  public notifyBasketPacketUpdate(data) {
    if (data) {
      this.notifyBasketPacketUpdatePageAction.next(data);
    }
  }

  public notifyPacketPageForStoneClickedForDetail(data) {
    if (data) {
      this.notifyPacketPageStoneDetailTabAction.next(data);
    }
  }

  public notifyViewRequestPageForStoneClickedForDetail(data) {
    if (data) {
      this.notifyViewRequestPageStoneDetailTabAction.next(data);
    }
  }

  public notifyViewRequestTodayVisitPageForStoneClickedForDetail(data) {
    if (data) {
      this.notifyViewRequestTodayVisitPageStoneDetailTabAction.next(data);
    }
  }

  public notifyMyConfirmationPageForStoneClickedForDetail(data) {
    if (data) {
      this.notifyMyConfirmationPageStoneDetailTabAction.next(data);
    }
  }

  public notifyMyBasketPageForStoneClickedForDetail(data) {
    if (data) {
      this.notifyMyBasketPageStoneDetailTabAction.next(data);
    }
  }

  public notifyHoldListPageForStoneClickedForDetail(data) {
    if (data) {
      this.notifyHoldListPageStoneDetailTabAction.next(data);
    }
  }

  public notifyDaypPageForStoneClickedForDetail(data) {
    if (data) {
      this.notifyDaypPageStoneDetailTabAction.next(data);
    }
  }

  public notifyb2bChildViewForNotesUpdate(data) {
    if (data) {
      this.notifyNoteUpdateToChildViewAction.next(data);
    }
  }

  public notifyViewRequestForPacketUpdate(data) {
    if (data) {
      this.notifyViewRequestForPacketUpdateAction.next(data);
    }
  }

  public notifyDaypForPacketUpdate(data) {
    if (data) {
      this.notifyDaypForPacketUpdateAction.next(data);
    }
  }

  public checkDaypStatus(data) {
    if (data) {
      this.notifyCheckDaypStatusAction.next(data);
    }
  }

  public updatePacketinTable(data) {
    if (data) {
      this.notifyUpdatePacketinTableAction.next(data);
    }
  }

  public updateAppointmentList(data) {
    if (data) {
      this.notifyUpdateAppointmentList.next(data);
    }
  }

  public notifyB2BForPacketUpdate(data) {
    if (data) {
      this.notifyB2BForPacketUpdateAction.next(data);
    }
  }

  public notifyCardCountUpdate(data) {
    if (data) {
      this.notifyCardCountUpdateAction.next(data);
    }
  }

  public notifyDownloadProgress(data) {
    if (data) {
      this.notifyDownloadProgressAction.next(data);
    }
  }

  public notifyTabChange(data) {
    if (data) {
      this.notifyTabChangeAction.next(data);
    }
  }

  public notifyBGMClick(data) {
    if (data) {
      this.notifyBGMClickAction.next(data);
    }
  }

  public notifyEXFinishingClick(data) {
    if (data) {
      this.notifyEXFinishingClickAction.next(data);
    }
  }

  public notifyVGFinishingClick(data) {
    if (data) {
      this.notifyVGFinishingClickAction.next(data);
    }
  }

  public notifyFinishingValueChange(data) {
    if (data) {
      this.notifyFinishingValueChangeAction.next(data);
    }
  }

  public notifyBGMChange(data) {
    if (data) {
      this.notifyBGMChangeAction.next(data);
    }
  }

  public notifyDaypBtbPageLogout(data) {
    if (data) {
      this.notifyDaypBtbPageonLogout.next(data);
    }
  }

  public notifyUserChooseLogout(data) {
    if (data) {
      this.notifyToLogout.next(data);
    }
  }
}
