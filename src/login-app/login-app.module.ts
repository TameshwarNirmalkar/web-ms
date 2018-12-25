import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { HttpClientModule, HttpClient, HttpClientJsonpModule} from '@angular/common/http';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import {LoginAppRoutingModule} from './login-app-routing.module';
import {LoginAppComponent} from './login-app.component';
import { CoreModule } from '@srk/core';
import { SharedModule } from '@srk/shared';
import { LoginModule } from './login/login.module';
import {SharingModule} from '../app/shared/sharing.module';

export function CreateTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    LoginAppComponent
  ],
  imports: [
    BrowserAnimationsModule,
    BrowserModule,
    CoreModule,
    SharedModule,
    SharingModule,
    LoginAppRoutingModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: CreateTranslateLoader,
        deps: [HttpClient]
      }
    }),
    LoginModule,
    HttpClientJsonpModule,
    HttpClientModule
  ],
  providers: [TranslateService],
  bootstrap: [LoginAppComponent]
})

export class LoginAppModule { }
