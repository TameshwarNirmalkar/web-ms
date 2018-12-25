import { Component, OnInit, Input, ViewChild, OnChanges, OnDestroy, Output, EventEmitter, AfterViewInit, ViewChildren, QueryList } from '@angular/core';
import { StoneDetailsService } from '@srk/shared';
import { AuthService } from '@srk/core';
import { CustomTranslateService } from '@srk/core';
import { MessageService } from '@srk/core';
import { ConfirmationService } from 'primeng/components/common/api';
import { EventDetailsService } from '@srk/core';
import { NotifyService } from '@srk/core';
import { MessageCodes, MessageCodesComparator } from '@srk/core';
import { UtilService } from '@srk/shared';
import { AddNoteService } from '@srk/shared';
import { UserProfileService } from '@srk/core';
import { BidToBuyService } from '@srk/shared';
import { ApplicationStorageService } from '@srk/core';
import { DxDataGridComponent } from 'devextreme-angular/ui/data-grid';
@Component({
  selector: 'app-my-appointment',
  templateUrl: './my-appointment.component.html',
  styleUrls: ['./my-appointment.component.scss']
})
export class MyAppointmentComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit {
  @ViewChild('themeMultimediaPopUp') themeMultimediaPopUp;
  @ViewChild('thmDdcOverlay') thmDdcOverlay;
  @ViewChild('bookAppointment') bookAppointment;
  @Input() eventId: any;
  @Input() visiblePacketIcon: any;
  @Output() appointmentPacket = new EventEmitter();
  @ViewChild('appointmentContainer') appointmentContainer;
  @ViewChildren(DxDataGridComponent) dataTables: QueryList<DxDataGridComponent>;
  public appointmentSubscription: any;
  public notAvailableStonesAppointment: boolean;
  public errorMessage: any;
  public appointedList = [];
  public appointedDate: any;
  public popUpTitle: any;
  public showCommentPopUp = false;
  public isAddComment: boolean;
  public clientName: any;
  public stoneAddedComment: any[];
  public newComments: any;
  public toggleMultimediaPopup = false;
  public stoneMultimediaInfo: any;
  public ddcOverlayVisible: boolean;
  public ddcStones: any[];
  public definedDDCHour: any;
  public selectedStones = [];
  public showAppointmentOverlay = false;
  public appointmentDetails: any;
  public stoneStatusSubscription: any;
  public selectedColumnList: any;
  public stoneButtonList: any;
  public selectedStoneObj: any;
  public httpSubscription: any;
  public selectedStonesArray: any;
  public commentsOverlayVisible = false;
  public allNotesForStone: any;
  public addnoteOverlayVisible = false;
  public btbSelectedStones = [];
  public isBTBDataLoaded = false;
  public isBTBClosed = false;
  public disableSaveComment = false;
  public btbOverlayVisible = false;
  public stoneArrayObj = [];
  public packetSubscription: any;
  public currentPopUp: any;
  public appointmentComment: any;
  public appointmentId: any;
  public timer;
  public columnWidth = 130;
  public isIconVisible: boolean = false;
  public selectedTableToggle = false;
  public allColumnWidth: any;
  public isColumnExpanded = false;
  
  constructor(
    private stoneDetailsService: StoneDetailsService,
    private customTranslateSvc: CustomTranslateService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private eventDetailsService: EventDetailsService,
    private notify: NotifyService,
    private authService: AuthService,
    private notesService: AddNoteService,
    private bidToBuyService: BidToBuyService,
    private userProfileService: UserProfileService,
    private appStore: ApplicationStorageService,
    private utilService: UtilService
  ) { }

