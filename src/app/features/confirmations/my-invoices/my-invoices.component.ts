import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ConfirmationService } from '../confirmation.service';
import { UtilService } from '@srk/shared';
import { NotifyService } from '@srk/core';
import { MessageCodes, MessageCodesComparator } from '@srk/core';
import { MessageService } from '@srk/core';
import { LoggerService } from '@srk/core';

@Component({
  selector: 'app-my-invoices',
  templateUrl: './my-invoices.component.html',
  styleUrls: ['./my-invoices.component.scss']
})
export class MyInvoicesComponent implements OnInit {

  public processKey: any;
  public myInvoices: any;
  public initWorkflowResponse: any;
  public workflowStatusResponse: any;
  public approveWorkFlowResponse: any;
  public workflowhistoryResponse: any;
  public eligible_discount: any;
  public pending_discount: any;
  public given_discount: any;
  public weeks: any[] = [];
  public selectedWeek: any;
  private showWeekHistory = 5;
  readonly yearFirstWeek = 1;
  readonly yearLastWeek = 53;


  constructor(private confirmationService: ConfirmationService,
    private utilService: UtilService,
    private notifyService: NotifyService,
    private messageService: MessageService,
    private logger: LoggerService
  ) { }

  ngOnInit() {
    // this.fetchAllInvoices();
    this.processKey = 'invoiceConfirmation';
  }

  resetPage() {
    this.eligible_discount = undefined;
    this.pending_discount = undefined;
    this.given_discount = undefined;
    this.myInvoices = [];
  }


  fetchAllInvoices() {
    this.resetPage();
    this.notifyService.showBlockUI({ 'message': 'PLEASE_WAIT' });
    this.confirmationService.listInvoices('myInvoicesComponent').subscribe((res) => {
      this.myInvoices = this.errorHandling(res);
    }, error => {
      this.notifyService.hideBlockUI();
    });
  }



  initWorkflow(invoiceId) {
    this.confirmationService.initWorkflow(this.processKey, invoiceId).subscribe((res) => {
      this.initWorkflowResponse = res.data;
      this.logger.logInfo('initWorkflow', 'my-invoice.component user action on Row button :- ' + JSON.stringify(this.initWorkflowResponse));
    }, error => {

    });
  }

  getWorkflowStatus(invoiceId) {
    this.confirmationService.getWorkflowStatus(this.processKey, invoiceId).subscribe((res) => {
      this.workflowStatusResponse = res.data;
      this.logger.logInfo('getWorkflowStatus', 'my-invoice.component user action on Row button :- ' + JSON.stringify(this.workflowStatusResponse));
    }, error => {

    });
  }

  approveWorkFlow(invoiceId) {
    this.confirmationService.approveWorkFlow(this.processKey, invoiceId).subscribe((res) => {
      this.approveWorkFlowResponse = res.data;
      this.logger.logInfo('approveWorkFlow', 'my-invoice.component user action on Row button :- ' + JSON.stringify(this.approveWorkFlowResponse));
    }, error => {

    });
  }

  getHistoryTasks(invoiceId) {
    this.confirmationService.getHistoryTasks(this.processKey, invoiceId).subscribe((res) => {
      this.workflowhistoryResponse = res.data;
      this.logger.logInfo('getHistoryTasks', 'my-invoice.component user action on Row button :- ' + JSON.stringify(this.workflowhistoryResponse));
    }, error => {

    });
  }

  // Need work on this, errorhandling incomplete
  errorHandling(response): any {
    this.notifyService.hideBlockUI();
    if (response !== undefined) {
      if (!MessageCodesComparator.AreEqual(response.code, MessageCodes.OK_200)) {
        if (response.data.length > 0) {
          return response.data;
        } else {
          this.messageService.showErrorGrowlMessage('NO_DATA_FOUND');
        }
      } else if (MessageCodesComparator.AreEqual(response.code, MessageCodes._OVER_LIMIT)) {
        this.messageService.showSuccessGrowlMessage(MessageCodes[response.code]);
        return response.data;
      } else if (response.code === 'ELS#200') {
        if (response.data.body.length > 0) {
          return response.data;
        } else {
          this.messageService.showErrorGrowlMessage('NO_DATA_FOUND');
        }
      }
    }
  }


  showPacketList(e) {
    this.initWorkflow(e);
  }

}
