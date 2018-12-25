import { Component, OnInit } from '@angular/core';
import { UserLimitService } from '../user-limit.service';
import { Message } from 'primeng/primeng';
import { MessageService } from '@srk/core';

@Component({
  selector: 'app-add-user-limit',
  templateUrl: './add-user-limit.component.html',
  styleUrls: ['./add-user-limit.component.scss']
})
export class AddUserLimitComponent implements OnInit {
  clientLimitJson: any;

  constructor(private service: UserLimitService, private messageService: MessageService
  ) { }

  ngOnInit() {
    this.service.getClientDataJson()
      .subscribe(data => {
        this.clientLimitJson = data;
      });
  }

  add(eventData) {
    let result: any;
    this.service.saveNewRule(eventData)
      .subscribe(
      data => {
        result = data;
        if (result) {
          this.messageService.showSuccessGrowlMessage(result['message']);
        }
      },
      error => {
        result = error;
        if (result) {
          this.messageService.showErrorGrowlMessage(result['message']);
        }
      });

  }
}
