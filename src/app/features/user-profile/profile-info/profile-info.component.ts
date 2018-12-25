import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-profile-info',
  templateUrl: './profile-info.component.html',
  styleUrls: ['./profile-info.component.scss']
})
export class ProfileInfoComponent implements OnInit {
  public profileInfoTabs = [
    { tabName: 'My Account Details' },
    { tabName: 'Change Password' }
  ];
  constructor() { }

  ngOnInit() {
  }

}
