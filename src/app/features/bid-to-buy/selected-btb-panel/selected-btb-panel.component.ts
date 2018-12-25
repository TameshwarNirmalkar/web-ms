import { Component, OnInit, Input, Output, EventEmitter, OnChanges, ViewChild, OnDestroy, HostListener } from '@angular/core';
import { UserProfileService } from '@srk/core';
import { BidToBuyService, UtilService } from '@srk/shared';
import { StoneDetailsService } from '@srk/shared';
import * as _ from 'underscore';
import { EventDetailsService } from '@srk/core';
import { MessageCodes, MessageCodesComparator } from '@srk/core';
import { MessageService } from '@srk/core';
import { NotifyService } from '@srk/core';
import { AuthService } from '@srk/core';
import { DownloadStonesService } from '@srk/shared';
import { AddNoteService } from '@srk/shared';
import { ApiService } from '@srk/shared';
import { ConfirmationService } from 'primeng/components/common/api';
import { CustomTranslateService } from '@srk/core';
import { ApplicationStorageService, SearchService } from '@srk/core';
import { Subscription } from 'rxjs';

declare var $: any;

@Component({
  selector: 'app-selected-btb-panel',
  templateUrl: './selected-btb-panel.component.html',
  styleUrls: ['./selected-btb-panel.component.scss']
})
export class SelectedBtbPanelComponent implements OnInit, OnChanges, OnDestroy {
  @Input() stockObject: any;
  @Input() isSubmmissionPanel: any;
  @Output() updateArray = new EventEmitter();
  @Output() gridRefresh = new EventEmitter();
  @Output() submitStone = new EventEmitter();
  @Output() updatePrice = new EventEmitter();
  @Input() tabName: any;
  @ViewChild('themeMultimediaPopUp') themeMultimediaPopUp;
  @ViewChild('daypGrid') daypGrid: any;
  @Output() stoneToAddPakcet = new EventEmitter();
  @Output() refreshAllNotes = new EventEmitter();
  @Input() isBasketBTB: boolean;
  @Input() isBtbTab: Boolean;
  @Input() isSubmissionBTB: boolean;
  @Input() showPacket: boolean;
  @Output() editBtbSubmissionList = new EventEmitter();
  @ViewChild('selectedBtbContainer') selectedBtbContainer;
  @Output() toggleSelectedTable = new EventEmitter();
  @Output() btbPacket = new EventEmitter();
  gridRebind: any;
  public isAllStoneSelected: any;
  public selectedColumnList: any;
  public toggleTable = false;
  public eventDetails = false;
  public isPreSelectEventPermissible = false;
  public selectedStones: any[];
  public toggleMultimediaPopup = false;
  public selectedStonesObject = [];
  public toggleComparePopup = false;
  public addnoteOverlayVisible = false;
  public selectedDownloadType: any;
  public downloadPopOverVisible = false;
  public downloadOptions: any;
  public requestPopupVisible = false;
  public apiLink: any;
  @Input() stonesActedOn: any;
  public commentsOverlayVisible = false;
  public isColumnExpanded = false;
  public allNotesForStone: any;
  public isEditable = false;
  public packetSubscription: any;
  public colorLegendFilterValue: String[] = [];
  public stoneConfirmedSubscription: any;
  public currentStoneArray: any[];
  public timer;
  public conversionRate: any;
  public columnWidth = 130;
  public isIconVisible = false;
  public allColumnWidth: any;
  public gridHeight: any;
  public isBtbAvailable = 0;
  public initAutoPriceSubscripation: any;
  public submmissionPanel: boolean = false;
  public displayIconOverlay: Boolean = false;
  public packetIconDataForGrid: any[];
  public iconDisplayStoneObject: any;
  public iconOverlayXPosition: Number;
  public iconOverlayYPosition: Number;
  public focusedElement: any;
  public addNoteSubscription: Subscription;
  constructor(
    private userProfileService: UserProfileService,
    private btbService: BidToBuyService,
    private stoneDetailsService: StoneDetailsService,
    private eventDetailsService: EventDetailsService,
    private messageService: MessageService,
    private notify: NotifyService,
    private searchSvc: SearchService,
    private authService: AuthService,
    private downloadSvc: DownloadStonesService,
    private notesService: AddNoteService,
    private apiService: ApiService,
    private confirmationService: ConfirmationService,
    private customTranslateSvc: CustomTranslateService,
    private appStore: ApplicationStorageService,
    private utilService: UtilService
  ) { }

