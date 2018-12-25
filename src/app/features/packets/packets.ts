import { Injectable, Type } from '@angular/core';

// @Injectable()

export class Packets {
  constructor(public packet_id: string, public packet_name: string, public data: any) { }
}
