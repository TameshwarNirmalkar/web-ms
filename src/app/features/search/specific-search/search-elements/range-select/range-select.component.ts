import { Component, OnInit, Input, EventEmitter, Output, ViewEncapsulation } from '@angular/core';
declare var jQuery;

@Component({
  selector: 'app-search-range-select',
  templateUrl: './range-select.component.html',
  styleUrls: ['./range-select.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class RangeSelectComponent implements OnInit {

  @Input() searchData: any;
  @Input() preSelectedSearchData: any;
  @Output() save = new EventEmitter();
  valueSet: any[] = [];
  optionsValue: any[] = [];
  selectedValue: string[] = [];
  selectAllFlag: any;
  mouseClicked = false;
  dragStart = false;
  selectAllOption = [{ label: 'All', value: 'all' }]

  constructor() { }

  ngOnInit() {
    this.valueSet = this.checkValues(this.searchData);
    this.valueSet.forEach((element) => {
      this.optionsValue.push({ label: element.label, value: element.value });
    });
    this.setPreSelectedValues();
  }

  setPreSelectedValues() {
    if (this.preSelectedSearchData) {
      this.preSelectedSearchData.forEach((value) => {
        this.selectedValue.push(value);
      });
      if (this.preSelectedSearchData.length === this.valueSet.length) {
        this.selectAllFlag = ['all'];
      }
    }
  }

  checkValues(data: any) {
    if (!data) { return; }
    return data;
  }

  selectAll() {
    const flag = this.selectAllFlag.indexOf('all') > -1 ? true : false;
    if (flag === true) {
      this.valueSet.forEach((element) => {
        this.selectedValue.push(element.value);
      });
    } else {
      this.selectedValue = [];
    }
    this.selectSearchValues();
  }

  selectSearchValues() {
    if (this.selectedValue.length < this.valueSet.length) {
      this.selectAllFlag = [];
    } else if (this.selectedValue.length === this.valueSet.length) {
      this.selectAllFlag = ['all'];
    }
    this.save.emit(this.selectedValue);
  }

  dragged(event) {
    if (this.mouseClicked) {
      this.dragStart = true;
    }
    this.selectItem(event);
  }

  initDrag(event) {
    this.mouseClicked = true;
    jQuery(event.target).click();
  }

  finishDrag(event) {
    if (this.mouseClicked && !this.dragStart) {
      jQuery(event.target).click();
    }
    this.mouseClicked = false;
    this.dragStart = false;
  }

  selectItem(event) {
    if (event !== undefined && event.target !== undefined
      && event.target.className !== undefined
      && event.target.className.indexOf('ui-button ui-widget') >= 0
      && this.mouseClicked && this.dragStart
      && event.target.className.indexOf('ui-state-active') < 0) {
      jQuery(event.target).click();
    }
  }
}
