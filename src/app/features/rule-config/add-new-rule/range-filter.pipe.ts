import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'rangeFilter'
})
export class RangeFilterPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    if (value.length === 0) {
      return value;
    }

    const copyArray: any[] = [];
    value.forEach((x) => {
      copyArray.push(Object.assign({}, x));
    });

    for (let i = 0; i < copyArray.length; i++) {
      if (args === 'Text' && copyArray[i].value === 'Range') {
        copyArray.splice(i, 1);
        return copyArray;
      }
    }
    return copyArray;
  }
}