  ngOnInit() {
    this.submmissionPanel = this.isSubmmissionPanel;
    this.searchSvc.getBtbVersionList().subscribe(res => {
      if (res && res.code && MessageCodesComparator.AreEqual(res.code, MessageCodes.B2B_GET_VERSION_200)) {
        this.isBtbAvailable = 1;
      } else {
        this.isBtbAvailable = 2;
      }
    }, err => { });
    const priceSubscription = this.stoneDetailsService.getPriceInfoObservable().subscribe(res => {
      this.conversionRate = res.conversion_rate;
      if (priceSubscription) {
        priceSubscription.unsubscribe();
      }
    });

    this.allColumnWidth = this.userProfileService.getColumnWidth();
    [this.isColumnExpanded, this.isIconVisible] = this.utilService.getExpandedColumnValue();
    this.gridHeight = window.innerHeight - 328;
    this.selectedColumnList = this.userProfileService.getSelectedColumnList();
    this.checkPreselectionEvent();
    this.stoneConfirmedSubscription = this.notify.notifyStoneStateUpdatedObservable$.subscribe((res) => {
      this.updateStoneStateDetails(res);
    });
    this.toggleSelectedTable.emit({ status: false });
    this.btbService.handlekeyupEvent('allSelectedStoneContainer');
    if (this.appStore.getData('editableSubmission') && this.isSubmissionBTB) {
      const data = this.appStore.getData('editableSubmission');
      this.isEditable = data.edit;
      if (this.isEditable) {
        this.currentStoneArray = this.appStore.getData('editableSubmissionArray');
      }
    }
    this.packetSubscription = this.notify.notifyBasketPacketUpdatePageActionObservable$.subscribe(res => {
      this.updatePacketDetails(res);
    });
    this.addNoteSubscription = this.notify.addNewNotesForIggridObservable$.subscribe(res => {
      if (res.isDeleteFlow) {
        this.deleteCommentsFromStones(res);
      } else {
        this.updateNotesForStones(res);
      }
    });

  }

  toggleSelectedStoneTable() {
    if (this.stockObject.selectedStoneArray && this.stockObject.selectedStoneArray.length > 0) {
      this.toggleTable = !this.toggleTable;
    }
    this.toggleSelectedTable.emit({ status: this.toggleTable });
  }


  syncSelectedStones(array, data) {

    const differenceStones = _.difference(this.stoneDetailsService.createStoneIdList(array.selectedStoneArray), array.selectedStones);
    differenceStones.forEach(stone => {
      array.selectedStoneArray.forEach(tableObj => {
        if (stone === tableObj.stone_id) {
          const i = array.selectedStoneArray.indexOf(tableObj);
          array.selectedStoneArray.splice(i, 1);
        }
      });
    });
    array.totalCarat = this.btbService.calculateCarat(array);
    this.updateArray.emit({ selectedArray: this.stockObject, data: data });
    if (this.stockObject.selectedStones && this.stockObject.selectedStones.length === 0) {
      this.toggleTable = false;
      this.toggleSelectedTable.emit({ status: this.toggleTable });
    }

  }

  filterSelectedStones(array, data, gridName) {

    if (Array.isArray(data)) {

      array.selectedStones = [];

      this.syncSelectedStones(array, data);

    } else {

      if (data.added === false) {

        array.selectedStones = array.selectedStones.filter(elm => { return elm !== data.stoneId });
        // Hacky Way Maybe but did not want to create a whole another component for just one line of code.
        $('#grid' + gridName).igGridUpdating('deleteRow', data.stoneId);

      }

      this.syncSelectedStones(array, data);

    }

  }

  ngOnChanges() {
    if (this.stockObject) {
      this.isAllStoneSelected = true;
    }
    this.stoneConfirmedSubscription = this.notify.notifyStoneStateUpdatedObservable$.subscribe((res) => {
      this.updateStoneStateDetails(res);
    });
  }

  isAllCheckboxSelected(array) {
    if (!this.isAllStoneSelected) {
      array.selectedStoneArray = [];
      array.selectedStones = [];
      this.toggleTable = false;
      this.toggleSelectedTable.emit({ status: this.toggleTable });
    }
    array.totalCarat = this.btbService.calculateCarat(array);
    this.updateArray.emit({ selectedArray: this.stockObject });
  }