  ngOnInit() {
    this.allColumnWidth = this.userProfileService.getColumnWidth();
    this.stoneButtonList = {
      addNote: true,
      removeAppointmentStone: true,
      applyDDC: true,
      addToBasket: true,
    };
    [this.isColumnExpanded, this.isIconVisible] = this.utilService.getExpandedColumnValue();
    this.selectedColumnList = this.userProfileService.getSelectedColumnList();
    this.clientName = this.authService.getUserDetail().person_name;
    this.appointmentSubscription = this.notify.notifyUpdateAppointmentListObservable$.subscribe((res) => {
      if (res.source === 'bookAppointment') {
        let flag = false;
        if (this.appointedList && this.appointedList.length > 0) {
          this.appointedList.forEach(appointment => {
            if (appointment.data.appointment_id === res.appointmentObj.appointment_id) {
              appointment.data.party_remark = res.appointmentObj.party_remark;
              flag = true;
            };
          });
        }
        if (!flag) {
          this.createAppointmentEntry(res.appointmentObj);
        }
      } else if (res.source === 'updateAppointment') {
        this.updateAppointmentList(res.appointmentObj);
      }
    });
    this.stoneStatusSubscription = this.notify.notifyStoneStateUpdatedObservable$.subscribe((res) => {
      this.updateStoneStatus(res);
    });
    this.packetSubscription = this.notify.notifyBasketPacketUpdatePageActionObservable$.subscribe(res => {
      this.updatePacketDetails(res);
    });
  }

  ngOnChanges() {
    if (this.eventId) {
      this.selectedStoneObj = {
        selectedStones: [],
        selectedStoneArray: [],
        panelData: {},
        isAllSelectedStoneSelected: false
      };
      if (this.appStore.getData('my-appointment-selected-stone-panel')) {
        const selectionObj = this.appStore.getData('my-appointment-selected-stone-panel');
        this.selectedStones = selectionObj['selectedStones'];
        this.selectedStonesArray = selectionObj['selectedStoneArray'];
        this.updateSelectedStonePanel();
      }
      this.initializeAppointmentArray();
    }
  }

  initializeAppointmentArray() {
    this.appointedList = [];
    this.getAllappointedList(this.eventId)
    if(this.appStore.getData('myAppointmentArray')){
    this.appointedList = this.appStore.getData('myAppointmentArray')
    } 
     
  }
  
  getAllappointedList(eventId) {
    this.eventDetailsService.fetchSubmittedAppointment(eventId).subscribe(res => {
      if (!res.error_status) {
        if (MessageCodesComparator.AreEqual(res.code, MessageCodes.EVENT_EAD_200)
          && res.data.length > 0) {
          res.data.forEach(element => {
            this.createAppointmentEntry(element);
          });
        } else {
          this.notAvailableStonesAppointment = true;
        }
      }
    }, error => {
      this.errorMessage = 'SERVER_ERROR_OCCURRED';
    });
  }

  createAppointmentEntry(response) {
    const stoneIds = response.stone_ids;
    const dataEntry = {
      data: response,
      toggleTable: false,
      table: [],
      selectedStones: [],
      isAllSelected: false,
      isColumnExpanded: false,
      columnWidth: 200,
      isIconVisible: false
    };
    if (stoneIds.length > 0) {
      this.stoneDetailsService.getStoneDetails(stoneIds).subscribe(res => {
        dataEntry['table'] = this.utilService.updateStonesForDecimal(res);
        dataEntry.table.forEach(tableObj => {
          tableObj['appointment_id'] = dataEntry.data.appointment_id;
        });
        dataEntry.data.not_available = dataEntry.table.length - this.fetchConfirmableStones(dataEntry).length;
        this.appointedList.push(dataEntry);
        this.appointedList = this.sortByAppointment(this.appointedList);
      });
    } else {
      this.appointedList.push(dataEntry);
      this.appointedList = this.sortByAppointment(this.appointedList);
    }
    this.appStore.store('myAppointmentArray', this.appointedList);
  }

