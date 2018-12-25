import { Component, OnInit, Output, Input, ViewEncapsulation, EventEmitter, OnDestroy } from '@angular/core';
import { SearchService } from '@srk/core';
import { NotifyService } from '@srk/core';
import { TitleCasePipe } from '@angular/common';
import * as _ from 'underscore';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-search-luster',
  styleUrls: ['./luster.component.scss'],
  templateUrl: './luster.component.html',
  encapsulation: ViewEncapsulation.None
})
export class LusterComponent implements OnInit, OnDestroy {

  @Input() data: any;
  @Input() filterConfig: any;
  @Output() filter = new EventEmitter();

  private bgmSubscription: Subscription;
  noBgmFlag = false;
  lusterValues: any;
  shadeValues: any;
  lusterOptionsValue: any[] = [];
  shadeOptionsValue: any[] = [];
  lusterSelectedValue: string[] = [];
  shadeSelectedValue: string[] = [];
  result: any[] = [{ 'key': 'luster', 'value': [] }, { 'key': 'shade', 'value': [] }];

  constructor(
    private service: SearchService,
    private notifyService: NotifyService) { }

  ngOnInit() {
    this.bgmSubscription = this.notifyService.notifyBGMClickActionObservable$.subscribe(res => {
      this.noBgmFlag = res.flag;
      this.selectNoBgm();
    });
    this.service.getSearchFilterData().subscribe(response => {
      this.lusterValues = response.data.luster;
      this.lusterValues.forEach((element) => {
        const labelValue = new TitleCasePipe().transform(element.label);
        this.lusterOptionsValue.push({ label: labelValue, value: element.value });
      });
      this.shadeValues = response.data.shade;
      this.shadeValues.forEach((element) => {
        const labelValue = new TitleCasePipe().transform(element.label);
        this.shadeOptionsValue.push({ label: labelValue, value: element.value });
      });
    });
    if (this.data && this.data.parentRef) {
      this.setFilterConfigData(this.data.parentRef);
    } else if (this.filterConfig !== undefined) {
      this.setFilterConfigData(this.filterConfig);
    }
  }

  setFilterConfigData(data) {
    if (data.values !== undefined) {
      if (data.values.luster !== undefined) {
        this.lusterSelectedValue = data.values.luster;
        this.saveValues('luster', this.lusterSelectedValue);
      }
      if (data.values.shade !== undefined) {
        this.shadeSelectedValue = data.values.shade;
        this.saveValues('shade', this.shadeSelectedValue);
      }
      if (this.service.isNoBgmSelection(data.values.luster, data.values.shade)) {
        this.noBgmFlag = true;
      }
    }
  }

  saveSearchValues() {
    this.updateShadeResultForBrown();
    if (this.data && this.data.isObserved) {
      this.notifyService.notifySearchElementTouched(
        { searchComponent: 'LusterComponent', parent: this.data.parentRef, filterCriteria: this.result });
    }
  }

  updateShadeResultForBrown() {
    this.result.forEach((filter) => {
      if (filter.key === 'shade') {
        if (_.contains(filter.value, 2) && !(_.contains(filter.value, 4))) {
          filter.value.push(4);
        } else if (!(_.contains(filter.value, 2)) && _.contains(filter.value, 4)) {
          filter.value = _.without(filter.value, 4);
        }
      }
    });
  }

  saveValues(label, value) {
    if (this.service.isNoBgmSelection(this.lusterSelectedValue, this.shadeSelectedValue)) {
      this.noBgmFlag = true;
    } else {
      this.noBgmFlag = false;
    }

    this.result.forEach((filter) => {
      if (filter.key === label) {
        filter.value = value;
      }
    });
    this.saveSearchValues();
  }

  selectNoBgm() {
    this.resetValues();
    if (this.noBgmFlag === false) {
      this.lusterOptionsValue.forEach((element) => {
        if (element.label === 'Excellent') {
          this.lusterSelectedValue.push(element.value);
        }
      });
      this.shadeOptionsValue.forEach((element) => {
        if (element.label === 'None') {
          this.shadeSelectedValue.push(element.value);
        }
      });
    }
    this.saveValues('luster', this.lusterSelectedValue);
    this.saveValues('shade', this.shadeSelectedValue);
  }

  resetValues() {
    this.shadeSelectedValue = [];
    this.lusterSelectedValue = [];
    this.result.forEach((item) => {
      item.value = [];
    });
  }

  ngOnDestroy() {
    this.bgmSubscription.unsubscribe();
  }

}
