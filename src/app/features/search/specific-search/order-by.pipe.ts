import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'orderBy'
})
export class OrderByPipe implements PipeTransform {

  transform(value: any[], args?: any): any {
    value.sort((a: any, b: any) => {
      if (a.data.order < b.data.order) {
        return -1;
      } else if (a.data.order > b.data.order) {
        return 1;
      } else {
        return 0;
      }
    });
    return value;
  }

}
