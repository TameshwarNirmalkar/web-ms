import { Directive, TemplateRef, ViewContainerRef, Input, OnInit, HostListener } from '@angular/core';
import { ApplicationDataService, MessageService } from '@srk/core';
import { NotifyService } from '@srk/core';
import { StoneDetailsService } from '../services/stone-details.service';

@Directive({
  selector: '[dirStoneMultimediaDetail]'
})
export class StoneMultimediaDetailDirective {
  @Input() dirStoneMultimediaDetail: any;
  public mediaTypeAvailableKey = [
    { name: 'Image', key: 'image_url' },
    { name: 'Video', key: 'movie_url' },
    { name: 'HA', key: 'hna_url' },
    { name: 'PDF', key: 'cert_url' },
    { name: 'Plotting', key: 'plot_url' },
    { name: 'Digiplott', key: 'digiplot_url' }
  ];
  constructor(
    private applicationDataService: ApplicationDataService,
    private notify: NotifyService,
    private messageService: MessageService,
    private stoneDetailsService: StoneDetailsService) { }

  @HostListener('click') onClick() {
    const envName = this.applicationDataService.getEnvironment()['envName'];
    const param = envName === 'ProdTrad' ? 'stoneId' : 'stoneIds';
    const flag = this.checkIfMediaIsAvailable();
    if (flag) {
      this.logViewedByMe();
      if (Object.keys(this.dirStoneMultimediaDetail).length > 2) {
        const taburl = window.open('http://pck2.azureedge.net/stone-multimedia/twin-stone-media-new/stone-multimedia.html?'
          + param + '=' + this.dirStoneMultimediaDetail.stoneid1.stone_id + ',' + this.dirStoneMultimediaDetail.stoneid2.stone_id + '&showMediaType=' + this.dirStoneMultimediaDetail.showMediaType, '_blank');
      } else {
        if (this.dirStoneMultimediaDetail.isDigiPlot === false) {
          const taburl = window.open('https://pck2.azureedge.net/stone-multimedia/stone-multimedia.htm?'
            + param + '=' + this.dirStoneMultimediaDetail.stoneid.stone_id, '_blank');
        } else {
          const taburl = window.open('https://pck2.azureedge.net/stone-multimedia/stone-multimedia.htm?'
            + param + '=' + this.dirStoneMultimediaDetail.stoneid.stone_id + '&showMediaType=' + this.dirStoneMultimediaDetail.showMediaType, '_blank');
        }
      }
    } else {
      // this.messageService.show
    }
  }

  logViewedByMe() {
    if (this.dirStoneMultimediaDetail.stoneid) {
      this.stoneDetailsService.incrementStoneView(this.dirStoneMultimediaDetail.stoneid.stone_id).subscribe(res => {
        this.notify.notifyStoneStateUpdated({ source: 'onlineViewIncrement', stoneList: [this.dirStoneMultimediaDetail.stoneid.stone_id] });
      });
    } else if (this.dirStoneMultimediaDetail) {
      this.stoneDetailsService.incrementStoneView(this.dirStoneMultimediaDetail).subscribe(res => {
        this.notify.notifyStoneStateUpdated({ source: 'onlineViewIncrement', stoneList: [this.dirStoneMultimediaDetail] });
      });
    }
  }

  checkIfMediaIsAvailable() {
    let flag = true;
    if (this.dirStoneMultimediaDetail.hasOwnProperty('stoneid1') && this.dirStoneMultimediaDetail.hasOwnProperty('stoneid2')) {
      const obj1 = this.dirStoneMultimediaDetail.stoneid1;
      const obj2 = this.dirStoneMultimediaDetail.stoneid2;
      let flag1 = true;
      let flag2 = true;
      this.mediaTypeAvailableKey.forEach(element => {
        if (this.dirStoneMultimediaDetail.showMediaType === element.name) {
          if (!obj1[element.key]) {
            flag1 = false;
          }
          if (!obj2[element.key]) {
            flag2 = false;
          }
        }
      });
      flag = flag1 || flag2;
    } else if (this.dirStoneMultimediaDetail.hasOwnProperty('stoneid')) {
      const obj = this.dirStoneMultimediaDetail.stoneid;
      this.mediaTypeAvailableKey.forEach(element => {
        if (this.dirStoneMultimediaDetail.showMediaType === element.name) {
          if (!obj[element.key]) {
            flag = false;
          }
        }
      });
    } else {
    }
    return flag;
  }
}