  updatePacketDetails(event) {
    if (event && event.array && event.array.length > 0) {
      this.packetIconDataForGrid = event.array.map(elm => { return elm.stones.toString(); }).toString();
    }
    if (this.stockObject.selectedStoneArray) {
      if (this.stockObject.selectedStoneArray) {
        this.stockObject.selectedStoneArray = this.stoneDetailsService.setStonePacketCount(this.stockObject.selectedStoneArray);
        this.stockObject.selectedStoneArray = this.stoneDetailsService.updateStonePacketCount(event, this.stockObject.selectedStoneArray);
        this.stockObject.selectedStoneArray = this.stoneDetailsService.setStonePacketCount(this.stockObject.selectedStoneArray);
        this.stockObject.selectedStoneArray = this.stoneDetailsService.updateStonePacketCount(event,
          this.stockObject.selectedStoneArray);
      }
    }
  }
  checkPreselectionEvent() {
    this.eventDetailsService.checkPreEventSelectionPermission().subscribe(res => {
      let flag = false;
      if (!res.error_status) {
        if (MessageCodesComparator.AreEqual(res.code, MessageCodes.EVENT_SEL_PFS_200)) {
          flag = true;
          if (res.hasOwnProperty('data')) {
            this.eventDetails = this.eventDetailsService.reorderEventDetails(res.data, 'button_order');
          }
        } else if (MessageCodesComparator.AreEqual(res.code, MessageCodes.EVENT_NEF_200)) {
          flag = false;
        }
      }
      this.isPreSelectEventPermissible = flag;
    }, error => {
      this.isPreSelectEventPermissible = false;
    });
  }

  addStonesToEvent(array, event) {
    this.selectedStones = this.createDeepCopyArray(array.selectedStones);
    if (this.selectedStones && this.selectedStones.length > 0) {
      this.notify.showBlockUI({ 'message': 'PLEASE_WAIT' });
      this.eventDetailsService.addStoneToEvent(this.selectedStones, event.event_id).subscribe(res => {
        this.notify.hideBlockUI();
        if (!res.error_status) {
          if (MessageCodesComparator.AreEqual(res.code, MessageCodes.EVENT_INS_200)) {
            this.notify.notifyStoneStateUpdated({ source: 'eventAdded', stoneList: this.selectedStones });
            this.messageService.showSuccessGrowlMessage(res.message);
          } else {
            this.messageService.showErrorGrowlMessage('STONE_NOT_ADDED_EVENT');
          }
        }
      }, error => {
        this.notify.hideBlockUI();
        this.messageService.showErrorGrowlMessage('SERVER_ERROR_OCCURRED');
      });
    } else {
      this.messageService.showErrorGrowlMessage('NO_SELECTED_STONE');
    }
  }

  createDeepCopyArray(array) {
    return JSON.parse(JSON.stringify(array));
  }

  addToMyBasket(array) {
    this.selectedStones = this.createDeepCopyArray(array.selectedStones);
    const apiLink = this.authService.getApiLinkForKey('add_basket_btn', '');
    const servicedata = '{"stone_ids":' + JSON.stringify(this.selectedStones) + '}';
    if (this.selectedStones && this.selectedStones.length > 0) {
      this.notify.showBlockUI({ 'message': 'PLEASE_WAIT' });
      this.apiService.postCall('ThmSelectedStonePanelComponent:addToMyBasket', apiLink, servicedata).subscribe((response) => {
        this.notify.hideBlockUI();
        if (response !== undefined) {
          if (MessageCodesComparator.AreEqual(response.code, MessageCodes.SMS_MB_NSF_200)) {
            this.messageService.showErrorGrowlMessage(MessageCodes[response.code]);
          } else if (MessageCodesComparator.AreEqual(response.code, MessageCodes.SMS_MB_SS_200)) {
            this.notify.notifyStoneStateUpdated({ source: 'basketRequested', stoneList: this.selectedStones });
            this.messageService.showSuccessGrowlMessage(MessageCodes[response.code]);
            // this.submitStone.emit({ gridRebind: array.selectedStoneArray });
          } else if (MessageCodesComparator.AreEqual(response.code, MessageCodes.SMS_MB_SNE_200)) {
            this.messageService.showErrorGrowlMessage(MessageCodes[response.code]);
          }
        }
      }, error => {
        this.notify.hideBlockUI();
        this.messageService.showErrorGrowlMessage('ERR_SAVE_STONE_BASKET');
      });
    } else {
      this.messageService.showErrorGrowlMessage('NO_SELECTED_STONE');
    }
  }

