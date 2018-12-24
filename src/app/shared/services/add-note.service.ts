import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ErrorHandlerService } from '@srk/core';
import { ApplicationDataService } from '@srk/core';
import { AuthService } from '@srk/core';
import { LoggerService } from '@srk/core';
import { NotifyService } from '@srk/core';
import { catchError, map } from 'rxjs/operators';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class AddNoteService {

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService,
    private applicationDataService: ApplicationDataService,
    private authService: AuthService,
    private logger: LoggerService,
    private notify: NotifyService
  ) { }

  addCommentForStoneId(comment, stone_id): Observable<any> {
    const data = {
      comment: comment,
      stone_id: stone_id
    };
    return this.http.post(this.applicationDataService.getEnvironment().StoneManagementApi
      + '/stonemgt/' + this.authService.getLoginName() + '/viewRequest/addComment/' +
      this.applicationDataService.getEnvironment().StoneManagementApiVersion, data).pipe(
        map((response) => {
          return response;
        }),
        catchError(err => {
          this.logger.logError('addCommentForStoneId', `user action add comment for stone :- ${JSON.stringify(err)}`);
          return this.errorHandler.handleError('addCommentForStoneId', err);
        })
      );
  }

  getCommentListforStoneIds(stoneIds): Observable<any> {
    // let thisStoneIds = this.removeStoneNotesInfo(stoneIds);
    const stoneJson = {};
    stoneJson['stone_ids'] = this.createStoneIdList(stoneIds);
    return this.http.post(this.applicationDataService.getEnvironment().StoneManagementApi
      + '/stonemgt/' + this.authService.getLoginName() + '/viewRequest/commentList/' +
      this.applicationDataService.getEnvironment().StoneManagementApiVersion, stoneJson).pipe(
        map((response: Response) => {
          const responseArray = response.json();
          if (responseArray['data']) {
            stoneIds = this.addStoneNotesInfo(stoneIds, responseArray['data']);
          } else {
            stoneIds = this.removeStoneNotesInfo(stoneIds);
          }
          return stoneIds;
        }),
        catchError(err => this.errorHandler.handleError('getCommentListforStoneIds', err))
      );
  }

  getCommentListforStoneIdsForGrid(stoneIds): Observable<any> {
    const stoneJson = {};
    stoneJson['stone_ids'] = this.createStoneIdList(stoneIds);
    return this.http.post(this.applicationDataService.getEnvironment().StoneManagementApi
      + '/stonemgt/' + this.authService.getLoginName() + '/viewRequest/commentList/' +
      this.applicationDataService.getEnvironment().StoneManagementApiVersion, stoneJson).pipe(
        map((response: Response) => response),
        catchError(err => this.errorHandler.handleError('getCommentListforStoneIdsForGrid', err))
      );
  }

  deleteCommentListforStoneIds(commentIds): Observable<any> {
    const stoneJson = {};
    stoneJson['comment_ids'] = commentIds;
    const httpOptions = {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' }), body: JSON.stringify(stoneJson)
    };
    return this.http.delete(this.applicationDataService.getEnvironment().StoneManagementApi
      + '/stonemgt/viewRequest/deleteComment/' +
      this.applicationDataService.getEnvironment().StoneManagementApiVersion, httpOptions).pipe(
        map((response) => response),
        catchError(err => this.errorHandler.handleError('deleteCommentListforStoneIds', err))
      );
  }


  createStoneIdList(stoneArray) {
    const stoneIdList = [];
    if (stoneArray) {
      stoneArray.forEach((stone) => {
        if (stone.stone_id) {
          stoneIdList.push(stone.stone_id);
        }
      });
    }
    return stoneIdList;
  }

  createNoteIdList(noteList) {
    const noteIdList = [];
    if (noteList) {
      noteList.forEach((note) => {
        if (note.comment_id) {
          noteIdList.push(note.comment_id);
        }
      });
    }
    return noteIdList;
  }

  addStoneNotesInfo(stoneArray, stoneInfo) {
    stoneArray.forEach((stone) => {
      const stoneId = stone.stone_id;
      if (stoneInfo.hasOwnProperty(stoneId)) {
        if (stoneInfo[stoneId] && stoneInfo[stoneId].length > 0) {
          let array: any[];
          array = stoneInfo[stoneId];
          array.reverse();
          stone['notes'] = array;
          stone['haveNote'] = true;
          stone['displayNote'] = array[0].comment;
          stone['totalNotes'] = array.length;
        }
      } else {
        if (stone.notes) {
          delete stone.notes;
        }
        stone['haveNote'] = false;
        if (stone.displayNote) {
          stone['displayNote'] = '';
        }
        if (stone.totalNotes) {
          delete stone.totalNotes;
        }
      }
    });
    return stoneArray;
  }

  removeStoneNotesInfo(stoneArray) {
    if (stoneArray && stoneArray.length > 0) {
      stoneArray.forEach((stone) => {
        if (stone.hasOwnProperty('haveNote')) {
          if (stone.haveNote) {
            delete stone.notes;
            delete stone.haveNote;
            delete stone.displayNote;
            delete stone.totalNotes;
          }
        }
      });
    }
    return stoneArray;
  }

  fetchStonesComment(array) {
    // console.log('Making request for the comments');
    this.getCommentListforStoneIds(array).subscribe((commentRes) => {
      // console.log('response recieved ');
      array = commentRes;
    });
    // console.log('returnning ');
    return array;
  }

  fetchStonesAsynchronously(array): Promise<any> {

    return this.getCommentListforStoneIds(array).toPromise();

  }


}
