import { Type } from '@angular/core';

export class Dashboard {
  constructor(public name: string, public component: Type<any>, public data: any) { }
}
