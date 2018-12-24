import { Component, Input, Output, EventEmitter, OnInit, OnChanges, ViewEncapsulation } from '@angular/core';
declare var require: any;
// const Survey = require('../../../../assets/js/survey/survey.ko.js');

@Component({
  selector: 'app-serenaway-survey',
  template: `
  <div id="surveyElement"></div>`,
  styleUrls: ['./serenaway-survey-component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class SerenawaySurveyComponent implements OnInit, OnChanges {
  public survey: any;
  public surveyResponseData: any;
  public surveyCompletedPageNumber: any;
  public surveyValue: any;
  public displayMode: any;
  @Output() surveyOnCurrentPage = new EventEmitter();
  @Output() surveyonCompletePage = new EventEmitter();
  @Input() set responseData(value: object) {
      this.surveyResponseData = value;
  }
  @Input() set currentPage(value: object) {
    this.surveyCompletedPageNumber = value;
  }
  @Input() set mode(value: object) {
    this.displayMode = value;
  }
  @Input() set json(value: object) {
    this.surveyValue = value;

  }
  ngOnInit() {
  }
  ngOnChanges() {
    // Survey.defaultBootstrapMaterialCss.navigationButton = 'btn btn-green';
    // Survey.defaultBootstrapMaterialCss.rating.item = 'btn btn-default my-rating';
    // Survey.Survey.cssType = 'bootstrapmaterial';
    if (this.surveyValue !== undefined) {
        this.survey = {}; //new Survey.SurveyWindow(JSON.parse(this.surveyValue));
        this.survey.survey.currentPageNo = this.surveyCompletedPageNumber;
        if (this.displayMode !== undefined) {
            this.survey.survey.mode = this.displayMode;
        }
        this.survey.survey.data = this.surveyResponseData;
        this.survey.survey.onCurrentPageChanged.add(this.doOnCurrentPageChanged);
        this.survey.survey.onComplete.add(this.surveyOnComplete);
        this.survey.survey.render('surveyElement');
        this.survey.show();
    }

  }

  doOnCurrentPageChanged = (onCurrentPageData) => {
    this.surveyOnCurrentPage.emit(onCurrentPageData);
  }

  surveyOnComplete = (onCompletePageData) => {
    this.surveyonCompletePage.emit(onCompletePageData);
  }
}
