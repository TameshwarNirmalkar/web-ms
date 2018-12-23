import { Injectable } from '@angular/core';
import { UserDetails } from '../models/user-details';

@Injectable()
export class UserDetailService {

  private userDetails: UserDetails = <UserDetails>{};

  constructor() {
    this.userDetails.name = 'Admin';
    this.userDetails.email = 'Admin@mail.com';
    this.userDetails.id = '112';
  }

  getUserDetails(): UserDetails {
    return this.userDetails;
  }

}