  toggleMultimediaOverlay(stoneInfo) {
    this.themeMultimediaPopUp.initializePopUp(stoneInfo);
    this.toggleMultimediaPopup = true;
  }

  toggleCloseMultimediaPopUp(e) {
    this.toggleMultimediaPopup = e.status;
  }

  addNoteForStone(array) {
    this.selectedStones = this.createDeepCopyArray(array.selectedStones);
    if (this.selectedStones && this.selectedStones.length > 0) {
      this.addnoteOverlayVisible = true;
      // this.submitStone.emit({ gridRebind: array.selectedStoneArray });
    } else {
      this.messageService.showErrorGrowlMessage('NO_SELECTED_STONE');
    }
  }

  toggleAddNoteOverlay(e) {
    if (e.forAddNote) {
      this.addnoteOverlayVisible = e.visible;
    } else {
      this.commentsOverlayVisible = e.visible;
    }
    // if (e.noteDetil) {
    //   this.refreshAllStoneNote(this.stockObject);
    //   this.refreshAllNotes.emit({ status: true });
    // }
  }

  showAllCommentsForStone(notes) {
    this.commentsOverlayVisible = true;
    this.allNotesForStone = notes;
  }

  toggleOverlay(e) {
    this.requestPopupVisible = e.visible;
  }

  toggleViewRequestOverlay(array) {
    this.apiLink = this.authService.getApiLinkForKey('view_request_btn', '');
    this.selectedStones = this.createDeepCopyArray(array.selectedStones);
    if ((this.selectedStones).length > 0) {
      this.requestPopupVisible = !this.requestPopupVisible;
      // this.submitStone.emit({ gridRebind: array.selectedStoneArray });
    } else {
      this.messageService.showErrorGrowlMessage('NO_SELECTED_STONE');
    }
  }

  showDowaloadOptions() {
    this.selectedDownloadType = 0;
    this.downloadOptions = this.downloadSvc.getDownloadOptions('excel_download_btb_btn');
    this.downloadPopOverVisible = true;
  }

  downloadResult(array) {
    this.selectedStones = this.createDeepCopyArray(array.selectedStones);
    if (this.selectedStones.length > 0) {
      this.downloadSvc.downloadStoneDetails(array.selectedStoneArray, this.selectedStones, this.selectedDownloadType);
      this.downloadPopOverVisible = false;
      this.selectedDownloadType = null;
    } else {
      this.messageService.showErrorGrowlMessage('NO_SELECTED_STONE');
    }
  }

  compareStone(array) {
    this.selectedStonesObject = [];
    this.toggleComparePopup = true;
    this.selectedStonesObject = this.createDeepCopyArray(array.selectedStoneArray);
  }

  refreshAllStoneNote(array) {
    // this.refreshAllNotes.emit({ status: true });
    // this.notesService.getCommentListforStoneIds(array.selectedStoneArray).subscribe((response) => {
    //   array.selectedStoneArray = response;
    // }, error => {
    //   this.messageService.showErrorGrowlMessage('ERR_FETCH_EXTRA_STONE_INFO');
    // });
    this.btbService.fetchStonesCommentAsync(array)
      .then((response) => {
        array.table = response;
        // this.stonesActedOn = { 'source': 'noteAdded', data: array.table };
      });
    if (array.selectedStoneArray && array.selectedStoneArray.length > 0) {
      array.selectedStoneArray = this.notesService.fetchStonesComment(array.selectedStoneArray);
    }
  }

  closeCompareStoneOverlay() {
    this.selectedStonesObject = [];
    this.toggleComparePopup = false;
  }

  addSelectedStonesToPacket(array) {
    if (array.selectedStoneArray.length > 0) {
      this.stoneToAddPakcet.emit({ visible: false, object: array.selectedStoneArray });
    } else {
      this.messageService.showErrorGrowlMessage('NO_SELECTED_STONE');
    }
  }

  togglePacketOverlay(data) {
    this.stoneToAddPakcet.emit({ visible: true, object: [data] });
  }

  sendExcelMail() {
    this.selectedStones = this.createDeepCopyArray(this.stockObject.selectedStones);
    if (this.selectedStones.length > 0) {
      this.downloadSvc.mailStoneExcel(this.stockObject.selectedStoneArray, this.selectedStones, 'B2B Stone List');
    } else {
      this.messageService.showErrorGrowlMessage('NO_SELECTED_STONE');
    }
  }

