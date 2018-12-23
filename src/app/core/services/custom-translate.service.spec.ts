/* tslint:disable:no*unused*variable */

import {} from 'jasmine';
import { TestBed, async, inject } from '@angular/core/testing';
import { HttpModule, Http, JsonpModule } from '@angular/http';
import { RouterTestingModule} from '@angular/router/testing';
import { TranslateModule, TranslateLoader, TranslateService, TranslateStaticLoader } from '@ngx-translate/core/@ngx-translate/core';
import { CustomTranslateService } from './custom-translate.service';


describe('CustomTranslateService', () => {
  let translate: TranslateService = null;
  beforeEach(() => {

    TestBed.configureTestingModule({

      imports: [TranslateModule.forRoot({
        provide: TranslateLoader,
        useFactory: (http: Http) => new TranslateStaticLoader(http, 'assets/i18n', '.json'),
        deps: [Http]
      })],
      providers: [TranslateService, CustomTranslateService]
    });
    TestBed.compileComponents();
  });

  beforeEach(inject([TranslateService, CustomTranslateService], (translateService: TranslateService, service: CustomTranslateService) => {
    translate = translateService;
  }));
  // *******************************translateColumns()********************************************************************//

  it('should translateColumns in English', inject([CustomTranslateService, TranslateService],
    (service: CustomTranslateService, translateSvc: TranslateService) => {
      translateSvc.use('en');
      this.data = [
        { mainDesc: 'Stones Uploaded' },
        { mainDesc: 'Recommended Stones' }
      ];
      this.data = service.translateColumns('mainDesc', this.data);
      this.newData = [
        { mainDesc: 'Stones Uploaded' },
        { mainDesc: 'Recommended Stones' }
      ];
      expect(this.data).toEqual(this.newData);
    }));

  it('should fail translateColumns in English', inject([CustomTranslateService, TranslateService],
    (service: CustomTranslateService, translateSvc: TranslateService) => {
      translateSvc.use('en');
      this.data = [
        { mainDesc: 'Stones Uploaded' },
        { mainDesc: 'Recommended Stones' }
      ];
      this.data = service.translateColumns('mainDesc', this.data);
      this.newData = [
        { mainDesc: 'Stones Uploaded' },
        { mainDesc: 'Stones' }
      ];
      expect(this.data).toEqual(this.newData);
    }));

  it('should translateColumns in Chinese', inject([CustomTranslateService, TranslateService],
    (service: CustomTranslateService, tsService: TranslateService) => {
      tsService.use('zh');
      this.data = [
        { mainDesc: 'Stones Uploaded' }
      ];
      this.data = service.translateColumns('mainDesc', this.data);
      this.newData = [
        { mainDesc: '上传的石头' }
      ];
      setTimeout(() => {
        expect(this.data).toEqual(this.newData);
      }, 80);
    }));

  it('should fail translateColumns in Chinese', inject([CustomTranslateService, TranslateService],
    (service: CustomTranslateService, tsService: TranslateService) => {
      translate.use('zh');

      this.data = [
        { mainDesc: 'Stones Uploaded' },
        { mainDesc: 'Recommended Stones' }
      ];
      this.transData = service.translateColumns('mainDesc', this.data);
      this.newData = [
        { mainDesc: '上传石头' },
        { mainDesc: '推荐石' }
      ];
      setTimeout(() => {
        expect(this.transData).toEqual(this.newData);
      }, 80);
    }));

  it('should translateColumns in spanish', inject([CustomTranslateService, TranslateService],
    (service: CustomTranslateService, tsService: TranslateService) => {
      tsService.use('es');
      this.data = [
        { mainDesc: 'Stones Uploaded' },
        { mainDesc: 'Recommended Stones' }
      ];
      this.newdata = service.translateColumns('mainDesc', this.data);
      this.newData = [
        { mainDesc: 'Piedras cargadas' },
        { mainDesc: 'Piedras recomendadas' }
      ];
      setTimeout(() => {
        expect(this.newdata).toEqual(this.newData);
      }, 80);
    }));

  it('should fail translateColumns in Spanish', inject([CustomTranslateService, TranslateService],
    (service: CustomTranslateService, tsService: TranslateService) => {
      tsService.use('es');
      this.data = [
        { mainDesc: 'Stones Uploaded' }
      ];
      this.data = service.translateColumns('mainDesc', this.data);
      this.newData = [
        { mainDesc: 'Piedras cargadas' }
      ];
      setTimeout(() => {
        expect(this.data).toEqual(this.newData);
      }, 80);
    }));


  // ********************************************************************************************************************//


  // *******************************translateString()********************************************************************//

  it('should translateString in english', inject([CustomTranslateService, TranslateService],
    (service: CustomTranslateService, tsService: TranslateService) => {
      tsService.use('en');
      this.data = service.translateString(this.data);
      this.newData = 'Stones';
      expect(this.data).toEqual(this.newData);
    }));

  it('should fail translateString in english', inject([CustomTranslateService, TranslateService],
    (service: CustomTranslateService, tsService: TranslateService) => {
      tsService.use('en');
      this.data = 'Stones';
      this.data = service.translateString(this.data);
      this.newData = 'Sto';
      expect(this.data).not.toEqual(this.newData);
    }));

  it('should translateString in spanish', inject([CustomTranslateService, TranslateService],
    (service: CustomTranslateService, tsService: TranslateService) => {
      tsService.use('es');
      this.data = 'xyz';
      this.data = service.translateString(this.data);
      this.newData = 'Piedras';
      setTimeout(() => {
        expect(this.data).toEqual(this.newData);
      }, 80);
    }));

  it('should fail translateString in spanish', inject([CustomTranslateService, TranslateService],
    (service: CustomTranslateService, tsService: TranslateService) => {
      tsService.use('es');
      this.data = 'Stones';
      this.data = service.translateString(this.data);
      this.newData = 'Pieds';
      setTimeout(() => {
        expect(this.data).toEqual(this.newData);
      }, 80);

    }));

  it('should translateString in chinese', inject([CustomTranslateService, TranslateService],
    (service: CustomTranslateService, tsService: TranslateService) => {
      tsService.use('zh');
      this.data = 'Stones';
      this.data = service.translateString(this.data);
      this.newData = '石头';
      setTimeout(() => {
        expect(this.data).toEqual(this.newData);
      }, 80);
    }));

  it('should fail translateString in chinese', inject([CustomTranslateService, TranslateService],
    (service: CustomTranslateService, tsService: TranslateService) => {
      tsService.use('zh');
      this.data = 'Stones';
      this.data = service.translateString(this.data);
      this.newData = '石';
      setTimeout(() => {
        expect(this.data).not.toEqual(this.newData);
      }, 80);
    }));

  // ***************************************************************************************************************//


  // *******************************translateSelectItem()********************************************************************//

  it('should translateSelectItem in English', inject([CustomTranslateService, TranslateService],
    (service: CustomTranslateService, tsService: TranslateService) => {
      tsService.use('en');
      this.data = [
        { label: 'DASHBOARD', icon: 'fa-desktop', routeLink: 'dashboard' }
      ];
      this.data = service.translateSelectItem(this.data);
      this.newData = [
        { label: 'DASHBOARD', icon: 'fa-desktop', routeLink: 'dashboard' }
      ];
      expect(this.data).toEqual(this.newData);
    }));

  it('should fail translateSelectItem in English', inject([CustomTranslateService, TranslateService],
    (service: CustomTranslateService, tsService: TranslateService) => {
      tsService.use('en');
      this.data = [
        { label: 'DASHBOARD', icon: 'fa-desktop', routeLink: 'dashboard' }
      ];
      this.data = service.translateSelectItem(this.data);
      this.newData = [
        { label: 'DASHARD', icon: 'fa-desktop', routeLink: 'dashboard' }
      ];
      expect(this.data).not.toEqual(this.newData);
    }));

  it('should translateSelectItem in Chinese', inject([CustomTranslateService, TranslateService],
    (service: CustomTranslateService, tsService: TranslateService) => {
      tsService.use('zh');
      this.data = [
        { label: 'DASHBOARD', icon: 'fa-desktop', routeLink: 'dashboard' }
      ];
      this.data = service.translateSelectItem(this.data);
      this.newData = [
        { label: '仪表板', icon: 'fa-desktop', routeLink: 'dashboard' }
      ];
      setTimeout(() => {
        expect(this.data).not.toEqual(this.newData);
      }, 80);
    }));

  it('should fail translateSelectItem in Chinese', inject([CustomTranslateService, TranslateService],
    (service: CustomTranslateService, tsService: TranslateService) => {
      tsService.use('zh');
      this.data = [
        { label: 'DASHBOARD', icon: 'fa-desktop', routeLink: 'dashboard' }
      ];
      this.data = service.translateSelectItem(this.data);
      this.newData = [
        { label: '仪表', icon: 'fa-desktop', routeLink: 'dashboard' }
      ];
      setTimeout(() => {
        expect(this.data).not.toEqual(this.newData);
      }, 80);
    }));

  it('should translateSelectItem in spanish', inject([CustomTranslateService, TranslateService],
    (service: CustomTranslateService, tsService: TranslateService) => {
      tsService.use('es');
      this.data = [
        { label: 'DASHBOARD', icon: 'fa-desktop', routeLink: 'dashboard' }
      ];
      this.data = service.translateSelectItem(this.data);
      this.newData = [
        { label: 'TABLERO', icon: 'fa-desktop', routeLink: 'dashboard' }
      ];
      setTimeout(() => {
        expect(this.data).toEqual(this.newData);
      }, 80);
    }));

  it('should fail translateSelectItem in Spanish', inject([CustomTranslateService, TranslateService],
    (service: CustomTranslateService, tsService: TranslateService) => {
      tsService.use('es');
      this.data = [
        { label: 'DASHBOARD', icon: 'fa-desktop', routeLink: 'dashboard' }
      ];
      this.data = service.translateSelectItem(this.data);
      this.newData = [
        { label: 'TABLE', icon: 'fa-desktop', routeLink: 'dashboard' }
      ];
      setTimeout(() => {
        expect(this.data).not.toEqual(this.newData);
      }, 80);
    }));
  // ********************************************************************************************************************//

  // ******************************* translateProperty()********************************************************************//

  it('should translateProperty in English', inject([CustomTranslateService, TranslateService],
    (service: CustomTranslateService, tsService: TranslateService) => {
      tsService.use('en');
      this.data = [
        { label: 'DASHBOARD', icon: 'fa-desktop', routeLink: 'dashboard' }
      ];
      this.data = service.translateProperty('label', this.data);
      this.newData = [
        { label: 'DASHBOARD', icon: 'fa-desktop', routeLink: 'dashboard' }
      ];
      setTimeout(() => {
        expect(this.data).toEqual(this.newData);
      }, 80);
    }));

  it('should fail translateProperty in English', inject([CustomTranslateService, TranslateService],
    (service: CustomTranslateService, tsService: TranslateService) => {
      tsService.use('en');
      this.data = [
        { label: 'DASHBOARD', icon: 'fa-desktop', routeLink: 'dashboard' }
      ];
      this.data = service.translateProperty('label', this.data);
      this.newData = [
        { label: 'DASHARD', icon: 'fa-desktop', routeLink: 'dashboard' }
      ];
      setTimeout(() => {
        expect(this.data).not.toEqual(this.newData);
      }, 80);
    }));

  it('should translateProperty in Chinese', inject([CustomTranslateService, TranslateService],
    (service: CustomTranslateService, tsService: TranslateService) => {
      tsService.use('zh');
      this.data = [
        { label: 'DASHBOARD', icon: 'fa-desktop', routeLink: 'dashboard' }
      ];
      this.data = service.translateProperty('label', this.data);
      this.newData = [
        { label: '仪表板', icon: 'fa-desktop', routeLink: 'dashboard' }
      ];
      setTimeout(() => {
        expect(this.data).not.toEqual(this.newData);
      }, 80);
    }));

  it('should fail translateProperty in Chinese', inject([CustomTranslateService, TranslateService],
    (service: CustomTranslateService, tsService: TranslateService) => {
      tsService.use('zh');
      this.data = [
        { label: 'DASHBOARD', icon: 'fa-desktop', routeLink: 'dashboard' }
      ];
      this.data = service.translateProperty('label', this.data);
      this.newData = [
        { label: '仪表', icon: 'fa-desktop', routeLink: 'dashboard' }
      ];
      setTimeout(() => {
        expect(this.data).not.toEqual(this.newData);
      }, 80);
    }));

  it('should translateProperty in spanish', inject([CustomTranslateService, TranslateService],
    (service: CustomTranslateService, tsService: TranslateService) => {
      tsService.use('es');
      this.data = [
        { label: 'DASHBOARD', icon: 'fa-desktop', routeLink: 'dashboard' }
      ];
      this.data = service.translateProperty('label', this.data);
      this.newData = [
        { label: 'TABLERO', icon: 'fa-desktop', routeLink: 'dashboard' }
      ];
      setTimeout(() => {
        expect(this.data).toEqual(this.newData);
      }, 80);
    }));

  it('should fail translateProperty in Spanish', inject([CustomTranslateService, TranslateService],
    (service: CustomTranslateService, tsService: TranslateService) => {
      tsService.use('es');
      this.data = [
        { label: 'DASHBOARD', icon: 'fa-desktop', routeLink: 'dashboard' }
      ];
      this.data = service.translateProperty('label', this.data);
      this.newData = [
        { label: 'TABLE', icon: 'fa-desktop', routeLink: 'dashboard' }
      ];
      setTimeout(() => {
        expect(this.data).not.toEqual(this.newData);
      }, 80);
    }));
  // ********************************************************************************************************************//

  // *******************************translateDashboardCardList()********************************************************************//

  it('should translateDashboardCardList in English', inject([CustomTranslateService, TranslateService],
    (service: CustomTranslateService, tsService: TranslateService) => {
      tsService.use('en');
      this.data = [
        { mainDesc: 'Stones Uploaded' },
        { mainDesc: 'Recommended Stones' }
      ];
      this.data = service.translateDashboardCardList(this.data);

      this.newData = [
        { mainDesc: 'Stones Uploaded' },
        { mainDesc: 'Recommended Stones' }
      ];
      expect(this.data).toEqual(this.newData);
    }));

  it('should fail translateDashboardCardList in English', inject([CustomTranslateService, TranslateService],
    (service: CustomTranslateService, tsService: TranslateService) => {
      tsService.use('en');
      this.data = [
        { mainDesc: 'Stones Uploaded' },
        { mainDesc: 'Recommended Stones' }
      ];
      this.data = service.translateDashboardCardList(this.data);
      this.newData = [
        { mainDesc: 'Stones Uploaded' },
        { mainDesc: 'Stones' }
      ];
      expect(this.data).not.toEqual(this.newData);
    }));

  it('should translateDashboardCardList in Chinese', inject([CustomTranslateService, TranslateService],
    (service: CustomTranslateService, tsService: TranslateService) => {
      tsService.use('zh');
      this.data = [
        { mainDesc: 'Stones Uploaded' },
        { mainDesc: 'Recommended Stones' }
      ];
      this.data = service.translateDashboardCardList(this.data);
      this.newData = [
        { mainDesc: '上传的石头' },
        { mainDesc: '推荐石头' }
      ];
      setTimeout(() => {
        expect(this.data).toEqual(this.newData);
      }, 80);
    }));

  it('should fail translateDashboardCardList in Chinese', inject([CustomTranslateService, TranslateService],
    (service: CustomTranslateService, tsService: TranslateService) => {
      tsService.use('zh');
      this.data = [
        { mainDesc: 'Stones Uploaded' },
        { mainDesc: 'Recommended Stones' }
      ];
      this.data = service.translateDashboardCardList(this.data);
      this.newData = [
        { mainDesc: '上传石头' },
        { mainDesc: '推荐石' }
      ];
      setTimeout(() => {
        expect(this.data).not.toEqual(this.newData);
      }, 80);
    }));

  it('should translateDashboardCardList in spanish', inject([CustomTranslateService, TranslateService],
    (service: CustomTranslateService, tsService: TranslateService) => {
      tsService.use('es');
      this.data = [
        { mainDesc: 'Stones Uploaded' },
        { mainDesc: 'Recommended Stones' }
      ];
      this.data = service.translateDashboardCardList(this.data);
      this.newData = [
        { mainDesc: 'Piedras cargadas' },
        { mainDesc: 'Piedras recomendadas' }
      ];
      setTimeout(() => {
        expect(this.data).toEqual(this.newData);
      }, 80);
    }));

  it('should fail translateDashboardCardList in Spanish', inject([CustomTranslateService, TranslateService],
    (service: CustomTranslateService, tsService: TranslateService) => {
      tsService.use('es');
      this.data = [
        { mainDesc: 'Stones Uploaded' },
        { mainDesc: 'Recommended Stones' }
      ];
      this.data = service.translateDashboardCardList(this.data);
      this.newData = [
        { mainDesc: 'Piedras cargadas' },
        { mainDesc: 'Piedras recomdas' }
      ];
      setTimeout(() => {
        expect(this.data).not.toEqual(this.newData);
      }, 80);
    }));
  // ********************************************************************************************************************//

});
