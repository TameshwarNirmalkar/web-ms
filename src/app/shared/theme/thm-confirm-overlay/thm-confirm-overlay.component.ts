import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ConfirmationService } from 'primeng/primeng';
import { CustomTranslateService } from '@srk/core';
import { LoggerService } from '@srk/core';
import { NotifyService } from '@srk/core';
import { MessageService } from '@srk/core';
import { AuthService } from '@srk/core';
import { ApiService } from '../../services/api.service';
import { MessageCodes, MessageCodesComparator } from '@srk/core';
import { StoneDetailsService } from '../../services/stone-details.service';

@Component({
  selector: 'thm-confirm-overlay',
  templateUrl: './thm-confirm-overlay.component.html',
  styleUrls: ['./thm-confirm-overlay.component.scss']
})
export class ThmConfirmOverlayComponent implements OnInit {

  @Input() visibleConfirmOverlay: any;
  @Input() stoneList: any;
  @Output() toggleConfirmOverlay = new EventEmitter();

  response: any = {};
  orderDetailFetched: boolean;
  reOrderRequestEnabled: boolean;
  confirmableStones: any[] = [];
  conversionRate: any;
  infoMessage: string;
  public isStoneConfirmed = false;
  cannotConfirmStones: any[] = [];
  public httpSubscription: any;
  public remark: any;
  notGIAStones: any[] = [];
  public viewFinalPayableAndFinalOff = this.stoneDetailsService.showFinalPayableAndFinalOff();
  constructor(
    private confirmationService: ConfirmationService,
    private customTranslateService: CustomTranslateService,
    private logger: LoggerService,
    private notify: NotifyService,
    private messageService: MessageService,
    private authService: AuthService,
    private apiService: ApiService,
    private stoneDetailsService: StoneDetailsService) { }

  ngOnInit() { 
  }

  checkOrderDetails() {
    this.orderDetailFetched = false;
    this.reOrderRequestEnabled = false;
  }

  verifyDiamondConfirmation(stoneList, stoneTable) {
    this.notGIAStones = [];
    const url = this.authService.getApiLinkForKey('confirm_btn', 'order_detail');
    this.confirmableStones = stoneList;
    const request = {
      'stone_ids': this.confirmableStones,
      'audit': {
        'action_id': 2,
        'activity_id': 2
      }
    };
    this.notify.showBlockUI({ 'message': 'PLEASE_WAIT' });
    this.apiService.postCall('ThmConfirmOverlayComponent:verifyDiamondConfirmation', url, request).subscribe((res) => {
      this.logger.logInfo('ThmConfirmOverlayComponent:verifyDiamondConfirmation',
        'Stones order detail fetched successfully :- ' + JSON.stringify(res));
      this.notify.hideBlockUI();
      if (res.data) {
        if (MessageCodesComparator.AreEqual(res.code, MessageCodes.SMS_GOD_200)) {
          this.visibleConfirmOverlay = true;
          this.response = res.data;
          this.cannotConfirmStones = res.data.stoneListNotApproved.split(',');
          this.cannotConfirmStones.forEach(stone => {
            this.remove(this.confirmableStones, stone);
          });
        }
      } else if (MessageCodesComparator.AreEqual(res.code, MessageCodes.SMS_MSG_CONFIRM_STONE_COUNT_LIMIT_EXCEED_200)) {
        this.visibleConfirmOverlay = false;
        this.messageService.showInfoGrowlMessage(res.message);
      }
      this.orderDetailFetched = true;
    }, error => {
      this.notify.hideBlockUI();
    });
    if (stoneTable && stoneTable.length > 0) {
      stoneTable.forEach(stone => {
        if (stone.certificate.short_value !== 'GIA') {
          this.notGIAStones.push(stone.stone_id);
        }
      });
    }
  }

  confirmNow() {
    const url = this.authService.getApiLinkForKey('confirm_btn', 'confirm_stones');
    const request = {
      'stone_ids': this.confirmableStones,
      'audit': {
        'action_id': 3,
        'activity_id': 2
      }
    };
    if (this.remark) {
      request['remark'] = this.remark;
    }
    this.isStoneConfirmed = true;
    this.apiService.postCall('ThmConfirmOverlayComponent:confirmNow', url, request).subscribe((res) => {
      this.isStoneConfirmed = false;
      this.response = res.data;
      this.logger.logInfo('ThmConfirmOverlayComponent:confirmNow', 'Stones got confirmed successfully :- ' + JSON.stringify(res));
      if (res.data.canNotConfirmStonesList !== undefined) {
        this.orderDetailFetched = false;
        this.reOrderRequestEnabled = true;
      } else if (res.data.length > 0) {
        this.fetchExportMemo();
        const confirmedStones: any[] = res.data;
        const confirmedStoneIds: any[] = [];
        confirmedStones.forEach((stoneDtl) => {
          confirmedStoneIds.push(stoneDtl);
        });
        this.messageService.showSuccessGrowlMessage(
          'Stones ' + confirmedStoneIds.toString() + ' successfully confirmed.');
        this.closeConfirmOverlay();
        this.notify.notifyStoneStateUpdated({
          source: 'confirmedStones', stoneList: confirmedStoneIds,
          cannotConfirmStones: this.cannotConfirmStones
        });
      }
    }, error => {
      this.messageService.showErrorGrowlMessage('CHECK_INPUT');
      this.remark = '';
      this.isStoneConfirmed = false;
    });
  }

  reOrderSummary() {
    this.logger.logInfo('ThmConfirmOverlayComponent:reOrderSummary',
      'User action for Re-Order Summary for stones :- ' + JSON.stringify(this.confirmableStones));
    this.verifyDiamondConfirmation(this.confirmableStones, []);
    this.reOrderRequestEnabled = false;
  }

  closeConfirmOverlay() {
    this.visibleConfirmOverlay = false;
    this.confirmableStones = [];
    this.toggleConfirmOverlay.emit({ visible: false });
  }

  remove(array, element) {
    const index = array.indexOf(element);
    if (index >= 0) {
      array.splice(index, 1);
    }
  }

  fetchExportMemo() {
    if (this.httpSubscription) {
      this.httpSubscription.unsubscribe();
    }
    this.httpSubscription = this.stoneDetailsService.getConfirmedExportMemo().subscribe(res => {
      this.conversionRate = res.data.conversion_rate;
    }, error => { });
  }

}
