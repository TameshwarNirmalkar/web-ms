import {
  Component, OnChanges,
  SimpleChanges, OnInit, Input, TemplateRef, Output, EventEmitter, HostListener
} from '@angular/core';
import { InfraGridComponent } from './../../search/infra-grid/infra-grid.component';
import * as _ from 'underscore';


declare var $: any;
declare var moment: any;

@Component({
  selector: 'app-btb-grid',
  templateUrl: './btb-infra-grid.component.html',
  styleUrls: ['./btb-infra-grid.component.scss']
})

export class BtbInfraGridComponent extends InfraGridComponent implements OnInit, OnChanges {

  @Output() offerPriceForStoneUpdated: EventEmitter<any> = new EventEmitter<any>();
  @Output() offerPercentageForStoneUpdated: EventEmitter<any> = new EventEmitter<any>();
  @Output() offerPriceInput: EventEmitter<any> = new EventEmitter<any>();
  @Input() editBtbSubmissionList;
  @Input() editingEnabled: Boolean;
  @Input() gridRefresh: Boolean;
  @Input() submitStone: Boolean;
  @Input() isBTBSelectedStonesGrid: Boolean;
  @Output() lastFocusedElement: EventEmitter<any> = new EventEmitter<any>();

  public textBoxElement: any;
  public currentFocusedInput: any;
  ngOnInit() {
    super.ngOnInit();
    // this.calculatedGridHeight = ( $('#grid' + this.gridName.replace('selectedStoneGrid', '')).igGrid('option', 'height') - 5);
    // $('#' + this.gridName + 'container').css('cssText', 'height: 100% !important');

    const me = this;
    $(document).on('keypress', '.numbervalidate', function (event) {
      event = event ? event : window.event;
      const charCode = event.which ? event.which : event.keyCode;
      if (charCode === 46 || charCode === 37 || charCode === 39) {
        return true;
      }
      if (charCode > 31 && (charCode < 48 || charCode > 57)) {
        return false;
      }
      return true;
    });

    $('.grid-container').on('keydown', '.numbervalidate', function (event) {
      event = event ? event : window.event;
      const charCode = event.which ? event.which : event.keyCode;
      let index = $('.btb-grid-cell-amount-input').index(this);
      if (charCode === 40 || charCode === 13 || charCode === 9) {
        index = index + 1;
        // $(this).blur();
        let stone: any = me.resultObject.table.find(elm => { return elm._id === event.target.dataset.id; });
        let price = event.target.value;
        me.offerPriceForStoneUpdated.emit({ stone: stone, price: price });
        // $('#grid' + this.gridName).igGridUpdating('updateRow', stone.stone_id, stone[0]);
        stone = null;
        price = null;

        $('.btb-grid-cell-amount-input:eq(' + index + ')').focus();

// ///////////// ///////////// ///////////// ///////////// ///////////// ///////////// ///////////// ///////////// ///////////
        // Here to make scroller move, store it in document.getElementById('grid' + this.gridName + '_scrollContainer').scrollTop
        console.log("1----",$('.btb-grid-cell-amount-input:eq(' + index + ')')[0].offsetParent.parentElement.offsetHeight,
        $('.btb-grid-cell-amount-input:eq(' + index + ')')[0].offsetParent.parentElement);

// ///////////// ///////////// ///////////// ///////////// ///////////// ///////////// ///////////// ///////////// ///////////// ///////////

        setTimeout(() => {
          // $('.btb-grid-cell-amount-input:eq(' + index + ')').focus();
          $('.btb-grid-cell-amount-input:eq(' + index + ')').select();
          me.currentFocusedInput = '.btb-grid-cell-amount-input:eq(' + index + ')';
          me.lastFocusedElement.emit({ element: '.btb-grid-cell-amount-input:eq(' + index + ')', mouseClick: false });
        }, 300);
        $('body').css('overflow-y', 'hidden');
      }
      if (charCode === 38) {
        if (index !== 0) {
          index = index - 1;
        }

        // $(this).blur();
        let stone: any = me.resultObject.table.find(elm => { return elm._id === event.target.dataset.id; });
        let price = event.target.value;
        me.offerPriceForStoneUpdated.emit({ stone: stone, price: price });
        // $('#grid' + this.gridName).igGridUpdating('updateRow', stone.stone_id, stone[0]);
        stone = null;
        price = null;

        $('.btb-grid-cell-amount-input:eq(' + index + ')').focus();

        setTimeout(() => {
          $('.btb-grid-cell-amount-input:eq(' + index + ')').select();
          me.currentFocusedInput = '.btb-grid-cell-amount-input:eq(' + index + ')';
          me.lastFocusedElement.emit({ element: '.btb-grid-cell-amount-input:eq(' + index + ')', mouseClick: false });
        }, 300);
      }
      return true;
    });

    $(document).delegate('#grid' + this.gridName, 'iggridcolumnmovingcolumnmoving', function (evt, args) {
      let scrollHeight;
      let btbAll = document.getElementById('gridbtbAllStone_scrollContainer');
      let btbBasket = document.getElementById('gridbtbBasketStone_scrollContainer');
      let btbSubmission = document.getElementById('gridbtbSubmissionStone_scrollContainer');

      scrollHeight = (btbAll !== null ? btbAll.scrollTop : (btbBasket !== null ? btbBasket.scrollTop : (btbSubmission !== null ? btbSubmission.scrollTop : 0)));
      $('#grid' + this.gridName).igGridColumnMoving('moveColumn', args.columnKey, args.owner._activeMO.before, true, true);
      setTimeout(() => {
        if (document.getElementById('gridbtbAllStone_scrollContainer') !== null) {
          document.getElementById('gridbtbAllStone_scrollContainer').scrollTop = scrollHeight;
        }
        if (document.getElementById('gridbtbBasketStone_scrollContainer') !== null) {
          document.getElementById('gridbtbBasketStone_scrollContainer').scrollTop = scrollHeight;
        }
        if (document.getElementById('gridbtbSubmissionStone_scrollContainer') !== null) {
          document.getElementById('gridbtbSubmissionStone_scrollContainer').scrollTop = scrollHeight;
        }
      }, 300);
    });

  }

