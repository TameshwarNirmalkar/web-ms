import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BasketRoutingModule } from './basket-routing.module';
import { BasketComponent } from './basket.component';
import { BasketTableComponent } from './basket-table/basket-table.component';
import { SharedModule } from '@srk/shared';
import { PacketsModule } from '@srk/features/packets';
import { BasketService } from './basket.service';


@NgModule({
  imports: [
    CommonModule,
    BasketRoutingModule,
    SharedModule,
    PacketsModule,
  ],
  declarations: [BasketComponent, BasketTableComponent],
  providers: [BasketService]
})
export class BasketModule { }