  sortByAppointment(requestData) {
    requestData.sort(function (obj1, obj2) {
      if (obj1.data.appointment_date < obj2.data.appointment_date) {
        return -1;
      } else if (obj1.data.appointment_date > obj2.data.appointment_date) {
        return 1;
      } else {
        return 0;
      }
    });
    return requestData;
  }

  toggleTable(id) {
    this.appointedList.forEach((element) => {
      if (id === element.data.appointment_id) {
        const i = this.appointedList.indexOf(element);
        this.appointedList[i].toggleTable = !this.appointedList[i].toggleTable;
        if (this.appointedList[i].toggleTable) {
          this.stoneDetailsService.storeStoneAdditionalInfo(this.appointedList[i].table).subscribe((response) => {
            this.appointedList[i].table = response;
            this.notesService.getCommentListforStoneIds(this.appointedList[i].table).subscribe((res) => {
              this.appointedList[i].table = res;
            }, error => {
              this.messageService.showErrorGrowlMessage('ERR_FETCH_EXTRA_STONE_INFO');
            });
            this.appStore.store('myAppointmentArray', this.appointedList);
          });
        }
      }
    });
  }

  toggleMultimediaOverlay(stoneInfo) {
    this.themeMultimediaPopUp.initializePopUp();
    this.toggleMultimediaPopup = true;
    this.stoneMultimediaInfo = stoneInfo;
  }

  toggleCloseMultimediaPopUp(e) {
    this.toggleMultimediaPopup = e.status;
  }

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

  toggleEditAppointment(obj) {
    this.bookAppointment.initializeAppointment();
    this.appointmentDetails = {
      'appointment_date': obj.appointment_date,
      'slot_id': obj.slot_id,
      'party_remark': obj.party_remark,
      'appointment_id': obj.appointment_id,
      'slot_type': obj.slot_type,
      'stone_ids': obj.stone_ids,
      'total_stones': obj.total_stones,
      'not_available': obj.not_available
    };
    this.showAppointmentOverlay = !this.showAppointmentOverlay;
    this.popUpTitle = 'EDIT_APPOINTMENT';
  }

  closeAppointmentOveraly(e) {
    this.showAppointmentOverlay = e.status;
  }

  updateAppointmentList(obj) {
    this.appointedList.forEach(element => {
      if (element.data.appointment_id === obj.appointment_id) {
        element.data.appointment_date = obj.appointment_date;
        element.data.slot_id = obj.slot_id;
        element.data.party_remark = obj.party_remark;
        element.data.slot_type = obj.slot_type;
        element.data.appointment_from_time = obj.appointment_from_time;
        element.data.appointment_to_time = obj.appointment_to_time;
        if (element.data.stone_ids.length !== obj.stone_ids.length) {
          this.stoneDetailsService.getStoneDetails(obj.stone_ids).subscribe(res => {
            element['table'] = this.utilService.updateStonesForDecimal(res);
            element.table.forEach(tableObj => {
              tableObj['appointment_id'] = obj.appointment_id;
            });
            element.data.not_available = element.table.length - this.fetchConfirmableStones(element).length;
            element.isAllSelected = false;
            element.toggleTable = false;
          });
        }
      }
    });
    this.appointedList = this.sortByAppointment(this.appointedList);
    this.appStore.store('myAppointmentArray', this.appointedList);
  }

  updateStoneStatus(res) {
    this.appointedList.forEach(listObj => {
      this.eventDetailsService.updateIconsStatusInfo(listObj.table, res);
      if (res.source === 'confirmedStones') {
        res.stoneList.forEach(stone => {
          const i = listObj.selectedStones.indexOf(stone);
          if (i > -1) {
            listObj.selectedStones.splice(i, 1);
          }
          this.filterSelectedStones(listObj);
        });
      }
      listObj.data.not_available = listObj.table.length - this.fetchConfirmableStones(listObj).length;
    });
    this.appStore.store('myAppointmentArray', this.appointedList);
  }

