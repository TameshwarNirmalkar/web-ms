import { Component, OnInit } from '@angular/core';
// import { StoneDetailsService,
//   StoneMultimediaDetailDirective,
//   UtilService,
//   AddNoteService
// } from '@srk/shared';

import { ApplicationAuditService } from '@srk/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'web-ms';
  constructor (
    private aas: ApplicationAuditService
    // private aths: AuthService,
    // private sss: SessionStorageService,
    // private ups: UserProfileService,
    // private ass: ApplicationStorageService
    ) {
      // console.log( this.aas, '\n\n', this.aths,'\n\n', this.sss, '\n\n', this.ups, '\n\n', this.ass  );
  }

  ngOnInit() {
    console.log( this.aas );
  }
}
