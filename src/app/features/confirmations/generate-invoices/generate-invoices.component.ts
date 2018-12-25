import { Component, OnInit, OnDestroy } from '@angular/core';
import { ConfirmationService } from '../confirmation.service';
import { UtilService } from '@srk/shared';
import { AuthService } from '@srk/core';
import { ApplicationStorageService } from '@srk/core';
import { NotifyService } from '@srk/core';
import { LoggerService } from '@srk/core';


@Component({
  selector: 'app-generate-invoices',
  templateUrl: './generate-invoices.component.html',
  styleUrls: ['./generate-invoices.component.scss']
})

export class GenerateInvoicesComponent implements OnInit, OnDestroy {

  public generateInvoices: any;
  public createInvoices: any;
  public generateresponseReceived = false;
  public createresponseReceived = false;
  public invoiceTypeList: any[] = ['abc', 'def', 'ghi', 'jkl'];
  public stoneListForInvoiceGeneration: any[];

  public invoiceTypeValue: string;
  public invoiceNumber: any;
  public performaInvoiceNumber: any;
  public invoice_type_limit: any;

  public shippingType: any;
  public shipmentTo: any;
  public onBehalfOf: any;
  public city: any;
  public portOfLoading: any;
  public state: any;
  public portOfDischarge: any;
  public country: any;
  public finalDestination: any;
  public zip: any;
  public email: any;
  public mobileNo: any;
  public carrier: any;
  public mode: any;
  public bankName: any;
  public accountNumber: any;
  public bankCode: any;
  public field1: any;
  public shippingCode: any;
  public shippingSlCode: any;
  public checked: any;


  constructor(private confirmationService: ConfirmationService, 
    private utilService: UtilService,
    private authService: AuthService,
    private appStore: ApplicationStorageService,
    private notify: NotifyService,
    private logger: LoggerService
  ) {}

  ngOnInit() {
    if (this.appStore.getData('stoneListToGenerateEnvoice') !== undefined) {
      this.stoneListForInvoiceGeneration = this.appStore.getData('stoneListToGenerateEnvoice');
    };
    this.resetPage();
    this.loadData();
  }

  ngOnDestroy() {
    this.appStore.remove('stoneListToGenerateEnvoice');
  }

  resetPage() {
    this.generateresponseReceived = false;
    this.createresponseReceived = false;
    this.generateInvoices = [];
    this.createInvoices = [];
    this.invoiceTypeValue= '';
    this.shippingType= '';
    this.shipmentTo= '';
    this.onBehalfOf= '';
    this.city= '';
    this.portOfLoading= '';
    this.state= '';
    this.portOfDischarge= '';
    this.country= '';
    this.finalDestination= '';
    this.zip= '';
    this.email= '';
    this.mobileNo= '';
    this.carrier= '';
    this.mode= '';
    this.bankName= '';
    this.accountNumber= '';
    this.bankCode= '';
    this.field1= '';
  }
  
  loadData() {
    this.resetPage();
    this.confirmationService.generateInvoice(this.stoneListForInvoiceGeneration).subscribe((res) => {
      this.generateInvoices = res.data;
      this.logger.logInfo('generateInvoice', 'get prefilled data for invoice generation:- ' + JSON.stringify(this.generateInvoices));
      this.generateresponseReceived = true;
      this.mapUIFields();
    }, error => {

    });
  }
  
  generateInvoiceClick(){
    var data = {
      "j_date": "",
      "j_number": 0,
      "bank_code": this.bankCode,
      "carrier_code": "BRK",
      "sdollar": 0,
      "proforma_invoice_number": this.performaInvoiceNumber,
      "userId": 0,
      "computer_id": 0,
      "form_id": 0,
      "sel_type": "",
      "shipment_inc": "",
      "shipping_address": "",
      "shipping_code": this.shippingCode,
      "shipping_srno": this.shippingSlCode,
      "invoice_number": this.invoiceNumber
    };
    this.confirmationService.createInvoice(data).subscribe((res) => {
      this.createInvoices = res.data;
      this.logger.logInfo('createInvoice', 'user fills all the detail and generate invoice :- ' + JSON.stringify(this.createInvoices));
      this.createresponseReceived = true;
      this.onSuccessInvoiceGenerated();
    }, error => {

    });
  }

  previewInvoiceClick(){
  }

  mapUIFields(){
    var object = {};
    for (let i of this.generateInvoices) {
        object = i;
    }
    this.shipmentTo= object['SHIPMENT_TO'];
    this.onBehalfOf= this.authService.getLoginName();
    this.city= object['CITY'];
    this.portOfLoading= object['LOADING_PORT'];
    this.state= object['STATE'];
    this.portOfDischarge= object['DISCHARGE_PORT'];
    this.country= object['COUNTRY'];
    this.finalDestination= object['FINAL_DESTINATION'];
    this.zip= object['ZIP'];
    this.email= object['EMAIL_ID'];
    this.mobileNo= object['MOBILE_NUMBER'];
    this.carrier= object['CARRIER_NAME'];
    this.mode= object['CARRIER_MODE'];
    this.bankName= object['BANKNAME'];
    this.accountNumber= object['BANK_ACCNUMBER'];
    this.shippingCode= object['SHIPPING_CODE'];
    this.shippingSlCode= object['SHIPPING_SR_NUMBER'];
    this.invoiceNumber= object['INVOICE_NUMBER'];
    this.performaInvoiceNumber= object['PROFORMA_INVOICE_NUMBER'];
    this.invoice_type_limit= object['INVOICE_TYPE'];
  
  }

  onSuccessInvoiceGenerated(){

  }

}
