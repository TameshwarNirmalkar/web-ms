import { Component } from '@angular/core';
// import { StoneDetailsService,
//   StoneMultimediaDetailDirective,
//   UtilService,
//   AddNoteService
// } from '@srk/shared';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'web-ms';
  constructor () {
      console.log( 'App is running..' );
  }
}
