import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'cardItems'
})
export class CardItemsPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    if (value.length === 0) {
      return value;
    }
    const deviceSize = window.innerWidth;
    let carouselItems = [];
    if (deviceSize > 1000) {
      carouselItems = value.slice(0, 4);
    } else if (deviceSize > 600) {
      carouselItems = value.slice(0, 2);
    } else if (deviceSize > 0) {
      carouselItems = value.slice(0, 1);
    }
    return carouselItems;
  }
}
