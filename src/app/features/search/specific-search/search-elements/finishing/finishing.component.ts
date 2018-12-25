import { Component, OnInit, EventEmitter, Output, Input, ViewEncapsulation, OnDestroy } from '@angular/core';
import { SearchService } from '@srk/core';
import { NotifyService } from '@srk/core';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-search-finishing',
  templateUrl: './finishing.component.html',
  styleUrls: ['./finishing.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class FinishingComponent implements OnInit, OnDestroy {
  @Input() data: any;
  @Input() filterConfig: any;
  @Output() filter = new EventEmitter();

  private EXSubscription: Subscription;
  private VGSubscription: Subscription;
  finishingValues: any;
  cutValueOptions: any[] = [];
  polishValueOptions: any[] = [];
  symmetryValueOptions: any[] = [];
  vgSelectionFlag = false;
  exSlectionFlag = false;
  selectedCutValues: any[] = [];
  selectedPolishValues: any[] = [];
  selectedSymmetryValues: any[] = [];
  result: any[] = [];

  constructor(
    private service: SearchService,
    private notifyService: NotifyService) { }

  ngOnInit() {
    this.EXSubscription = this.notifyService.notifyEXFinishingClickActionObservable$.subscribe(res => {
      this.exSlectionFlag = res.flag;
      this.selectAllExcellent();
    });
    this.VGSubscription = this.notifyService.notifyVGFinishingClickActionObservable$.subscribe(res => {
      this.vgSelectionFlag = res.flag;
      this.selectAllVeryGood();
    });
    this.service.getSearchFilterData().subscribe(response => {
      this.cutValueOptions = this.getValueList(response.data.cut);
      this.polishValueOptions = this.getValueList(response.data.polish);
      this.symmetryValueOptions = this.getValueList(response.data.symmetry);
    });
    if (this.data !== undefined) {
      this.preFillFilterData(this.data.parentRef);
    } else if (this.filterConfig !== undefined) {
      this.preFillFilterData(this.filterConfig);
    }
  }

  getValueList(array: any[]) {
    const listArray: any[] = [];
    array.forEach((element) => {
      listArray.push({ label: element.label, value: element.value });
    });
    return listArray;
  }

  preFillFilterData(data) {
    if (data.values !== undefined) {
      if (data.values.cut !== undefined) {
        data.values.cut.forEach((value) => {
          this.selectedCutValues.push(value);
        });
      }
      if (data.values.polish !== undefined) {
        data.values.polish.forEach((value) => {
          this.selectedPolishValues.push(value);
        });
      }
      if (data.values.symmetry !== undefined) {
        data.values.symmetry.forEach((value) => {
          this.selectedSymmetryValues.push(value);
        });
      }

      if (this.service.isVgSelection(data.values)) {
        this.vgSelectionFlag = true;
      }

      if (this.service.isExSelection(data.values)) {
        this.exSlectionFlag = true;
      }
    }
  }
  
  selectAllVeryGood() {
    this.resetValues();
    if (this.vgSelectionFlag === false) {
      this.cutValueOptions.forEach((element) => {
        if (element.label === 'VG' || element.label === 'EX') {
          this.selectedCutValues.push(element.value);
        }
      });
      this.saveValues('cut', this.selectedCutValues);
      this.polishValueOptions.forEach((element) => {
        if (element.label === 'VG' || element.label === 'EX') {
          this.selectedPolishValues.push(element.value);
        }
      });
      this.saveValues('polish', this.selectedPolishValues);
      this.symmetryValueOptions.forEach((element) => {
        if (element.label === 'VG' || element.label === 'EX') {
          this.selectedSymmetryValues.push(element.value);
        }
      });
      this.saveValues('symmetry', this.selectedSymmetryValues);
    }
  }

  selectAllExcellent() {
    this.resetValues();
    if (this.exSlectionFlag === false) {
      this.cutValueOptions.forEach((element) => {
        if (element.label === 'EX') {
          this.selectedCutValues.push(element.value);
        }
      });
      this.saveValues('cut', this.selectedCutValues);
      this.polishValueOptions.forEach((element) => {
        if (element.label === 'EX') {
          this.selectedPolishValues.push(element.value);
        }
      });
      this.saveValues('polish', this.selectedPolishValues);
      this.symmetryValueOptions.forEach((element) => {
        if (element.label === 'EX') {
          this.selectedSymmetryValues.push(element.value);
        }
      });
      this.saveValues('symmetry', this.selectedSymmetryValues);
    }
  }

  resetValues() {
    this.selectedCutValues = [];
    this.selectedPolishValues = [];
    this.selectedSymmetryValues = [];
    this.result.forEach((item) => {
      item.value = [];
    });
    this.saveValues('cut', this.selectedCutValues);
    this.saveValues('polish', this.selectedPolishValues);
    this.saveValues('symmetry', this.selectedSymmetryValues);
  }

  saveValues(label, value) {
    const param = {};
    param['key'] = label;
    param['value'] = value;
    this.saveFinishingValues(param);
  }

  saveFinishingValues(object) {
    this.result.push(object);
    if (this.data && this.data.isObserved) {
      this.notifyService.notifySearchElementTouched({
        searchComponent: 'FinishingComponent',
        parent: this.data.parentRef,
        filterCriteria: this.result
      });
    }
  }

  ngOnDestroy() {
    this.EXSubscription.unsubscribe();
    this.VGSubscription.unsubscribe();
  }
}
