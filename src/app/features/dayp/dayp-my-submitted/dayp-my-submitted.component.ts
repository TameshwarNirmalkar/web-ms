import { Component, OnInit, Input, ViewChild, OnDestroy, AfterViewInit, HostListener } from '@angular/core';
import { UserProfileService } from '@srk/core';
import { StoneDetailsService } from '@srk/shared';
import { UtilService } from '@srk/shared';
import { DaypService } from '@srk/shared';
import { MessageCodes, MessageCodesComparator } from '@srk/core';
import { MessageService } from '@srk/core';
import { SearchService } from '@srk/core';
import { Subscription } from 'rxjs/Subscription';
import { NotifyService } from '@srk/core';
import { DownloadStonesService } from '@srk/shared';
import { AddNoteService } from '@srk/shared';
import { ApplicationStorageService } from '@srk/core';
import { AuthService } from '@srk/core';
import * as _ from 'underscore';

@Component({
  selector: 'app-dayp-my-submitted',
  templateUrl: './dayp-my-submitted.component.html',
  styleUrls: ['./dayp-my-submitted.component.scss']
})
export class DaypMySubmittedComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('daypMySubmittedContainer') daypMySubmittedContainer;
  @ViewChild('selectedDaypStonesPanel') selectedDaypStonesPanel;
  @ViewChild('themeMultimediaPopUp') themeMultimediaPopUp;
  @ViewChild('thmDdcOverlay') thmDdcOverlay;
  @Input() isEditableMode: boolean;
  @Input() isResultDeclared: boolean;
  @Input() daypStatus: boolean;
  @Input() visiblePacketIcon = false;
  @Input() packetStoneArray: any;



  private packetSubscription: Subscription;
  private noteAddSubscription: Subscription;
  private stonePriceUpdateSubscription: Subscription;
  private addNoteSubscription: Subscription;
  private tabChangeSubscription: Subscription;
  private daypSubmissionSubscription: Subscription;

  public daypSubmittedData: any;
  public selectedColumnList: any;
  public offerColumnList: any[];
  public message: string;
  public offerSignOptions = [
    { notation: '+', value: 'plus' },
    { notation: '-', value: 'minus' }
  ];
  public isDataFetched = false;
  public timer;
  public commentsOverlayVisible = false;
  public addnoteOverlayVisible = false;
  public allNotesForStone: any[] = [];

  public toggleMultimediaPopup = false;
  public stoneMultimediaInfo: any;

  public ddcOverlayVisible = false;
  public definedDDCHour: any;
  public ddcStones: any[] = [];

  public downloadPopOverVisible = false;
  public downloadOptions: any[];
  public selectedDownloadType: any;
  public columnWidth = 130;
  public isIconVisible = false;
  public isEditable = false;
  public menuDistanceFromTop: any;
  public currentScroll: any;
  public caratHeaderFilter = [];
  public amountHeaderFilter = [];
  public priceHeaderFilter = [];
  public diffHeaderFilter = [];
  public daypamountHeaderFilter = [];
  public offperHeaderFilter = [];
  public daypHeight = window.innerHeight - 285;
  public isFilterAllSelected = false;
  public filterDataSource = [];
  public daypColumnWidth: any;
  public filterOptions = [];
  public isColumnExpanded = false;
  public filterFlag: any;
  public selectedFilterOption: any;
  public allColumnWidth: any;
  public colWidth: any;
  public filterPopOverVisible = false;
  public filterId = 'filterOnMySubmission';
  public selectedTableToggle = false;
  public gridRebind: any;

  // Variables for grid.
  public packetIconDataForGrid: any[];  // Used to update Packet icons in the Data Grid.
  public stonesActedOn: any;
  public iconOverlayXPosition: Number;
  public iconOverlayYPosition: Number;
  public displayIconOverlay: Boolean = false;
  public iconDisplayStoneObject: any;
  public colorLegendFilterValue: String[] = [];
  public originalDataSource: any;
  constructor(
    private userProfileService: UserProfileService,
    private stoneSvc: StoneDetailsService,
    private utilService: UtilService,
    private daypSvc: DaypService,
    private messageService: MessageService,
    private searchSvc: SearchService,
    private notify: NotifyService,
    private downloadSvc: DownloadStonesService,
    private notesService: AddNoteService,
    private appStore: ApplicationStorageService,
    private authService: AuthService) { }

  ngOnInit() {
    this.allColumnWidth = this.userProfileService.getColumnWidth();
    this.daypColumnWidth = this.userProfileService.getDAYPColumnWidth();
    this.colWidth = this.allColumnWidth;
    // this.filterFlag = this.appStore.getData('filterFlag');
    this.selectedColumnList = this.userProfileService.getSelectedColumnList();
    this.offerColumnList = this.userProfileService.getSelectedDaypValues();
    this.message = 'Loading...';
    this.getStoneList();
    [this.isColumnExpanded, this.isIconVisible] = this.utilService.getExpandedColumnValue();
    this.packetSubscription = this.notify.notifyBasketPacketUpdatePageActionObservable$.subscribe(res => {
      this.updatePacketDetails(res);
    });
    this.stonePriceUpdateSubscription = this.notify.notifyStoneStateUpdatedObservable$.subscribe((res) => {
      this.updateStoneStateDetails(res);
      // if (res.daypAction === 'daypSubmitted') {

      //   res.daypAction = 'DAYPStoneOfferUpdated';
      //   this.stonesActedOn = {'source' : 'daypStoneStateUpdated', 'data' : res};

      // } else {

      //   this.stonesActedOn = {'source' : 'daypStoneStateUpdated', 'data' : res};

      // }

    });
    this.tabChangeSubscription = this.notify.notifyTabChangeActionObservable$.subscribe(res => {
      if (res.index === 3) {
        if (this.daypSubmissionSubscription) {
          this.daypSubmissionSubscription.unsubscribe();
        }
        this.getStoneList();
      }
    });
    this.daypSvc.handlekeyupEvent('daypMySubmittedContainer');
    this.addNoteSubscription = this.notify.addNewNotesForIggridObservable$.subscribe(res => {
      if (res.isDeleteFlow) {
        this.deleteCommentsFromStones(res);
      } else {
        this.updateNotesForStones(res);
      }
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      if (this.appStore.getData('daypSubmissionPageRef')) {
        const scrollable = this.daypMySubmittedContainer.instance.getScrollable();
        scrollable.scrollTo({ left: 0, top: this.appStore.getData('daypSubmissionPageRef') });
      }
    }, 2000);
    this.daypSvc.setSortedColumnIndex(this.daypMySubmittedContainer, this.daypSubmittedData);
  }

  getStoneList() {
    if (this.daypStatus || this.isEditableMode) {
      if (this.appStore.getData('daypMySubmissionDetails')) {
        this.daypSubmittedData = this.appStore.getData('daypMySubmissionDetails');
      }
      this.getDaypMySubmissionList();
    }
  }

  gridRefresh(eve) {
    this.gridRebind = eve.gridRebind;
  }

  getDaypMySubmissionList() {
    this.message = 'Loading...';
    this.daypSubmissionSubscription = this.daypSvc.getDaypFinalSubmiitedStones().subscribe((response) => {
      if (response && !response.error_status && MessageCodesComparator.AreEqual(response.code, MessageCodes.SMS_MHS_SF_200)) {
        response.data = this.utilService.updateStonesForDecimal(response.data);
        this.daypSubmittedData = this.daypSvc.initializeStoneListObject(response.data);
        this.daypSubmittedData = this.daypSvc.checkSelectedStones(this.daypSubmittedData, this.appStore.getData('daypMySubmissionDetails'));
        this.updateExtraStoneDetails();
        this.isDataFetched = true;
        this.adjustTableSize();
      } else if (response && response.error_status && MessageCodesComparator.AreEqual(response.code, MessageCodes.SMS_DEE_200)) {
        this.daypStatus = false;
      } else if (response && response.error_status && MessageCodesComparator.AreEqual(response.code, MessageCodes.DAYP_SNF_404)) {
        this.daypSubmittedData = {};
        this.message = 'NO_STONE_FOUND_DAYP_SUBMISSION';
      } else if (response && response.error_status && MessageCodesComparator.AreEqual(response.code, MessageCodes.SMS_DAYP_DNA_200)) {
        this.daypSubmittedData = {};
        this.message = 'DATA_NOT_AVAILABLE_DAYP';
      } else if (response && response.error_status) {
        this.daypSubmittedData = {};
        this.message = 'ERR_GET_DAYP_MYSUBMITTED';
      }
    }, error => {
      this.message = 'ERR_GET_DAYP_MYSUBMITTED';
    });
  }

  updateExtraStoneDetails() {
    this.daypSubmittedData = this.daypSvc.updateSortedObject(this.daypSubmittedData, this.appStore.getData('daypMySubmissionDetails'));
    if (this.daypSubmittedData.selectedStoneTable && this.daypSubmittedData.selectedStoneTable.length > 0) {
      this.daypSubmittedData.selectedStoneTable = this.daypSvc.fetchStoneAdditionalInfo(this.daypSubmittedData.selectedStoneTable);
      this.daypSubmittedData.selectedStoneTable = this.daypSvc.fetchStonesComment(this.daypSubmittedData.selectedStoneTable);
    }
    this.updatePacketDetails(this.packetStoneArray);
    this.appStore.store('daypMySubmissionDetails', this.daypSubmittedData);
  }

  selectAllStones() {
    if (this.daypSubmittedData.isAllResultSelected) {
      this.daypSubmittedData.selectedStoneButton = this.stoneSvc.createStoneIdList(this.daypSubmittedData.diamondTable);
      this.daypSubmittedData.filteredStone = this.stoneSvc.createStoneIdList(this.daypSubmittedData.diamondTable);
      this.daypSubmittedData.selectedStoneTable = JSON.parse(JSON.stringify(this.daypSubmittedData.diamondTable));
    } else {
      this.daypSubmittedData.selectedStoneButton = [];
      this.daypSubmittedData.selectedStoneTable = [];
      this.daypSubmittedData.filteredStone = [];
    }
    this.daypSubmittedData.isAllSelected = this.searchSvc.isArrayMatch(this.daypSubmittedData.selectedStoneButton,
      this.daypSubmittedData.filteredStone);
    this.updateDaypStoneDetails(this.daypSubmittedData);
    this.updateRowColor();
  }

  /*selectMultipleStone(id) {
    this.daypSubmittedData = this.searchSvc.fetchSelectedStones(this.daypSubmittedData, id);
    if (this.daypSubmittedData.selectedStoneTable.length === 0) {
      this.isEditable = false;
    }
    if (this.filterDataSource.length > 0) {
      this.isAllFilterStoneSelected();
    }
    this.updateRowColor();
    this.updateDaypStoneDetails(this.daypSubmittedData);
  }*/

  selectMultipleStone(data) {

    if (Array.isArray(data)) {

      this.daypSubmittedData.selectedStoneButton = [];
      this.daypSubmittedData.filteredStone = [];
      this.daypSubmittedData.selectedStoneTable = [];

      if (data.length > 0) {

        data.forEach((elm, index) => {

          this.daypSubmittedData.selectedStoneButton.push(elm._id);
          this.daypSubmittedData.filteredStone.push(elm._id);
          this.daypSubmittedData.selectedStoneTable.push(

            this.daypSubmittedData.diamondTable.find(elem => { return elm._id === elem._id; })

          );

          if (index === data.length - 1) {

            this.isAllFilterStoneSelected();
            this.updateDaypStoneDetails(this.daypSubmittedData);
            this.updateRowColor();

          }

        });

      } else {

        this.isEditable = false;
        this.updateDaypStoneDetails(this.daypSubmittedData);

      }


    } else {

      if (data.added === true) {

        this.daypSubmittedData.selectedStoneButton.push(data.stoneId);

      } else {

        this.daypSubmittedData.selectedStoneButton = this.daypSubmittedData.selectedStoneButton.filter(elm => { return elm !== data.stoneId; });

        if (this.daypSubmittedData.selectedStoneButton.length === 0) {

          this.isEditable = false;

        }

      }

      this.daypSubmittedData = this.searchSvc.fetchSelectedStones(this.daypSubmittedData, data.stoneId);
      if (this.filterDataSource.length > 0) {
        this.isAllFilterStoneSelected();
      }
      this.updateDaypStoneDetails(this.daypSubmittedData);
      this.updateRowColor();

    }

  }

  updateStoneStateDetails(res) {
    const stoneList = res.stoneList;
    if (stoneList) {
      if (!this.daypSubmittedData || this.daypSubmittedData === {}) {
        this.daypSubmittedData = this.daypSvc.initializeStoneListObject([]);
      }
      if (res.hasOwnProperty('daypAction')) {
        if (res.daypAction === 'removeStoneFromSubmission') {
          this.daypSubmittedData.selectedStoneButton.forEach(value => {
            if (stoneList.indexOf(value) > -1) {
              this.stoneSvc.removeElement(this.daypSubmittedData.selectedStoneButton, value);
            }
          });
          this.daypSubmittedData.filteredStone.forEach(value => {
            if (stoneList.indexOf(value) > -1) {
              this.stoneSvc.removeElement(this.daypSubmittedData.filteredStone, value);
            }
          });
          this.daypSubmittedData.diamondTable = this.daypSvc.removeStoneFromTable(this.daypSubmittedData.diamondTable, stoneList);
          if (this.daypSubmittedData.selectedStoneTable && this.daypSubmittedData.selectedStoneTable.length > 0) {
            this.daypSubmittedData.selectedStoneTable =
              this.daypSvc.removeStoneFromTable(this.daypSubmittedData.selectedStoneTable, stoneList);
          }
          this.daypSubmittedData = this.daypSvc.updateDaypObjectData(this.daypSubmittedData, stoneList);
          // we use  'confirmedStones' key to remove stone on click of remove from dayp-submited
          const newResponse = { ...res };
          newResponse['source'] = 'confirmedStones';
          console.log("My submission---", newResponse)
          this.stonesActedOn = newResponse;
        } else if (res.daypAction === 'daypSubmitted') {
          const daypSubmittedData = this.daypSubmittedData;
          if (daypSubmittedData && daypSubmittedData.diamondTable) {

            if (res.status === 'overwrite') {
              this.daypSubmittedData = this.daypSvc.initializeStoneListObject([]);
              this.daypSubmittedData.diamondTable = this.updateDAYPStoneInfo(this.daypSubmittedData.diamondTable, stoneList, res);
              // this.stonesActedOn = {source: 'overWriteExcel', data: this.daypSubmittedData.diamondTable};
              if (daypSubmittedData.selectedStoneTable && daypSubmittedData.selectedStoneTable.length > 0) {
                this.daypSubmittedData.selectedStoneTable = this.updateDAYPSelectedStoneInfo
                  (this.daypSubmittedData.selectedStoneTable, stoneList, res);
              }
            } else {
              this.daypSubmittedData.diamondTable = this.updateDAYPStoneInfo(daypSubmittedData.diamondTable, stoneList, res);
              // this.stonesActedOn = {source: 'overWriteExcel', data: this.daypSubmittedData.diamondTable};
              if (daypSubmittedData.selectedStoneTable && daypSubmittedData.selectedStoneTable.length > 0) {
                this.daypSubmittedData.selectedStoneTable = this.updateDAYPSelectedStoneInfo
                  (daypSubmittedData.selectedStoneTable, stoneList, res);
              }
            }
            const newResponse = { ...res };
            newResponse['source'] = 'offerOnSelectedStonesUpdated';
            this.stonesActedOn = newResponse;
          } else {
            this.getDaypMySubmissionList();
          }
        } else if (res.daypAction === 'daypPriceMidUpdated' || res.daypAction === 'offerOnSelectedStonesUpdated') {
          if (res.isCancelled) {
            if (this.originalDataSource && this.originalDataSource.diamondTable) {
              const revertStoneList = this.stoneSvc.createStoneIdList(this.originalDataSource.diamondTable);
              this.daypSubmittedData.diamondTable = this.updateDAYPStoneInfo(this.originalDataSource.diamondTable, revertStoneList, res);
              this.originalDataSource = null;
            }
          } else {
            this.daypSubmittedData.diamondTable = this.updateDAYPStoneInfo(this.daypSubmittedData.diamondTable, stoneList, res);
          }
          if (this.daypSubmittedData.selectedStoneTable && this.daypSubmittedData.selectedStoneTable.length > 0) {
            this.daypSubmittedData.selectedStoneTable = this.updateDAYPSelectedStoneInfo
              (this.daypSubmittedData.selectedStoneTable, stoneList, res);
          }
          const newResponse = { ...res };
          newResponse['source'] = res.daypAction;
          this.stonesActedOn = newResponse;
        } else if (res.status === '' && res.daypAction === 'daypPriceInserted') {
          res = this.validateStoneStateDetailsRemoveEntry(res);
          this.daypSubmittedData.selectedStoneButton.forEach(value => {
            if (stoneList.indexOf(value) > -1) {
              this.stoneSvc.removeElement(this.daypSubmittedData.selectedStoneButton, value);
            }
          });
          this.daypSubmittedData.filteredStone.forEach(value => {
            if (stoneList.indexOf(value) > -1) {
              this.stoneSvc.removeElement(this.daypSubmittedData.filteredStone, value);
            }
          });
          this.daypSubmittedData.diamondTable = this.daypSvc.removeStoneFromTable(this.daypSubmittedData.diamondTable, stoneList);
          // this.stonesActedOn = {source : 'removeStoneFromBasket', data: stoneList};
          if (this.daypSubmittedData.selectedStoneTable && this.daypSubmittedData.selectedStoneTable.length > 0) {
            this.daypSubmittedData.selectedStoneTable =
              this.daypSvc.removeStoneFromTable(this.daypSubmittedData.selectedStoneTable, stoneList);
          }
          this.daypSubmittedData = this.daypSvc.updateDaypObjectData(this.daypSubmittedData, stoneList);
          // we use  'confirmedStones' key to remove stone on click of remove from dayp- basket
          if (res.stoneList.length > 0) {
            const newResponse = { ...res };
            newResponse['source'] = 'confirmedStones';
            this.stonesActedOn = newResponse;
          }
        }
      } else {
        this.daypSubmittedData.diamondTable = this.daypSvc.updateTableStoneDetails(this.daypSubmittedData.diamondTable, stoneList, res);
        if (this.daypSubmittedData.selectedStoneTable && this.daypSubmittedData.selectedStoneTable.length > 0) {
          this.daypSubmittedData.selectedStoneTable =
            this.daypSvc.updateTableStoneDetails(this.daypSubmittedData.selectedStoneTable, stoneList, res);
        }
        this.stonesActedOn = res;
      }
      if (this.daypSubmittedData.diamondTable && this.daypSubmittedData.selectedStoneTable &&
        this.daypSubmittedData.diamondTable.length === this.daypSubmittedData.selectedStoneTable.length) {
        this.daypSubmittedData.isAllResultSelected = true;
      }
      this.updateDaypStoneDetails(this.daypSubmittedData);
      this.appStore.store('daypMySubmissionDetails', this.daypSubmittedData);
    }
  }

  updateDAYPStoneInfo(table, stoneList, res) {
    if (table) {
      table = this.daypSvc.updateDAYPStonePriceValue(JSON.parse(JSON.stringify(table)), res.stoneObj, true);
    }
    return table;
  }

  updateDAYPSelectedStoneInfo(table, stoneList, res) {
    if (table) {
      table = this.daypSvc.updateDAYPStonePriceValue(JSON.parse(JSON.stringify(table)), res.stoneObj, false);
    }
    return table;
  }

  refreshDaypTable() {
    if (this.daypMySubmittedContainer) {
      this.daypMySubmittedContainer.instance.refresh();
      if (this.selectedDaypStonesPanel && this.selectedDaypStonesPanel.hasOwnProperty('selectedDaypStoneContainer') &&
        this.selectedDaypStonesPanel.selectedDaypStoneContainer) {
        this.selectedDaypStonesPanel.selectedDaypStoneContainer.instance.refresh();
      }
    }
  }

  toggleSelectedDaypPanel(event) {
    this.updateDaypStoneDetails(event.array);
    this.selectedTableToggle = event.status;
  }

  updateDaypStones(event) {
    if (this.filterDataSource.length > 0) {
      this.isAllFilterStoneSelected();
    }
    this.updateRowColor();
    this.updateDaypStoneDetails(event.array);
  }

  updateDaypStoneDetails(array) {
    if (array) {
      this.daypSubmittedData.selectedStoneTable = array.selectedStoneTable;
      this.daypSubmittedData.selectedStoneButton = array.selectedStoneButton;
      this.daypSubmittedData.filteredStone = array.filteredStone;
      this.daypSubmittedData.toggleTableDisplay = array.toggleTableDisplay;
      if (!array.isAllSelected) {
        this.daypSubmittedData.isAllSelected = false;
        this.daypSubmittedData.isAllResultSelected = false;
        this.daypSubmittedData.toggleTableDisplay = false;
        this.daypSubmittedData.selectedStoneButton = [];
        this.daypSubmittedData.filteredStone = [];
        this.daypSubmittedData.selectedStoneTable = [];
      }
    }
    this.getSelectedStoneCarat();
    this.adjustTableSize();
    this.appStore.store('daypMySubmissionDetails', this.daypSubmittedData);
  }

  getSelectedStoneCarat() {
    this.daypSubmittedData.selectedStonesCarat = 0;
    this.daypSubmittedData.totalOfferAmount = 0;
    if (this.daypSubmittedData.selectedStoneTable.length > 0) { }
    this.daypSubmittedData.selectedStoneTable.forEach(stone => {
      this.daypSubmittedData.selectedStonesCarat += Number(stone.carat);
      this.daypSubmittedData.totalOfferAmount += Number(stone.dayp_amount);
    });
  }

  showAllCommentsForStone(notes) {
    this.commentsOverlayVisible = true;
    this.allNotesForStone = notes;
  }

  toggleAddNoteOverlay(e) {
    if (e.forAddNote) {
      this.addnoteOverlayVisible = e.visible;
    } else {
      this.commentsOverlayVisible = e.visible;
    }
    // if (e.noteDetil) {
    //   this.updateStoneComments({ status: true });
    //   this.refreshDaypTable();
    // }
  }

  updateStoneComments(event) {
    if (event.status) {
      // this.getNotesForAllStones();
    }
  }

  addStoneInfoTab(data) {
    // this.getPageRef();

    data = this.daypSubmittedData.diamondTable.find(elm => { return elm._id === data; });

    data['CurrentSelectedTab'] = 'daypSubmmit';
    if (!this.isEditableMode) {
      this.notify.notifyDaypPageForStoneClickedForDetail({ type: 'stoneDtl', 'data': data });
    }
  }

  addTwinStoneInfoTab(pairId) {
    // this.getPageRef();
    if (!this.isEditableMode) {
      this.notify.notifyDaypPageForStoneClickedForDetail({ type: 'twinStoneDtl', 'data': pairId });
    }
  }

  toggleMultimediaOverlay(stoneInfo) {
    this.themeMultimediaPopUp.initializePopUp();
    this.stoneMultimediaInfo = stoneInfo;
    this.toggleMultimediaPopup = true;
  }

  toggleCloseMultimediaPopUp(e) {
    this.toggleMultimediaPopup = e.status;
  }

  /******************* DDC *******************************/
  updateDDC(stoneData) {
    this.ddcStones = [];
    this.thmDdcOverlay.selectedDdcHour = 0;
    this.definedDDCHour = 0;
    this.ddcStones.push(stoneData.stone_id);
    if (stoneData.ddcHour > 0) {
      this.definedDDCHour = stoneData.ddcHour;
    }
    this.ddcOverlayVisible = true;
  }

  toggleDdcOverlay(e) {
    this.ddcOverlayVisible = e.visible;
  }

  showDowaloadOptions() {
    this.selectedDownloadType = 0;
    this.downloadOptions = this.downloadSvc.getDownloadOptions('excel_download_dayp_btn');
    this.downloadPopOverVisible = true;
  }

  downloadDaypStones(array) {
    const stoneList = JSON.parse(JSON.stringify(array.filteredStone));
    if (stoneList.length > 0) {
      if (this.selectedDownloadType === 'excel') {
        let tableArray = JSON.parse(JSON.stringify(array.diamondTable));
        tableArray.forEach(element => {
          element['final_submit'] = true;
        });
        this.downloadSvc.downloadDaypStoneExcel(tableArray, stoneList);
      } else {
        this.downloadSvc.downloadStoneDetails(array.diamondTable, stoneList, this.selectedDownloadType);
      }
      this.downloadPopOverVisible = false;
      this.selectedDownloadType = null;
    } else {
      this.selectedDownloadType = null;
      this.messageService.showErrorGrowlMessage('NO_SELECTED_STONE');
    }
  }
  sendExcelMail(array) {
    const stoneList = JSON.parse(JSON.stringify(array.filteredStone));
    if (stoneList.length > 0) {
      this.downloadSvc.mailDAYPStoneExcel(array.diamondTable, stoneList, 'DAYP SUBMISSIONS');
    } else {
      this.messageService.showErrorGrowlMessage('NO_SELECTED_STONE');
    }
  }

  stoneToOperateInPacket(data) {
    this.notify.notifyDaypForPacketUpdate({ visible: true, object: [data] });
  }

  updatePacketDetails(event) {
    if (event && event.array && event.array.length > 0) {
      this.packetIconDataForGrid = event.array.map(elm => { return elm.stones.toString(); }).toString();
    }
    if (event) {
      if (this.daypSubmittedData && this.daypSubmittedData.diamondTable) {
        this.daypSubmittedData.diamondTable = this.stoneSvc.setStonePacketCount(this.daypSubmittedData.diamondTable);
        this.daypSubmittedData.diamondTable = this.stoneSvc.updateStonePacketCount(event, this.daypSubmittedData.diamondTable);
      }
      if (this.daypSubmittedData && this.daypSubmittedData.selectedStoneTable) {
        this.daypSubmittedData.selectedStoneTable = this.stoneSvc.setStonePacketCount(this.daypSubmittedData.selectedStoneTable);
        this.daypSubmittedData.selectedStoneTable = this.stoneSvc.updateStonePacketCount(event, this.daypSubmittedData.selectedStoneTable);
      }
    }
  }

  getNotesForAllStones() {
    if (this.daypSubmittedData && this.daypSubmittedData.diamondTable) {
      // this.daypSubmittedData.diamondTable = this.daypSvc.fetchStonesComment(this.daypSubmittedData.diamondTable);

      if (this.noteAddSubscription) {
        this.noteAddSubscription.unsubscribe();
      }
      this.noteAddSubscription = this.notesService.getCommentListforStoneIds(this.daypSubmittedData.diamondTable).subscribe((res) => {
        this.daypSubmittedData.diamondTable = res;
        this.stonesActedOn = { 'source': 'noteAdded', data: this.daypSubmittedData.diamondTable };
      }, error => {
        this.stonesActedOn = { 'source': 'noteAdded' };
      });

      if (this.daypSubmittedData.selectedStoneTable && this.daypSubmittedData.selectedStoneTable.length > 0) {
        this.daypSubmittedData.selectedStoneTable = this.daypSvc.fetchStonesComment(this.daypSubmittedData.selectedStoneTable);
      }
    }
  }

  getPageRef() {
    const scrollable = this.daypMySubmittedContainer.instance.getScrollable('#daypMySubmittedContainer');
    this.appStore.store('daypSubmissionPageRef', scrollable.scrollTop());
  }

  scrollTable(params) {
    if (params === 'left') {
      this.stoneSvc.scrollLeft(this.daypMySubmittedContainer, '#daypMySubmittedContainer');
    } else if (params === 'right') {
      this.stoneSvc.scrollRight(this.daypMySubmittedContainer, '#daypMySubmittedContainer');
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
    this.stoneSvc.handleSortingOrder(this.daypMySubmittedContainer);
    const columns = JSON.parse(JSON.stringify(this.daypMySubmittedContainer.columns));
    if (this.isColumnExpanded) {
      columns[1].width = 275;
    } else {
      columns[1].width = 130;
    }
    this.daypMySubmittedContainer.columns = columns;
  }

  ngOnDestroy() {
    if (this.packetSubscription) {
      this.packetSubscription.unsubscribe();
    }
    if (this.noteAddSubscription) {
      this.noteAddSubscription.unsubscribe();
    }
    if (this.stonePriceUpdateSubscription) {
      this.stonePriceUpdateSubscription.unsubscribe();
    }
    this.tabChangeSubscription.unsubscribe();
    if (this.addNoteSubscription) {
      this.addNoteSubscription.unsubscribe();
    }
  }

  onCellPrepared(e) {
    this.daypSvc.onCellPrepared(e, this.daypSubmittedData.selectedStoneButton);
  }

  updateRowColor() {
    this.daypSvc.updateRowColor(this.daypMySubmittedContainer, this.daypSubmittedData);
  }

  editSubmittedStones(event) {
    this.originalDataSource = JSON.parse(JSON.stringify(this.daypSubmittedData));
    this.isEditable = event.isEditable;
  }

  onPriceInput(data, priceRef: any) {
    const reg = /[^0-9\.\,]/ig;
    if (priceRef.value && reg.test(priceRef.value)) {
      const start = priceRef.selectionStart, end = priceRef.selectionEnd;
      const value = String(priceRef.value).replace(reg, '')
      priceRef.value = value;
      priceRef.setSelectionRange(start, end - 1);
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

  onSingchange(sign, stone_id) {
    this.daypSubmittedData.diamondTable.forEach(stone => {
      if (stone.stone_id === stone_id) {
        stone.offerSign = sign;
        stone = this.daypSvc.resetDaypValue(stone, {});
      }
    });
  }

  addOfferPriceForStone(data, offerPrice) {
    if (offerPrice != '' && Number(data.dayp_rate) !== Number(offerPrice)) {
      const response = this.daypSvc.addOfferPriceForStone(data, offerPrice);
      if (response.status) {
        const newPrice = this.daypSvc.setOffPrice(response.data, offerPrice);
        if (newPrice.data.dayp_rate) {
          newPrice.data.dayp_rate = parseFloat(newPrice.data.dayp_rate).toFixed(2);
        }
        if (newPrice.data.dayp_per) {
          newPrice.data.dayp_per = parseFloat(newPrice.data.dayp_per).toFixed(2);
        }
        this.stonesActedOn = { source: 'DAYPStoneOfferUpdated', data: newPrice.data };
        this.notify.notifyStoneStateUpdated({ daypAction: 'daypPriceMidUpdated', stoneList: [data.stone_id], stoneObj: [response.data] });
      } else {
        this.daypSubmittedData.diamondTable = this.daypSvc.resetDaypOffers(this.daypSubmittedData.diamondTable, [data]);
        this.stonesActedOn = { source: 'DAYPStoneOfferUpdated', data: data };
        if (this.daypSubmittedData.selectedStoneTable && this.daypSubmittedData.selectedStoneTable.length > 0) {
          this.daypSubmittedData.selectedStoneTable = this.daypSvc.resetDaypOffers(this.daypSubmittedData.selectedStoneTable, [data]);
        }
      }
    } else if (offerPrice === '' && data.dayp_rate) {
      this.daypSubmittedData.diamondTable = this.daypSvc.resetDaypOffers(this.daypSubmittedData.diamondTable, [data]);
      this.stonesActedOn = { source: 'DAYPStoneOfferUpdated', data: data };
      if (this.daypSubmittedData.selectedStoneTable && this.daypSubmittedData.selectedStoneTable.length > 0) {
        this.daypSubmittedData.selectedStoneTable = this.daypSvc.resetDaypOffers(this.daypSubmittedData.selectedStoneTable, [data]);
      }
    }
  }

  addOfferPercentageForStone(data, offerPercentage, sign) {
    if (offerPercentage != '' && data.dayp_per !== Number(offerPercentage)) {
      const response = this.daypSvc.addOfferPercentageForStone(data, offerPercentage, sign);
      if (response.status) {
        this.notify.notifyStoneStateUpdated({ daypAction: 'daypPriceMidUpdated', stoneList: [data.stone_id], stoneObj: [response.data] });
        // this.stonesActedOn = {source: 'DAYPStoneOfferUpdated', data: data};
      } else {
        this.daypSubmittedData.diamondTable = this.daypSvc.resetDaypOffers(this.daypSubmittedData.diamondTable, [data]);
        this.stonesActedOn = { source: 'DAYPStoneOfferUpdated', data: data };
        if (this.daypSubmittedData.selectedStoneTable && this.daypSubmittedData.selectedStoneTable.length > 0) {
          this.daypSubmittedData.selectedStoneTable = this.daypSvc.resetDaypOffers(this.daypSubmittedData.selectedStoneTable, [data]);
        }
      }
    } else if (offerPercentage === '' && data.dayp_per) {
      this.daypSubmittedData.diamondTable = this.daypSvc.resetDaypOffers(this.daypSubmittedData.diamondTable, [data]);
      this.stonesActedOn = { source: 'DAYPStoneOfferUpdated', data: data };
      if (this.daypSubmittedData.selectedStoneTable && this.daypSubmittedData.selectedStoneTable.length > 0) {
        this.daypSubmittedData.selectedStoneTable = this.daypSvc.resetDaypOffers(this.daypSubmittedData.selectedStoneTable, [data]);
      }
    }
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.fixedHeader();
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    this.onWindowScroll();
    this.adjustTableSize();
  }

  fixedHeader() {
    this.currentScroll = window.scrollY;
    const containerWidth = jQuery('#fixedDaypPanel').outerWidth();
    if (jQuery('#fixedDaypPanel').offset() && jQuery('#fixedDaypPanel').offset().top) {
      this.menuDistanceFromTop = jQuery('#fixedDaypPanel').offset().top > 0 ? jQuery('#fixedDaypPanel').offset().top : 0;
      if ((this.currentScroll) > this.menuDistanceFromTop) {
        // jQuery('#daypPanel').addClass('stuck').innerWidth(containerWidth).css('padding-bottom', '10px');
        jQuery('#packetTabResultId').addClass('packet-struck');
        jQuery('#packetBox').css('display', 'none');
      } else {
        // jQuery('#daypPanel').removeClass('stuck').innerWidth(containerWidth).css('padding-bottom', '0px');
        jQuery('#packetTabResultId').removeClass('packet-struck');
        jQuery('#packetBox').css('display', 'block');
      }
      this.adjustTableSize();
    }
  }

  adjustTableSize() {
    this.daypHeight = window.innerHeight - 285;
    this.adjustTableBoxSize();
  }

  adjustTableBoxSize() {
    if (jQuery('#daypPanel')) {
      // jQuery('#daypPanel').css('height', window.innerHeight);
    }
  }

  onContentLoad(event) {
    this.daypSubmittedData = this.daypSvc.getSortedTable(this.daypMySubmittedContainer, this.daypSubmittedData);
    this.appStore.store('daypMySubmissionDetails', this.daypSubmittedData);
    const filters = this.daypMySubmittedContainer.instance.getCombinedFilter();
    if (filters) {
      const filterDataSource = this.daypMySubmittedContainer.instance.getDataSource();
      this.filterDataSource = JSON.parse(JSON.stringify(filterDataSource['_items']));
      this.isAllFilterStoneSelected();
    } else {
      this.filterDataSource = [];
      this.isFilterAllSelected = false;
    }
  }

  selectFilterStones() {
    this.daypSubmittedData = this.daypSvc.selectFilterStones(this.filterDataSource, this.isFilterAllSelected, this.daypSubmittedData);
    this.updateDaypStoneDetails(this.daypSubmittedData);
    this.updateRowColor();
  }

  isAllFilterStoneSelected() {
    this.isFilterAllSelected = this.daypSvc.isAllFilterStoneSelected(this.filterDataSource, this.daypSubmittedData.selectedStoneButton);
  }

  showFilterOptions() {
    if (this.filterFlag) {
      this.filterOptions = [{ label: 'Disable Filter', value: 'disableFilter' }, { label: 'Reset Filter', value: 'resetFilter' }];
    } else {
      this.filterOptions = [{ label: 'Enable Filter', value: 'enableFilter' }];
    }
    this.filterPopOverVisible = true;
  }

  toggleFilterPopOverVisible(e) {
    this.filterPopOverVisible = e.visible;
  }

  toggleFilterFlag(e) {
    this.filterFlag = e.filterFlag;
  }

  toggleColWidth(e) {
    this.colWidth = e.colWidth;
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

  updateStonesInselectedGrid(data) {

    // this.stonesActedOn = data;

  }

  // Display menu for icons
  stoneMediaIconPanel(event) {
    const data = this.stoneSvc.returnPositionOfOverlay(event);
    this.iconOverlayXPosition = data.left;
    this.iconOverlayYPosition = data.top;
    this.iconDisplayStoneObject = event.stoneId;
    this.displayIconOverlay = true;
  };

  closeGridIconOverlay(data) {

    this.displayIconOverlay = false;

  }

  validateStoneStateDetailsRemoveEntry(res) {
    const allStones = this.stoneSvc.createStoneIdList(this.daypSubmittedData.diamondTable);
    const commonStones = _.intersection(allStones, res.stoneList);
    if (res.hasOwnProperty('stoneObj') && _.isArray(res.stoneObj)) {
      const stoneObj = [];
      res.stoneObj.map(entry => {
        if (commonStones.indexOf(entry.stone_id) > -1) {
          stoneObj.push(entry);
        }
      });
      res['stoneObj'] = stoneObj;
    }
    res['stoneList'] = commonStones;
    return res;
  }
  updateNotesForStones(res) {
    if (this.daypSubmittedData.diamondTable && this.daypSubmittedData.diamondTable.length > 0) {
      const toUpdateStoneArray = this.stoneSvc.findStoneObjUsingStoneIds(this.daypSubmittedData.diamondTable, res.stoneList);
      if (toUpdateStoneArray instanceof Array && toUpdateStoneArray.length > 0) {
        this.notesService.fetchStonesAsynchronously(toUpdateStoneArray)
          .then(result => {

            this.daypSubmittedData.diamondTable = this.stoneSvc.findAndUpdateStoneCommentFromList(this.daypSubmittedData.diamondTable, result);
            
            if (result && result instanceof Array && result.length > 0) {
              this.updateSelectedStonesNote();
              this.stonesActedOn = { 'source': 'noteAdded', stoneList: res.stoneList };
            }

          }).catch(error => {

            console.error('Failed with error ');
            console.error(error);

          });
      }
    }
  }

  deleteCommentsFromStones(res) {
    const stoneList = [];
    if (this.daypSubmittedData.diamondTable && this.daypSubmittedData.diamondTable.length > 0) {
      const commentsId = res.commentList;
      this.daypSubmittedData.diamondTable.forEach(stone => {
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
      this.updateSelectedStonesNote();
      if (_.uniq(stoneList) && _.uniq(stoneList).length > 0) {
        this.stonesActedOn = { 'source': 'noteAdded', stoneList: _.uniq(stoneList) };
      }
    }
  }

  updateSelectedStonesNote() {
    if (this.daypSubmittedData.selectedStoneTable && this.daypSubmittedData.selectedStoneTable.length > 0) {
      this.daypSubmittedData.selectedStoneTable =
        this.stoneSvc.updateNotesForSelectedPanel(this.daypSubmittedData.selectedStoneTable, this.daypSubmittedData.diamondTable);
    }
    this.appStore.store('daypMySubmissionDetails', this.daypSubmittedData);
  }

}
