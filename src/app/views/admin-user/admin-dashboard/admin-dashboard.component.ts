import { Component, OnInit } from '@angular/core';
import { AdminDashboardService } from './admin-dashboard.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
  providers: [AdminDashboardService]
})
export class AdminDashboardComponent implements OnInit {

  constructor(private service: AdminDashboardService) { }

  ngOnInit() {
  }

}
