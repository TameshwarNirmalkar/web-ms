import { Component, Input, OnInit } from '@angular/core';
import { SearchService } from '@srk/core';
import { NotifyService } from '@srk/core';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-fancy-color',
  templateUrl: './fancy-color.component.html',
  styleUrls: ['../../dynamic-search-component/dynamic-search-component.component.scss']
})
export class FancyColorComponent implements OnInit {

  @Input() data: any;
  @Input() filterConfig: any;
  fancyColorOptions: any[] = [];
  intensityColorOptions: any[] = [];
  overtoneColorOptions: any[] = [];
  selectedFancyColorValues: any[] = [];
  selectedIntensityColorValues: any[] = [];
  selectedOvertoneColorValues: any[] = [];

  public fancyColors = {
    'color': this.selectedFancyColorValues,
    'intensity': this.selectedIntensityColorValues,
    'overtone': this.selectedOvertoneColorValues
  };

  constructor(
    private service: SearchService,
    private notifyService: NotifyService) { }


  ngOnInit() {
    this.service.getSearchFilterData().subscribe(response => {
      response.data.color_fancy.forEach((element) => {
        const labelValue = new TitleCasePipe().transform(element.label);
        this.fancyColorOptions.push({ label: labelValue, value: String(element.value) });
      });

      response.data.color_intensity.forEach((element) => {
        const labelValue = new TitleCasePipe().transform(element.label);
        this.intensityColorOptions.push({ label: labelValue, value: String(element.value) });
      });

      response.data.color_overtone.forEach((element) => {
        const labelValue = new TitleCasePipe().transform(element.label);
        this.overtoneColorOptions.push({ label: labelValue, value: String(element.value) });
      });
    });
    if (this.data !== undefined && this.data.parentRef.values !== undefined) {
      this.initForModify(this.data);
    }
  }

  initForModify(object) {
    if (object.parentRef.values.color !== undefined && object.parentRef.values.color.fancy_color) {
      const fancyColors = object.parentRef.values.color.fancy_color;
      if (fancyColors) {
        this.selectedFancyColorValues = fancyColors['color'];
        this.selectedIntensityColorValues = fancyColors['intensity'];
        this.selectedOvertoneColorValues = fancyColors['overtone'];
      }
    }
  }

  saveFancyColorValues() {
    const result = [{
      'key': 'COLOR-FANCY-fancy_color',
      'value': {
        'color': this.selectedFancyColorValues,
        'intensity': this.selectedIntensityColorValues,
        'overtone': this.selectedOvertoneColorValues
      }
    }];
    if (this.data && this.data.isObserved) {
      this.notifyService.notifySearchElementTouched(
        { searchComponent: 'FancyColorComponent', parent: this.data.parentRef, filterCriteria: result }
      );
    }
  }
}