  updateSelectedStonePanel() {
    if (this.httpSubscription) {
      this.httpSubscription.unsubscribe();
    }
    this.selectedStoneObj['selectedStones'] = this.selectedStones;
    this.selectedStoneObj['selectedStoneArray'] = this.selectedStonesArray;
    this.selectedStoneObj['panelData'] = {};
    if (this.selectedStones.length > 0) {
      this.selectedStoneObj.isAllSelectedStoneSelected = true;
      this.httpSubscription = this.stoneDetailsService.getDiamondPriceInfo(this.selectedStoneObj.selectedStoneArray).subscribe(res => {
        this.selectedStoneObj['selectedStoneArray'] = res;
        this.selectedStoneObj['panelData'] = this.stoneDetailsService.calculateSelectedStoneData(this.selectedStoneObj.selectedStoneArray);
      });
    } else {
      this.selectedStoneObj.isAllSelectedStoneSelected = false;
    }
    this.updateRowColor();
    this.appStore.store('my-appointment-selected-stone-panel', this.selectedStoneObj);
  }

  updateAppointmentArray(e) {
    let unselectedStones = [];
    unselectedStones = this.selectedStones.filter(stone => {
      return e.array.selectedStones.indexOf(stone) === -1;
    });
    this.appointedList = this.removeUnselectedStones(this.appointedList, unselectedStones);
    this.selectedStones = e.array.selectedStones;
    if (this.selectedStones.length === 0) {
      this.selectedTableToggle = false;
    }
    this.selectedStonesArray = e.array.selectedStoneArray;
    this.updateSelectedStonePanel();
  }

  removeUnselectedStones(array, stones) {
    array.forEach(data => {
      const allSelectedStoneArray = JSON.parse(JSON.stringify(data.selectedStones));
      stones.forEach(stone_id => {
        const i = allSelectedStoneArray.indexOf(stone_id);
        if (i !== -1) {
          allSelectedStoneArray.splice(i, 1);
        }
      });
      data.selectedStones = allSelectedStoneArray;
      data = this.fitlerArrayStones(data);
    });
    return array;
  }

  toggleSelectedTable(e) {
    this.selectedTableToggle = e.status;
  }

  isAllCheckboxSelected(array) {
    if (array.isAllSelected) {
      array.selectedStones = [];
      array.selectedStones = this.fetchConfirmableStones(array);
      array['appointmentObj'] = this.createAppointmentDateObj(array);
    } else {
      array.selectedStones = [];
      array.appointmentObj = [];
    }
    this.fetchStoneDetails();
  }

  createAppointmentDateObj(array) {
    const appointmentObj = [];
    if (array.selectedStones) {
      array.selectedStones.forEach(stones => {
        const obj = {
          'stone_id': stones,
          'appointment_id': array.data.appointment_id
        };
        appointmentObj.push(obj);
      });
    }
    return appointmentObj;
  }

  filterSelectedStones(array) {
    array['appointmentObj'] = this.createAppointmentDateObj(array);
    array = this.fitlerArrayStones(array);
    this.fetchStoneDetails();
  }

  fitlerArrayStones(array) {
    let availableStones = [];
    availableStones = this.fetchConfirmableStones(array);
    if (availableStones.length > 0) {
      array.isAllSelected = this.stoneDetailsService.isArrayMatch(array.selectedStones, availableStones);
    }
    return array;
  }

  fetchConfirmableStones(array) {
    const confirmableStones = [];
    array.table.forEach(element => {
      if (((element.stone_state === 6)
        || (element.stone_state === 0)
        || (element.stone_state === 3 && element.reason_code !== 1))) {
      } else {
        confirmableStones.push(element.stone_id);
      }
    });
    return confirmableStones;
  }

  fetchStoneDetails() {
    this.selectedStonesArray = [];
    this.selectedStones = this.fetchAllSelectedStones(this.appointedList);
    this.selectedStonesArray = this.fetchSelectedStoneDetails(this.selectedStones, this.appointedList);
    this.updateSelectedStonePanel();
  }

