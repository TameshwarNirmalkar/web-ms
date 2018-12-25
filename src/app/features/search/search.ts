import { Injectable, Type } from '@angular/core';

// @Injectable()

export class Search {
  constructor(public id, public name: any, public component: Type<any>, public data: any) { }
}
