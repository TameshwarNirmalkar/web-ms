import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@srk/shared';
import { SearchModule } from '../search/search.module';
import { PacketsModule } from '../packets/packets.module';
import { TwinDiamondsComponent } from './twin-diamonds.component';
import { RecommendedTwinDiamondsComponent } from './recommended-twin-diamonds/recommended-twin-diamonds.component';
import { YouMayLikeTwinDiamondsComponent } from './you-may-like-twin-diamonds/you-may-like-twin-diamonds.component';
import { YourMarkedAsTwinDiamondsComponent } from './your-marked-as-twin-diamonds/your-marked-as-twin-diamonds.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    SearchModule,
    PacketsModule
  ],
  declarations: [
    TwinDiamondsComponent,
    RecommendedTwinDiamondsComponent,
    YouMayLikeTwinDiamondsComponent,
    YourMarkedAsTwinDiamondsComponent
  ],
  exports: [
    TwinDiamondsComponent,
    RecommendedTwinDiamondsComponent,
    YouMayLikeTwinDiamondsComponent,
    YourMarkedAsTwinDiamondsComponent
  ]
})
export class TwinDiamondsModule { }