  priceEntry(data, offerPrice) {
    if (offerPrice != "") {
      this.appStore.store('isBtbModify', true);
      const response = this.btbService.priceEntry(data, offerPrice);
      if (response.status) {
        const newPrice = this.btbService.setOffPrice(response.data, offerPrice);
        newPrice.data.bid_rate = parseFloat(newPrice.data.bid_rate).toFixed(2);
        if (!this.submmissionPanel) {
          this.initiateAutoSavePrice(newPrice.data, offerPrice, newPrice.offerPer);
        }
        const stonesActedOn = { source: 'bidToBuyPriceUpdated', data: newPrice.data };
        this.updatePrice.emit(stonesActedOn);
      } else {
        data = this.btbService.resetBtbValue(data, data);
        const stonesActedOn = { source: 'bidToBuyPriceUpdated', data: data };
        this.updatePrice.emit(stonesActedOn);
        this.refreshBtbTable();
      }
    } else {
      data = this.btbService.resetBtbValue(data, data);
      this.stonesActedOn = { source: 'bidToBuyPriceUpdated', data: data };
    }
  }

  onPriceKeyDown(ev) {
    ev = (ev) ? ev : window.event;
    const charCode = (ev.which) ? ev.which : ev.keyCode;
    if (charCode === 39 || charCode === 37) {
      ev.stopImmediatePropagation();
      return;
    }
  }

  initiateAutoSavePrice(data, offerPrice, offerPer) {
    const action = this.getCurrentTab();
    if (this.initAutoPriceSubscripation) {
      this.initAutoPriceSubscripation.unsubscribe();
    }
    this.initAutoPriceSubscripation = this.btbService.autoSavePriceChange(data.stone_id, offerPrice, offerPer, action).subscribe(res => {
      if (MessageCodesComparator.AreEqual(res.code, MessageCodes.B2B_BSS_200)) {
        if (action === 'u') {
          this.notify.notifyStoneStateUpdated({ b2bAction: 'b2bPriceUpdated', stoneList: [data.stone_id], stoneObj: [data], status: 'selected' });
        } else {
          this.notify.notifyStoneStateUpdated({ b2bAction: 'b2bPriceInserted', stoneList: [data.stone_id], stoneObj: [data], status: 'selected' });
        }
        if (this.isSubmissionBTB) {
          this.messageService.showSuccessGrowlMessage('B2B_BID_SUBMIT_SUCCESS');
          $('body').css('overflow-y', 'auto');
          if (this.daypGrid) {
            if (this.focusedElement && this.focusedElement.element) {
              this.daypGrid.focusTextBox(this.focusedElement.element, this.focusedElement.mouseClick);
            }
          }
        } else {
          this.messageService.showSuccessGrowlMessage(MessageCodes.B2B_BSS_200);
        }
      } else if (MessageCodesComparator.AreEqual(res.code, MessageCodes.SMS_B2B_TO_401)) {
        this.messageService.showErrorGrowlMessage(MessageCodes.SMS_B2B_TO_401);
      } else {
        this.messageService.showErrorGrowlMessage('FAILURE_ADDING_BID');
      }
    });
  }

  onPriceInput(data, priceRef: any) {
    const reg = /[^0-9\.\,]/ig;
    if (priceRef.value && reg.test(priceRef.value)) {
      let start = priceRef.selectionStart, end = priceRef.selectionEnd;
      let value = String(priceRef.value).replace(reg, '');
      priceRef.value = value;
      priceRef.setSelectionRange(start, end - 1);
    }
  }

  updateStoneStateDetails(res) {
    const stoneList = res.stoneList;
    if (stoneList && this.stockObject) {
      if (res.hasOwnProperty('b2bAction')) {
        if (res.b2bAction !== 'b2bPriceInserted' || res.source !== 'b2bRequested') {
          // this.stonesActedOn = res;
        }
        this.stockObject.selectedStoneArray = this.updateB2BStoneInfo(this.stockObject.selectedStoneArray, stoneList, res);
        this.stockObject.totalOfferAmt = this.btbService.calculateOfferAmount(this.stockObject);
        this.stockObject.totalCarat = this.btbService.calculateCarat(this.stockObject);
      } else {
        // this.stockObject.selectedStoneArray = this.btbService.updateTableStoneDetails(this.stockObject.selectedStoneArray, stoneList, res);
        // this.stonesActedOn = res;
      }
    }
  }

