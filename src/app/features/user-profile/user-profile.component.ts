import { Component, OnInit } from '@angular/core';
import { UserProfileService } from '@srk/core';
import { CustomTranslateService } from '@srk/core';
import { Message } from 'primeng/primeng';
import { MessageService } from '@srk/core';
import { Subscription } from 'rxjs/Subscription';
import { NotifyService } from '@srk/core';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],

})
export class UserProfileComponent implements OnInit {
  public profileTabs = [
    { tabName: 'Profile' },
    { tabName: 'Profile Settings' }
    // { tabName: 'Terms & Conditions' }
  ];

  constructor(
    private userProfileService: UserProfileService,
    private messageService: MessageService,
    private customTranslateService: CustomTranslateService,
    private notifyService: NotifyService) { }

  ngOnInit() { }

  notifyProfileChange(e) {
    if (e.status) {
      this.messageService.showSuccessGrowlMessage(e.message);
    } else {
      this.messageService.showErrorGrowlMessage(e.message);
    }
  }

}
