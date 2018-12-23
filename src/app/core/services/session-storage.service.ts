import {Injectable} from '@angular/core';

// @TODO Add a fallback for when Browsers SessionStorage is not available it will fallback to storage in memory.

@Injectable()
export class SessionStorageService {

  constructor() {}


  getDataFromSessionStorage(key: string): Promise<any> {

    return new Promise<any>((resolve, reject) => {

      let temp: string = window.sessionStorage.getItem(key);

      if (temp) {

        resolve(JSON.parse(temp));

      } else {

        reject(null);

      }

      temp = null;

    });

  }


  setDataInSessionStorage(key: string, value: any): Promise<Boolean> {

    return new Promise((resolve, reject) => {

      window.sessionStorage.setItem(key, value);
      resolve(true);

    });

  }


  deleteItemFromSessionStorage(key: string): Promise<Boolean> {

    return new Promise<Boolean>((resolve, reject) => {

      window.sessionStorage.removeItem(key);
      resolve(true);

    });

  }


  clearSessionStorage(): Promise<Boolean> {

    return new Promise<Boolean>((resolve, reject) => {

      window.sessionStorage.clear();
      resolve(true);

    });

  }


}
