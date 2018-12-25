
import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  OnDestroy,
  OnChanges,
  SimpleChanges,
  AfterViewInit,
  ElementRef, ViewChild, ViewEncapsulation, ChangeDetectionStrategy
} from '@angular/core';
import { StoneDetailsService, StoneMultimediaDetailDirective, UtilService } from '@srk/shared';
import { ApplicationAuditService, SessionStorageService, UserProfileService, ApplicationStorageService } from '@srk/core';
// import { TodayInfraGridComponent } from './../view-request-details/today-infra-grid/today-infra-grid.component';
// import { UpcomingInfraGridComponent } from './../view-request-details/upcoming-infra-grid/upcoming-infra-grid.component';
// import { PastInfraGridComponent } from './../view-request-details/past-infra-grid/past-infra-grid.component';
import { Observable } from 'rxjs/Observable';


declare var moment: any;
declare var $: any;

@Component({
  // providers: [PastInfraGridComponent],
  selector: 'vr-infra-grid',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './vr-infra-grid.component.html',
  styleUrls: ['./vr-infra-grid.component.scss'],
  // changeDetection: ChangeDetectionStrategy.OnPush
})

export class VrGridComponent implements OnInit, OnDestroy, OnChanges, AfterViewInit {

  @Input() packetIconDataForGrid;
  @Input() visiblePacketIcon;
  @Input() selectedStonesArray;
  @Input() selectedStoneTableIsVisible;
  @Input() resultObject;
  @Input() gridName;
  @Input() widthInfo;
  @Input() upcomingTableData;
  @Input() gridHeight;
  @Input() userSelectedColumns;
  @Input() currentSelectedStones;
  @Input() stonesActedOn;
  @Input() tabActive;
  @Input() colorLegendFilter;

  // FOr Editing in BTB and DAYP SUbmitteed
  @Output() stoneDetailInNewTab: EventEmitter<string> = new EventEmitter<string>();
  @Output() twinDiamondDetailInNewTab: EventEmitter<string> = new EventEmitter<string>();
  @Output() singleRowSelected: EventEmitter<any> = new EventEmitter<any>();
  @Output() allRowsSelected: EventEmitter<Boolean> = new EventEmitter<Boolean>();
  @Output() updateDDCClicked: EventEmitter<any> = new EventEmitter<any>();
  @Output() displayNotesForSingleStoneInDialog: EventEmitter<any> = new EventEmitter<any>();
  @Output() addStoneToPacket: EventEmitter<any> = new EventEmitter<any>();
  @Output() displayIconsOverlay: EventEmitter<any> = new EventEmitter<any>();
  @Output() b2bIconPopup: EventEmitter<any> = new EventEmitter<any>();

  /*DAYP Only Outputs*/
  @Output() offerPriceForStoneUpdated: EventEmitter<any> = new EventEmitter<any>();
  @Output() offerPercentageForStoneUpdated: EventEmitter<any> = new EventEmitter<any>();

  @ViewChild('searchInput') searchInput: ElementRef;

  public columnWidths: any = this.widthInfo;
  public dataToDisplay: any[] = [];
  public currentSelectedRows: any[] = [];
  public tableColumns: any[];
  public leftScroll: any = 0;
  public verticalScroll: number = 0;
  public initGrid: Boolean = true;
  public gridInitialised: Boolean = false;

  // Custom Context Menu stuff
  public displayContextMenu: Boolean;
  public menuXPosition: Number;
  public menuYPosition: Number;
  public contextMenuOptionsList: { label: String, value: String, columnName: String }[] = [];
  public gridFixingDirection: String = 'left';
  displayGridLoadingOverlay: Boolean = true;
  public calculatedGridHeight: any;
  public isStoneDetailColumnExpanded: Boolean;

  // For scroll on DAYP PAges
  public currentVerticalScrollPosition: Number = -1;
  public currentHorizontalScrollPosition: any = -1;

  //for all three table 

  public dataToDisplayOfPast: any[] = [];
  public dataToDisplayOfToday: any[] = [];
  public dataToDisplayOfUpcoming: any[] = [];
  public currentSelectedRowsOfPast: any[] = [];
  public currentSelectedRowsOfToday: any[] = [];
  public currentSelectedRowsOfUpcoming: any[] = [];

  constructor(
    public stoneDetailService: StoneDetailsService,
    public auditService: ApplicationAuditService,
    public sessionStorageService: SessionStorageService,
    public stoneMultiMediaDetailDirective: StoneMultimediaDetailDirective,
    public userProfileService: UserProfileService,
    public appStore: ApplicationStorageService,
    public utilSvc: UtilService
    // private pastInfraGridComponent: PastInfraGridComponent,
    // private todayInfraGridComponent: TodayInfraGridComponent,
    // private upcomingInfraGridComponent: UpcomingInfraGridComponent
  ) {

    // Override Methods form the Library so that we can enable copying.
    // Please do not delete these lines.
    // $.ui.igGridSelection.prototype._preventDefault = function () {};
    // $.ui.igGridSelection.prototype._selectStart = function () {};

  }

  ngOnInit() {

    this.calculatedGridHeight = this.getGridHeight();

    this.contextMenuOptionsList = [
      {
        label: 'Sort Ascending',
        value: 'sortAscending',
        columnName: ''
      }, {
        label: 'Sort Descending',
        value: 'sortDescending',
        columnName: ''
      }, {
        label: 'Clear Sorting',
        value: 'clearSorting',
        columnName: ''
      }, {
        label: 'Column Chooser',
        value: 'toggleColumnChooser',
        columnName: ''
      }, {
        label: 'Hide Column',
        value: 'hideColumn',
        columnName: '',
      }, {
        label: 'Toggle Filtering',
        value: 'toggleFiltering',
        columnName: '',
      }, {
        label: 'Move Column First',
        value: 'moveFirst',
        columnName: ''
      }, {
        label: 'Move Column Last',
        value: 'moveLast',
        columnName: ''
      }
    ];

    this.columnWidths = this.widthInfo;

    this.tableColumns = [
      {
        key: 'multimedia',
        headerText: '',
        width: '25px',
        dataType: 'object',
        template: '<i class="grid-icon icon-media"></i>'
        /*template: '<a href="https://pck2.azureedge.net/stone-multimedia/stone-multimedia.htm?stoneIds=${_id}" target="_blank" > ' +
        '<i class="grid-icon icon-media"></i> ' +
        '</a>'*/
      },
      {
        key: '_id',
        headerText: '<span class="stoneIdGridHeader">Stone ID <i class="fa fa-arrow-right"></i></span>',
        enabled: true,
        index: 0,
        width: '100px',
        dataType: 'string',
        template: this.getTemplate({
          id: '${_id}',
          colorLegend: [
            { color: '${multimedia.newArrival}' },
            { color: '${multimedia.bidToBuy}' },
            { color: '${multimedia.underBusinessProcess}' },
            { color: '${multimedia.recentlyUploaded}' }
          ],
          iconLegend: [
            { icon: '<span class="grid-icon-with-container ${multimedia.isTwin}" title="Twin Diamond"> </span>' },
            { icon: '<span class="grid-icon-with-container ${multimedia.btobstate}" title="${multimedia.btobtooltip}"> </span>' },
            { icon: '<span class="grid-icon-with-container ${multimedia.isDDC}" title="DDC"> </span>' },
            { icon: '<span class="grid-icon-with-container" title="Note"> <div class="icon-with-text my-three"> <span class="${multimedia.havenote}"> </span> <label> <span>${multimedia.notecount}</span> </label> </div> </span>' },
            { icon: '<span class="grid-icon-with-container ${multimedia.basket}" title="Basket"> </span>' },
            { icon: '<span class="grid-icon-with-container ${multimedia.recommended}" title="Recommended"> </span>' },
            { icon: '<span class="grid-icon-with-container ${multimedia.ohhold}" title="On Hold"> </span>' },
            { icon: '<span class="grid-icon-with-container ${multimedia.showHoldIcon}" title="On Hold"> </span>' },
            { icon: '<span class="grid-icon-with-container ${multimedia.isFlag}" title="In Event"> <img src="${multimedia.countrycode}"> </span>' },
            { icon: '<span class="grid-icon-with-container"> <div class="icon-with-text my-one"> <span title="${multimedia.viewrequesttooltip}" class="${multimedia.viewrequest}"></span> <label> <span> ${multimedia.totalviewrequest} </span> </label> </div> </span>' },
            { icon: '<span class="grid-icon-with-container"> <div class="icon-with-text  my-two"> <span class="${multimedia.onlineview.class}"></span> <label> <span title="${multimedia.onlineview.tooltip1}"> ${multimedia.onlineview.totalviewed} </span> <span title="${multimedia.onlineview.tooltip2}"> ${multimedia.onlineview.totalviewedbyuser} </span> </label> </div> </span>' },
          ]
        })
      },
    ];

    this.generateTableColumns();

    typeof $('#grid' + this.gridName)[0] === typeof undefined ? this.initGrid = true : this.initGrid = false;

    this.updateIconDataForStones()

      .then(result => {

        this.dataToDisplay = this.transformDataForGrid(result);

        if (this.initGrid === true) {

          this.initTable();

        }


      })
      .catch(error => {

        console.error('Failed while trying to initialize the data grid.');
        console.error(error);

      });

    // setTimeout(() => {
    //   $('#gridpastGrid').igGrid('option', 'showHeader', false);
    // }, 3000);  

    setTimeout(() => {
      $('#gridupcomingGrid_hscroller').on('scroll', function () {
        document.getElementById('gridpastGrid_hscroller').scrollLeft = document.getElementById('gridupcomingGrid_hscroller').scrollLeft;
      });
    }, 1000);

    // Delegate
    $(document).delegate('#gridupcomingGrid', 'iggridcellclick', function (evt, ui) {
    });

    // Delegate
    $(document).delegate('#gridheaderGrid', 'iggridsortingcolumnsorted', function (evt, ui) {
      $('#gridupcomingGrid').igGridSorting('sortColumn', ui.columnKey, ui.direction);
      $('#gridtodayGrid').igGridSorting('sortColumn', ui.columnKey, ui.direction);
      $('#gridpastGrid').igGridSorting('sortColumn', ui.columnKey, ui.direction);

    });

    // Bind after initialization
    $(document).delegate('#gridheaderGrid', 'iggridhidingcolumnshowing', function (evt, ui) {
      $('#gridpastGrid').igGridHiding('showColumn', ui.columnKey, false, function () { });
      $('#gridupcomingGrid').igGridHiding('showColumn', ui.columnKey, false, function () { });
      $('#gridtodayGrid').igGridHiding('showColumn', ui.columnKey, false, function () { });
    });

    $(document).delegate('#gridheaderGrid', 'iggridcolumnmovingcolumnmoved', function (evt, args) {
      $('#gridupcomingGrid').igGridColumnMoving('moveColumn', args.columnKey, args.owner._activeMO.before, true, true);
      $('#gridpastGrid').igGridColumnMoving('moveColumn', args.columnKey, args.owner._activeMO.before, true, true);
      $('#gridtodayGrid').igGridColumnMoving('moveColumn', args.columnKey, args.owner._activeMO.before, true, true);

    });
    // Initialize
    $('#gridupcomingGrid').igGrid({
      headerCellRendered: function (evt, ui) {
      }
    });

    $(document).delegate('#gridheaderGrid', 'iggridfilteringdatafiltered', function (evt, ui) {
      if (ui.expressions.length !== 0) {
        $('#gridupcomingGrid').igGridFiltering('filter', ([{ fieldName: ui.columnKey, expr: ui.expressions[0].expr, cond: ui.expressions[0].cond, logic: 'OR' }]));
        $('#gridpastGrid').igGridFiltering('filter', ([{ fieldName: ui.columnKey, expr: ui.expressions[0].expr, cond: ui.expressions[0].cond, logic: 'OR' }]));
        $('#gridtodayGrid').igGridFiltering('filter', ([{ fieldName: ui.columnKey, expr: ui.expressions[0].expr, cond: ui.expressions[0].cond, logic: 'OR' }]));
      } else {
        const cond = $('#gridheaderGrid').igGridFiltering('option', 'columnSettings').filter(id => id.columnKey === ui.columnKey);
        $('#gridupcomingGrid').igGridFiltering('filter', ([{ fieldName: ui.columnKey, expr: '', cond: cond[0].condition, logic: 'OR' }]));
        $('#gridpastGrid').igGridFiltering('filter', ([{ fieldName: ui.columnKey, expr: '', cond: cond[0].condition, logic: 'OR' }]));
        $('#gridtodayGrid').igGridFiltering('filter', ([{ fieldName: ui.columnKey, expr: '', cond: cond[0].condition, logic: 'OR' }]));
      }

    });

    setTimeout(() => {
      $('#gridheaderGrid_scroll').on('scroll', function () {
        document.getElementById('gridupcomingGrid_scroll').scrollLeft = document.getElementById('gridheaderGrid_scroll').scrollLeft;
        document.getElementById('gridpastGrid_scroll').scrollLeft = document.getElementById('gridheaderGrid_scroll').scrollLeft;
        document.getElementById('gridtodayGrid_scroll').scrollLeft = document.getElementById('gridheaderGrid_scroll').scrollLeft;

      });
    }, 1000);

  }

