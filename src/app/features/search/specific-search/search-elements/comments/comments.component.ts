import { Component, OnInit, EventEmitter, Output, Input, ViewEncapsulation} from '@angular/core';
import { SearchService } from '@srk/core';
import { NotifyService } from '@srk/core';
import { MessageService } from '@srk/core';
import { StoneDetailsService } from '@srk/shared';
import { TitleCasePipe } from '@angular/common';
@Component({
  selector: 'app-search-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CommentsComponent implements OnInit {

  @Input() data: any;
  // commentValues: any;
  ktsOptionList: any[] = [];
  sgsOptionList: any[] = [];
  KTSlikeValues: any[] = [];
  KTSdislikeValues: any[] = [];
  SGSlikeValues: any[] = [];
  SGSdislikeValues: any[] = [];

tooltipMsg:String;
  isLikeKTS = false;
  isDislikeKTS = false;
  isLikeSGS = false;
  isDislikeSGS = false;

  constructor(
    private service: SearchService,
    private notifyService: NotifyService,
    private messageService: MessageService,
    private stoneSvc: StoneDetailsService) { }

  ngOnInit() {
    this.service.getSearchFilterData().subscribe(response => {
      response.data.comment.forEach((element) => {
        const labelValue = new TitleCasePipe().transform(element.label);
        this.ktsOptionList.push({ label: labelValue, value: element.label });
      });

      response.data.sgs.forEach((element) => {
        const labelValue = new TitleCasePipe().transform(element.label);
        this.sgsOptionList.push({ label: labelValue, value: element.label });
      });
    });
    this.setPreSelectedValues();
  }
  setPreSelectedValues() {
    if (this.data.parentRef.values !== undefined) {
      if (this.data.parentRef.values.kts !== undefined) {
        this.isLikeKTS = true;
        this.data.parentRef.values.kts.forEach((value) => {
          this.KTSlikeValues.push(value);
        });
      }
      if (this.data.parentRef.values.sgs !== undefined) {
        this.isLikeSGS = true;
        this.data.parentRef.values.sgs.forEach((value) => {
          this.SGSlikeValues.push(value);
        });
      }
    }
    if (this.data.parentRef.values_not !== undefined && Object.keys(this.data.parentRef.values_not).length !== 0 &&
      this.data.parentRef.values_not.constructor === Object) {
      if (this.data.parentRef.values_not.kts !== undefined) {
        this.isDislikeKTS = true;
        this.data.parentRef.values_not.kts.forEach((value) => {
          this.KTSdislikeValues.push(value);
        });
      }
      if (this.data.parentRef.values_not.sgs !== undefined) {
        this.isDislikeSGS = true;
        this.data.parentRef.values_not.sgs.forEach((value) => {
          this.SGSdislikeValues.push(value);
        });
      }
    }
  }

  KTSlike() {
    if (this.KTSlikeValues.length > 0) {
      this.isLikeKTS = true;
    } else {
      this.isLikeKTS = false;
    }
    const result = [{
      'key': 'kts-like',
      'value': this.KTSlikeValues
    }];
    if (this.data && this.data.isObserved) {
      this.notifyService.notifySearchElementTouched(
        { searchComponent: 'CommentsComponent', parent: this.data.parentRef, filterCriteria: result }
      );
    }
  }

  KTSdislike() {
    if (this.KTSdislikeValues.length > 0) {
      this.isDislikeKTS = true;
    } else {
      this.isDislikeKTS = false;
    }
    const result = [{
      'key': 'kts-dislike',
      'value': this.KTSdislikeValues
    }];
    if (this.data && this.data.isObserved) {
      this.notifyService.notifySearchElementTouched(
        { searchComponent: 'CommentsComponent', parent: this.data.parentRef, filterCriteria: result }
      );
    }
  }

  SGSlike() {
    if (this.SGSlikeValues.length > 0) {
      this.isLikeSGS = true;
    } else {
      this.isLikeSGS = false;
    }
    const result = [{
      'key': 'sgs-like',
      'value': this.SGSlikeValues
    }];
    if (this.data && this.data.isObserved) {
      this.notifyService.notifySearchElementTouched(
        { searchComponent: 'CommentsComponent', parent: this.data.parentRef, filterCriteria: result }
      );
    }
  }

  SGSdislike() {
    if (this.SGSlikeValues.length > 0) {
      this.isDislikeSGS = true;
    } else {
      this.isDislikeSGS = false;
    }
    const result = [{
      'key': 'sgs-dislike',
      'value': this.SGSdislikeValues
    }];
    if (this.data && this.data.isObserved) {
      this.notifyService.notifySearchElementTouched(
        { searchComponent: 'CommentsComponent', parent: this.data.parentRef, filterCriteria: result }
      );
    }
  }

  saveValues(label, value) {
    value = this.stoneSvc.removeDuplicateItemFromArray(value);
    const param = {};
    param['key'] = label;
    param['value'] = value;
    this.saveCommentValues(param);
  }

  removeValues(valuelist, array) {
    let list = [];
    valuelist.forEach(object => {
      list.push(object.value)
    });
    array.forEach(value => {
      list.forEach(object => {
        if (object === value) {
          const i = list.indexOf(object);
          list.splice(i, 1);
        }
      })
    })
    return list;
  }

  saveCommentValues(object) {
    const result = [];
    result.push(object);
    if (this.data.isObserved) {
      this.notifyService.notifySearchElementTouched(
        { searchComponent: 'CommentsComponent', parent: this.data.parentRef, filterCriteria: result }
      );
    }
  }


}
