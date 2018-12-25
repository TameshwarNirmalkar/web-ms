import { Injectable } from '@angular/core';

@Injectable()
export class AdminUserService {

  constructor() { }

  getMenuItems() {
    return [
      { label: 'DASHBOARD', icon: 'fa-desktop', routeLink: 'dashboard' },
      { label: 'CREATE USER RULE', icon: 'fa-search', routeLink: 'add-user-rule' },
      { label: 'VIEW USER RULE', icon: 'fa-usd', routeLink: 'view-user-rule' }
    ];
  }

}
