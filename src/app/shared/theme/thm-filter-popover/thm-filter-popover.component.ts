import { Component, OnInit, Input, OnChanges, Injectable, Output, EventEmitter } from '@angular/core';
import { UtilService } from '../../services/util.service';
import { UserProfileService } from '@srk/core';

@Component({
  selector: 'thm-filter-popover',
  templateUrl: './thm-filter-popover.component.html',
  styleUrls: ['./thm-filter-popover.component.scss']
})

export class ThmFilterPopoverComponent implements OnInit, OnChanges {

  @Input() filterPopOverVisible: boolean;
  @Input() targetId: any;
  @Input() container: any;
  @Input() filterOptions: any[];
  @Output() toggleFilterPopOverVisible = new EventEmitter();
  @Output() toggleFilterFlag = new EventEmitter();
  @Output() toggleColWidth = new EventEmitter();

  public filterFlag: any = false;
  public selectedFilterOption: any;
  public allColumnWidth: any;
  public colWidth: any;
  public daypColumnWidth: any;
  public filterObj = {};

  constructor(
    private utilService: UtilService,
    private userProfileService: UserProfileService) { }

  ngOnInit() {
    this.allColumnWidth = this.userProfileService.getColumnWidth();
    this.daypColumnWidth = this.userProfileService.getDAYPColumnWidth();
    this.colWidth = this.allColumnWidth;
  }

  ngOnChanges() { }

  filterOperations() {
    this.filterObj = this.utilService.filterOperations(this.selectedFilterOption, this.container, this.daypColumnWidth, this.allColumnWidth);
    this.filterFlag = this.filterObj['filter_flag'];
    this.selectedFilterOption = this.filterObj['selected_filter_option'];
    this.colWidth = this.filterObj['col_width'];;
    this.container.instance.refresh();
    this.filterPopOverVisible = false;
    this.toggleFilterPopOverVisible.emit({ visible: this.filterPopOverVisible });
    this.toggleFilterFlag.emit({ filterFlag: this.filterFlag });
    this.toggleColWidth.emit({ colWidth: this.colWidth });
  }
}