  updateB2BStoneInfo(table, stoneList, res) {
    table = this.btbService.updateBTBStonePriceValue(table, res.stoneObj, false);
    return table;
  }

  submitBTBBasketStones(array) {
    setTimeout(() => {
      const flag = this.checkIsValueEntered(array);
      if (flag) {
        if (array.selectedStones && array.selectedStones.length > 0) {
          const cancelVisitMessage = this.customTranslateSvc.translateString('SUBMIT_BTB_STONES');
          const cancelVisitHeader = this.customTranslateSvc.translateString('SUBMIT_STONES_HEADING');
          this.confirmationService.confirm({
            message: cancelVisitMessage,
            header: cancelVisitHeader,
            accept: () => {
              const selectedStones = this.createDeepCopyArray(array.selectedStones);
              this.btbService.finalSavePriceChange(selectedStones).subscribe(res => {
                if (MessageCodesComparator.AreEqual(res.code, MessageCodes.B2B_BSS_200)) {
                  let submittedStoneArray =
                    this.btbService.addFinalSubmitFlag('b2bSubmission', this.createDeepCopyArray(array.selectedStoneArray));
                  submittedStoneArray = this.stoneDetailsService.removeDuplicatesFromObject(submittedStoneArray, 'stone_id');
                  this.notify.notifyStoneStateUpdated({ b2bAction: 'b2bSubmitted', stoneList: selectedStones, stoneObj: submittedStoneArray });
                  if (this.isBtbTab) {
                    // this.gridRefresh.emit({ gridRebind: selectedStones });
                    // this.gridRebind = selectedStones;
                    if (array.selectedStoneArray.length === 0) {
                      if (this.toggleTable) {
                        this.toggleTable = !this.toggleTable;
                      }
                      this.toggleSelectedTable.emit({ status: this.toggleTable });
                    }
                  } else {
                    // this.submitStone.emit({ gridRebind: submittedStoneArray });
                  }
                  this.messageService.showSuccessGrowlMessage('B2B_BID_SUBMIT_SUCCESS');
                } else if (MessageCodesComparator.AreEqual(res.code, MessageCodes.SMS_B2B_TO_401)) {
                  this.messageService.showErrorGrowlMessage(MessageCodes.SMS_B2B_TO_401);
                } else {
                  this.messageService.showErrorGrowlMessage('BTB_SUBMIT_ERROR');
                }
              }, error => {
                this.messageService.showErrorGrowlMessage('SERVER_ERROR_OCCURRED');
              });
            }
          });
        } else {
          this.messageService.showErrorGrowlMessage('NO_SELECTED_STONE');
        }
      } else {
        this.messageService.showErrorGrowlMessage('BTB_ENTER_PRICE_STONE');
      }
    }, 1500);
  }

  removeBTBSubmissionStones(array) {
    if (array.selectedStoneArray.length > 0) {
      const cancelVisitMessage = this.customTranslateSvc.translateString('REMOVE_BTB_STONES');
      const cancelVisitHeader = this.customTranslateSvc.translateString('REMOVE_BTB_STONES_HEADING');
      this.confirmationService.confirm({
        message: cancelVisitMessage,
        header: cancelVisitHeader,
        accept: () => {
          const selectedStones = this.createDeepCopyArray(array.selectedStones);
          this.btbService.deleteBTBFinalSubmitted(selectedStones).subscribe(res => {
            if (MessageCodesComparator.AreEqual(res.code, MessageCodes.SMS_B2B_DL_200)) {
              const deletedStoneArray = this.btbService.resetBTBPriceValue(this.createDeepCopyArray(array.selectedStoneArray));
              this.notify.notifyStoneStateUpdated({ b2bAction: 'b2bDeleted', stoneList: selectedStones, stoneObj: deletedStoneArray });
              this.messageService.showSuccessGrowlMessage('B2B_OFFER_DELETE_SUCCESS');
              // this.gridRefresh.emit({ gridRebind: selectedStones });
              // this.gridRebind = selectedStones;
              if (array.selectedStoneArray.length === 0) {
                if (this.toggleTable) {
                  this.toggleTable = !this.toggleTable;
                }
                this.toggleSelectedTable.emit({ status: this.toggleTable });
              }
            } else {
              this.messageService.showErrorGrowlMessage('BTB_REMOVE_SUBMIT_ERROR');
            }
          });
        }
      });
    } else {
      this.messageService.showErrorGrowlMessage('NO_SELECTED_STONE');
    }
  }