  fetchSelectedStoneDetails(selectedStones, array) {
    const selectedStonesArray = [];
    selectedStones.forEach(stone => {
      array.forEach(arrayObj => {
        if (arrayObj.appointmentObj) {
          arrayObj.appointmentObj.forEach(value => {
            if (arrayObj.data.appointment_id === value.appointment_id) {
              arrayObj.table.forEach(tableObj => {
                if (tableObj.stone_id === value.stone_id) {
                  selectedStonesArray.push(tableObj);
                }
              });
            }
          });
        }
      });
    });
    return this.stoneDetailsService.removeDuplicatesFromObject(selectedStonesArray, 'stone_id');
  }

  fetchAllSelectedStones(array) {
    const allSelectedStones = [];
    array.forEach(element => {
      element.selectedStones.forEach(stones => {
        allSelectedStones.push(stones);
      });
    });
    return this.stoneDetailsService.removeDuplicateItemFromArray(allSelectedStones);
  }

  triggerCancelAppointment(data) {
    const cancelVisitMessage = this.customTranslateSvc.translateString('CANCEL_APPOINTMENT');
    const cancelVisitHeader = this.customTranslateSvc.translateString('CANCEL_APPOINTMENT_TEXT');
    this.confirmationService.confirm({
      message: cancelVisitMessage,
      header: cancelVisitHeader,
      accept: () => {
        this.removeAppointment(data.appointment_id);
      }
    });
  }

  removeAppointment(id) {
    const requestJson = {
      'appointment_id': id
    };
    this.eventDetailsService.requestCancelAppointment(requestJson, this.eventId).subscribe(res => {
      if (MessageCodesComparator.AreEqual(res.code, MessageCodes.EVENT_DL_APPT_200)) {
        this.deleteAppointment(id);
      } else if (MessageCodesComparator.AreEqual(res.code, MessageCodes.EVENT_NO_APPT_200)) {
        this.messageService.showErrorGrowlMessage(res.message);
      }
    }, error => {
      this.messageService.showErrorGrowlMessage('SERVER_ERROR_OCCURRED');
    });
  }

  removeStonesFromList(stonesArray) {
    if (stonesArray.length > 0) {
      const removeStoneMessage = this.customTranslateSvc.translateString('Are you sure, you want to remove this stone ?');
      const removeStoneHeader = this.customTranslateSvc.translateString('Remove stone');
      this.confirmationService.confirm({
        message: removeStoneMessage,
        header: removeStoneHeader,
        accept: () => {
          const groups = {};
          stonesArray.forEach(stone => {
            const groupName = stone.appointment_id;
            if (!groups[groupName]) {
              groups[groupName] = [];
            }
            groups[groupName].push(stone.stone_id);
          });
          stonesArray = [];
          for (const groupName in groups) {
            if (groups.hasOwnProperty(groupName)) {
              stonesArray.push({ appointmentId: groupName, stoneIds: groups[groupName] });
            }
          }
          this.initiateRemoveEntry(stonesArray);
        }
      });
    } else {
      this.messageService.showErrorGrowlMessage('NO_SELECTED_STONE');
    }
  }

  initiateRemoveEntry(stoneArray) {
    stoneArray.forEach(entry => {
      this.callRemoveStoneEntryApi(entry.stoneIds, entry.appointmentId);
    });
  }

