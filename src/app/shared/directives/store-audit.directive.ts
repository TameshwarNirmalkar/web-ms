import { Directive, HostListener, Input, OnInit } from '@angular/core';
import * as _ from 'underscore';
import { ApplicationAuditService } from '@srk/core';
import { ApplicationDataService } from '@srk/core';
import { UserDeviceService } from '@srk/core';

declare var $: any;

@Directive({
  selector: '[dirStoreAudit]'
})
export class StoreAuditDirective {
  @Input() dirStoreAudit: any;
  constructor(
    private auditService: ApplicationAuditService,
    private userDeviceService: UserDeviceService,
    private applicationData: ApplicationDataService) { }

  @HostListener('click') onClick() {
    const auditData = JSON.parse(localStorage.getItem('srk-audit-setting')) || this.applicationData.getAuditData();
    if (auditData) {
      this.storeAuditData();
    }
  }

  storeAuditData() {
    this.auditService.saveButtonActionAudit(this.dirStoreAudit);
  }
}
