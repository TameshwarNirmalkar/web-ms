import { Component, OnInit, Input, OnChanges, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { ConfirmationService } from '../../confirmation.service';
import { MessageCodes, MessageCodesComparator } from '@srk/core';
import { MessageService } from '@srk/core';
import { DownloadStonesService } from '@srk/shared';
import { MyConfirmationsComponent } from '../my-confirmations.component';
import { StoneDetailsService } from '@srk/shared';
import { UserProfileService } from '@srk/core';
import { NotifyService } from '@srk/core';
import { DxDataGridComponent } from 'devextreme-angular/ui/data-grid';
import { UtilService } from '@srk/shared';
import { ApplicationStorageService } from '@srk/core';
import { AuthService } from '@srk/core';

@Component({
  selector: 'app-confirmation-details',
  templateUrl: './confirmation-details.component.html',
  styleUrls: ['./confirmation-details.component.scss']
})

export class ConfirmationDetailsComponent implements OnInit, OnChanges {
  @Input() weekDetailsObject: any;
  @ViewChild('myConfirmationpGridContainer') myConfirmationpGridContainer: any;
  @ViewChildren(DxDataGridComponent) dataTables: QueryList<DxDataGridComponent>;
  public selectedDownloadType: any;
  public downloadOptions: any[];
  public downloadPopOverVisible = false;
  public selectedStones: any[] = [];
  public is_comm_per_active = false;
  public is_terms_per_active = false;
  public is_company_event_active = false;
  public is_conversion_rate = false;
  public isAllSelected = false;
  public timer;
  public selectedColumnList: any;
  public viewFinalPayableAndFinalOff = this.stoneDetailsService.showFinalPayableAndFinalOff();
  
  constructor(private confirmationService: ConfirmationService,
    public messageService: MessageService,
    public downloadSvc: DownloadStonesService,
    public myConfirmations: MyConfirmationsComponent,
    private stoneDetailsService: StoneDetailsService,
    public userProfileService: UserProfileService,
    private notify: NotifyService,
    private utilService: UtilService,
    private appStore: ApplicationStorageService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.selectedColumnList = this.userProfileService.getSelectedConfirmationColumnList();
    this.weekDetailsObject.stoneList.forEach((stone) => {
      stone.amount = parseFloat(String(stone.original$ct * stone.carat)).toFixed(2);
    });
    this.weekDetailsObject.stoneList.amount = this.weekDetailsObject.stoneList.original$ct * this.weekDetailsObject.stoneList.carat;
    this.selectedColumnList = this.userProfileService.getSelectedConfirmationColumnList();
    this.utilService.createConfirmationfields(this.weekDetailsObject.stoneList);
  }

  ngOnChanges() {
    if (this.weekDetailsObject && this.weekDetailsObject.discountFlag) {
      this.is_comm_per_active = this.weekDetailsObject.discountFlag.is_comm_per_active;
      this.is_terms_per_active = this.weekDetailsObject.discountFlag.is_terms_per_active;
      this.is_company_event_active = this.weekDetailsObject.discountFlag.is_company_event_active;
      this.is_conversion_rate = this.weekDetailsObject.discountFlag.is_conversion_rate;
    }
  }

  showDownloadOptions() {
    this.selectedDownloadType = 0;
    this.downloadOptions = this.downloadSvc.getDownloadOptions('excel_download_regular_btn');
    this.downloadPopOverVisible = true;
  }

  /*********** download result ***************/
  downloadResult(array) {
    const stoneArray = [];
    if (this.selectedStones.length > 0) {
      this.selectedStones.forEach(element => {
        array.forEach(index => {
          if (index.stone_id === element) {
            stoneArray.push(index);
          }
        });
      });
      if (this.selectedDownloadType !== 'excel') {
        this.downloadSvc.downloadStoneDetails(stoneArray, this.selectedStones, this.selectedDownloadType);
      } else {
        array.forEach(stoneObject => {
          stoneArray.forEach(stoneDetail => {
            if (stoneObject.stone_id === stoneDetail.stone_id) {
              stoneDetail['status'] = stoneObject.order_status;
              stoneDetail['amount'] = stoneObject.amount;
              stoneDetail['blind_percent'] = stoneObject.blind_discount;
              stoneDetail['wvd_percent'] = stoneObject.newWeeklyVolumeDiscount;
              stoneDetail['price_final'] = stoneObject.newFinal$ct;
              stoneDetail['final_off'] = stoneObject.newFinalOffPerct;
              stoneDetail['final_payable_amount'] = stoneObject.newFinalPayableAmt;
              stoneDetail['terms_discount'] = stoneObject.terms_discount;
              stoneDetail['event_discount'] = stoneObject.event_discount;
              stoneDetail['coOp_discount'] = stoneObject.co_op_discount;
              stoneDetail['price_srk'] = stoneObject.original$ct;
            }
          });
        });
        this.downloadSvc.downloadConfirmationExcel(stoneArray, this.selectedStones);
      }
      this.downloadPopOverVisible = false;
      this.selectedDownloadType = null;
    } else {
      this.messageService.showErrorGrowlMessage('NO_SELECTED_STONE');
    }
  }
  sendExcelMail() {
    if (this.selectedStones.length > 0) {
      this.stoneDetailsService.getStoneDetails(this.selectedStones).subscribe(response => {
        this.downloadSvc.mailStoneExcel(response, this.selectedStones, 'Confirmed Stone List');
      });
    } else {
      this.messageService.showErrorGrowlMessage('NO_SELECTED_STONE');
    }
  }

  addStoneDetailTab(data) {
    const thisStoneDate = this.getStoneDetailForStoneId(data.stone_id);
  }

  getStoneDetailForStoneId(stonId): any {
    this.stoneDetailsService.getStoneDetails(stonId).subscribe(stoneDetailResponse => {
      if (stoneDetailResponse !== undefined) {
        stoneDetailResponse.forEach(stoneDetail => {
          this.notify.notifyMyConfirmationPageForStoneClickedForDetail({ 'data': stoneDetail });
        });
      }
    });
  }

  stoneSelected() {
    if (this.selectedStones.length > 0) {
      if ( this.selectedStones.length === this.weekDetailsObject.stoneList.length ) {
          this.isAllSelected = true;
      } else {
          this.isAllSelected = false;
      }
      // this.messageService.showInfoGrowlMessage('WAIT_FOR_LIVE_WVD_UPDATE');
      this.confirmationService.getLiveWvd(this.weekDetailsObject.weekNo, this.selectedStones).subscribe(res => {
        if (MessageCodesComparator.AreEqual(res.code, MessageCodes.SMS_MSG_CONFIRM_SUCCESS_LIVE_WVD_200)) {
          this.storeLiveWvd(res.data);
        } else {
          // this.messageService.showErrorGrowlMessage('SERVER_ERROR_OCCURRED_FETCH_WVD');
        }
      }, error => {
        this.messageService.showErrorGrowlMessage('SERVER_ERROR_OCCURRED');
      });
    }
    this.updateRowColor();
  }

  storeLiveWvd(wvdData) {
    this.weekDetailsObject.stoneList.forEach(stoneObj => {
      if (wvdData.stone_list.hasOwnProperty(stoneObj.stone_id)) {
        stoneObj['newWeeklyVolumeDiscount'] = this.stoneDetailsService.getDecimalNumber(wvdData.stone_list[stoneObj.stone_id].wvdDiscount * -1);
        stoneObj['newFinal$ct'] = wvdData.stone_list[stoneObj.stone_id].final$Ct;
        stoneObj['newFinalPayableAmt'] = wvdData.stone_list[stoneObj.stone_id].finalAmount;
        const avg_rap_rate = Number(wvdData.stone_list[stoneObj.stone_id].price_rap) * Number(wvdData.stone_list[stoneObj.stone_id].i_carat);
        const total_fCt = Number(wvdData.stone_list[stoneObj.stone_id].final$Ct) * Number(wvdData.stone_list[stoneObj.stone_id].i_carat);
        stoneObj['newFinalOffPerct'] = ((avg_rap_rate - total_fCt) / avg_rap_rate) * 100;
        if (Number(stoneObj['newFinalOffPerct']) < 0) {
          stoneObj['newFinalOffPerct'] = Number(stoneObj['newFinalOffPerct']) * (-1);
        }
      } else {
        stoneObj['newWeeklyVolumeDiscount'] = stoneObj.weekly_volume_discount;
        stoneObj['newWeeklyVolumeDiscount'] = stoneObj['newWeeklyVolumeDiscount'] * -1;
        stoneObj['newFinal$ct'] = stoneObj.final$ct;
        stoneObj['newFinalPayableAmt'] = stoneObj.final_amount;
        const avg_rap_rate = Number(stoneObj.price_rap) * Number(stoneObj.carat);
        const total_fCt = Number(stoneObj.final$ct) * Number(stoneObj.carat);
        stoneObj['newFinalOffPerct'] = ((avg_rap_rate - total_fCt) / avg_rap_rate) * 100;
        if (Number(stoneObj['newFinalOffPerct']) < 0) {
          stoneObj['newFinalOffPerct'] = Number(stoneObj['newFinalOffPerct']) * (-1);
        }
      }
    });
    const params = { selectedConfirmedStones: this.selectedStones.toString() };
    // this.messageService.showDynamicSuccessGrowlMessage('UPDATED_LIVE_WVD', params);
  }

  isAllCheckboxSelected() {
    if (this.isAllSelected) {
      this.selectedStones = this.createStoneIdList(this.weekDetailsObject.stoneList);
    } else {
      this.selectedStones = [];
    }
    this.updateRowColor();
    this.stoneSelected();
  }

  createStoneIdList(list) {
    const stonesList = [];
    list.forEach(stones => {
      stonesList.push(stones.stone_id);
    });
    return stonesList;
  }

  updateRowColor() {
    if (this.myConfirmationpGridContainer) {
      this.weekDetailsObject.stoneList.forEach((element, index) => {
        this.stoneDetailsService.showRowColorChanges(this.myConfirmationpGridContainer, this.selectedStones, element.stone_id, index);
      });
    }
  }

  onCellPrepared(e) {
    if (e.rowType === 'data') {
      this.selectedStones.forEach(stoneId => {
        if (e.key.stone_id === stoneId) {
          this.stoneDetailsService.changeRowColor(e.cellElement, true);
        }
      });
    }
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
      container = this.myConfirmationpGridContainer;
    }
    return container;
  }

  scrollTable(params, name) {
    const gridId = name + 'PastRequestContainer';
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
    }, 1);
  }

  stopScrolling() {
    clearInterval(this.timer);
  }

  showStoneMediaIconsPanel(stoneObj, event, thmMediaIcon) {
    thmMediaIcon.stoneObj = stoneObj;
    thmMediaIcon.multimediaOverlay.toggle(event);
  }
}