  editBTBSubmissionPrice(array) {
    if (this.isBtbAvailable === 1) {
      if (array.selectedStoneArray.length > 0) {
        this.isEditable = !this.isEditable;
        this.currentStoneArray = this.createDeepCopyArray(array.selectedStoneArray);
        this.appStore.store('editableSubmissionArray', this.currentStoneArray);
        this.editBtbSubmissionList.emit({ edit: true, cancel: false, done: false });
        this.appStore.store('editableSubmission', { edit: true, cancel: false, done: false });
      } else {
        this.messageService.showErrorGrowlMessage('NO_SELECTED_STONE');
      }
    } else {
      this.messageService.showErrorGrowlMessage('BID_TIME_CPMPLETE');
    }
  }

  getCurrentTab() {
    let action;
    if (this.isSubmissionBTB) {
      action = 'u';
    } else {
      action = 'i';
    }
    return action;
  }


  addStoneDetailTab(data) {
    data = this.stockObject.selectedStoneArray.find(elm => { return elm._id === data; });
    data['CurrentSelectedTab'] = this.tabName;
    this.notify.notifyViewRequestPageForStoneClickedForDetail({ 'type': 'stoneDtl', 'data': data });
  }

  addTwinStoneInfoTab(pairId) {
    this.notify.notifyViewRequestPageForStoneClickedForDetail({ 'type': 'twinStoneDtl', 'data': pairId });
  }

  submittedStonePriceEntry(data, offerPrice) {
    const response = this.btbService.priceEntry(data, offerPrice);
    if (response.status) {
      const newPrice = this.btbService.setOffPrice(response.data, offerPrice);
      this.notify.notifyStoneStateUpdated({ b2bAction: 'b2bPriceMidUpdated', stoneList: [data.stone_id], stoneObj: [data] });
    } else {
      data = this.btbService.resetBtbValue(data, data);
      this.refreshBtbTable();
    }
  }

  refreshBtbTable() {
    if (this.selectedBtbContainer) {
      this.selectedBtbContainer.instance.refresh();
    }
  }

  doneBTBSubmissionPrice(array) {
    setTimeout(() => {
      this.isEditable = !this.isEditable;
      array.selectedStoneArray.forEach(stone => {
        if (stone.offer_per_disc) {
          let bidPercentage = stone.offer_per_disc;
          if (bidPercentage.indexOf('+') !== -1) {
            const bidPercentageValue = bidPercentage.split('+');
            bidPercentage = bidPercentageValue[1];
          }
          // this.initiateAutoSavePrice(stone, stone.bid_rate, bidPercentage);
        }
      });
      this.editBtbSubmissionList.emit({ edit: false, cancel: false, done: true });
      this.appStore.store('editableSubmission', { edit: false, cancel: false, done: true });
    }, 500);
  }

  cancelBTBSubmissionPrice(array) {
    setTimeout(() => {
      this.isEditable = !this.isEditable;
      // this.stockObject.selectedStoneArray = this.currentStoneArray;
      this.stockObject.table = array.table;
      this.editBtbSubmissionList.emit({ edit: false, cancel: true, done: false });
      this.appStore.store('editableSubmission', { edit: false, cancel: true, done: false });
      this.appStore.remove('editableSubmissionArray');
      array = this.btbService.resetBtbValue(array, array);
      // this.stonesActedOn = { source: 'bidToBuyPriceUpdated', data: array };
      // this.stonesActedOn = array.table;
      this.updatePrice.emit({ source: 'bidToBuyAllStoneUpdate', data: array });
    }, 500);

  }

  checkIsValueEntered(array) {
    let flag = false;
    const totalStoneCount = array.selectedStoneArray.length;
    let trueCount = 0;
    array.selectedStoneArray.forEach(element => {
      if (element.bid_rate && (element.bid_percentage || element.offer_per_disc)) {
        trueCount++;
      }
    });
    if (trueCount === totalStoneCount) {
      flag = true;
    }
    return flag;
  }

