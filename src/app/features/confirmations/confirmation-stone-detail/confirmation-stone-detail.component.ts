import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
import { ConfirmationService } from '../confirmation.service';
import { UtilService } from '@srk/shared';
import { NotifyService } from '@srk/core';
import { MessageCodes, MessageCodesComparator } from '@srk/core';
import { MessageService } from '@srk/core';
import { LoggerService } from '@srk/core';
import { ApplicationStorageService } from '@srk/core';
import { StoneDetailsService } from '@srk/shared';

@Component({
  selector: 'app-confirmation-stone-detail',
  templateUrl: './confirmation-stone-detail.component.html',
  styleUrls: ['./confirmation-stone-detail.component.scss']
})
export class ConfirmationStoneDetailComponent implements OnInit {
  @Input() stoneName: any;
  public data: any;
  public stoneId: any;

  constructor(private appStore: ApplicationStorageService,
    private stoneDetailsService: StoneDetailsService,
  ) { }

  ngOnInit() {
    this.stoneDetailsService.getConfirmedExportMemo().subscribe(res => { }, error => { });
    if (this.stoneName) {
      this.getStoneDetailForStoneId(this.stoneName);
    };
  }

  resetPage() {
  }

  getStoneDetailForStoneId(stonId) {
    this.stoneDetailsService.getStoneDetails(stonId).subscribe(stoneDetailResponse => {
      if (stoneDetailResponse !== undefined) {
        stoneDetailResponse.forEach(stoneDetail => {
          this.data = stoneDetail;
        })
      }
    });
  }

  ngOnDestroy() {
    //  this.appStore.remove('stoneIdForDetailMyConfirmation');
  }

}
