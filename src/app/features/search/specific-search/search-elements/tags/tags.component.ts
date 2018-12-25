import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { SearchService } from '@srk/core';
import { NotifyService } from '@srk/core';

@Component({
  selector: 'app-search-tags',
  template: `<div  id="TAGS_ID"  class="ui-grid ui-grid-responsive ui-grid-pad component-cards">
    <div id="tagsHeaderBox" class="ui-g-11 custom-padding">
      <label id="tagsLabel" class="component-cards-heading">{{'Tags' | translate}}</label>
    </div>
    <div id="tagsTooltipBox" class="ui-g-1" align="right">

      <span  id="tagsTooltip" class="info-icon icon-info display-none"></span>
      <app-thm-tooltip [targetID]="'tagsTooltip'" [tooltipHeading]="'Tags'"
      [tooltipMessage]="'Lorem ipsum dolor sit amet, consectetuer adipiscing elit.'">
      </app-thm-tooltip>
    </div>
  <div id="tagsComponentBox" class='ui-g-12 custom-padding' *ngIf='tagValues'>
    <p-multiSelect id="tagsMultiselect" styleClass="tag-component-dropdown" [options]='tagValueOptions' [(ngModel)]='selectedValues'
    (onChange)='saveTagValues()'></p-multiSelect>
  </div>
  </div>
`,
  styleUrls: ['../../dynamic-search-component/dynamic-search-component.component.scss']
})
export class TagsComponent implements OnInit {

  @Input() data: any;
  tagValues: any;
  tagValueOptions: any[] = [];
  selectedValues: string[] = [];

  constructor(
    private service: SearchService,
    private notifyService: NotifyService) { }

  ngOnInit() {
    this.service.getSearchElement().subscribe(response => {
      this.tagValues = response.data.tags;
      response.data.tags.forEach((tagValue) => {
        this.tagValueOptions.push({ label: tagValue, value: tagValue });
      });
    });
    this.setPreSelectedValues();
  }

  setPreSelectedValues() {
    if (this.data.parentRef.values !== undefined) {
      if (this.data.parentRef.values.tags !== undefined) {
        this.data.parentRef.values.tags.forEach((value) => {
          this.selectedValues.push(value);
        });
      }
    }
  }

  saveTagValues() {
    const result = [{
      'key': 'tags',
      'value': this.selectedValues
    }];
    if (this.data && this.data.isObserved) {
      this.notifyService.notifySearchElementTouched(
        { searchComponent: 'TagsComponent', parent: this.data.parentRef, filterCriteria: result }
      );
    }
  }
}