  scrollTable(params) {
    if (params === 'left') {
      this.stoneDetailsService.scrollLeft(this.selectedBtbContainer, '#allSelectedStoneContainer');
    } else if (params === 'right') {
      this.stoneDetailsService.scrollRight(this.selectedBtbContainer, '#allSelectedStoneContainer');
    }
  }

  scrollTableInInterval(params) {
    this.timer = setInterval(() => {
      this.scrollTable(params);
    }, 1)
  }

  stopScrolling() {
    clearInterval(this.timer);
  }

  scrollColumn() {
    this.isColumnExpanded = !this.isColumnExpanded;
    this.isIconVisible = !this.isIconVisible;
    this.stoneDetailsService.handleSortingOrder(this.selectedBtbContainer);
    if (this.isColumnExpanded) {
      const columns = JSON.parse(JSON.stringify(this.selectedBtbContainer.columns));
      columns[1].width = 275;
      this.selectedBtbContainer.columns = columns;
    } else {
      const columns = JSON.parse(JSON.stringify(this.selectedBtbContainer.columns));
      columns[1].width = 130;
      this.selectedBtbContainer.columns = columns;
    }
  }

  onCellPrepared(e, array) {
    this.stoneDetailsService.onCellPrepared(e, array.selectedStones);
  }

  ngOnDestroy() {
    this.toggleSelectedTable.emit({ status: false });
    if (this.initAutoPriceSubscripation) {
      this.initAutoPriceSubscripation.unsubscribe();
    }
    if (this.packetSubscription) {
      this.packetSubscription.unsubscribe();
    }
    if (this.addNoteSubscription) {
      this.addNoteSubscription.unsubscribe();
    }
  }

  @HostListener('window:resize')
  onWindowResize() {
    if (this.stockObject.selectedStoneArray.length > 0) {
      this.gridHeight = window.innerHeight - 328;
    }
  }

  showStoneMediaIconsPanel(stoneObj, event, thmMediaIcon) {
    thmMediaIcon.stoneObj = stoneObj;
    thmMediaIcon.multimediaOverlay.toggle(event);
  }

  setColorLegendFilterValue(event: any, filterValue: String): void {

    if (this.colorLegendFilterValue.includes(filterValue)) {

      this.colorLegendFilterValue = this.colorLegendFilterValue.filter(elm => { return elm !== filterValue; });

    } else {

      this.colorLegendFilterValue = [...this.colorLegendFilterValue, filterValue];

    }

  }

  closeGridIconOverlay(data) {

    this.displayIconOverlay = false;

  }

  stoneMediaIconPanel(event) {
    const data = this.stoneDetailsService.returnPositionOfOverlay(event);
    this.iconOverlayXPosition = data.left;
    this.iconOverlayYPosition = data.top;
    this.iconDisplayStoneObject = event.stoneId;
    this.displayIconOverlay = true;
  };

  storeLastFocusedElement(event) {
    this.focusedElement = event;
  }

  updateNotesForStones(res) {
    if (this.stockObject && this.stockObject.length > 0) {
      const toUpdateStoneArray = this.stoneDetailsService.findStoneObjUsingStoneIds(this.stockObject, res.stoneList);
      if (toUpdateStoneArray instanceof Array && toUpdateStoneArray.length > 0) {
        this.notesService.fetchStonesAsynchronously(toUpdateStoneArray)
          .then(result => {

            this.stockObject = this.stoneDetailsService.findAndUpdateStoneCommentFromList(this.stockObject, result);

          }).catch(error => {

            console.error('Failed with error ');
            console.error(error);

          });
      }
    }
  }

  deleteCommentsFromStones(res) {
    const stoneList = [];
    if (this.stockObject && this.stockObject.length > 0) {
      const commentsId = res.commentList;
      this.stockObject.forEach(stone => {
        if (stone.haveNote) {
          commentsId.forEach(comment => {
            stone.notes.forEach((note, noteIndex) => {
              if (Number(note.comment_id) === Number(comment)) {
                stone.notes.splice(noteIndex, 1);
                stoneList.push(stone.stone_id);
              }
            });
          });
          if (stone.notes.length === 0) {
            if (stone.notes) {
              delete stone.notes;
            }
            stone['haveNote'] = false;
            if (stone.displayNote) {
              stone['displayNote'] = '';
            }
            if (stone.totalNotes) {
              delete stone.totalNotes;
            }
          } else {
            stone['displayNote'] = stone.notes[0];
            stone['totalNotes'] = stone.notes.length;
          }
        }
      });
    }
  }
}
