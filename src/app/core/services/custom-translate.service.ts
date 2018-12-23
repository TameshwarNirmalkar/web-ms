import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class CustomTranslateService {

  constructor(private translateService: TranslateService) { }

  translateColumns(prop: string, columns: any[]): any[] {
    for (let i = 0; i < columns.length; i++) {
      const propName: any = columns[i][prop];
      this.translateService.get(propName).subscribe((res: string) => {
        columns[i][prop] = res;
      });
    }
    return columns;
  }

  translateSelectItem(selectList: any[]): any[] {
    for (let i = 0; i < selectList.length; i++) {
      const selList: any = selectList[i];
      this.translateProperty('label', selList);
    }
    return selectList;
  }

  translateProperty(prop: string, targetObj: any) {
    if (targetObj[prop] !== null && targetObj[prop] !== undefined) {
      this.translateService.get(targetObj[prop]).subscribe((res: string) => {
        targetObj[prop] = res;
      });
    }
  }

  translateString(str: string): string {
    this.translateService.get(str).subscribe((res: string) => {
      str = res;
    });
    return str;
  }

  translateDynamicString(str: string, params: any) {
    this.translateService.get(str, params).subscribe((res: string) => {
      str = res;
    });
    return str;
  }

  translateDashboardCardList(cardList: any[]): any[] {
    for (let i = 0; i < cardList.length; i++) {
      const selList: any = cardList[i];
      this.translateCardProperty('mainDisplayText', {}, selList);
      this.translateCardProperty('footerLeftName', selList['footerLeftParams'], selList);
      this.translateCardProperty('footerRightName', selList['footerRightParams'], selList);
    }
    return cardList;
  }

  translateCardProperty(prop: string, params: any, targetObj: any) {
    if (targetObj[prop] !== null && targetObj[prop] !== undefined) {
      this.translateService.get(targetObj[prop], params).subscribe((res: string) => {
        targetObj[prop] = res;
      });
    }
  }

  getUserLanguage(): string {
    return this.translateService.currentLang;
  }

}
