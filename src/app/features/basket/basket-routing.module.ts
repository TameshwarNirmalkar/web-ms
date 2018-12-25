import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BasketComponent } from './basket.component';
import { RouterGuard } from '@srk/shared';

export const routes: Routes = [
  { path: '', redirectTo: 'basket-list', pathMatch: 'full' },
  { path: 'basket-list', component: BasketComponent, canActivate: [RouterGuard], pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BasketRoutingModule { }