  ngOnChanges(changes: SimpleChanges) {

    if (changes.tabActive && changes.tabActive.firstChange === false && changes.tabActive.currentValue === true) {

      this.displayGridLoadingOverlay = true;

      setTimeout(() => {

        const tempData = this.transformDataForGrid(this.resultObject.diamondTable);

        $('#grid' + this.gridName).igGrid('dataSourceObject', tempData).igGrid('dataBind');

        this.displayGridLoadingOverlay = false;

      }, 0);

    }

    if (changes.stonesActedOn && changes.stonesActedOn.firstChange === false) {

      this.displayGridLoadingOverlay = true;

      if (this.gridInitialised === true) {

        this.verticalScroll = Math.round(document.getElementById('grid' + this.gridName + '_scrollContainer').scrollTop || 0);

        const tempArray = this.transformDataForGrid(this.resultObject.diamondTable || this.resultObject.table);

        if (changes.stonesActedOn.currentValue.source === 'confirmedStones' || changes.stonesActedOn.currentValue.source === 'holdRequested') {

          changes.stonesActedOn.currentValue.stoneList.forEach((elem, index) => {

            $('#grid' + this.gridName).igGridUpdating('deleteRow', elem);

            if (index === (changes.stonesActedOn.currentValue.stoneList.length - 1)) {

              this.displayGridLoadingOverlay = false;
              $('#grid' + this.gridName).igGrid('commit');
              $('.ui-iggrid-virtualrow').css('height', '32px');
              $('#grid' + this.gridName).igGridColumnFixing('checkAndSyncHeights');
              this.realignGrid();

            }

          });

        } else if (changes.stonesActedOn && changes.stonesActedOn.currentValue.source === 'noteAdded') {
          if (changes.stonesActedOn && changes.stonesActedOn.currentValue.data) {
            const data = changes.stonesActedOn.currentValue.data;
            const tempArrayDisplay = this.transformDataForGrid(data);
            $('#grid' + this.gridName).igGrid('dataSourceObject', tempArrayDisplay).igGrid('dataBind');
          }

          this.displayGridLoadingOverlay = false;

        } else {

          tempArray.forEach((elm, index) => {

            if ($('#grid' + this.gridName).igGrid('rowById', elm._id)[0]) {

              $('#grid' + this.gridName).igGridUpdating('updateRow', elm._id, elm);

            }

            if (tempArray.length - 1 === index) {

              this.displayGridLoadingOverlay = false;

            }

          });

        }


      }

    }

    // Adjust scroll and manage tables when selected stone panel is selected.
    if (changes.selectedStoneTableIsVisible && changes.selectedStoneTableIsVisible.firstChange === false) {

      if (this.selectedStoneTableIsVisible === false) {

        // Re-Sync the selection from SelectedStone Grid, once the grid is closed.
        $('#grid' + this.gridName).igGridSelection('clearSelection');
        this.currentSelectedRows = [];

        this.resultObject.selectedStones.map(elm => {

          $('#grid' + this.gridName).igGridSelection('selectRowById', elm);
          this.currentSelectedRows.push({ rowKey: elm, rowIndex: elm });

        });

        $('#searchTabResultId').css('overflow', 'hidden');

      } else {

        // $('#searchTabResultId').css('overflow', 'scroll');

      }

    }


    // Sync stone selection in grid when selected panel is open and a stone is de-selected from the selected stones table.
    if (changes.selectedStonesArray && changes.selectedStonesArray.firstChange === false) {

      if (changes.selectedStonesArray.previousValue.length > changes.selectedStonesArray.currentValue.length) {

        for (let i = 0; i < changes.selectedStonesArray.previousValue.length; i++) {

          if (!changes.selectedStonesArray.currentValue.includes(changes.selectedStonesArray.previousValue[i])) {

            $('#grid' + this.gridName).igGridSelection('deselectRowById', changes.selectedStonesArray.previousValue[i]);

          }

        }

      }

    }


    // Handle Packet Icon display.
    if (changes.visiblePacketIcon && changes.visiblePacketIcon.firstChange === false) {

      if (changes.visiblePacketIcon.currentValue === true) {

        $('#grid' + this.gridName).igGrid('destroy');

        this.tableColumns.unshift({
          key: 'addtopacket',
          headerText: '<i class="grid-icon icon-packet-add"></i>',
          width: '25px',
          dataType: 'string',
          template: '<i class="grid-icon ${addtopacket}" title="Select Packet"></i>'
        });

        this.dataToDisplay = this.transformDataForGrid(this.upcomingTableData);

        this.initTable();

      } else {

        this.tableColumns = this.tableColumns.filter(elm => {
          return elm.key !== 'addtopacket';
        });

        $('#grid' + this.gridName).igGrid('destroy');

        this.initTable();

      }

    }


    if (changes.packetIconDataForGrid && changes.packetIconDataForGrid.firstChange === false) {

      let temp = changes.packetIconDataForGrid.currentValue.split(',');

      for (let i = 0; i < temp.length; i++) {

        $('#grid' + this.gridName)
          .igGrid('cellById', temp[i], 'addtopacket').children().removeClass('icon-packet-add').addClass('icon-packet-added text-green');

      }

      temp = null;

    }

    if (changes.colorLegendFilter && changes.colorLegendFilter.firstChange === false && this.displayGridLoadingOverlay === false) {

      let gridData = this.transformDataForGrid(this.upcomingTableData);
      let tempData: any[] = [];

      this.displayGridLoadingOverlay = true;

      if (changes.colorLegendFilter.currentValue.length === 0) {

        tempData = this.transformDataForGrid(this.upcomingTableData);
        $('#grid' + this.gridName).igGrid('dataSourceObject', tempData).igGrid('dataBind');
        this.displayGridLoadingOverlay = false;

      } else {

        changes.colorLegendFilter.currentValue.forEach((elem, index) => {

          if (changes.colorLegendFilter.currentValue.includes(elem)) {

            gridData.forEach((elm, idx) => {

              let tmpIndex = tempData.findIndex(el => { return el._id === elm._id; });

              if (elm.multimedia[elem] !== 'null' && tmpIndex === -1) {

                tempData.push(elm);

              }

              tmpIndex = null;

              if (index === (changes.colorLegendFilter.currentValue.length - 1)) {

                if (idx === (gridData.length - 1)) {

                  $('#grid' + this.gridName).igGrid('dataSourceObject', tempData).igGrid('dataBind');
                  this.displayGridLoadingOverlay = false;
                  tempData = null;
                  gridData = null;

                }

              }

            });

          }

        });

      }

    }

  }

  ngAfterViewInit() {

    Observable.fromEvent(this.searchInput.nativeElement, 'keyup')
      .debounceTime(500)
      .distinctUntilChanged()
      .subscribe(input => {

        // Get Scroll Value before running the search.
        // this.leftScroll = document.getElementById('grid' + this.gridName + '_hscroller').scrollLeft;
        // this.verticalScroll = document.getElementById('grid' + this.gridName + '_scrollContainer').scrollTop;

        this.searchValues(this.searchInput.nativeElement.value);

      });

  }

  ngOnDestroy() {

    this.saveGridState()
      .then(saved => {

        $('#grid' + this.gridName).igGrid('destroy');

      }).catch(error => {

        console.error('Failed to save data to storage.');
        console.error(error);

        const gridStateKey = 'grid' + this.gridName + 'State';

        this.sessionStorageService.deleteItemFromSessionStorage(gridStateKey)
          .then(deleted => {

            $('#grid' + this.gridName).igGrid('destroy');

          }).catch(err => {

            console.error('Fialed to destroy session.');
            console.error(err);

          });

      });

  }


  getTemplateString() {

    const template: String = '<div class="grid-id-content-wrapper"> <div class="text-align-left"> <span class="grid-id-text"> ${id} </span> </div>' +
      '<div class="text-align-left grid-icons-container"> ' +
      '{{each ${iconLegend} }}' +
      ' ${iconLegend.icon} ' +
      '{{/each}}' +
      '</div> </div> <div class="color-indicator-panel-container">' +
      '{{each ${colorLegend} }} ' +
      '<div class=\'color-indicator-panel\'> <div class=\'colorLagend_GRID color-legend-width-height color-legend-${colorLegend.color} \'></div> </div>' +
      '{{/each}}' +
      '</div>';

    return template;

  }

  getTemplate(data) {

    const template: String = '<div class="grid-id-content-wrapper"> <div class="text-align-left"> <span class="grid-id-text"> ${id} </span> </div>' +
      '<div class="text-align-left grid-icons-container"> ' +
      '{{each ${iconLegend} }}' +
      ' ${iconLegend.icon} ' +
      '{{/each}}' +
      '</div> </div> <div class="color-indicator-panel-container">' +
      '{{each ${colorLegend} }} ' +
      '<div class=\'color-indicator-panel\'> <div class=\'colorLagend_GRID color-legend-width-height color-legend-${colorLegend.color} \'></div> </div>' +
      '{{/each}}' +
      '</div>';

    return $.ig.tmpl(template, data);

  }

