import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { DdcService } from '../../services/ddc.service';
import { MessageService } from '@srk/core';
import { MessageCodes, MessageCodesComparator } from '@srk/core';
import { NotifyService } from '@srk/core';
import { StoneDetailsService } from '../../services/stone-details.service';
import * as _ from 'underscore';
@Component({
  selector: 'thm-ddc-overlay',
  templateUrl: './thm-ddc-overlay.component.html',
  styleUrls: ['./thm-ddc-overlay.component.scss'],
  providers: [DdcService]
})
export class ThmDdcOverlayComponent implements OnInit, OnChanges {
  @Input() visibleDdcOverlay: any;
  @Input() previousDdcHour: any;
  @Input() stoneList: any[];
  @Output() toggleDdcOverlay = new EventEmitter();

  public ddcHoursList: any[];
  public selectedDdcHour: any;
  public isRequested = false;
  public isRemoveRequested = false;

  public selectedDDCEventHour = [];
  public normalDDCHoursList: any[];
  public eventDDCHourList: any[];
  public invalidDDCStoneList: any[];
  public normalDDCStoneList: any[];
  public eventDDCStoneList: any[];
  public eventsInfoList: any[];
  public loadingDDCData = true;
  public httpSubscription: any;
  public requestBody: any;
  public errorMessage: any;
  public isRegularNotAvailable: boolean;
  constructor(
    private ddcSvc: DdcService,
    private notify: NotifyService,
    private messageService: MessageService,
    private stoneDetailsService: StoneDetailsService) { }

  ngOnInit() {
  }

  ngOnChanges() {
    this.loadingDDCData = true;
    this.errorMessage = 'DDC_MESSAGE_FETCH_TIME';
    if (this.httpSubscription) {
      this.httpSubscription.unsubscribe();
    }
    if (this.stoneList && this.stoneList.length > 0) {
      this.initializeDdcOverlay();
    }
  }

  initializeDdcOverlay() {
    this.selectedDDCEventHour = [];
    this.isRegularNotAvailable = false;
    this.httpSubscription = this.ddcSvc.getDDCHours(this.stoneList).subscribe((response) => {
      this.loadingDDCData = false;
      if (MessageCodesComparator.AreEqual(response.code, MessageCodes.SMS_DH_GS_200)) {
        const ddcBody = response.data;
        if (ddcBody.hasOwnProperty('ddch_code')) {
          if (ddcBody.ddch_code.hasOwnProperty('regular')) {
            this.normalDDCHoursList = this.createLabelValuePair(ddcBody.ddch_code.regular);
            if (this.stoneList.length === 1 && this.previousDdcHour) {
              this.selectedDdcHour = this.previousDdcHour;
            }
          }
          if (ddcBody.ddch_code.hasOwnProperty('events')) {
            this.eventDDCHourList = this.createLabelValuePair(ddcBody.ddch_code.events);
          }
        }
        if (ddcBody.hasOwnProperty('stone_list')) {
          if (ddcBody.stone_list.hasOwnProperty('regular')) {
            this.normalDDCStoneList = ddcBody.stone_list.regular;
          }
          if (ddcBody.stone_list.hasOwnProperty('events')) {
            if (!ddcBody.ddch_code.hasOwnProperty('events')) {
              if (!this.normalDDCStoneList) {
                this.eventDDCHourList = this.createLabelValuePair(ddcBody.ddch_code.regular);
              } else {
                this.isRegularNotAvailable = true;
                this.eventDDCHourList = [];
              }
            }
            this.createEventDDCList(ddcBody.stone_list.events);
          }
        }
      } else {
        this.loadingDDCData = true;
        this.errorMessage = 'SERVER_ERROR_OCCURRED';
      }
    }, error => {
      this.loadingDDCData = true;
      this.errorMessage = 'SERVER_ERROR_OCCURRED';
    });
  }

  selectedButton(eventInfo) {
    let flag = false;
    if (eventInfo.selectedEventDDCHour) {
      const eventDdc = {
        'stone_ids': eventInfo.stone_id,
        'event_id': eventInfo.event_id,
        'ddch_code': eventInfo.selectedEventDDCHour
      };
      this.selectedDDCEventHour.forEach(entry => {
        if (!flag) {
          if (entry.event_id === eventDdc.event_id) {
            entry['ddch_code'] = eventDdc.ddch_code;
            flag = true;
          }
        }
      });
      if (!flag) {
        this.selectedDDCEventHour.push(eventDdc);
      }
    }
  }

