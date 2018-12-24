import { CanActivate, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@srk/core';
import { Observable } from 'rxjs/Rx';

@Injectable()
export class RouterGuard implements CanActivate {

  constructor(private router: Router, private authService: AuthService) { }

  public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean {
    let isAllowsed = false;
    const accessRouteUrl: string = state.url;
    const isUserSessionFound = this.authService.isUserSessionAvailable();
    if (isUserSessionFound && accessRouteUrl !== undefined) {
      const hasPermission = this.authService.hasRoutePermission(accessRouteUrl);
      if (hasPermission) {
        isAllowsed = true;
      } else {
        isAllowsed = false;
        this.router.navigate(['/dashboard']);
      }
    } else {
      isAllowsed = false;
      this.router.navigate(['/login']);
    }
    return isAllowsed;
  }
}