  initTable() {

    $('#grid' + this.gridName).igGrid({
      primaryKey: '_id',
      // caption : '<span> <img src=\"//www.infragistics.com/media/441501/horz_logo.png\" alt=\"Infragistics\"></span>',
      width: '100%',
      // height: '100%',
      // avgRowHeight: 35,
      // autoAdjustHeight: true,
      // adjustVirtualHeights: true,
      featureChooserIconDisplay: 'always',
      enableHoverStyles: false,
      autofitLastColumn: false,
      columns: this.tableColumns,
      //rowVirtualization: true,
      //virtualizationMode: 'continuous',
      autoGenerateColumns: false,
      dataSource: this.dataToDisplay.length > 35 ? this.dataToDisplay.slice(0, 5) : this.dataToDisplay,
      responseDataKey: 'results',
      autoCommit: true,
      features: [
        {
          name: 'Updating',
          editMode: 'none',
          enableAddRow: false,
          enableDeleteRow: true,
          showDoneCancelButtons: false,
          validation: false
        },
        {
          name: 'ColumnFixing',
          fixingDirection: this.gridFixingDirection,
          showFixButtons: false,
          columnSettings: [
            {
              columnKey: 'addtopacket',
              isFixed: true,
              allowFixing: false
            },
            {
              columnKey: 'multimedia',
              isFixed: true,
              allowFixing: false
            },
            {
              columnKey: '_id',
              isFixed: true,
              allowFixing: false
            }
          ], columnFixed: (evt, args) => {

            this.realignGrid();

          }, columnUnfixed: (evt, args) => {

            this.realignGrid();

          }
        },
        {
          name: 'MultiColumnHeaders',
          groupCollapsed: (evt, ui) => {

            this.realignGrid();

          },
          groupExpanded: (evt, ui) => {

            this.realignGrid();

          }
        },
        {
          name: 'Sorting',
          applySortedColumnCss: false,
          sortingDialogContainment: 'window',
          columnSettings: [
            {
              columnKey: 'addtopacket',
              allowSorting: false
            },
            {
              columnKey: 'multimedia',
              allowSorting: false
            }
          ],
          columnSorting: (evt, ui) => {

            if (ui.columnKey === '_id') {

              const width = $('#grid' + this.gridName + '__id').width();
              if (width < 100) {

                $('#grid' + this.gridName).igGridResizing('resize', ui.columnKey, 250);
                $('#gridpastGrid').igGridResizing('resize', ui.columnKey, 250);
                $('#gridupcomingGrid').igGridResizing('resize', ui.columnKey, 250);
                $('#gridtodayGrid').igGridResizing('resize', ui.columnKey, 250);

                $('#grid' + this.gridName + '__id').find('.stoneIdGridHeader').children().removeClass('fa-arrow-right').addClass('fa-arrow-left');
                // $('#gridpastGrid' + '__id').find('.stoneIdGridHeader').children().removeClass('fa-arrow-right').addClass('fa-arrow-left');
                // $('#gridupcomingGrid' + '__id').find('.stoneIdGridHeader').children().removeClass('fa-arrow-right').addClass('fa-arrow-left');
                // $('#gridtodayGrid' + '__id').find('.stoneIdGridHeader').children().removeClass('fa-arrow-right').addClass('fa-arrow-left');

                this.realignGrid();

              } else {

                $('#grid' + this.gridName).igGridResizing('resize', ui.columnKey, 100);
                $('#gridpastGrid').igGridResizing('resize', ui.columnKey, 100);
                $('#gridupcomingGrid').igGridResizing('resize', ui.columnKey, 100);
                $('#gridtodayGrid').igGridResizing('resize', ui.columnKey, 100);

                $('#grid' + this.gridName + '__id').find('.stoneIdGridHeader').children().removeClass('fa-arrow-left').addClass('fa-arrow-right');
                // $('#gridpastGrid' + '__id').find('.stoneIdGridHeader').children().removeClass('fa-arrow-left').addClass('fa-arrow-right');
                // $('#gridtodayGrid' + '__id').find('.stoneIdGridHeader').children().removeClass('fa-arrow-left').addClass('fa-arrow-right');
                // $('#gridupcomingGrid' + '__id').find('.stoneIdGridHeader').children().removeClass('fa-arrow-left').addClass('fa-arrow-right');

                this.realignGrid();

              }

              return false;

            } else {

              let column = $('#grid' + this.gridName).igGrid('option', 'columns').find(elm => { return elm.key === ui.columnKey; });
              let currentWidth = column.width;
              let originalWidth = column.originalWidth;

              if (currentWidth === originalWidth) {
                $('#grid' + this.gridName).igGridResizing('resize', ui.columnKey, (currentWidth + 16));
                $('#gridpastGrid').igGridResizing('resize', ui.columnKey, (currentWidth + 16));
                $('#gridtodayGrid').igGridResizing('resize', ui.columnKey, (currentWidth + 16));
                $('#gridupcomingGrid').igGridResizing('resize', ui.columnKey, (currentWidth + 16));
              }

              column = null;
              currentWidth = null;
              originalWidth = null;

              return true;

            }

          }

        },
        {
          name: 'Filtering',
          mode: 'simple',
          type: 'local',
          columnSettings: [
            {
              columnKey: 'addtopacket',
              allowFiltering: false,
            },
            {
              columnKey: 'multimedia',
              allowFiltering: false,
            }, {
              columnKey: '_id',
              allowFiltering: false
            }
          ],
          dropDownOpened: (evt, ui) => {

            // Move Filter Dropdown to the left that are over-flowing from the screen.
            if (($(ui.dropDown).offset().left + $(ui.dropDown).width() + 10) > window.innerWidth) {

              let temp: number = ($(ui.dropDown).offset().left - $(ui.dropDown).width());

              temp = (Math.round(temp));

              $(ui.dropDown).offset({ left: temp });

            }

          }
        },
        {
          name: 'Selection',
          mode: 'row',
          activation: false,
          multipleSelection: true
        },
        {
          name: 'RowSelectors',
          enableCheckBoxes: true,
          enableRowNumbering: false,
          rowSelectorColumnWidth: 35,
          enableSelectAllForPaging: true,
          requireSelection: true,
          rowSelectorClicked: (evt, ui) => {

            let alreadySelected = this.currentSelectedRows.findIndex((elm, index) => {

              return elm.rowKey === ui.rowKey;

            });

            if (alreadySelected > -1) {



            } else {

              this.currentSelectedRows.push({ rowKey: ui.rowKey, rowIndex: ui.rowIndex });
              this.singleRowSelected.emit({ stoneId: ui.rowKey, added: true });

            }

            this.currentSelectedRows.forEach(elm => {

              $('#grid' + this.gridName).igGridSelection('selectRowById', elm.rowKey);

            });

            alreadySelected = null;

          },
          checkBoxStateChanging: (evt, ui) => {

            this.handleCheckBoxStateChangeInitiated();

          },
          checkBoxStateChanged: (evt, ui) => {
            this.handleCheckboxStateChange(evt, ui);

          }
        },
        {
          name: 'Resizing',
          columnSettings: [
            {
              columnKey: 'multimedia',
              allowResizing: false
            },
            {
              columnKey: '_id',
              allowResizing: false
            }
          ], columnResized: (evt, ui) => {

            this.realignGrid();

          }
        },
        {
          name: 'ColumnMoving',
          // columnMovingDialogContainment: 'owner',
          mode: 'deferred',
          moveType: 'render',
          columnSettings: [
            {
              columnKey: '_id',
              allowMoving: false
            },
            {
              columnKey: 'detailSection',
              allowMoving: false
            },
            {
              columnKey: 'addtopacket',
              allowMoving: false
            },
            {
              columnKey: 'multimedia',
              allowMoving: false
            },
            {
              columnKey: 'twin',
              allowMoving: false,
            },
            {
              columnKey: 'ddc',
              allowMoving: false,
            },
            {
              columnKey: 'viewrequest',
              allowMoving: false,
            },
            {
              columnKey: 'onlineview',
              allowMoving: false,
            },
            {
              columnKey: 'havenote',
              allowMoving: false,
            },
            {
              columnKey: 'basket',
              allowMoving: false,
            },
            {
              columnKey: 'recommended',
              allowMoving: false,
            },
            {
              columnKey: 'onhold',
              allowMoving: false,
            }
          ],
          columnMoved: (evt, args) => {

            this.displayGridLoadingOverlay = true;

            const allColumns = $('#grid' + this.gridName).igGrid('option', 'columns');
            const stoneIdColumnIndex = allColumns.findIndex(elm => { return elm.key === '_id'; });
            const movedColumnIndex = allColumns.findIndex(elm => { return elm.key === args.columnKey; });

            if (stoneIdColumnIndex > movedColumnIndex) {

              $('#grid' + this.gridName).igGridColumnMoving('moveColumn', args.columnKey, '_id', true, false, () => {

                // $('.ui-iggrid-virtualrow').css('height', '32px');
                // $('#grid' + this.gridName).igGridColumnFixing('checkAndSyncHeights');
                $('#grid' + this.gridName).igGridSorting('sortColumn', '_id', 'ascending');
                $('#grid' + this.gridName).igGridSorting('unsortColumn', '_id');

                this.realignGrid();

                this.displayGridLoadingOverlay = false;

              });

            } else {

              this.displayGridLoadingOverlay = false;

            }

          }
        },
        {
          name: 'Hiding',
          columnSettings: [
            {
              columnKey: 'multimedia',
              allowHiding: false
            },
            {
              columnKey: '_id',
              allowHiding: false
            },
            {
              columnKey: 'certificate',
              allowHiding: false
            },
            {
              columnKey: 'shape',
              allowHiding: false
            },
            {
              columnKey: 'cut',
              allowHiding: false
            },
            {
              columnKey: 'clarity',
              allowHiding: false
            },
            {
              columnKey: 'color',
              allowHiding: false
            },
            {
              columnKey: 'carat',
              allowHiding: false
            }
          ],
          columnChooserOpening: (evt, ui) => {

            $(ui.columnChooserElement).css({ 'max-height': (this.gridHeight - 150), 'overflow': 'scroll' });

          },
          columnHidden: (evt, ui) => {

            this.realignGrid();

          }, columnShown: (evt, ui) => {

            this.realignGrid();

          }
        }, {
          name: 'Tooltips',
          visibility: 'always',
          columnSettings: [
            { 'columnKey': 'addtopacket', 'allowTooltips': false },
            { 'columnKey': 'multimedia', 'allowTooltips': false },
            { 'columnKey': '_id', 'allowTooltips': false },
            { 'columnKey': 'oAmount', 'allowTooltips': false },
            { 'columnKey': 'onlinePercent', 'allowTooltips': false },
            { 'columnKey': 'termPercent', 'allowTooltips': false },
            { 'columnKey': 'wvdPercent', 'allowTooltips': false },
            { 'columnKey': 'coopPercent', 'allowTooltips': false },
            { 'columnKey': 'eventPercent', 'allowTooltips': false },
            { 'columnKey': 'fDollarCaratAmount', 'allowTooltips': false },
            { 'columnKey': 'fOffPercent', 'allowTooltips': false },
            { 'columnKey': 'fAmount', 'allowTooltips': false },
            {
              'columnKey': 'amount',
              'allowTooltips': false
            },
            {
              'columnKey': 'diff', 'allowTooltips': false
            },
            { 'columnKey': 'go', 'allowTooltips': false },
            { 'columnKey': 'certificate', 'allowTooltips': false }, {
              'columnKey': 'shape',
              'allowTooltips': false
            },
            { 'columnKey': 'carat', 'allowTooltips': false },
            { 'columnKey': 'clarity', 'allowTooltips': false }, {
              'columnKey': 'color',
              'allowTooltips': false
            },
            { 'columnKey': 'cut', 'allowTooltips': false },
            { 'columnKey': 'price_srk', 'allowTooltips': false },
            {
              'columnKey': 'rap_off',
              'allowTooltips': false
            },
            { 'columnKey': 'polish', 'allowTooltips': false },
            {
              'columnKey': 'symmetry',
              'allowTooltips': false
            },
            { 'columnKey': 'table_black', 'allowTooltips': false },
            {
              'columnKey': 'side_black',
              'allowTooltips': false
            },
            { 'columnKey': 'fluor', 'allowTooltips': false },
            {
              'columnKey': 'total_depth_percent',
              'allowTooltips': false
            },
            { 'columnKey': 'ratio', 'allowTooltips': false },
            { 'columnKey': 'table', 'allowTooltips': false }, {
              'columnKey': 'measurement',
              'allowTooltips': false
            },
            { 'columnKey': 'luster', 'allowTooltips': false },
            { 'columnKey': 'shade', 'allowTooltips': false }, {
              'columnKey': 'table_white',
              'allowTooltips': false
            },
            { 'columnKey': 'side_white', 'allowTooltips': false },
            { 'columnKey': 'sgs', 'allowTooltips': false }, {
              'columnKey': 'ts',
              'allowTooltips': false
            },
            { 'columnKey': 'ss', 'allowTooltips': false },
            { 'columnKey': 'to', 'allowTooltips': false }, {
              'columnKey': 'co',
              'allowTooltips': false
            },
            { 'columnKey': 'po', 'allowTooltips': false },
            { 'columnKey': 'tef', 'allowTooltips': false },
            {
              'columnKey': 'cef',
              'allowTooltips': false
            },
            { 'columnKey': 'cef', 'allowTooltips': false },
            { 'columnKey': 'pef', 'allowTooltips': false }, {
              'columnKey': 'kts',
              'allowTooltips': false
            },
            { 'columnKey': 'lab_comment', 'allowTooltips': true },
            {
              'columnKey': 'girdle_percent',
              'allowTooltips': false
            },
            { 'columnKey': 'hna', 'allowTooltips': false },
            {
              'columnKey': 'certificate_no',
              'allowTooltips': false
            },
            { 'columnKey': 'price_rap', 'allowTooltips': false },
            { 'columnKey': 'difference', 'allowTooltips': false },
            { 'columnKey': 'offAmt', 'allowTooltips': false },
            { 'columnKey': 'eoc', 'allowTooltips': false },
            { 'columnKey': 'eligibility', 'allowTooltips': true, 'maxWidth': (this.columnWidths.eligible + 10) || 200 }
          ],
        }
      ],
      templatingEngine: 'infragistics',
      dataBound: (evt, ui) => {

      },
      rowsRendered: (evt, ui) => {

        this.afterGridRowsRendered();

      },
      dataRendered: (evt, ui) => {

        this.realignGrid();

      },
      rendered: (evt, ui) => {

        this.afterGridRendered();

      },
      cellClick: (evt, ui) => {

        if (ui.colKey === 'addtopacket') {

          let temp = this.upcomingTableData.find(elm => {

            return ui.rowKey === elm._id;

          });

          this.auditService.saveButtonActionAudit('ADD TO PACKET');

          this.addStoneToPacket.emit(temp);

          temp = null;

        }

        if (ui.colKey === 'multimedia') {

          let temp = this.upcomingTableData.find(elm => {

            return ui.rowKey === elm._id;

          });

          this.displayIconsOverlay.emit({ stoneId: temp, eventObject: evt });

          $('#grid' + this.gridName).igGridSelection('deselectRowById', ui.rowKey);

          temp = null;

        }

        if (ui.colKey === 'certificate') {

          const temp = this.upcomingTableData.find(elm => {

            return ui.rowKey === elm._id;

          });

          // const url = 'https://pck2.azureedge.net/stone-multimedia/stone-multimedia.htm?stoneIds=' + temp._id + '&showMediaType=PDF';

          if (temp.certificate_no) {

            // window.open(url, '_blank');
            this.stoneMultiMediaDetailDirective.dirStoneMultimediaDetail = { stoneid: temp, showMediaType: 'PDF' };
            this.stoneMultiMediaDetailDirective.onClick();

          }

        }

        if (ui.colKey === '_id') {

          if (evt.originalEvent) {

            let temp = this.upcomingTableData.find(elm => {

              return ui.rowKey === elm._id;

            });

            if ($(evt.originalEvent.target).attr('class')) {

              if ($(evt.originalEvent.target).attr('class').includes('icon-Twin-Shape-Round')) {

                this.auditService.saveActionAuditData('STD DETAIL VIEW');

                this.twinDiamondDetailInNewTab.emit(temp.std_grp_no);

                temp = null;

              }

              if ($(evt.originalEvent.target).attr('class').includes('icon-note')) {

                this.displayNotesForSingleStoneInDialog.emit(temp.notes);

                temp = null;

              }

              if ($(evt.originalEvent.target).attr('class').includes('icon-ddc')) {

                this.updateDDCClicked.emit(temp);

                temp = null;

              }

              if ($(evt.originalEvent.target).attr('class').includes('grid-id-text')) {

                this.auditService.saveButtonActionAudit('STONE DETAIL VIEW');

                this.stoneDetailInNewTab.emit(ui.rowKey);

              }


              if ($(evt.originalEvent.target).attr('class').includes('icon-b2b')) {

                // this.auditService.saveButtonActionAudit('STONE DETAIL VIEW');

                this.b2bIconPopup.emit(temp);

              }


            }

          } else {

            this.auditService.saveButtonActionAudit('STONE DETAIL VIEW');

            this.stoneDetailInNewTab.emit(ui.rowKey);

          }

          $('#grid' + this.gridName).igGridSelection('deselectRowById', ui.rowKey);

        }

        let alreadySelected = this.currentSelectedRows.findIndex(elm => {

          return elm.rowKey === ui.rowKey;

        });


        if (alreadySelected < 0) {

          // Deselect row since we don't want to select row by clicking the cells.
          $('#grid' + this.gridName).igGridSelection('deselectRowById', ui.rowKey);

        }

        // Re-select all rows since all other selection is de-selected when a cell is clicked.
        // This is default behaviour for the grid.
        this.currentSelectedRows.map(elm => {

          $('#grid' + this.gridName).igGridSelection('selectRowById', elm.rowKey);

        });

        alreadySelected = null;

      }

    });

  }

