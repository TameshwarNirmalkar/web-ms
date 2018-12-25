import { Component, OnInit } from '@angular/core';
import { AdminUserService } from './admin-user.service';

@Component({
  selector: 'app-admin-user',
  templateUrl: './admin-user.component.html',
  styleUrls: ['./admin-user.component.scss'],
  providers: [AdminUserService]
})
export class AdminUserComponent implements OnInit {
  menuOptions: any[];

  constructor(private service: AdminUserService) { }

  ngOnInit() {
    this.menuOptions = this.service.getMenuItems();
  }
}