  callRemoveStoneEntryApi(id, appointmentId) {
    const value = {
      'stone_ids': id,
      'appointment_id': Number(appointmentId)
    };
    this.eventDetailsService.removeStoneFromAppointment(value, this.eventId).subscribe(res => {
      if (MessageCodesComparator.AreEqual(res.code, MessageCodes.DL_APPT_ST_200)) {
        this.appointedList.forEach(tableObj => {
          if (tableObj.data.appointment_id === Number(appointmentId)) {
            tableObj.selectedStones = [];
          }
        });
        this.removeAppointmentStones(id, Number(appointmentId));
      } else if (MessageCodesComparator.AreEqual(res.code, MessageCodes.EVENT_NO_APPT_200)
        || MessageCodesComparator.AreEqual(res.code, MessageCodes.DL_APPT_ST_ENF_200)) {
        this.messageService.showErrorGrowlMessage(MessageCodes[res.code]);
      } else {
        this.messageService.showErrorGrowlMessage(res.message);
      }
    }, error => {
      this.messageService.showErrorGrowlMessage('SERVER_ERROR_OCCURRED');
    });
  }

  removeAppointmentStones(ids, appointmentId) {
    let index;
    this.appointedList.forEach(tableObj => {
      if (tableObj.data.appointment_id === appointmentId) {
        index = this.appointedList.indexOf(tableObj);
        ids.forEach(stone => {
          tableObj.table.forEach(stoneObj => {
            if (stoneObj.stone_id === stone) {
              if (stoneObj.stone_state === 6) {
                tableObj.data.not_available--;
              }
              const i = this.appointedList[index].table.indexOf(stoneObj);
              this.appointedList[index].table.splice(i, 1);
              if (this.appointedList[index].table.length < 1) {
                this.appointedList[index].isAllSelected = false;
                this.appointedList[index].toggleTable = false;
              }
            }
          });
        });
      }
    });
    this.messageService.showSuccessGrowlMessage('STONE_REMOVED_SUCCESSFULLY');
    this.appStore.store('myAppointmentArray', this.appointedList);
    this.filterSelectedStones(this.appointedList[index]);
  }

  deleteAppointment(id) {
    this.appointedList.forEach((element) => {
      if (id === element.data.appointment_id) {
        const i = this.appointedList.indexOf(element);
        this.appointedList.splice(i, 1);
        this.messageService.showSuccessGrowlMessage(MessageCodes.EVENT_DL_APPT_200);
        this.appStore.store('myAppointmentArray', this.appointedList);
      }
    });
    if (this.appointedList.length > 0) {
      this.fetchStoneDetails();
    } else {
      this.notAvailableStonesAppointment = true;
    }
  }

  refreshNotes() {
    this.appointedList.forEach((element) => {
      element.table = this.notesService.fetchStonesComment(element.table);
    });
    if (this.selectedStoneObj.selectedStoneArray && this.selectedStoneObj.selectedStoneArray.length > 0) {
      this.selectedStoneObj.selectedStoneArray = this.notesService.fetchStonesComment(this.selectedStoneObj.selectedStoneArray);
    }
  }

  showAllCommentsForStone(notes) {
    this.commentsOverlayVisible = true;
    this.allNotesForStone = notes;
  }

  ngOnDestroy() {
    if (this.appointmentSubscription) {
      this.appointmentSubscription.unsubscribe();
    }
    if (this.packetSubscription) {
      this.packetSubscription.unsubscribe();
    }
    this.stoneStatusSubscription.unsubscribe();
  }

  toggleAddNoteOverlay(e) {
    if (e.forAddNote) {
      this.addnoteOverlayVisible = e.visible;
    } else {
      this.commentsOverlayVisible = e.visible;
    }
    if (e.noteDetil) {
      this.refreshNotes();
    }
  }

  openBTB(data) {
    this.btbSelectedStones = [];
    this.isBTBDataLoaded = false;
    this.isBTBClosed = false;
    this.bidToBuyService.getBTBPopuStone(data.stone_id).subscribe((response) => {
      if (!response.is_btb_active) {
        this.isBTBClosed = true;
        this.isBTBDataLoaded = true;
        return;
      }

      if (response !== undefined) {
        if (!response.error_status) {
          this.btbSelectedStones = data;
          if (response.data) {
            response.data.forEach(element => {
              this.stoneDetailsService.getB2BPopupData(element, this.btbSelectedStones);
            });
          }
        }
        this.isBTBDataLoaded = true;
      }
    });
    this.btbOverlayVisible = true;
  }

