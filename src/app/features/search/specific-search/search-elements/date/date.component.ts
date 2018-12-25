import { Component, Input, OnInit } from '@angular/core';
import { SearchService } from '@srk/core';
import { NotifyService } from '@srk/core';
import { MessageService } from '@srk/core';
@Component({
  selector: 'app-date',
  templateUrl: './date.component.html',
  styleUrls: ['./date.component.scss']
})
export class DateComponent implements OnInit {

  @Input() data: any;
  @Input() filterConfig: any;

  todayDate;
  fromDate;
  toDate;

  constructor(
    private service: SearchService,
    private messageService: MessageService,
    private notifyService: NotifyService) { }

  ngOnInit() {
    this.todayDate = this.getTodayDate();
    if (this.data && this.data.parentRef.range) {
      this.initFilterWithData(this.data.parentRef.range);
    }
  }

  initFilterWithData(range) {
    if (range.upload_date) {
      const dateRange = range.upload_date[0].split(':');
      this.fromDate = new Date(dateRange[0]);
      this.toDate = new Date(dateRange[1]);
    }
  }

  submitDate() {
    if (this.formatDate(this.fromDate) !== null && this.formatDate(this.toDate) !== null) {
      if (this.compareFromToDate(this.fromDate, this.toDate)) {
        this.createDateParam();
      } else {
        this.messageService.showErrorGrowlMessage('SELECT_CORRECT_DATE_RANGE');
      }
    } else {
      this.createDateParam();
    }
  }

  createDateParam() {
    const result = [{
      'key': '#upload_date',
      'value': [this.formatDate(this.fromDate) + ':' + this.formatDate(this.toDate)]
    }];
    if (this.data && this.data.isObserved) {
      this.notifyService.notifySearchElementTouched(
        { searchComponent: 'DateComponent', parent: this.data.parentRef, filterCriteria: result }
      );
    }
  }

  formatDate(dateObj = null): string {
    let formattedDate = null;
    if (dateObj) {
      const today = new Date(dateObj);
      const date = today.getDate();
      const month = today.getMonth() + 1;
      const year = today.getFullYear();
      const formatMonth = month < 10 ? '0' + month : month;
      const formatDate = date < 10 ? '0' + date : date;
      formattedDate = `${year}-${formatMonth}-${formatDate}`;
    }
    return formattedDate;
  }

  getTodayDate(): string {
    const today = new Date();
    const date = today.getDate();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();
    const formatMonth = month < 10 ? '0' + month : month;
    const formatDate = date < 10 ? '0' + date : date;
    return `${year}-${formatMonth}-${formatDate}`;
  }

  compareFromToDate(fromDate, toDate) {
    let flag = false;
    if (fromDate < toDate) {
      flag = true;
    }
    return flag;
  }
}