  transformDataForGrid(stoneArray): any[] {

    return stoneArray.map((elm) => {

      let DDCClass = 'icon-ddc ';

      if (elm.business_process === true) {

        if (elm.ddcStatus === 'ACTIVE') {

          DDCClass = DDCClass + 'text-green';

        }

        if (elm.ddcStatus === 'INACTIVE') {

          DDCClass = DDCClass + 'text-red';

        }

      } else {

        DDCClass = 'null';

      }

      // let date = new Date(elm.view_date_time);

      return {
        'multimedia': {
          newArrival: elm.color_legends_json.new_arrival ? 'new-arrival' : 'null',
          bidToBuy: elm.color_legends_json.b2b ? 'bid-to-buy' : 'null',
          underBusinessProcess: elm.color_legends_json.business_process ? 'under-business-process' : 'null',
          recentlyUploaded: elm.color_legends_json.uploaded ? 'recently-uploaded' : 'null',
          isTwin: elm.isTwin === 1 ? 'icon-Twin-Shape-Round' : 'null',
          isDDC: DDCClass,
          'recommended': elm.isRecommended === 1 ? 'srk-recommend' : 'null',
          'onhold': elm.isOnHold === 1 ? 'icon-hold-list-option-2' : 'null',
          'basket': elm.isBasket === 1 ? 'icon-cart' : 'null',
          'viewrequest': elm.totalViewRequest ? elm.viewRequestStatus === 2 ? 'grid-icon icon-my-view text-red' : 'grid-icon icon-my-view' : 'null',
          'viewrequesttooltip': elm.viewRequestStatus === 2 ? 'Stone Already Viewed' : 'View Request',
          'totalviewrequest': elm.totalViewRequest && elm.totalViewRequest > 1 ? elm.totalViewRequest : '',
          'havenote': elm.haveNote === true ? 'icon-note' : 'null',
          'notecount': elm.notes ? elm.notes.length : '',
          'addtopacket': elm.packet_count > 0 ? 'icon-packet-added text-green' : 'icon-packet-add',
          showHoldIcon: elm.showHoldIcon === true ? 'icon-hold-list-option-2' : 'null',
          btobstate: elm.b2b_state === 1 ? (elm.isBtbUpdated === 1 ? 'icon-b2b text-red' : (elm.isBtbUpdated === 2 ? 'icon-b2b text-green' : 'icon-b2b')) : 'null',
          btobtooltip: elm.isBtbUpdated === 1 ? 'BID_SAVED' : (elm.isBtbUpdated === 2 ? 'FINAL_SUBMITTED' : 'B2B_ACTIVE'),
          'onlineview': elm.totalViewedByUser > 0 ? {
            class: 'grid-icon icon-online-view',
            totalviewed: elm.totalViewed,
            totalviewedbyuser: '/' + elm.totalViewedByUser,
            tooltip1: 'Others View: ' + elm.totalViewed,
            tooltip2: 'My View: ' + elm.totalViewedByUser
          } : { class: 'null' },
          isFlag: elm.countryCode ? 'stone-flag-icon' : 'null',
          countrycode: '/assets/img/' + elm.countryCode,
          editedprice: elm.price_srk,
          viewDate: elm.view_date_time ? this.utilSvc.returnHTMLNeededDateTimeFormat(elm.view_date_time, 'dateWithMonth') + ',' + this.utilSvc.returnHTMLNeededDateTimeFormat(elm.view_date_time, 'year') : '',
          viewTime: elm.view_date_time ? this.utilSvc.returnHTMLNeededDateTimeFormat(elm.view_date_time, 'timeAMPM') : '',
          viewNote: elm.view_request_note.length > 0 ? elm.view_request_note[elm.view_request_note.length - 1].comment : '',
          stoneStatus: elm.stone_state === 6 ? 'Not Available' : elm.viewRequestStatus === 2 ? 'SEEN' : ''
        },
        'viewDate': elm.view_date_time ? this.utilSvc.returnHTMLNeededDateTimeFormat(elm.view_date_time, 'dateWithMonth') + ',' + this.utilSvc.returnHTMLNeededDateTimeFormat(elm.view_date_time, 'year') : '',
        'viewTime': elm.view_date_time ? this.utilSvc.returnHTMLNeededDateTimeFormat(elm.view_date_time, 'timeAMPM') : '',
        'viewNote': elm.view_request_note.length > 0 ? elm.view_request_note[elm.view_request_note.length - 1].comment : '',
        'stoneStatus': elm.stone_state === 6 ? 'Not Available' : elm.viewRequestStatus === 2 ? 'SEEN' : '',
        '_id': elm._id,
        'certificate': elm.certificate.short_value,
        'clarity': elm.clarity.short_value,
        'color': elm.color.short_value,
        'carat': elm.carat,
        'cut': elm.cut.short_value,
        'amount': elm.amount,
        'price_srk': elm.price_srk,
        'rap_off': elm.rap_off,
        'polish': elm.polish.short_value,
        'symmetry': elm.symmetry.short_value,
        'fluor': elm.fluor.short_value,
        'measurement': elm.measurement,
        'ratio': elm.ratio,
        'table': elm.table,
        'total_depth_percent': elm.total_depth_percent,
        'shade': elm.shade.short_value,
        'luster': elm.luster.short_value,
        'table_white': elm.table_white.short_value,
        'side_white': elm.side_white.short_value,
        'table_black': elm.table_black.short_value,
        'side_black': elm.side_black.short_value,
        'sgs': elm.sgs,
        'ts': elm.table_spot.short_value,
        'ss': elm.side_spot.short_value,
        'to': elm.table_open.short_value,
        'co': elm.crown_open.short_value,
        'po': elm.pav_open.short_value,
        'go': elm.girdle_open.short_value,
        'tef': elm.table_extra_facet.short_value,
        'cef': elm.crown_extra_facet.short_value,
        'pef': elm.pav_extra_facet.short_value,
        'kts': elm.kts,
        'lab_comment': elm.lab_comment,
        'girdle_percent': elm.girdle_percent,
        'hna': elm.hna.short_value,
        'certificate_no': elm.certificate_no || '',
        'price_rap': elm.price_rap,
        'eligibility': elm.eligibility,
        'shape': elm.shape.short_value,
        'twin': elm.isTwin === 1 ? 'icon-Twin-Shape-Round' : 'null',
        'ddc': DDCClass,
        'recommended': elm.isRecommended === 1 ? 'srk-recommend' : 'null',
        'onhold': elm.isOnHold === 1 ? 'icon-hold-list-option-2' : 'null',
        'basket': elm.isBasket === 1 ? 'icon-cart' : 'null',
        'viewrequest': elm.viewRequestStatus === 1 ? 'grid-icon icon-my-view' : 'null',
        'havenote': elm.haveNote === true ? 'icon-note' : 'null',
        'addtopacket': elm.packet_count > 0 ? 'icon-packet-added text-green' : 'icon-packet-add',
        'onlineview': elm.totalViewedByUser > 0 ? {
          class: 'grid-icon icon-online-view',
          totalviewed: elm.totalViewed,
          totalviewedbyuser: '/' + elm.totalViewedByUser,
          tooltip1: 'Others View',
          toolltip2: 'My View'
        } : { class: 'null' },
        'stoneIconData': {
          isTwin: elm.isTwin === 1 ? 'iconTwinShapeRound' : 'null',
          isDDC: elm.isDDC === 1 ? 'iconTwinShapeRound' : 'null'
        }
      };

    });

  }