  toggleBTBOverlay(e) {
    this.btbOverlayVisible = e.visible;
  }

  addStoneDetailTab(data) {
    const windowTopScroll: any = jQuery(window).scrollTop();
    this.appStore.store('pageScrollMyAppt', windowTopScroll);
    this.notify.notifyViewRequestPageForStoneClickedForDetail({ type: 'stoneDtl', 'data': data });
  }

  addTwinStoneInfoTab(pairId) {
    const windowTopScroll: any = jQuery(window).scrollTop();
    this.appStore.store('pageScrollMyAppt', windowTopScroll);
    this.notify.notifyViewRequestPageForStoneClickedForDetail({ 'type': 'twinStoneDtl', 'data': pairId });
  }

  addTab(e) {
    if (e.data && e.type === 'stoneDtl') {
      this.addStoneDetailTab(e.data);
    } else if (e.data && e.type === 'twinStoneDtl') {
      this.addTwinStoneInfoTab(e.data);
    }
  }

  resetBookAppointment() {
    this.bookAppointment.initializeAppointment();
  }

  addToPacket(data) {
    this.appointmentPacket.emit({ visible: true, object: [data] });
  }

  stoneFromSelectedStone(event) {
    this.appointmentPacket.emit({ visible: event.visible, object: event.object });
  }

  updatePacketDetails(event) {
    if (this.appointedList) {
      this.appointedList.forEach(tableObj => {
        if (tableObj.table) {
          tableObj.table = this.stoneDetailsService.setStonePacketCount(tableObj.table);
          tableObj.table = this.stoneDetailsService.updateStonePacketCount(event, tableObj.table);
        }
      });
    }
  }

  toggleCommentOverlay(data) {
    this.appointmentComment = data.party_remark;
    this.currentPopUp = 'commentList';
    this.popUpTitle = this.customTranslateSvc.translateString('Comments');
    this.showCommentPopUp = true;
  }

  toggleAddCommentsOverlay(id) {
    this.newComments = '';
    this.currentPopUp = 'addComment';
    this.popUpTitle = this.customTranslateSvc.translateString('Add Comment');
    this.showCommentPopUp = true;
    this.appointmentId = id;
  }

  saveNewComment(commentText) {
    if (commentText.trim() !== '') {
      this.disableSaveComment = true;
      this.eventDetailsService.addNewComments(commentText, this.appointmentId).subscribe(res => {
        this.disableSaveComment = false;
        this.addNewComments(commentText);
        this.messageService.showSuccessGrowlMessage('VIEW_REQUEST_ADDED_COMMENT');
        this.showCommentPopUp = false;
      }, error => {
        this.messageService.showErrorGrowlMessage('SERVER_ERROR_OCCURRED');
      });
    } else {
      this.messageService.showErrorGrowlMessage('ENTER_MESSAGE');
    }
  }

  addNewComments(commentValue) {
    this.appointedList.forEach((element) => {
      if (this.appointmentId === element.data.appointment_id) {
        const i = this.appointedList.indexOf(element);
        const getCurrentTime = new Date();
        const commentObj = {
          comment: commentValue,
          comment_date_time: this.utilService.tranformDate(getCurrentTime, 'yyyy-MM-dd HH:mm')
        };
        this.appointedList[i].data.party_remark.push(commentObj);
      }
    });
    this.appStore.store('myAppointmentArray', this.appointedList);
  }

  removeConfirmedEventStones(stoneId, time) {
    const removeStoneMessage = this.customTranslateSvc.translateString('Are you sure, you want to remove this stone ?');
    const removeStoneHeader = this.customTranslateSvc.translateString('Remove stone');
    this.confirmationService.confirm({
      message: removeStoneMessage,
      header: removeStoneHeader,
      accept: () => {
        this.callRemoveStoneEntryApi(stoneId, time);
      }
    });
  }

