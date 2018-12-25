import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-search-checkbox-select',
  templateUrl: './checkbox-select.component.html',
  styleUrls: ['./checkbox-select.component.scss']
})
export class CheckboxSelectComponent implements OnInit {

  @Input() searchData: any;
  @Input() preSelectedSearchData: any;
  @Input() titleCaseLable: boolean;
  @Output() save = new EventEmitter();
  valueSet: any[] = [];
  selectedValue: any[] = [];
  selectAllFlag = false;

  constructor() { }

  ngOnInit() {
    this.valueSet = this.checkValues(this.searchData);
    this.setPreSelectedValues();
  }

  setPreSelectedValues() {
    if (this.preSelectedSearchData) {
      this.preSelectedSearchData.forEach((value) => {
        this.selectedValue.push(value);
      });
      if (this.preSelectedSearchData.length === this.valueSet.length) {
        this.selectAllFlag = true;
      }
      this.selectCheckBoxValue();
    }
  }

  selectCheckBoxValue() {
    this.valueSet.forEach((definedValue) => {
      definedValue.isSelected = false;
      this.selectedValue.forEach((selectedValue) => {
        if (selectedValue === String(definedValue.value)) {
          definedValue.isSelected = true;
        }
      });
    });
  }

  checkValues(data: any) {
    if (!data) { return; }
    data.forEach((item) => {
      item.isSelected = false;
    });
    return data;
  }

  selectAll() {
    this.selectAllFlag = !this.selectAllFlag;
    if (this.selectAllFlag === true) {
      this.selectedValue = [];
      this.valueSet.forEach((element) => {
        element.isSelected = true;
        this.selectedValue.push(String(element.value));
      });
    } else {
      this.selectedValue = [];
      this.valueSet.forEach((element) => {
        element.isSelected = !element.isSelected;
      });
    }
    this.save.emit(this.selectedValue);
  }

  selectSearchValues(val) {
    val = val.toString();
    const i = this.selectedValue.indexOf(val);
    if (i > -1) {
      this.selectedValue.splice(i, 1);
    } else {
      this.selectedValue.push(val);
    }
    if (this.selectedValue.length < this.valueSet.length) {
      this.selectAllFlag = false;
    } else if (this.selectedValue.length === this.valueSet.length) {
      this.selectAllFlag = true;
    }
    if (this.selectedValue.length === 0) {
      this.valueSet.forEach((definedValue) => {
        definedValue.isSelected = false;
      });
    } else {
      this.selectCheckBoxValue();
    }
    this.save.emit(this.selectedValue);
  }
}
