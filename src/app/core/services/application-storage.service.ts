import { Injectable } from '@angular/core';

@Injectable()
export class ApplicationStorageService {
  private appData: any[];

  constructor() {
    this.appData = [];
  }

  store(name: string, data: any) {
    const storage = {
      'name': name,
      'value': data
    };
    if (this.appData.length === 0) {
      this.appData.push(storage);
    } else {
      this.remove(storage.name);
      this.appData.push(storage);
    }
  }

  getData(name: string): any {
    let storedValue;   
    this.appData.forEach((element) => {
      if (name === element.name) {
        storedValue = element.value;
      }
    });   
    return storedValue;
  }

  remove(name: string) {
    let index;
    this.appData.forEach((element) => {
      if (name === element.name) {
        index = this.appData.indexOf(element);
        if (index > -1) {
          this.appData.splice(index, 1);
        }
      }
    });
  }

  resetAll() {
    this.appData = JSON.parse(JSON.stringify([]));
  }
}