  getPageRef(appointment) {
    const gridIdName = '#' + appointment.data.appointment_id + 'AppointmentContainer';
    const scrollable = this.appointmentContainer.instance.getScrollable(gridIdName);
    appointment['pageRefPosition'] = scrollable.scrollTop();
    this.appStore.store('myAppointmentArray', this.appointedList);
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.appointedList.forEach(appointment => {
        const gridId = appointment.data.appointment_id + 'PastRequestContainer';
        const container = this.getDataGridContainer(gridId);
        if (appointment.hasOwnProperty('sortedColumnOrder') && appointment.hasOwnProperty('sortedColumn') && container) {
          container.instance.columnOption(appointment.sortedColumn, 'sortOrder', appointment.sortedColumnOrder);
        }
        if (appointment.pageRefPosition) {
          const scrollable = container.instance.getScrollable('#' + gridId);
          scrollable.scrollTo({ left: 0, top: appointment.pageRefPosition });
        }
      });
    }, 2000);
  }
  getDataGridContainer(gridId) {
    let container;
    if (this.dataTables && this.dataTables.hasOwnProperty('_results')) {
      const dataGrids = this.dataTables['_results'];
      dataGrids.forEach(dataGrid => {
        if (dataGrid.element.hasOwnProperty('nativeElement')) {
          if (gridId === dataGrid.element['nativeElement'].id) {
            container = dataGrid;
          }
        }
      });
    }
    if (container === undefined || container === null) {
      container = this.appointmentContainer;
    }
    return container;
  }

  scrollTable(params, name) {
    const gridId = name + 'AppointmentContainer';
    const container = this.getDataGridContainer(gridId);
    if (params === 'left') {
      this.stoneDetailsService.scrollLeft(container, '#' + gridId);
    } else if (params === 'right') {
      this.stoneDetailsService.scrollRight(container, '#' + gridId);
    }
  }

  scrollTableInInterval(params, name) {
    this.timer = setInterval(() => {
      this.scrollTable(params, name);
    }, 1)
  }

  stopScrolling() {
    clearInterval(this.timer);
  }

  scrollColumn(name, data) {
    const gridId = name + 'AppointmentContainer';
    this.isColumnExpanded = !this.isColumnExpanded;
    this.isIconVisible = !this.isIconVisible;
    const gridContainer = this.getDataGridContainer(gridId);
    this.stoneDetailsService.handleSortingOrder(gridContainer);
    if (this.isColumnExpanded) {
      const columns = JSON.parse(JSON.stringify(gridContainer.columns));
      columns[1].width = 275;
      gridContainer.columns = columns;
    } else {
      const columns = JSON.parse(JSON.stringify(gridContainer.columns));
      columns[1].width = 130;
      gridContainer.columns = columns;
    }
  }

  updateRowColor() {
    this.appointedList.forEach(array => {
      if (array.toggleTable) {
        const gridId = array.data.appointment_id + 'AppointmentContainer';
        const container = this.getDataGridContainer(gridId);
        if (container) {
          array.table.forEach((element, index) => {
            this.stoneDetailsService.showRowColorChanges(container, array.selectedStones, element.stone_id, index);
          });
        }
      }
    });
  }

  onCellPrepared(e, array) {
    this.stoneDetailsService.onCellPrepared(e, array.selectedStones);
  }

  onResultLoading(event) {
    const container = this.appointmentContainer;
    this.utilService.handleSort(event, container, 'stoneReqSortData', event);
  }

  showStoneMediaIconsPanel(stoneObj, event, thmMediaIcon) {
    thmMediaIcon.stoneObj = stoneObj;
    thmMediaIcon.multimediaOverlay.toggle(event);
  }
}
