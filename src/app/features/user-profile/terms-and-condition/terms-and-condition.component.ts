import { Component, OnInit } from '@angular/core';
import { UserProfileService } from '@srk/core';
import { MessageCodes, MessageCodesComparator } from '@srk/core';

@Component({
  selector: 'app-terms-and-condition',
  templateUrl: './terms-and-condition.component.html',
  styleUrls: ['./terms-and-condition.component.scss']
})
export class TermsAndConditionComponent implements OnInit {

  public termsDetails: any;
  public message: any;

  constructor(private userProfileService: UserProfileService) { }

  ngOnInit() {
    this.message = 'Loading..';
    this.userProfileService.fetchTermsAndCondition().subscribe(response => {
      if (response && !response.error_status && MessageCodesComparator.AreEqual(response.code, MessageCodes.AUTH_SHOW_TC_200)) {
        if (response.data && response.data.terms_and_condition_string) {
          this.termsDetails = response.data['terms_and_condition_string'];
        }
      } else {
        this.message = 'ERR_NO_DATA_FOUND';
      }
    }, err => {
      this.message = 'SERVER_ERROR_OCCURRED';
    });
  }

}