  public realignGrid(): void {

    let headerWidth = $('#gridheaderGrid' + '_headers thead').width();

    $('#gridupcomingGrid').css({
      'max-width': headerWidth + 'px',
      'width': headerWidth + 'px'
    });
    $('#gridpastGrid').css({
      'max-width': headerWidth + 'px',
      'width': headerWidth + 'px'
    });
    $('#gridtodayGrid').css({
      'max-width': headerWidth + 'px',
      'width': headerWidth + 'px'
    });

    headerWidth = null;

  }


  generateTableColumns(): void {

    //VIew Date Column

    this.tableColumns.push({
      key: 'viewDate',
      headerText: 'Date',
      width: '100px',
      originalWidth: this.columnWidths.dollarCt || '200px',
      dataType: 'string',
      columnIndex: 1,
      template: '<lable>${viewDate}</lable>'
    });

    // View Time Column 

    this.tableColumns.push({
      key: 'viewTime',
      headerText: 'Time',
      width: '100px',
      originalWidth: this.columnWidths.dollarCt || '200px',
      dataType: 'string',
      columnIndex: 2,
      template: '<lable>${viewTime}</lable>'
    });

    // View Note Comment 

    this.tableColumns.push({
      key: 'viewNote',
      headerText: 'Comment',
      width: '100px',
      originalWidth: this.columnWidths.dollarCt || '200px',
      dataType: 'string',
      columnIndex: 3,
      template: '<lable>${viewNote}</lable>'
    });

    // View Stone Status 
    this.tableColumns.push({
      key: 'stoneStatus',
      headerText: 'Status',
      width: '100px',
      originalWidth: this.columnWidths.dollarCt || '200px',
      dataType: 'string',
      columnIndex: 4,
      template: '<lable>${stoneStatus}</lable>'
    });

    // Certificate Column
    this.tableColumns.push({
      key: 'certificate',
      headerText: 'Cert',
      enabled: true,
      index: 1,
      width: this.columnWidths.cert || '200px',
      originalWidth: this.columnWidths.cert || '200px',
      dataType: 'string',
      columnIndex: this.userSelectedColumns.Certificate.order
    });


    // Shape Column
    this.tableColumns.push({
      key: 'shape',
      headerText: 'Shape',
      width: this.columnWidths.shape || '200px',
      originalWidth: this.columnWidths.shape || '200px',
      dataType: 'string',
      columnIndex: this.userSelectedColumns.Shape.order
    });

    // Clarity Column
    this.tableColumns.push({
      key: 'clarity',
      headerText: 'Clarity',
      width: this.columnWidths.clarity || '200px',
      originalWidth: this.columnWidths.clarity || '200px',
      dataType: 'string',
      columnIndex: this.userSelectedColumns.Clarity.order
    });

    // Color Column
    this.tableColumns.push({
      key: 'color',
      headerText: 'Colour',
      width: this.columnWidths.color || '200px',
      originalWidth: this.columnWidths.color || '200px',
      dataType: 'string',
      columnIndex: this.userSelectedColumns.Colour.order
    });


    // Carat Column
    this.tableColumns.push({
      key: 'carat',
      headerText: 'Carat',
      width: this.columnWidths.carat || '200px',
      originalWidth: this.columnWidths.carat || '200px',
      dataType: 'number',
      format: '#.00',
      columnIndex: this.userSelectedColumns.Carat.order
    });

    // Cut Column
    this.tableColumns.push({
      key: 'cut',
      headerText: 'Cut',
      width: this.columnWidths.cut || '200px',
      originalWidth: this.columnWidths.cut || '200px',
      dataType: 'string',
      columnIndex: this.userSelectedColumns.cut.order
    });


    // DollarCT Column
    if (this.userSelectedColumns.DollarCT.entity_value === true) {

      this.tableColumns.push({
        key: 'price_srk',
        headerText: '$/ct',
        width: this.columnWidths.dollarCt || '200px',
        originalWidth: this.columnWidths.dollarCt || '200px',
        dataType: 'number',
        format: '#.00',
        columnIndex: this.userSelectedColumns.DollarCT.order
      });

    }

    // Amount Column
    if (this.userSelectedColumns.Amount.entity_value === true) {

      this.tableColumns.push({
        key: 'amount',
        headerText: 'Amount',
        width: this.columnWidths.amount || '200px',
        originalWidth: this.columnWidths.amount || '200px',
        dataType: 'number',
        format: '#.00',
        columnIndex: this.userSelectedColumns.Amount.order
      });

    }

    // Off Column
    if (this.userSelectedColumns.Off.entity_value === true) {

      this.tableColumns.push({
        key: 'rap_off',
        headerText: 'OFF%',
        width: this.columnWidths.off || '200px',
        originalWidth: this.columnWidths.off || '200px',
        dataType: 'number',
        format: '#.00',
        columnIndex: this.userSelectedColumns.Off.order
      });

    }

    // polish Column
    if (this.userSelectedColumns.polish.entity_value === true) {

      this.tableColumns.push({
        key: 'polish',
        headerText: 'Pol',
        width: this.columnWidths.pol || '200px',
        originalWidth: this.columnWidths.pol || '200px',
        dataType: 'string',
        columnIndex: this.userSelectedColumns.polish.order
      });

    }

    // symmetry Column
    if (this.userSelectedColumns.symmetry.entity_value === true) {

      this.tableColumns.push({
        key: 'symmetry',
        headerText: 'Sym',
        enabled: true,
        index: 9,
        width: this.columnWidths.sym || '200px',
        originalWidth: this.columnWidths.sym || '200px',
        dataType: 'string',
        columnIndex: this.userSelectedColumns.symmetry.order
      });

    }

    // fluorescence Column
    if (this.userSelectedColumns.fluorescence.entity_value === true) {

      this.tableColumns.push({
        key: 'fluor',
        headerText: 'Fluor',
        width: this.columnWidths.fluor || '200px',
        originalWidth: this.columnWidths.fluor || '200px',
        dataType: 'string',
        columnIndex: this.userSelectedColumns.fluorescence.order
      });

    }

    // Measurement Column
    if (this.userSelectedColumns.Measurement.entity_value === true) {

      this.tableColumns.push({
        key: 'measurement',
        headerText: 'Measurement',
        width: this.columnWidths.measurement || '200px',
        originalWidth: this.columnWidths.measurement || '200px',
        dataType: 'string',
        columnIndex: this.userSelectedColumns.Measurement.order
      });

    }

    // DR Column
    if (this.userSelectedColumns.DR.entity_value === true) {

      this.tableColumns.push({
        key: 'ratio',
        headerText: 'D/R',
        width: this.columnWidths.dr || '200px',
        originalWidth: this.columnWidths.dr || '200px',
        dataType: 'number',
        format: '#.00',
        columnIndex: this.userSelectedColumns.DR.order
      });

    }

    // Tab Column
    if (this.userSelectedColumns.Tab.entity_value === true) {

      this.tableColumns.push({
        key: 'table',
        headerText: 'TAB',
        width: this.columnWidths.tab || '200px',
        originalWidth: this.columnWidths.tab || '200px',
        dataType: 'number',
        format: '#.00',
        columnIndex: this.userSelectedColumns.Tab.order
      });

    }

    // Td Column
    if (this.userSelectedColumns.Td.entity_value === true) {

      this.tableColumns.push({
        key: 'total_depth_percent',
        headerText: 'TD',
        width: this.columnWidths.td || '200px',
        originalWidth: this.columnWidths.td || '200px',
        dataType: 'number',
        format: '#.00',
        columnIndex: this.userSelectedColumns.Td.order
      });

    }

    // shade Column
    if (this.userSelectedColumns.shade.entity_value === true) {

      this.tableColumns.push({
        key: 'shade',
        headerText: 'Shd',
        width: this.columnWidths.shd || '200px',
        originalWidth: this.columnWidths.shd || '200px',
        dataType: 'string',
        columnIndex: this.userSelectedColumns.shade.order
      });

    }

    // luster Column
    if (this.userSelectedColumns.luster.entity_value === true) {

      this.tableColumns.push({
        key: 'luster',
        headerText: 'Lust',
        width: this.columnWidths.tab || '200px',
        originalWidth: this.columnWidths.tab || '200px',
        dataType: 'string',
        columnIndex: this.userSelectedColumns.luster.order
      });

    }

    // table_white Column
    if (this.userSelectedColumns.table_white.entity_value === true) {

      this.tableColumns.push({
        key: 'table_white',
        headerText: 'TW',
        width: this.columnWidths.tw || '200px',
        originalWidth: this.columnWidths.tw || '200px',
        dataType: 'string',
        columnIndex: this.userSelectedColumns.table_white.order
      });

    }

    // side_white Column
    if (this.userSelectedColumns.side_white.entity_value === true) {

      this.tableColumns.push({
        key: 'side_white',
        headerText: 'SW',
        width: this.columnWidths.sw || '200px',
        originalWidth: this.columnWidths.sw || '200px',
        dataType: 'string',
        columnIndex: this.userSelectedColumns.side_white.order
      });

    }

    // table_black Column
    if (this.userSelectedColumns.table_black.entity_value === true) {

      this.tableColumns.push({
        key: 'table_black',
        headerText: 'TB',
        width: this.columnWidths.dr || '200px',
        originalWidth: this.columnWidths.dr || '200px',
        dataType: 'string',
        columnIndex: this.userSelectedColumns.table_black.order
      });

    }

    // side_black Column
    if (this.userSelectedColumns.side_black.entity_value === true) {

      this.tableColumns.push({
        key: 'side_black',
        headerText: 'SB',
        width: this.columnWidths.tb || '200px',
        originalWidth: this.columnWidths.tb || '200px',
        dataType: 'string',
        columnIndex: this.userSelectedColumns.side_black.order
      });

    }

    // SGS Column
    if (this.userSelectedColumns.SGS.entity_value === true) {

      this.tableColumns.push({
        key: 'sgs',
        headerText: 'SGS Comment',
        width: this.columnWidths.sgs || '200px',
        originalWidth: this.columnWidths.sgs || '200px',
        dataType: 'string',
        columnIndex: this.userSelectedColumns.SGS.order,
        template: '<div class="text-align-left sgs-comment-span"> ${sgs} </div>'
      });

    }

    // table_spot Column
    if (this.userSelectedColumns.table_spot.entity_value === true) {

      this.tableColumns.push({
        key: 'ts',
        headerText: 'TS',
        width: this.columnWidths.ts || '200px',
        originalWidth: this.columnWidths.ts || '200px',
        dataType: 'string',
        columnIndex: this.userSelectedColumns.table_spot.order
      });

    }

    // side_spot Column
    if (this.userSelectedColumns.side_spot.entity_value === true) {

      this.tableColumns.push({
        key: 'ss',
        headerText: 'SS',
        width: this.columnWidths.ss || '200px',
        originalWidth: this.columnWidths.ss || '200px',
        dataType: 'string',
        columnIndex: this.userSelectedColumns.side_spot.order
      });

    }

    // table_open Column
    if (this.userSelectedColumns.table_open.entity_value === true) {

      this.tableColumns.push({
        key: 'to',
        headerText: 'TO',
        width: this.columnWidths.to || '200px',
        originalWidth: this.columnWidths.to || '200px',
        dataType: 'string',
        columnIndex: this.userSelectedColumns.table_open.order
      });

    }

    // crown_open Column
    if (this.userSelectedColumns.crown_open.entity_value === true) {

      this.tableColumns.push({
        key: 'co',
        headerText: 'CO',
        width: this.columnWidths.co || '200px',
        originalWidth: this.columnWidths.co || '200px',
        dataType: 'string',
        columnIndex: this.userSelectedColumns.crown_open.order
      });

    }

    // pav_open Column
    if (this.userSelectedColumns.pav_open.entity_value === true) {

      this.tableColumns.push({
        key: 'po',
        headerText: 'PO',
        width: this.columnWidths.po || '200px',
        originalWidth: this.columnWidths.po || '200px',
        dataType: 'string',
        columnIndex: this.userSelectedColumns.pav_open.order
      });

    }

    // girdle_open Column
    if (this.userSelectedColumns.girdle_open.entity_value === true) {

      this.tableColumns.push({
        key: 'go',
        headerText: 'GO',
        width: this.columnWidths.go || '200px',
        originalWidth: this.columnWidths.go || '200px',
        dataType: 'string',
        columnIndex: this.userSelectedColumns.girdle_open.order
      });

    }

    // table_EF Column
    if (this.userSelectedColumns.table_EF.entity_value === true) {

      this.tableColumns.push({
        key: 'tef',
        headerText: 'T EF',
        width: this.columnWidths.tef || '200px',
        originalWidth: this.columnWidths.tef || '200px',
        dataType: 'string',
        columnIndex: this.userSelectedColumns.table_EF.order
      });

    }

    // crown_EF Column
    if (this.userSelectedColumns.crown_EF.entity_value === true) {

      this.tableColumns.push({
        key: 'cef',
        headerText: 'C EF',
        width: this.columnWidths.cef || '200px',
        originalWidth: this.columnWidths.cef || '200px',
        dataType: 'string',
        columnIndex: this.userSelectedColumns.crown_EF.order
      });

    }

    // pav_EF Column
    if (this.userSelectedColumns.pav_EF.entity_value === true) {

      this.tableColumns.push({
        key: 'pef',
        headerText: 'P EF',
        width: this.columnWidths.pef || '200px',
        originalWidth: this.columnWidths.pef || '200px',
        dataType: 'string',
        columnIndex: this.userSelectedColumns.pav_EF.order
      });

    }

    // Key_To_Symbol Column
    if (this.userSelectedColumns.Key_To_Symbol.entity_value === true) {

      this.tableColumns.push({
        key: 'kts',
        headerText: 'Key To Symbol',
        width: this.columnWidths.kts || '200px',
        originalWidth: this.columnWidths.kts || '200px',
        dataType: 'string',
        columnIndex: this.userSelectedColumns.Key_To_Symbol.order
      });

    }

    // Lab_Comments Column
    if (this.userSelectedColumns.Lab_Comments.entity_value === true) {

      this.tableColumns.push({
        key: 'lab_comment',
        headerText: 'Lab Comments',
        width: this.columnWidths.lab || '200px',
        originalWidth: this.columnWidths.lab || '200px',
        dataType: 'string',
        columnIndex: this.userSelectedColumns.Lab_Comments.order
      });

    }

    // GirdlePer Column
    if (this.userSelectedColumns.GirdlePer.entity_value === true) {

      this.tableColumns.push({
        key: 'girdle_percent',
        headerText: 'Girdle',
        width: this.columnWidths.girdle || '200px',
        originalWidth: this.columnWidths.girdle || '200px',
        dataType: 'number',
        format: '#.00',
        columnIndex: this.userSelectedColumns.GirdlePer.order
      });

    }

    // HandA Column
    if (this.userSelectedColumns.HandA.entity_value === true) {

      this.tableColumns.push({
        key: 'hna',
        headerText: 'H&A',
        width: this.columnWidths.ha || '200px',
        originalWidth: this.columnWidths.ha || '200px',
        dataType: 'string',
        columnIndex: this.userSelectedColumns.HandA.order
      });

    }

    // Certificate_No Column
    if (this.userSelectedColumns.Certificate_No.entity_value === true) {

      this.tableColumns.push({
        key: 'certificate_no',
        headerText: 'Cert No',
        width: this.columnWidths.certNo || '200px',
        originalWidth: this.columnWidths.certNo || '200px',
        dataType: 'string',
        columnIndex: this.userSelectedColumns.Certificate_No.order
      });

    }

    // Rap_Dollar_CT Column
    if (this.userSelectedColumns.Rap_Dollar_CT.entity_value === true) {

      this.tableColumns.push({
        key: 'price_rap',
        headerText: 'Rap $/ct',
        width: this.columnWidths.rap || '200px',
        originalWidth: this.columnWidths.rap || '200px',
        dataType: 'number',
        format: '#.00',
        columnIndex: this.userSelectedColumns.Rap_Dollar_CT.order
      });

    }

    // Eligible Column
    if (this.userSelectedColumns.Eligible.entity_value === true) {

      this.tableColumns.push({
        key: 'eligibility',
        headerText: 'Eligible',
        width: this.columnWidths.eligible || '200px',
        originalWidth: this.columnWidths.eligible || '200px',
        dataType: 'string',
        columnIndex: this.userSelectedColumns.Eligible.order
      });

    }

    this.tableColumns = this.tableColumns.sort((a, b) => {

      return a.columnIndex - b.columnIndex;

    });

  }