  applyStoneDDC(params) {
    let flag = true;
    let requestBody = [];
    if (this.eventsInfoList && this.eventsInfoList.length > 0 && !this.isRegularNotAvailable) {
      this.eventsInfoList.forEach(event => {
        this.selectedButton(event);
      });
      if (this.selectedDDCEventHour.length > 0
        && this.selectedDDCEventHour.length === this.eventsInfoList.length) {
        const eventDDCJson = JSON.parse(JSON.stringify(this.selectedDDCEventHour));
        eventDDCJson.forEach(entry => {
          delete entry.event_id;
        });
        requestBody = eventDDCJson;
      } else {
        flag = false;
        this.messageService.showInfoGrowlMessage('SELECT_EVENT_DDC_TIME');
      }
    }
    if (this.normalDDCStoneList && this.normalDDCStoneList.length > 0 && flag) {
      if (this.selectedDdcHour) {
        if (this.eventsInfoList && this.eventsInfoList.length > 0 && this.isRegularNotAvailable) {
          this.eventsInfoList.forEach(element => {
            if (element.stone_id && element.stone_id.length > 0) {
              requestBody.push({ stone_ids: element.stone_id, ddch_code: this.selectedDdcHour });
            }
          });
        }
        requestBody.push({ stone_ids: this.normalDDCStoneList, ddch_code: this.selectedDdcHour });
      } else {
        flag = false;
        this.messageService.showInfoGrowlMessage('SELECT_DDC_TIME');
      }
    }
    if (flag) {
      this.isRequested = true;
      this.requestBody = this.generatePayloadForSave(requestBody);
      this.ddcSvc.saveStoneToDDC(this.requestBody, params).subscribe((response) => {
        this.isRequested = false;
        this.checkDdcSuccessResponse(response);
      }, error => {
        this.isRequested = false;
        this.checkDdcErrorResponse();
      });
    }
  }

  generatePayloadForSave(body) {
    if (body.length > 0) {
      body.forEach(obj => {
        const tempArray = [];
        if (obj.stone_ids && obj.stone_ids.length > 0) {
          obj.stone_ids.forEach(id => {
            tempArray.push(String(id));
          });
          obj.stone_ids = JSON.parse(JSON.stringify(tempArray));
        }
      });
    }
    return {
      'stones': body,
      'audit': {
        'action_id': 22,
        'activity_id': 17
      }
    };
  }

  removeStoneDDC() {
    this.isRemoveRequested = true;
    this.ddcSvc.removeDDCFromStone(this.stoneList).subscribe((response) => {
      this.isRemoveRequested = false;
      if (response !== undefined && MessageCodesComparator.AreEqual(response.code, MessageCodes.SMS_RM_DDC_200)) {
        this.notify.notifyStoneStateUpdated({ source: 'ddcRequested', stoneList: this.stoneList, status: '', hour: 0 });
        this.messageService.showSuccessGrowlMessage(MessageCodes[response.code]);
        this.toggleDdcOverlay.emit({ visible: false });
      } else if (response !== undefined && MessageCodesComparator.AreEqual(response.code, MessageCodes.SMS_DDC_ND_200)) {
        this.notify.notifyStoneStateUpdated({ source: 'ddcRequested', stoneList: [], status: '', hour: 0 });
        this.messageService.showErrorGrowlMessage(MessageCodes[response.code]);
      }
    }, error => {
      this.isRemoveRequested = false;
      this.checkDdcErrorResponse();
      this.toggleDdcOverlay.emit({ visible: false });
    });
  }

  checkDdcSuccessResponse(response) {
    if (MessageCodesComparator.AreEqual(response.code, MessageCodes.SMS_DDC_ND_200)) {
      this.notify.notifyStoneStateUpdated({ source: 'ddcRequested', stoneList: [], status: '', hour: 0 });
      this.messageService.showErrorGrowlMessage(MessageCodes[response.code]);
    } else if (MessageCodesComparator.AreEqual(response.code, MessageCodes.SMS_PARTIAL_DDC_201)) {
      let ddcAppliedStones;
      this.requestBody.stones.forEach(stoneObj => {
        ddcAppliedStones = _.difference(stoneObj.stone_ids, response.data.stone_ids);
        stoneObj['stone_ids'] = ddcAppliedStones;
      });
      this.updateStoneDdcTime();
      const params = { partialAddedStones: ddcAppliedStones.toString() };
      this.messageService.showDynamicSuccessGrowlMessage('PARTIAL_DDC_APPLIED', params);
    } else {
      this.updateStoneDdcTime();
      this.messageService.showSuccessGrowlMessage(MessageCodes[response.code]);
    }
    this.toggleDdcOverlay.emit({ visible: false });
  }

  checkDdcErrorResponse() {
    this.messageService.showErrorGrowlMessage('ERR_DDC_STONE');
    this.toggleDdcOverlay.emit({ visible: false });
  }

  cancelStoneDDC() {
    if (this.httpSubscription) {
      this.httpSubscription.unsubscribe();
    }
    this.stoneList = [];
    this.normalDDCHoursList = null;
    this.eventDDCHourList = null;
    this.normalDDCStoneList = null;
    this.eventsInfoList = null;
    this.selectedDdcHour = null;
    this.toggleDdcOverlay.emit({ visible: false });
  }

  createEventDDCList(eventList) {
    this.eventsInfoList = [];
    for (const event in eventList) {
      if (eventList.hasOwnProperty(event)) {
        eventList[event]['selectedEventDDCHour'] = '';
        if (this.stoneList.length === 1) {
          eventList[event]['selectedEventDDCHour'] = this.previousDdcHour;
        }
        this.eventsInfoList.push(eventList[event]);
      }
    }
  }

  createLabelValuePair(array) {
    const pair = [];
    array.forEach(element => {
      pair.push({ label: element, value: element });
    });
    return pair;
  }

  updateStoneDdcTime() {
    this.requestBody.stones.forEach(stoneObj => {
       this.notify.notifyStoneStateUpdated({
        source: 'ddcRequested', stoneList: stoneObj.stone_ids
        , status: 'ACTIVE', hour: stoneObj.ddch_code,
      });
    });
  }

}