  @HostListener('document:click', ['$event'])
  onWindowsClick(event) {
    if ($(event.target).hasClass('dayp-grid-cell-input')) {
      if (event && event.srcElement && event.srcElement.dataset && event.srcElement.dataset.id &&
        this.textBoxElement && this.textBoxElement.dataset && this.textBoxElement.dataset.id &&
        event.srcElement.dataset.id !== this.textBoxElement.dataset.id) {
        this.storePricesForMouseClick();
        if (this.gridName !== 'btbSubmissionStone') {
          this.focusTextBox(event.srcElement.dataset.id, true);
          this.lastFocusedElement.emit({ element: event.srcElement.dataset.id, mouseClick: true });
        } else {
          setTimeout(() => {
            this.focusTextBox(event.srcElement.dataset.id, true);
          }, 500);
        }
      }
      this.textBoxElement = event.target;
    } else {
      if (this.textBoxElement !== undefined) {
        this.storePricesForMouseClick();
        if (this.gridName !== 'btbSubmissionStone') {
          this.lastFocusedElement.emit({ element: null, mouseClick: true });
        }
        this.textBoxElement = undefined;
      }
    }
  }

  storePricesForMouseClick() {
    const stone: any = this.resultObject.table.find(elm => { return elm._id === this.textBoxElement.dataset.id; });
    const elementData = $('[data-id=' + this.textBoxElement.dataset.id + ']');
    if (elementData) {
      for (let i = 0; i < elementData.length; i++) {
        if (elementData[i].tagName === 'INPUT') {
          this.offerPriceForStoneUpdated.emit({ stone: stone, price: elementData[i].value });
          break;
        }
      }
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    super.ngOnChanges(changes);
    if (changes.editingEnabled && changes.editingEnabled.firstChange === false) {

      let allData = $('#grid' + this.gridName).data('igGrid').dataSource.data();

      allData.forEach((elm, index) => {

        elm.multimedia.editingEnabled = changes.editingEnabled.currentValue === true ? 'true' : 'false';

        if (index === allData.length - 1) {

          $('#grid' + this.gridName).igGrid('commit');

          // Need to sync back the selection after cancelling Edit.
          if (changes.editingEnabled.currentValue === false) {

            // Clear Current Selection.
            this.currentSelectedRows.length = 0;
            $('#grid' + this.gridName).igGridSelection('clearSelection');
            this.resultObject.selectedStoneArray.forEach((elem, idx) => {

              this.currentSelectedRows.push({ rowKey: elem._id, rowIndex: -1 });

              $('#grid' + this.gridName).igGridSelection('selectRowById', elem._id);

              if (idx === this.resultObject.selectedStoneArray.length - 1) {

                this.displayGridLoadingOverlay = false;
                allData = null;

              }

            });

          } else {

            this.displayGridLoadingOverlay = false;
            allData = null;

          }


        }

      });

    }
    if (changes.stonesActedOn && changes.stonesActedOn.firstChange === false) {
      if (changes.stonesActedOn.currentValue.source === 'bidToBuyPriceUpdated' ||
        changes.stonesActedOn.currentValue.source === 'b2bPriceInserted' ||
        changes.stonesActedOn.currentValue.source === 'b2bPriceMidUpdated') {
        let stoneObj = [];
        if (changes.stonesActedOn.currentValue.data) {
          stoneObj = [changes.stonesActedOn.currentValue.data];
        } else {
          stoneObj = changes.stonesActedOn.currentValue.stoneObj;
        }
        let temp = this.transformDataForGrid(stoneObj);

        const grid = $('#grid' + this.gridName);
        const gridObj = grid.data('igGrid');
        console.log("Events is " + changes.stonesActedOn.currentValue.source + " from " + this.gridName, changes.stonesActedOn)
        const currentScroll = document.getElementById('grid' + this.gridName + '_scrollContainer') ?
          document.getElementById('grid' + this.gridName + '_scrollContainer').scrollTop : 0;
        const scrollLeft = document.getElementById('grid' + this.gridName + '_displayContainer') ?
          document.getElementById('grid' + this.gridName + '_displayContainer').scrollLeft : 0;
        if (grid.find('tr[data-id=' + temp[0]._id + ']').length > 0) {
          grid.igGridUpdating('updateRow', temp[0]._id, temp[0]);
        } else {
          gridObj.dataSource.updateRow(temp[0]._id, temp[0]);
        }
        setTimeout(() => {

          document.getElementById('grid' + this.gridName + '_scrollContainer').scrollTop = currentScroll;
          document.getElementById('grid' + this.gridName + '_displayContainer').scrollLeft = scrollLeft;
        }, 250);
        this.displayGridLoadingOverlay = false;
        this.adjustScrollTopForFixedAndUnfixedDivs();
        temp = null;

      }

      if (changes.stonesActedOn.currentValue.source === 'bidToBuyAllStoneUpdate') {
        setTimeout(() => {
          const currentScroll = document.getElementById('grid' + this.gridName + '_scrollContainer') ?
            document.getElementById('grid' + this.gridName + '_scrollContainer').scrollTop : 0;
          const scrollLeft = document.getElementById('grid' + this.gridName + '_displayContainer') ?
            document.getElementById('grid' + this.gridName + '_displayContainer').scrollLeft : 0;
          const tempData = this.transformDataForGrid(this.tableData);

          $('#grid' + this.gridName).igGrid('dataSourceObject', tempData).igGrid('dataBind');

          setTimeout(() => {
            document.getElementById('grid' + this.gridName + '_scrollContainer').scrollTop = currentScroll;
            document.getElementById('grid' + this.gridName + '_displayContainer').scrollLeft = scrollLeft;
          }, 500);
          this.displayGridLoadingOverlay = false;

        }, 0);
        this.adjustScrollTopForFixedAndUnfixedDivs();
      }

      if (changes.stonesActedOn.currentValue.source === 'b2bRequested' ||
        changes.stonesActedOn.currentValue.source === 'b2bSubmitted' ||
        changes.stonesActedOn.currentValue.source === 'b2bPriceUpdated') {
        const currentScroll = document.getElementById('grid' + this.gridName + '_scrollContainer') ?
          document.getElementById('grid' + this.gridName + '_scrollContainer').scrollTop : 0;
        const scrollLeft = document.getElementById('grid' + this.gridName + '_displayContainer') ?
          document.getElementById('grid' + this.gridName + '_displayContainer').scrollLeft : 0;
        const temp = this.transformDataForGrid(this.tableData);
        $('#grid' + this.gridName).igGrid('dataSourceObject', temp).igGrid('dataBind');
        setTimeout(() => {

          document.getElementById('grid' + this.gridName + '_scrollContainer').scrollTop = currentScroll;
          document.getElementById('grid' + this.gridName + '_displayContainer').scrollLeft = scrollLeft;
        }, 500);
        this.adjustScrollTopForFixedAndUnfixedDivs();
      }

      if (changes.stonesActedOn.currentValue.source === 'bidToBuyPSubmitedUpdated') {
        let gridArray = [];
        gridArray = changes.stonesActedOn.currentValue.data || changes.stonesActedOn.currentValue.stoneObj;
        const grid = $('#grid' + this.gridName);
        const gridObj = grid.data('igGrid');
        if (gridArray.length > 0) {
          gridArray.forEach((elem, index) => {
            if (grid.find('tr[data-id=' + elem.stone_id + ']').length > 0) {
              grid.igGridUpdating('deleteRow', elem.stone_id);
            } else {
              gridObj.dataSource.deleteRow(elem.stone_id, true);
            }
          });
        }
      }
    }

    if (changes.gridRefresh && changes.gridRefresh.currentValue) {
      let gridArray = [];
      const grid = $('#grid' + this.gridName);
      const gridObj = grid.data('igGrid');
      gridArray = changes.gridRefresh.currentValue;
      if (gridArray.length > 0) {
        gridArray.forEach((elem, index) => {
          if (grid.find('tr[data-id=' + elem.stone_id + ']').length > 0) {
            grid.igGridUpdating('deleteRow', elem);
          }
        });
        const scrollLeft = document.getElementById('grid' + this.gridName + '_displayContainer') ?
          document.getElementById('grid' + this.gridName + '_displayContainer').scrollLeft : 0;
        setTimeout(() => {

          document.getElementById('grid' + this.gridName + '_scrollContainer').scrollTop =
            document.getElementById('grid' + this.gridName + '_scrollContainer').scrollTop + 5;
          document.getElementById('grid' + this.gridName + '_scrollContainer').scrollTop =
            document.getElementById('grid' + this.gridName + '_scrollContainer').scrollTop - 5;
          document.getElementById('grid' + this.gridName + '_displayContainer').scrollLeft = scrollLeft;
        }, 250);
      }
    }

    if (changes.submitStone && changes.submitStone.currentValue) {
      let gridArray = [];
      gridArray = changes.submitStone.currentValue;
      if (gridArray.length > 0) {
        gridArray.forEach((elem, index) => {
          const temp = this.transformDataForGrid([elem]);
          const grid = $('#grid' + this.gridName);
          const gridObj = grid.data('igGrid');
          console.log("Events is " + changes.stonesActedOn.currentValue.source + " from " + this.gridName, changes.stonesActedOn)

          if (grid.find('tr[data-id=' + temp[0]._id + ']').length > 0) {
            grid.igGridUpdating('updateRow', temp[0]._id, temp[0]);
          } else {
            gridObj.dataSource.updateRow(temp[0]._id, temp[0]);
          }
  
          const scrollLeft = document.getElementById('grid' + this.gridName + '_displayContainer') ?
            document.getElementById('grid' + this.gridName + '_displayContainer').scrollLeft : 0;
          setTimeout(() => {
            console.log("ScrollTop",document.getElementById('grid' + this.gridName + '_scrollContainer').scrollTop)

            document.getElementById('grid' + this.gridName + '_displayContainer').scrollLeft = scrollLeft;
          }, 250);
        });
      }
    }
  }

  generateTableColumns() {

    //Bid End Time Column

    this.tableColumns.push({
      key: 'btbEndDate',
      headerText: 'B.E.T. (IST)',
      width: '125px',
      originalWidth: this.columnWidths.dollarCt || '200px',
      dataType: 'string',
      columnIndex: 1,
      template: '<div class="bid-event-duration-display">{{if ${multimedia.isBtbRunning} === "true" }}' +
        '<label>${btbEndDate}<div class="clearfix"></div>${multimedia.btbEndTime}</label>' +
        '{{else}}' +
        '<label class = "offer-auto-saved">${btbEndDate}<div class="clearfix"></div>${multimedia.btbEndTime}</label>' +
        '{{/if}}</div>'
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
        columnIndex: this.userSelectedColumns.DollarCT.order,
        template:
          // '{{if ${multimedia.editingEnabled} === "false" }}' +
          '{{if (${multimedia.final_submit_class} === "offer-auto-saved" || ${multimedia.editingEnabled} === "true") && ${multimedia.isBtbRunning} === "true" }}' +
          '<div class="dayp-data-input-container"> ${price_srk} <span> ' +
          '<input class="numbervalidate dayp-grid-cell-input ${multimedia.final_submit_class} btb-grid-cell-amount-input"   [ngClass]="${final_submit} === 1 ? "text-green": "text-red" "type="text"' +
          ' data-id="${_id}" value="${multimedia.bid_rate}"> </span> ' +
          '</div>' +
          '{{else}}' +
          '<div class="dayp-data-input-container"> ${price_srk} </div> <div class="${multimedia.final_submit_class}"> ${multimedia.bid_rate} </div>' +
          '{{/if}}'
        // '{{else}}' +
        // '<div class="dayp-data-input-container"> ${price_srk} <span> ' +
        // '<input class="numbervalidate dayp-grid-cell-input  btb-grid-cell-amount-input ${multimedia.final_submit_class} "   [ngClass]="${final_submit} === 1 ? 
        // "text-green": "text-red" "type="text"' +
        // ' data-id="${_id}" value="${multimedia.bid_rate}"> </span> ' +
        // '</div>' +
        // '{{/if}}'
      });


    }

    //Diff Column 
    if (this.userSelectedColumns.btb_diff_per.entity_value === true) {

      this.tableColumns.push({
        key: 'diff',
        headerText: 'Diff%',
        width: this.columnWidths.diff_per || '200px',
        originalWidth: this.columnWidths.diff_per || '200px',
        dataType: 'number',
        format: '#.00',
        columnIndex: this.userSelectedColumns.btb_diff_per.order
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

    // Offer Amt. COlumn
    if (this.userSelectedColumns.btb_offer_amount.entity_value === true) {

      this.tableColumns.push({
        key: 'offAmt',
        headerText: 'Offer Amt.',
        width: this.columnWidths.amount || '200px',
        originalWidth: this.columnWidths.amount || '200px',
        dataType: 'number',
        format: '#.00',
        columnIndex: this.userSelectedColumns.btb_offer_amount.order,
        // template:'<span id="e" >${multimedia.bid_rate * carat}</span> '
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
        columnIndex: this.userSelectedColumns.Off.order,
        template: '<div class="dayp-data-input-container"> ${rap_off} <div style="width: 100%;"> ' +
          '<span id="${_id}allBidPercentage" >${multimedia.bid_percentage}</span> ' +
          '</div>'
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
        columnIndex: this.userSelectedColumns.Rap_Dollar_CT.order,

      });

    }

    if (this.visiblePacketIcon) {

      this.tableColumns.unshift({
        key: 'addtopacket',
        headerText: '<i class="grid-icon icon-packet-add"></i>',
        width: '25px',
        dataType: 'string',
        template: '<i class="grid-icon ${addtopacket}" title="Select Packet"></i>'
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

  public saveGridState(): Promise<any> {

    const gridStateKey = 'grid' + this.gridName + 'State';
    const obj = [];
    const oldObj = this.appStore.getData('gridStateName') || [];
    oldObj.forEach(element => {
      obj.push(element);
    });
    obj.push(gridStateKey);
    this.appStore.store('gridStateName', obj);
    const gridStateObject: any = {};

    return new Promise<any>((resolve, reject) => {
      gridStateObject.verticalScroll = document.getElementById('grid' + this.gridName + '_scrollContainer') ?
        document.getElementById('grid' + this.gridName + '_scrollContainer').scrollTop : 0;
      if ($('#grid' + this.gridName).data('igGrid') && $('#grid' + this.gridName).data('igGrid').dataSource &&
        $('#grid' + this.gridName).data('igGrid').dataSource.settings && $('#grid' + this.gridName).data('igGrid').dataSource.settings.filtering &&
        $('#grid' + this.gridName).data('igGrid').dataSource.settings.filtering.expressions) {
        gridStateObject.filteringExpressions = $('#grid' + this.gridName).data('igGrid').dataSource.settings.filtering.expressions;
      }
      gridStateObject.iconLegendExpanded = $('#grid' + this.gridName + '__id').width() > 100 ? true : false;
      gridStateObject.gridStateSwapping = $('#grid' + this.gridName).igGrid('option', 'columns');
      gridStateObject.oldIndex = this.oldColumnIndex;
      gridStateObject.newIndex = this.newColumnIndex;
      const verticalScroll = this.appStore.getData('resetScrollOnModify');
      if (verticalScroll === 'true') {
        gridStateObject.verticalScroll = 0;
        gridStateObject.iconLegendExpanded = 0;
        gridStateObject.filteringExpressions = 0;
        this.appStore.store('resetScrollOnModify', 'false');
      };
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

  public handleCheckboxStateChange(evt: any, ui: any) {

    if (ui.isHeader) {

      // Restore vertical scroll. This is meant to be a hack for DAYP.
      setTimeout(() => {

        $('#grid' + this.gridName).igGrid('virtualScrollTo', this.currentVerticalScrollPosition.toString());
        // this.currentHorizontalScrollPosition = document.getElementById('grid' + this.gridName + '_hscroller').scrollLeft;
      }, 0);

      if (ui.state === 'on') {
        this.displayGridLoadingOverlay = true;

        // Clear Earlier Selection.
        this.currentSelectedRows = [];
        this.allRowsSelected.emit(false);

        const currentData = $('#grid' + this.gridName).data('igGrid').dataSource.dataView();


        if (currentData.length > 0) {

          currentData.forEach((elm, index) => {

            if (elm.btbEndDate !== 'Bid Time') {
              this.currentSelectedRows.push({ rowKey: elm._id, rowIndex: ui.rowIndex });
            }

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

    } else {
      if (ui.state === 'on') {
        if (this.tableData.filter(id => id._id === ui.rowKey && (id.is_btb_running === 1 || id.is_btb_running === true)).length > 0) {
          this.currentSelectedRows.push({ rowKey: ui.rowKey, rowIndex: ui.rowIndex });
        }
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
      const bidPer = elm.offer_per_disc || elm.bid_percentage;
      return {
        'multimedia': {
          newArrival: elm.color_legends_json.new_arrival ? 'new-arrival' : 'null',
          bidToBuy: elm.color_legends_json.b2b ? 'bid-to-buy' : 'null',
          underBusinessProcess: elm.color_legends_json.business_process ? 'under-business-process' : 'null',
          recentlyUploaded: elm.color_legends_json.recently_uploaded ? 'recently-uploaded' : 'null',
          isTwin: elm.isTwin === 1 ? 'icon-Twin-Shape-Round' : 'null',
          isDDC: DDCClass,
          'recommended': elm.isRecommended === 1 ? 'srk-recommend' : 'null',
          'onhold': elm.isOnHold === 1 ? 'icon-hold-list-option-2' : 'null',
          'basket': elm.isBasket === 1 ? 'icon-cart' : 'null',
          'viewrequest': elm.totalViewRequest ? 'grid-icon icon-my-view' : 'null',
          'totalviewrequest': elm.totalViewRequest && elm.totalViewRequest > 1 ? elm.totalViewRequest : '',
          'havenote': elm.haveNote === true ? 'icon-note' : 'null',
          'notecount': elm.notes ? elm.notes.length : '',
          'addtopacket': elm.packet_count > 0 ? 'icon-packet-added text-green' : 'icon-packet-add',
          showHoldIcon: elm.showHoldIcon === true ? 'icon-hold-list-option-2' : 'null',
          // btobstate: elm.b2b_state === 1 ? elm.isBtbUpdated === 1 ? 'icon-b2b text-red' : 'icon-b2b text-green' : 'null',
          btobtooltip: elm.isBtbUpdated === 1 ? 'BID_SAVED' : (elm.isBtbUpdated === 2 ? 'FINAL_SUBMITTED' : 'B2B_ACTIVE'),
          'onlineview': (elm.totalViewed > -1 && !(elm.totalViewed === 0 && elm.totalViewedByUser === 0)) ? {
            class: 'grid-icon icon-online-view',
            totalviewed: elm.totalViewed,
            totalviewedbyuser: '/' + elm.totalViewedByUser,
            tooltip1: 'Others View: ' + elm.totalViewed,
            tooltip2: 'My View: ' + elm.totalViewedByUser
          } : { class: 'null' },
          isFlag: elm.countryCode ? 'stone-flag-icon' : 'null',
          countrycode: elm.countryCode,
          editedprice: elm.price_srk,
          final_submit_class: elm.final_submit ? 'btb-offer-final-saved' : 'offer-auto-saved',
          bid_rate: elm.bid_rate ? $.ig.formatter(elm.bid_rate, 'currency', '#.00') : '',
          bid_percentage: bidPer ? $.ig.formatter(bidPer, 'currency', '#.00') : '',
          editingEnabled: this.editingEnabled === true ? 'true' : 'false',
          btbEndTime: elm.is_btb_running ? elm.btb_enddatetime ?
            this.utilService.returnHTMLNeededDateTimeFormat(elm.btb_enddatetime, 'timeAMPM') : '' : 'Ended',
          isBtbRunning: elm.is_btb_running ? 'true' : 'false'
        },
        'btbEndDate': elm.is_btb_running ? elm.btb_enddatetime ?
          this.utilService.returnHTMLNeededDateTimeFormat(elm.btb_enddatetime, 'dateWithMonth') + ','
          + this.utilService.returnHTMLNeededDateTimeFormat(elm.btb_enddatetime, 'year') : '' : 'Bid Time',
        'diff': elm.offer_per_disc_diff || elm.difference,
        'offAmt': elm.bid_rate * elm.carat,
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
  afterGridRendered() {

    super.afterGridRendered();

  }

  afterGridRowsRendered() {

    super.afterGridRowsRendered();

    // this.initialisePriceInput();

  };

  initialisePriceInput() {
    $('.btb-grid-cell-amount-input').on('blur', (evt) => {
      let stone: any = this.resultObject.table.find(elm => { return elm._id === evt.target.dataset.id; });
      let price = evt.target.value;
      this.offerPriceForStoneUpdated.emit({ stone: stone, price: price });
      // $('#grid' + this.gridName).igGridUpdating('updateRow', stone.stone_id, stone[0]);
      stone = null;
      price = null;
    });
  }

  public getGridHeight(): number {
    let bufferHeight: any;
    const selectedStonePanelHeight: number = $('.selected-stone-panel-height-element').outerHeight();
    const headerHeight: number = $('#headerContainerId').outerHeight();
    const tabsElementHeight: number = $('.wrapper-search-tab').outerHeight();
    const colorLegendPanel: number = $('.color-lagend-panel').outerHeight();
    if (this.isBTBSelectedStonesGrid) {
      bufferHeight = 20;
    } else {
      bufferHeight = 110;
    }
    // Add all the heights.
    const totalHeight = Math.floor(
      (selectedStonePanelHeight + headerHeight + tabsElementHeight + colorLegendPanel) + bufferHeight
    );
    return Math.ceil(window.innerHeight - totalHeight);

  };

  focusTextBox(element, mouseClick) {
    if (element) {
      if (mouseClick) {
        const stringToFind = '[data-id=' + element + ']';
        if ($(stringToFind)) {
          $(stringToFind).focus();
        }
      } else {
        $(element).focus();
        this.currentFocusedInput = null;
      }
    }
  }

}