  updateIconDataForStones(): Promise<any> {

    return new Promise((resolve, reject) => {
      this.stoneDetailService
        .storeStoneAdditionalInfo(this.resultObject.table)
        .subscribe(res => {
          const temp = this.stoneDetailService.addStoneAdditionalInfo(this.upcomingTableData, res);

          resolve(temp);

        });

    });

  }

  searchValues(searchString) {
    debugger
    this.displayGridLoadingOverlay = true;

    // this.dataToDisplayOfPast = $('#gridpastGrid').data('igGrid').dataSource.dataView();
    // this.dataToDisplayOfToday = $('#gridtodayGrid').data('igGrid').dataSource.dataView();
    // this.dataToDisplayOfUpcoming = $('#gridupcomingGrid').data('igGrid').dataSource.dataView();
    this.dataToDisplayOfPast = this.transformDataForGrid(this.appStore.getData('pastRequestArray').table);
    this.dataToDisplayOfToday = this.transformDataForGrid(this.appStore.getData('stoneRequestedArray').table);
    this.dataToDisplayOfUpcoming = this.transformDataForGrid(this.appStore.getData('upcomingRequestArray').table);
    let tempArray = [];

    if (this.dataToDisplayOfPast) {
      let tempArray = [];
      for (let i = 0; i < this.dataToDisplayOfPast.length; i++) {
        const patt = new RegExp(searchString, 'gi');
        if (patt.test(JSON.stringify(this.dataToDisplayOfPast[i]))) {
          tempArray.push(this.dataToDisplayOfPast[i]);
        }
      }

      $('#gridpastGrid').igGrid('dataSourceObject', tempArray).igGrid('dataBind');
    }

    if (this.dataToDisplayOfToday) {
      let tempArray = [];
      for (let i = 0; i < this.dataToDisplayOfToday.length; i++) {
        const patt = new RegExp(searchString, 'gi');
        if (patt.test(JSON.stringify(this.dataToDisplayOfToday[i]))) {
          tempArray.push(this.dataToDisplayOfToday[i]);
        }
      }

      $('#gridtodayGrid').igGrid('dataSourceObject', tempArray).igGrid('dataBind');
    }

    if (this.dataToDisplayOfUpcoming) {
      let tempArray = [];
      for (let i = 0; i < this.dataToDisplayOfUpcoming.length; i++) {
        const patt = new RegExp(searchString, 'gi');
        if (patt.test(JSON.stringify(this.dataToDisplayOfUpcoming[i]))) {
          tempArray.push(this.dataToDisplayOfUpcoming[i]);
        }
      }

      $('#gridupcomingGrid').igGrid('dataSourceObject', tempArray).igGrid('dataBind');
    }



    setTimeout(() => {
      // Remove the loading overlay screen.
      this.displayGridLoadingOverlay = false;

    }, 0);

  }


  applyContextMenuActionToGrid(action: { label: String, value: String, columnName: String }): void {

    this.displayContextMenu = false;

    switch (action.value) {

      case 'sortAscending':

        $('#gridheaderGrid').igGridSorting('sortColumn', action.columnName, 'ascending');
        $('#gridupcomingGrid').igGridSorting('sortColumn', action.columnName, 'ascending');
        $('#gridpastGrid').igGridSorting('sortColumn', action.columnName, 'ascending');
        $('#gridtodayGrid').igGridSorting('sortColumn', action.columnName, 'ascending');



        break;

      case 'sortDescending':

        $('#gridheaderGrid').igGridSorting('sortColumn', action.columnName, 'descending');
        $('#gridupcomingGrid').igGridSorting('sortColumn', action.columnName, 'descending');
        $('#gridpastGrid').igGridSorting('sortColumn', action.columnName, 'descending');
        $('#gridtodayGrid').igGridSorting('sortColumn', action.columnName, 'descending');



        break;

      case 'clearSorting':

        $('#gridheaderGrid').igGridSorting('unsortColumn', action.columnName);
        $('#gridupcomingGrid').igGridSorting('unsortColumn', action.columnName);
        $('#gridpastGrid').igGridSorting('unsortColumn', action.columnName);
        $('#gridtodayGrid').igGridSorting('unsortColumn', action.columnName);


        let column = $('#gridheaderGrid').igGrid('option', 'columns').find(elm => { return elm.key === action.columnName; });

        if (column && (column.width === (column.originalWidth + 16))) {

          $('#gridheaderGrid').igGridResizing('resize', action.columnName, column.originalWidth);
          $('#gridupcomingGrid').igGridResizing('resize', action.columnName, column.originalWidth);
          $('#gridpastGrid').igGridResizing('resize', action.columnName, column.originalWidth);
          $('#gridtodayGrid').igGridResizing('resize', action.columnName, column.originalWidth);


        }

        column = null;

        const filteringExpressions = $('#gridheaderGrid').data('igGrid').dataSource.settings.filtering.expressions;

        $('#gridheaderGrid').igGridFiltering('filter', filteringExpressions, true);
        $('#gridupcomingGrid').igGridFiltering('filter', filteringExpressions, true);
        $('#gridpastGrid').igGridFiltering('filter', filteringExpressions, true);
        $('#gridtodayGrid').igGridFiltering('filter', filteringExpressions, true);





        break;

      case 'toggleColumnChooser':

        $('#grid' + this.gridName).igGridHiding('showColumnChooser');

        break;

      case 'hideColumn':

        $('#gridupcomingGrid').igGridHiding('hideColumn', action.columnName, () => {
          this.realignGrid();
        });

        $('#gridpastGrid').igGridHiding('hideColumn', action.columnName, () => {
          this.realignGrid();
        });

        break;

      case 'toggleFiltering':

        $('#grid' + this.gridName).igGridFiltering('toggleFilterRowByFeatureChooser', action.columnName);
        this.realignGrid();

        break;

      case 'togglePinning':

        const temp = $('#grid' + this.gridName).igGrid('fixingDirection');
        const allFixedColumns = $('#grid' + this.gridName).igGrid('option', 'columns');
        const fixedColumns = [];

        for (let i = 0; i < allFixedColumns.length; i++) {

          if ($('#grid' + this.gridName).igGrid('isFixedColumn', allFixedColumns[i].key)) {
            fixedColumns.push(allFixedColumns[i]);
          }

        }

        $('#grid' + this.gridName).igGridColumnFixing('destroy');

        if (temp === 'right') {

          $('#grid' + this.gridName).igGrid('destroy');
          this.gridFixingDirection = 'left';
          setTimeout(() => {

            this.initTable();

          }, 0);



        } else {

          $('#grid' + this.gridName).igGrid('destroy');
          this.gridFixingDirection = 'right';
          setTimeout(() => {

            this.initTable();

          }, 0);

        }

        setTimeout(() => {

          for (let i = 0; i < fixedColumns.length; i++) {

            $('#grid' + this.gridName).igGridColumnFixing('fixColumn', fixedColumns[i].key);

          }

        }, 0);

        break;

      case 'moveLast':
        $('#gridheaderGrid').igGrid('moveColumn', action.columnName, (this.tableColumns.length - 1), true, false);
        $('#gridtodayGrid').igGrid('moveColumn', action.columnName, (this.tableColumns.length - 1), true, false);
        $('#gridupcomingGrid').igGrid('moveColumn', action.columnName, (this.tableColumns.length - 1), true, false);
        $('#gridpastGrid').igGrid('moveColumn', action.columnName, (this.tableColumns.length - 1), true, false);


        break;

      case 'moveFirst':

        let idColumnIndex = this.tableColumns.findIndex(elm => { return elm.key === '_id'; });
        $('#gridheaderGrid').igGrid('moveColumn', action.columnName, (idColumnIndex + 1), true, false);
        $('#gridupcomingGrid').igGrid('moveColumn', action.columnName, (idColumnIndex + 1), true, false);
        $('#gridtodayGrid').igGrid('moveColumn', action.columnName, (idColumnIndex + 1), true, false);
        $('#gridpastGrid').igGrid('moveColumn', action.columnName, (idColumnIndex + 1), true, false);

        idColumnIndex = null;

        break;
    }

  }

