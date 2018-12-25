import { Component, OnInit } from '@angular/core';
import { UserProfileService } from '@srk/core';
@Component({
  selector: 'app-account-detail',
  templateUrl: './account-detail.component.html',
  styleUrls: ['./account-detail.component.scss']
})
export class AccountDetailComponent implements OnInit {

  public userAccountInfo: any;
  constructor(private userProfileService: UserProfileService) { }

  ngOnInit() {
    this.userProfileService.getAccountDetails().subscribe(res => {
      if (!res.error_status) {
        this.userAccountInfo = res.data[0];
      }
    }, error => {
      this.userAccountInfo = {};
    });
  }

}