  public getGridHeight(): number {

    const selectedStonePanelHeight: number = $('.selected-stone-panel-height-element').outerHeight();
    const headerHeight: number = $('#headerContainerId').outerHeight();
    const tabsElementHeight: number = $('.wrapper-search-tab').outerHeight();
    const colorLegendPanel: number = $('.color-lagend-panel').outerHeight();
    const bufferHeight: any = 60;

    const daypUploadAndDowloadButtonPanelHeight = $('.dayp-upload-dowload-buttons-panel').outerHeight() || 0;

    // Add all the heights.
    const totalHeight = Math.floor(
      (selectedStonePanelHeight + headerHeight + tabsElementHeight + colorLegendPanel + daypUploadAndDowloadButtonPanelHeight) + bufferHeight
    );

    // return Math.ceil(window.innerHeight - totalHeight);
    return 400;

  };

  public saveGridState(): Promise<any> {

    const gridStateKey = 'grid' + this.gridName + 'State';
    const gridStateObject: any = {};

    return new Promise<any>((resolve, reject) => {

      // gridStateObject.horizontalScroll = document.getElementById('grid' + this.gridName + '_hscroller') ? document.getElementById('grid' + this.gridName + '_hscroller').scrollLeft : 0;
      gridStateObject.verticalScroll = document.getElementById('grid' + this.gridName + '_scrollContainer') ? document.getElementById('grid' + this.gridName + '_scrollContainer').scrollTop : 0;
      gridStateObject.searchString = this.searchInput.nativeElement.value;
      gridStateObject.sortingState = $('#grid' + this.gridName).igGridSorting('option', 'columnSettings');
      gridStateObject.filteringExpressions = $('#grid' + this.gridName).data('igGrid').dataSource.settings.filtering.expressions;
      // gridStateObject.iconLegendExpanded = $('#grid' + this.gridName + '__id').width() > 100 ? true : false;


      this.sessionStorageService.setDataInSessionStorage(gridStateKey, JSON.stringify(gridStateObject))
        .then(result => {

          resolve(null);

        })
        .catch(error => {

          console.error('Failed to save data to storage.');
          console.error(error);

        });

    });

  }

  public restoreGridState() {

    this.displayGridLoadingOverlay = true;

    const gridStateKey = 'grid' + this.gridName + 'State';

    this.sessionStorageService.getDataFromSessionStorage(gridStateKey)
      .then((gridState) => {

        if (gridState) {


          // Restore vertical scroll.
          $('#grid' + this.gridName).igGrid('virtualScrollTo', gridState.verticalScroll.toString());

          // Restore horizontal scroll.
          // $('#grid' + this.gridName + '_hscroller').animate({scrollLeft: gridState.horizontalScroll}, 100);
          document.getElementById('grid' + this.gridName + '_hscroller').scrollLeft = gridState.horizontalScroll;

          // Restore Search.
          if (gridState.searchString) {

            this.searchInput.nativeElement.value = gridState.searchString;
            this.searchValues(gridState.searchString);

          }

          // Restore Sorting State.
          if (gridState.sortingState && gridState.sortingState.length > 0) {

            for (let i = 0; i < gridState.sortingState.length; i++) {

              if (gridState.sortingState[i].currentSortDirection) {

                $('#grid' + this.gridName)
                  .igGridSorting('sortColumn', gridState.sortingState[i].columnKey, gridState.sortingState[i].currentSortDirection);

              }

            }

          }

          // Restore Filtering State.
          if (gridState.filteringExpressions && gridState.filteringExpressions.length > 0) {

            $('#grid' + this.gridName).igGridFiltering('filter', gridState.filteringExpressions, true);
            // Show Filtering as filtering will be applied.
            $('#grid' + this.gridName).igGridFiltering('toggleFilterRowByFeatureChooser', '_id');

          }

          // Restore icon legend expansion state, if any.
          if (gridState.iconLegendExpanded === true) {

            $('#gridheaderGrid').igGridResizing('resize', '_id', 250);
            $('#gridupcomingGrid').igGridResizing('resize', '_id', 250);
            $('#gridtodayGrid').igGridResizing('resize', '_id', 250);
            $('#gridpastGrid').igGridResizing('resize', '_id', 250);

            $('#grid' + this.gridName + '__id').find('.stoneIdGridHeader').children().removeClass('fa-arrow-right').addClass('fa-arrow-left');

            this.realignGrid();

          }

        }


        // Remove loading overlay.
        this.displayGridLoadingOverlay = false;

      })
      .catch(error => {

        this.displayGridLoadingOverlay = false;

      });

  }


  clearSelection() {

    if (window.getSelection) {

      if (window.getSelection().empty) {  // Chrome

        window.getSelection().empty();

      } else if (window.getSelection().removeAllRanges) {  // Firefox

        window.getSelection().removeAllRanges();

      }

    }

  }

  public handleCheckboxStateChange(evt: any, ui: any) {

    if (ui.isHeader) {

      // Restore vertical scroll. This is meant to be a hack for DAYP.
      setTimeout(() => {

        // $('#grid' + this.gridName).igGrid('virtualScrollTo', this.currentVerticalScrollPosition.toString());
        // this.currentHorizontalScrollPosition = document.getElementById('grid' + this.gridName + '_hscroller').scrollLeft;
      }, 0);

      if (ui.state === 'on') {
        // comment for another grid
        this.displayGridLoadingOverlay = true;

        // Clear Earlier Selection.
        this.currentSelectedRows = [];
        
        this.allRowsSelected.emit(false);

        const currentData = $('#grid' + this.gridName).data('igGrid').dataSource.dataView();

        if (currentData.length > 0) {

          currentData.forEach((elm, index) => {

            this.currentSelectedRows.push({ rowKey: elm._id, rowIndex: ui.rowIndex });

            if (index === currentData.length - 1) {

              this.singleRowSelected.emit(currentData);
              this.displayGridLoadingOverlay = false;

            }

          });

        } else {

          this.displayGridLoadingOverlay = false;

        }



      } else {
        const currentData = $('#grid' + this.gridName).data('igGrid').dataSource.dataView();
        const allData = $('#grid' + this.gridName).data('igGrid').dataSource.data();
        const tempArray = [];

        if (currentData.length === allData.length) {

          this.currentSelectedRows = [];
          this.singleRowSelected.emit([]);

        } else {

          this.currentSelectedRows.forEach((elm, index) => {

            let temp = allData.find(elem => {
              return elm.rowKey === elem._id;
            });

            if (temp) {

              tempArray.push(temp);

            }

            temp = null;

            if (index === this.currentSelectedRows.length - 1) {

              for (let i = 0; i < currentData.length; i++) {

                let tempIndex = tempArray.findIndex(e => {
                  return e._id === currentData[i]._id;
                });

                if (tempIndex > -1) {

                  tempArray.splice(tempIndex, 1);

                }

                tempIndex = null;

              }

              this.displayGridLoadingOverlay = false;
              this.singleRowSelected.emit(tempArray);

              this.currentSelectedRows = tempArray.map((el, idx) => {

                $('#grid' + this.gridName).igGridSelection('selectRowById', el._id);
                return { rowKey: el._id, rowIndex: idx };


              });

            }

          });

        }

      }
      setTimeout(() => {
        if (ui.isHeader) {
          // Restore vertical scroll. This is meant to be a hack for DAYP.
          setTimeout(() => {
    
            // $('#grid' + this.gridName).igGrid('virtualScrollTo', this.currentVerticalScrollPosition.toString());
            // this.currentHorizontalScrollPosition = document.getElementById('grid' + this.gridName + '_hscroller').scrollLeft;
          }, 0);
    
          if (ui.state === 'on') {
    
            this.displayGridLoadingOverlay = true;
    
            // Clear Earlier Selection.
            this.currentSelectedRowsOfPast = [];
            this.currentSelectedRowsOfToday = [];
            this.currentSelectedRowsOfUpcoming = [];
            // this.allRowsSelected.emit(false);
    
            const currentDataPast = $('#gridpastGrid').data('igGrid').dataSource.dataView();
            const currentDataToday = $('#gridtodayGrid').data('igGrid').dataSource.dataView();
            const currentDataUpcomig = $('#gridupcomingGrid').data('igGrid').dataSource.dataView();
    
            if (currentDataPast.length > 0) {
              this.currentSelectedRowsOfPast = [];
              currentDataPast.forEach((elm, index) => {
                this.currentSelectedRowsOfPast.push({ rowKey: elm._id, rowIndex: ui.rowIndex });
    
                if (index === currentDataPast.length - 1) {
    
                  // this.singleRowSelected.emit(currentDataPast);
                  this.displayGridLoadingOverlay = false;
    
                }
    
              });
              this.appStore.store('pastCurrentSelect', this.currentSelectedRowsOfPast);
    
            } else {
    
              this.displayGridLoadingOverlay = false;
    
            }
            if (currentDataToday.length > 0) {
              this.currentSelectedRowsOfToday = [];
              currentDataToday.forEach((elm, index) => {
                this.currentSelectedRowsOfToday.push({ rowKey: elm._id, rowIndex: ui.rowIndex });
    
                if (index === currentDataToday.length - 1) {
    
                  // this.singleRowSelected.emit(currentDataToday);
                  this.displayGridLoadingOverlay = false;
    
                }
    
              });
              this.appStore.store('todayCurrentSelect', this.currentSelectedRowsOfToday);
    
            } else {
    
              this.displayGridLoadingOverlay = false;
    
            }
            if (currentDataUpcomig.length > 0) {
              this.currentSelectedRowsOfUpcoming = [];
              currentDataUpcomig.forEach((elm, index) => {
                this.currentSelectedRowsOfUpcoming.push({ rowKey: elm._id, rowIndex: ui.rowIndex });
    
                if (index === currentDataUpcomig.length - 1) {
    
                  // this.singleRowSelected.emit(currentDataUpcomig);
                  this.displayGridLoadingOverlay = false;
    
                }
    
              });
              this.appStore.store('upcomingCurrentSelect', this.currentSelectedRowsOfUpcoming);
    
            } else {
    
              this.displayGridLoadingOverlay = false;
    
            }
    
    
          } else {
            const currentDatapast = $('#gridpastGrid').data('igGrid').dataSource.dataView();
            const allDatapast = $('#gridpastGrid').data('igGrid').dataSource.data();
            const tempArraypast = [];
            const currentDatatoday = $('#gridtodayGrid').data('igGrid').dataSource.dataView();
            const allDatatoday = $('#gridtodayGrid').data('igGrid').dataSource.data();
            const tempArraytoday = [];
            const currentDataupcoming = $('#gridupcomingGrid').data('igGrid').dataSource.dataView();
            const allDataupcoming = $('#gridupcomingGrid').data('igGrid').dataSource.data();
            const tempArrayupcomg = [];
    
            if (currentDatapast.length === allDatapast.length) {
    
              this.currentSelectedRowsOfPast = [];
              // this.singleRowSelected.emit([]);
              this.appStore.store('pastCurrentSelect', this.currentSelectedRowsOfPast);
    
    
            } else {
    
              this.currentSelectedRowsOfPast.forEach((elm, index) => {
    
                let temp = allDatapast.find(elem => {
                  return elm.rowKey === elem._id;
                });
    
                if (temp) {
    
                  tempArraypast.push(temp);
    
                }
    
                temp = null;
    
                if (index === this.currentSelectedRowsOfPast.length - 1) {
    
                  for (let i = 0; i < currentDatapast.length; i++) {
    
                    let tempIndex = tempArraypast.findIndex(e => {
                      return e._id === currentDatapast[i]._id;
                    });
    
                    if (tempIndex > -1) {
    
                      tempArraypast.splice(tempIndex, 1);
    
                    }
    
                    tempIndex = null;
    
                  }
    
                  this.displayGridLoadingOverlay = false;
                  // this.singleRowSelected.emit(tempArraypast);
    
                  this.currentSelectedRowsOfPast = tempArraypast.map((el, idx) => {
    
                    $('#grid' + this.gridName).igGridSelection('selectRowById', el._id);
                    return { rowKey: el._id, rowIndex: idx };
    
    
                  });
    
                }
    
              });
              this.appStore.store('pastCurrentSelect', this.currentSelectedRowsOfPast);
    
            }
            if (currentDatatoday.length === allDatatoday.length) {
    
              this.currentSelectedRowsOfToday = [];
              // this.singleRowSelected.emit([]);
              this.appStore.store('todayCurrentSelect', this.currentSelectedRowsOfToday);
    
    
            } else {
    
              this.currentSelectedRowsOfToday.forEach((elm, index) => {
    
                let temp = allDatatoday.find(elem => {
                  return elm.rowKey === elem._id;
                });
    
                if (temp) {
    
                  tempArraytoday.push(temp);
    
                }
    
                temp = null;
    
                if (index === this.currentSelectedRowsOfToday.length - 1) {
    
                  for (let i = 0; i < currentDatatoday.length; i++) {
    
                    let tempIndex = tempArraytoday.findIndex(e => {
                      return e._id === currentDatatoday[i]._id;
                    });
    
                    if (tempIndex > -1) {
    
                      tempArraypast.splice(tempIndex, 1);
    
                    }
    
                    tempIndex = null;
    
                  }
    
                  this.displayGridLoadingOverlay = false;
                  // this.singleRowSelected.emit(tempArraypast);
    
                  this.currentSelectedRowsOfToday = tempArraypast.map((el, idx) => {
    
                    $('#gridtodayGrid' + this.gridName).igGridSelection('selectRowById', el._id);
                    return { rowKey: el._id, rowIndex: idx };
    
    
                  });
    
                }
    
              });
              this.appStore.store('todayCurrentSelect', this.currentSelectedRowsOfToday);
    
    
            }
            if (currentDataupcoming.length === allDataupcoming.length) {
    
              this.currentSelectedRowsOfUpcoming = [];
              // this.singleRowSelected.emit([]);
              this.appStore.store('upcomingCurrentSelect', this.currentSelectedRowsOfUpcoming);
    
    
            } else {
    
              this.currentSelectedRowsOfUpcoming.forEach((elm, index) => {
    
                let temp = allDataupcoming.find(elem => {
                  return elm.rowKey === elem._id;
                });
    
                if (temp) {
    
                  tempArrayupcomg.push(temp);
    
                }
    
                temp = null;
    
                if (index === this.currentSelectedRowsOfUpcoming.length - 1) {
    
                  for (let i = 0; i < currentDataupcoming.length; i++) {
    
                    let tempIndex = tempArrayupcomg.findIndex(e => {
                      return e._id === currentDataupcoming[i]._id;
                    });
    
                    if (tempIndex > -1) {
    
                      tempArrayupcomg.splice(tempIndex, 1);
    
                    }
    
                    tempIndex = null;
    
                  }
    
                  this.displayGridLoadingOverlay = false;
                  // this.singleRowSelected.emit(tempArraypast);
    
                  this.currentSelectedRowsOfPast = tempArrayupcomg.map((el, idx) => {
    
                    $('#gridupcomingGrid').igGridSelection('selectRowById', el._id);
                    return { rowKey: el._id, rowIndex: idx };
    
    
                  });
    
                }
    
              });
              this.appStore.store('upcomingCurrentSelect', this.currentSelectedRowsOfUpcoming);
    
            }
    
          }
    
        }

      }, 100);

    } else {

      if (ui.state === 'on') {

        this.currentSelectedRows.push({ rowKey: ui.rowKey, rowIndex: ui.rowIndex });
        this.singleRowSelected.emit({ stoneId: ui.rowKey, added: true });

      } else {

        // Filtered Stones check needed since selected stones cn be removed from the selection panels
        // which leave the grid out of sync and produce weird selection results.
        // Basically shows calculation for stone that are selected even if they are not.
        if (this.resultObject.filteredStone && this.resultObject.filteredStone.length === 0) {

          this.singleRowSelected.emit({ stoneId: ui.rowKey, added: false });

        } else {

          this.currentSelectedRows = this.currentSelectedRows.filter(elm => {
            return elm.rowKey !== ui.rowKey;
          });

          this.singleRowSelected.emit({ stoneId: ui.rowKey, added: false });

        }

      }

    }

  }

  public afterGridRendered() {

    setTimeout(() => {

      if (this.dataToDisplay.length > 35) {

        $('#grid' + this.gridName).igGrid('dataSourceObject', this.dataToDisplay).igGrid('dataBind');

      }

    }, 0);

    setTimeout(() => {

      // Sync selection, if any.
      // this.currentSelectedRows = this.selectedStonesArray;

      this.selectedStonesArray.forEach(elm => {

        this.currentSelectedRows.push({ rowKey: elm, rowIndex: -1 });
        $('#grid' + this.gridName).igGridSelection('selectRowById', elm);

      });


      // Hide Filtering initially by default.
      $('#grid' + this.gridName).igGridFiltering('toggleFilterRowByFeatureChooser', '_id');


      // Setup Right click for headers
      $('#grid' + this.gridName + '_container th.ui-iggrid-header.ui-widget-header').contextmenu((event) => {


        // Prevent the Browser menu from displaying.
        event.preventDefault();

        const tempIndex = this.contextMenuOptionsList.findIndex(elm => {

          return elm.value === 'togglePinning';

        });

        if (event.currentTarget.id === ('grid' + this.gridName + '__id') || event.currentTarget.id === ('grid' + this.gridName + '_multimedia')
          || event.currentTarget.id === ('grid' + this.gridName + '_addtopacket')) {

          this.contextMenuOptionsList.length = 0;

        } else {

          this.contextMenuOptionsList = [{
            label: 'Sort Ascending',
            value: 'sortAscending',
            columnName: ''
          }, {
            label: 'Sort Descending',
            value: 'sortDescending',
            columnName: ''
          }, {
            label: 'Clear Sorting',
            value: 'clearSorting',
            columnName: ''
          }, {
            label: 'Column Chooser',
            value: 'toggleColumnChooser',
            columnName: ''
          }, {
            label: 'Hide Column',
            value: 'hideColumn',
            columnName: '',
          }, {
            label: 'Toggle Filtering',
            value: 'toggleFiltering',
            columnName: '',
          }, {
            label: 'Move Column First',
            value: 'moveFirst',
            columnName: ''
          }, {
            label: 'Move Column Last',
            value: 'moveLast',
            columnName: ''
          }];

          /*
           {
            label: 'Pin Left/Right',
            value: 'togglePinning',
            columnName: ''
          }
          */

        }


        // Do not show move first on the first column.
        const stoneIdColumnIndex = $('#grid' + this.gridName).igGrid('option', 'columns').findIndex(elm => { return elm.key === '_id'; });
        const currentColumnIndex = $('#grid' + this.gridName).igGrid('option', 'columns').findIndex(elm => {
          return elm.key === event.currentTarget.id.replace(('grid' + this.gridName + '_'), '');
        });

        if ((stoneIdColumnIndex + 1) === currentColumnIndex) {

          const temp = this.contextMenuOptionsList.findIndex(elm => { return elm.value === 'moveFirst'; });

          if (temp > -1) {

            this.contextMenuOptionsList.splice(temp, 1);

          }

        }


        // Do not show move last on the last column.
        if (currentColumnIndex === (this.tableColumns.length - 1)) {

          const temp = this.contextMenuOptionsList.findIndex(elm => { return elm.value === 'moveLast'; });

          if (temp > -1) {

            this.contextMenuOptionsList.splice(temp, 1);

          }

        }

        const mandatoryColumns = ['certificate', 'shape', 'cut', 'carat', 'color', 'clarity'];
        const columnName = event.currentTarget.id.replace(('grid' + this.gridName + '_'), '');

        if (mandatoryColumns.indexOf(columnName) > -1) {

          let tempIdx = this.contextMenuOptionsList.findIndex(elm => {

            return elm.value === 'hideColumn';

          });

          this.contextMenuOptionsList.splice(tempIdx, 1);
          tempIdx = null;

        }


        for (let i = 0; i < this.contextMenuOptionsList.length; i++) {

          this.contextMenuOptionsList[i].columnName = event.currentTarget.id.replace(('grid' + this.gridName + '_'), '');

        }

        this.menuXPosition = event.pageX;
        this.menuYPosition = event.pageY;
        this.displayContextMenu = true;

      });

      // Expand StoneID column based on user preference.
      if (this.userProfileService.getSelectedSaveSearchPreference().is_coloumn_expanded.entity_value === true) {

        $('#grid' + this.gridName).igGridResizing('resize', '_id', 250);
        $('#gridtodayGrid').igGridResizing('resize', '_id', 250);
        $('#gridupcomingGrid').igGridResizing('resize', '_id', 250);
        $('#gridpastGrid').igGridResizing('resize', '_id', 250);

        $('#grid' + this.gridName + '__id').find('.stoneIdGridHeader').children().removeClass('fa-arrow-right').addClass('fa-arrow-left');

      }

      this.restoreGridState();

      this.realignGrid();

      // Initlize tool tips for icons.
      $('.icon-Twin-Shape-Round').tooltip();

      // Setup Scroll Event listener for stone media menu.
      $('#grid' + this.gridName + '_scrollContainer').on('click scroll wheel onmousewheel', () => {

        this.clearSelection();

      });

      // Remove Loader once all initial grid operations are complete.
      this.displayGridLoadingOverlay = false;

      // Set grid Initialised flag.
      this.gridInitialised = true;

    }, 0);

  }

  public afterGridRowsRendered(): void {

  }

  public handleCheckBoxStateChangeInitiated() {

    // this.currentVerticalScrollPosition = document.getElementById('grid' + this.gridName + '_scrollContainer').scrollTop;

  }

}
