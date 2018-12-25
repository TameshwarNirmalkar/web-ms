import { InclusionsComponent } from './../../search/specific-search/search-elements/inclusions/inclusions.component';
import { Component, OnInit, Output, EventEmitter, Input, OnChanges, SimpleChanges, HostListener } from '@angular/core';
import { InfraGridComponent } from '@srk/features/search';
import * as _ from 'underscore';
declare var $: any;

@Component({
  selector: 'app-dayp-grid',
  templateUrl: './dayp-grid.component.html',
  styleUrls: ['./dayp-grid.component.scss']
})

export class DaypGridComponent extends InfraGridComponent implements OnInit, OnChanges {

  @Input() offerColumnList: any;
  @Input() gridRefresh: Boolean;
  @Input() isEditableMode: any;
  @Input() daypStatus: any;
  @Input() editingEnabled: Boolean; // For Editing in BTB and DAYP Submitted.
  @Output() offerPriceForStoneUpdated: EventEmitter<any> = new EventEmitter<any>();
  @Output() offerPercentageForStoneUpdated: EventEmitter<any> = new EventEmitter<any>();
  @Output() offerPriceInput: EventEmitter<any> = new EventEmitter<any>();
  @Output() lastFocusedElement: EventEmitter<any> = new EventEmitter<any>();
  public currentFocusedInput: any;
  public textBoxElementPer: any;
  public textBoxElementAmt: any;
  ngOnInit() {

    super.ngOnInit();

    setTimeout(() => {
      if (this.isEditableMode === true) {
        $('#grid' + this.gridName).igGridRowSelectors('destroy');
      }
    }, 2000);

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

      if ($('.dayp-grid-cell-percentage-input').index(this) !== -1) {
        let index = $('.dayp-grid-cell-percentage-input').index(this);
        if (charCode === 40 || charCode === 13 || charCode === 9) {
          index = index + 1;
          // $(this).blur();
          let stone: any = me.resultObject.diamondTable.find(elm => { return elm._id === event.target.dataset.id; });
          let price = event.target.value;
          let offerSign = event.target.previousElementSibling ? event.target.previousElementSibling.value : 'minus';

          me.offerPercentageForStoneUpdated.emit({ stone: stone, price: price, offerSign: offerSign });

          stone = null;
          price = null;
          offerSign = null;

          $('.dayp-grid-cell-percentage-input:eq(' + index + ')').focus();

          setTimeout(() => {
            $('.dayp-grid-cell-percentage-input:eq(' + index + ')').select();
            me.currentFocusedInput = '.dayp-grid-cell-percentage-input:eq(' + index + ')';
            me.lastFocusedElement.emit({ element: '.dayp-grid-cell-percentage-input:eq(' + index + ')', mouseClick: false });
          }, 1000);
          $('body').css('overflow-y', 'hidden');
        }
        if (charCode === 38) {
          if (index !== 0) {
            index = index - 1;
          }

          // $(this).blur();
          let stone: any = me.resultObject.diamondTable.find(elm => { return elm._id === event.target.dataset.id; });
          let price = event.target.value;
          let offerSign = event.target.previousElementSibling ? event.target.previousElementSibling.value : 'minus';

          me.offerPercentageForStoneUpdated.emit({ stone: stone, price: price, offerSign: offerSign });

          stone = null;
          price = null;
          offerSign = null;

          $('.dayp-grid-cell-percentage-input:eq(' + index + ')').focus();

          setTimeout(() => {
            $('.dayp-grid-cell-percentage-input:eq(' + index + ')').select();
            me.currentFocusedInput = '.dayp-grid-cell-percentage-input:eq(' + index + ')';
            me.lastFocusedElement.emit({ element: '.dayp-grid-cell-percentage-input:eq(' + index + ')', mouseClick: false });
          }, 1000);
        }
        return true;
      }
      if ($('.dayp-grid-cell-amount-input').index(this) !== -1) {
        let index = $('.dayp-grid-cell-amount-input').index(this);
        if (charCode === 40 || charCode === 13 || charCode === 9) {
          index = index + 1;
          // $(this).blur();
          let stone: any = me.resultObject.diamondTable.find(elm => { return elm._id === event.target.dataset.id; });
          let price = event.target.value;

          me.offerPriceForStoneUpdated.emit({ stone: stone, price: price });

          stone = null;
          price = null;

          $('.dayp-grid-cell-amount-input:eq(' + index + ')').focus();

          setTimeout(() => {
            $('.dayp-grid-cell-amount-input:eq(' + index + ')').select();
            me.currentFocusedInput = '.dayp-grid-cell-amount-input:eq(' + index + ')';
            me.lastFocusedElement.emit({ element: me.currentFocusedInput, mouseClick: false });
          }, 1000);
          $('body').css('overflow-y', 'hidden');
        }
        if (charCode === 38) {
          if (index !== 0) {
            index = index - 1;
          }

          // $(this).blur();
          let stone: any = me.resultObject.diamondTable.find(elm => { return elm._id === event.target.dataset.id; });
          let price = event.target.value;

          me.offerPriceForStoneUpdated.emit({ stone: stone, price: price });

          stone = null;
          price = null;

          $('.dayp-grid-cell-amount-input:eq(' + index + ')').focus();

          setTimeout(() => {
            $('.dayp-grid-cell-amount-input:eq(' + index + ')').select();
            me.currentFocusedInput = '.dayp-grid-cell-amount-input:eq(' + index + ')';
            me.lastFocusedElement.emit({ element: me.currentFocusedInput, mouseClick: false });
          }, 1000);
        }
        return true;
      }
    });



    // $(document).delegate('#grid' + this.gridName, 'iggridcolumnmovingcolumnmoving', function (evt, args) {
    //   this.saveGridState();
    //   $("#grid" + this.gridName).igGridColumnMoving("moveColumn", args.columnKey, args.owner._activeMO.before, true, true);
    // });

    // $(document).delegate("#grid" + this.gridName, "iggridsortingcolumnsorting", function (evt, ui) {
    //   this.saveGridState();
    // });

    setTimeout(() => {
      $(document).delegate('#grid' + this.gridName, 'iggridcolumnmovingcolumnmoving', function (evt, args) {
        let scrollHeight;
        const daypSearchGrid = document.getElementById('griddaypSearchGrid_scrollContainer');
        const daypBasket = document.getElementById('griddaypBasketGrid_scrollContainer');
        scrollHeight = (daypSearchGrid !== null ? daypSearchGrid.scrollTop : (daypBasket !== null ? daypBasket.scrollTop : 0));
        $('#grid' + this.gridName).igGridColumnMoving('moveColumn', args.columnKey, args.owner._activeMO.before, true, true);
        setTimeout(() => {
          if (document.getElementById('griddaypSearchGrid_scrollContainer') !== null) {
            document.getElementById('griddaypSearchGrid_scrollContainer').scrollTop = scrollHeight;
          }
          if (document.getElementById('griddaypBasketGrid_scrollContainer') !== null) {
            document.getElementById('griddaypBasketGrid_scrollContainer').scrollTop = scrollHeight;
          }
        }, 300);
      });
    }, 2000);



  }
  @HostListener('document:click', ['$event'])
  onWindowsClick(event) {
    if ($(event.target).hasClass('dayp-grid-cell-percentage-input')) {
      if (event && event.srcElement && event.srcElement.dataset && event.srcElement.dataset.id &&
        this.textBoxElementPer && this.textBoxElementPer.dataset && this.textBoxElementPer.dataset.id &&
        event.srcElement.dataset.id !== this.textBoxElementPer.dataset.id) {
        this.storePercentageForMouseClick();
        this.focusTextBox(event.srcElement.dataset.id, true);
        this.lastFocusedElement.emit({ element: event.srcElement.dataset.id, mouseClick: true });
      }
      this.textBoxElementPer = event.target;
    } else {
      if (this.textBoxElementPer !== undefined) {
        this.storePercentageForMouseClick();
        this.lastFocusedElement.emit({ element: null, mouseClick: true });
        this.textBoxElementPer = undefined;
      }
    }
    if ($(event.target).hasClass('dayp-grid-cell-amount-input')) {
      if (event && event.srcElement && event.srcElement.dataset && event.srcElement.dataset.id &&
        this.textBoxElementAmt && this.textBoxElementAmt.dataset && this.textBoxElementAmt.dataset.id &&
        event.srcElement.dataset.id !== this.textBoxElementAmt.dataset.id) {
        this.storePricesForMouseClick();
        this.focusTextBox(event.srcElement.dataset.id, true);
        this.lastFocusedElement.emit({ element: event.srcElement.dataset.id, mouseClick: true });
      }
      this.textBoxElementAmt = event.target;
    } else {
      if (this.textBoxElementAmt !== undefined) {
        this.storePricesForMouseClick();
        this.lastFocusedElement.emit({ element: null, mouseClick: true });
        this.textBoxElementAmt = undefined;
      }
    }
  }

  storePricesForMouseClick() {
    const stone: any = this.resultObject.diamondTable.find(elm => { return elm._id === this.textBoxElementAmt.dataset.id; });
    const elementData = $('[data-id=' + this.textBoxElementAmt.dataset.id + ']');
    if (elementData) {
      for (let i = 0; i < elementData.length; i++) {
        if (elementData[i].tagName === 'INPUT') {
          this.offerPriceForStoneUpdated.emit({ stone: stone, price: elementData[i].value });
          break;
        }
      }
    }
  }

  storePercentageForMouseClick() {
    const stone: any = this.resultObject.diamondTable.find(elm => { return elm._id === this.textBoxElementPer.dataset.id; });
    const elementData = $('[data-id=' + this.textBoxElementPer.dataset.id + ']');
    if (elementData) {
      for (let i = 0; i < elementData.length; i++) {
        if (elementData[i].tagName === 'INPUT') {
          const offerSign = this.textBoxElementPer.previousElementSibling ? this.textBoxElementPer.previousElementSibling.value : 'minus';
          this.offerPercentageForStoneUpdated.emit({ stone: stone, price: elementData[i].value, offerSign: offerSign });
          break;
        }
      }
    }
  }

  ngOnChanges(changes: SimpleChanges) {

    // Call NgOnChanges On Parent to Maintain Base Grid Functionality.
    console.log("Events is from " + this.gridName, changes.stonesActedOn)
    super.ngOnChanges(changes);
    if (changes.stonesActedOn && changes.stonesActedOn.firstChange === false
      && changes.stonesActedOn.currentValue) {
      const gridHeight = this.getGridHeight();
      const scrollLeft = document.getElementById('grid' + this.gridName + '_displayContainer') ?
        document.getElementById('grid' + this.gridName + '_displayContainer').scrollLeft : 0;
      if (changes.stonesActedOn.currentValue.source && changes.stonesActedOn.currentValue.source === 'daypStoneStateUpdated') {

        // Remove stone from grid UI when stone is submitted.
        if (changes.stonesActedOn.currentValue.data.daypAction === 'daypSubmitted') {

          this.displayGridLoadingOverlay = true;
          console.log("Events is DAYP submitted from " + this.gridName, changes.stonesActedOn)
          changes.stonesActedOn.currentValue.data.stoneList.forEach((elm, index, sourceArray) => {

            this.currentSelectedRows = this.currentSelectedRows.filter(el => { return el.rowKey !== elm; });
            const grid = $('#grid' + this.gridName);
            const gridObj = grid.data('igGrid');
            if (grid.find('tr[data-id=' + elm + ']').length > 0) {
              grid.igGridUpdating('deleteRow', elm);
            } else {
              gridObj.dataSource.deleteRow(elm, true);
            }

            if (index === sourceArray.length - 1) {
              $('#grid' + this.gridName).igGrid('commit');
              this.displayGridLoadingOverlay = false;

            }

          });

        }

      }

      if (changes.stonesActedOn.currentValue.source
        && (changes.stonesActedOn.currentValue.source === 'DAYPStoneOfferUpdated' || changes.stonesActedOn.currentValue.source === 'daypPriceMidUpdated')) {
        let stoneObj = changes.stonesActedOn.currentValue.data || changes.stonesActedOn.currentValue.stoneObj;
        if (!_.isArray(stoneObj)) {
          stoneObj = [stoneObj];
        }
        let temp = this.transformDataForGrid(stoneObj);
        const grid = $('#grid' + this.gridName);
        const gridObj = grid.data('igGrid');
        console.log("Events is " + changes.stonesActedOn.currentValue.source + " from " + this.gridName, changes.stonesActedOn)

        if (grid.find('tr[data-id=' + temp[0]._id + ']').length > 0) {
          grid.igGridUpdating('updateRow', temp[0]._id, temp[0]);
        } else {
          gridObj.dataSource.updateRow(temp[0]._id, temp[0]);
        }
        setTimeout(() => {

          document.getElementById('grid' + this.gridName + '_scrollContainer').scrollTop = document.getElementById('grid' + this.gridName + '_scrollContainer').scrollTop + 5;
          document.getElementById('grid' + this.gridName + '_scrollContainer').scrollTop = document.getElementById('grid' + this.gridName + '_scrollContainer').scrollTop - 5;

          document.getElementById('grid' + this.gridName + '_displayContainer').scrollLeft = scrollLeft;

        }, 250);
        $('#grid' + this.gridName).igGrid('option', 'height', gridHeight);
        this.adjustScrollTopForFixedAndUnfixedDivs();
        // setTimeout(() => {
        //   if (this.currentFocusedInput) {
        //     $(this.currentFocusedInput).focus();
        //     $(this.currentFocusedInput).select();
        //     this.currentFocusedInput = null;
        //   }
        // }, 1000);

        // this.initialisePriceInput();
        // this.initialisePercentageInput();
        // this.initialisePercentageSignInput();

        this.displayGridLoadingOverlay = false;
        this.adjustScrollTopForFixedAndUnfixedDivs();
        temp = null;

      }
      if (changes.stonesActedOn.currentValue.source && changes.stonesActedOn.currentValue.source === 'offerOnSelectedStonesUpdated') {

        let temp = this.transformDataForGrid(this.resultObject.selectedStoneTable);
        const allStoneData = this.stoneDetailService.createStoneIdList(this.tableData);
        console.log("Events is " + changes.stonesActedOn.currentValue.source + " from " + this.gridName, changes.stonesActedOn)
        const grid = $('#grid' + this.gridName);
        const gridObj = grid.data('igGrid');
        const currentScroll = document.getElementById('grid' + this.gridName + '_scrollContainer') ?
          document.getElementById('grid' + this.gridName + '_scrollContainer').scrollTop : 0;
        if (changes.stonesActedOn.currentValue.isCancelled) {
          if (!this.isSelectedPanel) {
            temp = this.transformDataForGrid(this.resultObject.diamondTable);
          } else {
            temp = this.transformDataForGrid(this.tableData);
          }
          $('#grid' + this.gridName).igGrid('dataSourceObject', temp).igGrid('dataBind');
          setTimeout(() => {
            if (document.getElementById('grid' + this.gridName + '_scrollContainer')) {
              document.getElementById('grid' + this.gridName + '_scrollContainer').scrollTop = currentScroll;
            }
            $('#grid' + this.gridName).igGrid('option', 'height', gridHeight);
            this.displayGridLoadingOverlay = false;
          }, 500);
        } else {
          temp = this.transformDataForGrid(this.tableData);
          $('#grid' + this.gridName).igGrid('dataSourceObject', temp).igGrid('dataBind');
          this.displayGridLoadingOverlay = false;
          setTimeout(() => {
            if (document.getElementById('grid' + this.gridName + '_scrollContainer')) {
              document.getElementById('grid' + this.gridName + '_scrollContainer').scrollTop = currentScroll;
            }
            $('#grid' + this.gridName).igGrid('option', 'height', gridHeight);
          }, 500);
        }
        temp = null;
        this.adjustScrollTopForFixedAndUnfixedDivs();
      }
      if (changes.stonesActedOn.currentValue.status === 'overwrite' && this.gridName !== 'daypBasketGrid') {
        const temp = this.transformDataForGrid(this.tableData);
        console.log("Events is " + changes.stonesActedOn.currentValue.status + " from " + this.gridName, changes.stonesActedOn)
        $('#grid' + this.gridName).igGrid('dataSourceObject', temp).igGrid('dataBind');
        $('#grid' + this.gridName).igGrid('option', 'height', gridHeight);
        this.displayGridLoadingOverlay = false;
      }
      // if (changes.stonesActedOn.currentValue.source === 'noteAdded') {
      //   setTimeout(() => {
      //     var gridArray = [];
      //     gridArray = changes.stonesActedOn.currentValue.data;
      //     if (gridArray.length > 0) {
      //       gridArray.forEach((elem, index) => {
      //         let temp = this.transformDataForGrid([elem]);
      //         $('#grid' + this.gridName).igGridUpdating('updateRow', temp[0]._id, temp[0]);
      //       });
      //     }

      //   }, 0);

      // }
    }

    // if (changes.stonesActedOn.currentValue.source === 'overWriteExcel') {
    //   debugger
    //   console.log('1');
    //   let temp = this.transformDataForGrid([changes.stonesActedOn.currentValue.data]);

    // }
    if (changes.gridRefresh && changes.gridRefresh.currentValue) {
      const allStoneData = this.stoneDetailService.createStoneIdList(this.tableData)
      let gridArray = [];
      gridArray = changes.gridRefresh.currentValue;
      if (gridArray.length > 0) {
        console.log("Events is Refresh from " + this.gridName, changes.stonesActedOn)
        gridArray.forEach((elem, index) => {
          if (allStoneData.indexOf(elem.toString()) > -1) {
            $('#grid' + this.gridName).igGridUpdating('deleteRow', elem);
          }
        });
      }
    }


  }

  generateTableColumns() {

    if (this.isEditableMode === false) {
      this.tableColumns = [
        {
          key: 'multimedia',
          headerText: '',
          width: '25px',
          dataType: 'object',
          template: '<i class="grid-icon icon-media"></i>'
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
              { icon: '<span class="grid-icon-with-container ${multimedia.isFlag}" title="In Event"> <img src="${multimedia.countrycode}"> </span>' },
              { icon: '<span class="grid-icon-with-container"> <div class="icon-with-text my-one"> <span title="View Request" class="${multimedia.viewrequest}"></span> <label> <span> ${multimedia.totalviewrequest} </span> </label> </div> </span>' },
              { icon: '<span class="grid-icon-with-container"> <div class="icon-with-text  my-two"> <span class="${multimedia.onlineview.class}"></span> <label> <span title="${multimedia.onlineview.tooltip1}"> ${multimedia.onlineview.totalviewed} </span> <span title="${multimedia.onlineview.tooltip2}"> ${multimedia.onlineview.totalviewedbyuser} </span> </label> </div> </span>' },
            ]
          })
        },
      ];
    } else {
      this.tableColumns = [
        {
          key: 'multimedia',
          headerText: '',
          width: '25px',
          dataType: 'object',
          template: '<i class="grid-icon icon-media"></i>'
        },
        {
          key: '_id',
          headerText: '<span class="stoneIdGridHeader">Stone ID <i class="fa fa-arrow-right"></i></span>',
          enabled: true,
          index: 0,
          width: '70px',
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
              { icon: '<span class="grid-icon-with-container ${multimedia.isFlag}" title="In Event"> <img src="${multimedia.countrycode}"> </span>' },
              { icon: '<span class="grid-icon-with-container"> <div class="icon-with-text my-one"> <span title="View Request" class="${multimedia.viewrequest}"></span> <label> <span> ${multimedia.totalviewrequest} </span> </label> </div> </span>' },
              { icon: '<span class="grid-icon-with-container"> <div class="icon-with-text  my-two"> <span class="${multimedia.onlineview.class}"></span> <label> <span title="${multimedia.onlineview.tooltip1}"> ${multimedia.onlineview.totalviewed} </span> <span title="${multimedia.onlineview.tooltip2}"> ${multimedia.onlineview.totalviewedbyuser} </span> </label> </div> </span>' },
            ]
          })
        },
      ];
    }

    // Certificate Column
    this.tableColumns.push({
      key: 'certificate',
      headerText: 'Cert',
      width: this.columnWidths.cert || '200px',
      originalWidth: this.columnWidths.cert || '200px',
      dataType: 'string',
      columnIndex: this.userSelectedColumns.Certificate.order,
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
    if (this.isEditableMode === false && this.daypStatus === true) {
      if (this.userSelectedColumns.DollarCT.entity_value === true) {

        if (this.offerColumnList.dollar_ct.entity_value === true) {

          this.tableColumns.push({
            key: 'price_srk',
            headerText: '$/ct',
            width: this.columnWidths.dollarCt || '200px',
            originalWidth: this.columnWidths.dollarCt || '200px',
            dataType: 'number',
            format: '#.00',
            columnIndex: this.userSelectedColumns.DollarCT.order,
            template: '{{if ${multimedia.final_submit_class} === "offer-auto-saved" }}' +
              '<div class="dayp-data-input-container"> ${price_srk} <span> ' +
              '<input class=" numbervalidate dayp-grid-cell-input dayp-grid-cell-amount-input ${multimedia.final_submit_class}" type="text"' +
              ' data-id="${_id}" placeholder="Offer $/ct" value="${multimedia.dayp_rate}"> </span> ' +
              '</div>' +
              '{{else}}' +
              '<div class="dayp-data-input-container"> ${price_srk} </div> <div class="${multimedia.final_submit_class}"> ${multimedia.dayp_rate} </div>' +
              '{{/if}}'
          });

        } else {

          this.tableColumns.push({
            key: 'price_srk',
            headerText: '$/ct',
            width: this.columnWidths.dollarCt || '200px',
            originalWidth: this.columnWidths.dollarCt || '200px',
            dataType: 'number',
            format: '#.00',
            columnIndex: this.userSelectedColumns.DollarCT.order,
            template: '{{if ${multimedia.final_submit_class} === "offer-auto-saved" && ${multimedia.hasSign} === "true" }}' +
              '<div class="dayp-data-input-container"> ${price_srk} <span> ' +
              '<input class=" numbervalidate dayp-grid-cell-input dayp-grid-cell-amount-input ${multimedia.final_submit_class}" type="text"' +
              ' data-id="${_id}" placeholder="Offer $/ct" value="${multimedia.dayp_rate}"> </span> ' +
              '</div>' +
              '{{else}}' +
              '<div class="dayp-data-input-container"> ${price_srk} </div> <div class="${multimedia.final_submit_class}"> ${multimedia.dayp_rate} </div>' +
              '{{/if}}'
          });

        }

      }
    } else {
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
            '{{if ${multimedia.dayp_rate} }}' +
            '<div class="dayp-data-input-container"> ${price_srk} </div> <div class="${multimedia.final_submit_class}"> ${multimedia.dayp_rate} </div>' +
            '{{else}}' +
            '<div class="dayp-data-input-container"> ${price_srk} </div>' +
            '{{/if}}'
        });
      }

    }

    // Difference Column
    if (this.isEditableMode === false && this.daypStatus === true) {
      console.log("Diff per", this.userSelectedColumns.dayp_diff_per)
      if (this.userSelectedColumns.dayp_diff_per.entity_value === true) {

        this.tableColumns.push({
          key: 'difference',
          headerText: 'Diff%',
          width: this.columnWidths.diff_per || '200px',
          originalWidth: this.columnWidths.diff_per || '200px',
          dataType: 'number',
          format: '#.00',
          columnIndex: this.userSelectedColumns.dayp_diff_per.order,
          template: '<div class="${multimedia.difference_border_class}" title="${multimedia.difference_tooltip}"> ${difference} </div>'
        });
      }
    }

    // EOC Column For Dayp
    if (this.isEditableMode === false && this.daypStatus === true) {
      if (this.userSelectedColumns.dayp_eligible_offer_count.entity_value === true) {

        this.tableColumns.push({
          key: 'eoc',
          headerText: 'EOC',
          width: this.columnWidths.eoc || '200px',
          originalWidth: this.columnWidths.eoc || '200px',
          dataType: 'number',
          columnIndex: this.userSelectedColumns.dayp_eligible_offer_count.order,
          template: '<div title="EOC = Eligible Offer Count. Number of Offers With difference of -7% or Less">${eoc}</div>'
        });
      }
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
    if (this.isEditableMode === false && this.daypStatus === true) {
      if (this.userSelectedColumns.Off.entity_value === true) {

        if (this.offerColumnList.off_percentage.entity_value) {

          this.tableColumns.push({
            key: 'rap_off',
            headerText: 'OFF%',
            width: this.columnWidths.offer_per || '200px',
            originalWidth: this.columnWidths.offer_per || '200px',
            dataType: 'string',
            format: '#.00',
            columnIndex: this.userSelectedColumns.Off.order,
            template: '{{if ${multimedia.final_submit_class} === "offer-auto-saved" && ${multimedia.hasSign} === "true" }}' +
              '<div class="dayp-data-input-container"> ${rap_off} <div class="dayp-grid-cell-percentage-inputs-container"> ' +
              // '<select data-id="${_id}" class="dayp-grid-cell-percentage-input--sign-select"> ' +
              // '<option value="plus" ${multimedia.plusSign}> + </option> <option value="minus" ${multimedia.minusSign}> - </option> ' +
              // '</select>' +
              // '<input class=" numbervalidate dayp-grid-cell-input dayp-grid-cell-percentage-input ${multimedia.final_submit_class}" type="text"' +
              // ' data-id="${_id}" placeholder="Offer %" value="${multimedia.daypPer}"> </div> ' +
              '<div class="${multimedia.final_submit_class}"> ${multimedia.plusSignForPre} ${multimedia.daypPer} </div>' +
              '</div>' +
              '{{elseif ${multimedia.final_submit_class} === "offer-auto-saved" && ${multimedia.hasSign} === "false" }}' +
              '<div class="dayp-data-input-container"> ${rap_off} <div class="dayp-grid-cell-percentage-inputs-container"> ' +
              '<input class=" numbervalidate dayp-grid-cell-input dayp-grid-cell-percentage-input ${multimedia.final_submit_class}" type="text"' +
              ' data-id="${_id}" placeholder="Offer %" value="${multimedia.daypPer}"> </div> ' +
              '</div>' +
              '{{else}}' +
              '<div class="dayp-data-input-container"> ${rap_off} </div> <div class="${multimedia.final_submit_class}"> ${multimedia.plusSignForPre} ${multimedia.daypPer} </div>' +
              '{{/if}}'
          });

        } else {

          this.tableColumns.push({
            key: 'rap_off',
            headerText: 'OFF%',
            width: this.columnWidths.offer_per || '200px',
            originalWidth: this.columnWidths.offer_per || '200px',
            dataType: 'string',
            format: '#.00',
            columnIndex: this.userSelectedColumns.Off.order,
            template: '<div class="dayp-data-input-container"> ${rap_off} </div> <div class="${multimedia.final_submit_class}">${multimedia.plusSignForPre} ${multimedia.daypPer} </div>'
          });

        }

      }
    } else {
      if (this.userSelectedColumns.Off.entity_value === true) {
        this.tableColumns.push({
          key: 'rap_off',
          headerText: 'OFF%',
          width: this.columnWidths.offer_per || '200px',
          originalWidth: this.columnWidths.offer_per || '200px',
          dataType: 'string',
          format: '#.00',
          columnIndex: this.userSelectedColumns.Off.order,
          template:
            '{{if ${multimedia.daypPer} }}' +
            '<div class="dayp-data-input-container"> ${rap_off} </div> <div class="${multimedia.final_submit_class}"> ${multimedia.plusSignForPre} ${multimedia.daypPer} </div>' +
            '{{else}}' +
            '<div class="dayp-data-input-container"> ${rap_off} </div>' +
            '{{/if}}'
        });
      }
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

    // Add to packet Icon
    if (this.visiblePacketIcon) {

      this.tableColumns.unshift({
        key: 'addtopacket',
        headerText: '<i class="grid-icon icon-packet-add"></i>',
        width: '25px',
        dataType: 'string',
        template: '<i class="grid-icon ${addtopacket}" title="Select Packet"></i>'
      });

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


      return {
        'multimedia': {
          newArrival: elm.color_legends_json.new_arrival ? 'new-arrival' : 'null',
          bidToBuy: elm.color_legends_json.b2b ? 'bid-to-buy' : 'null',
          underBusinessProcess: elm.color_legends_json.business_process ? 'under-business-process' : 'null',
          recentlyUploaded: elm.color_legends_json.recently_uploaded ? 'recently-uploaded' : 'null',
          isTwin: elm.isTwin === 1 ? 'icon-Twin-Shape-Round' : 'null',
          isDDC: DDCClass,
          'recommended': elm.isRecommended === 1 ? 'icon-recommended' : 'null',
          'onhold': elm.isOnHold === 1 ? 'icon-hold-list-option-2' : 'null',
          'basket': elm.isBasket === 1 ? 'icon-cart' : 'null',
          'viewrequest': elm.totalViewRequest ? 'grid-icon icon-my-view' : 'null',
          'totalviewrequest': elm.totalViewRequest && elm.totalViewRequest > 1 ? elm.totalViewRequest : '',
          'havenote': elm.haveNote === true ? 'icon-note' : 'null',
          'notecount': elm.notes ? elm.notes.length : '',
          'addtopacket': elm.packet_count > 0 ? 'icon-packet-added text-green' : 'icon-packet-add',
          showHoldIcon: elm.showHoldIcon === true ? 'icon-hold-list-option-2' : 'null',
          btobstate: elm.b2b_state === 1 ? 'icon-b2b' : 'null',
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
          dayp_rate: elm.dayp_rate ? $.ig.formatter(elm.dayp_rate, 'currency', '#.00') : '',
          final_submit_class: elm.final_submit ? 'offer-final-saved' : 'offer-auto-saved',
          difference_border_class: elm.difference != null ? elm.difference * -1 <= 7 ? 'borderGreen' : 'borderRed' : '',
          difference_tooltip: elm.difference != null ? elm.difference * -1 <= 7 ? 'This is an Eligible offer.' : 'This is an Ineligible offer.' : '',
          hasSign: elm.rap_off.charAt(0) === '+' || elm.rap_off.charAt(0) === '-' ? 'true' : 'false',
          plusSign: elm.offerSign === 'plus' ? 'selected' : '',
          minusSign: elm.offerSign === 'plus' ? '' : 'selected',
          editingEnabled: this.editingEnabled === true ? 'true' : 'false',
          price_rap: elm.price_rap,
          plusSignForPre: Number(elm.dayp_rate) > Number(elm.price_rap) ? '+' : '',
          daypPer: elm.dayp_per
        },
        '_id': elm._id,
        'certificate': elm.certificate.short_value,
        'clarity': elm.clarity.short_value,
        'color': elm.color.short_value,
        'carat': elm.carat,
        'cut': elm.cut.short_value,
        'amount': elm.amount,
        'price_srk': elm.price_srk,

        'eoc': elm.daypOfferCount || 0,
        // 'difference': elm.difference ? elm.difference.toString().replace('+', '').replace('-', '') : '',
        'difference': elm.difference,

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
        'recommended': elm.isRecommended === 1 ? 'icon-recommended' : 'null',
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

    // Setup OnBlur Event Listeners for the price Inputs.
    // this.initialisePriceInput();

    // // Setup OnBlur Event Listeners for the Percentage Inputs.
    // this.initialisePercentageInput();

    // // Setup listener for change on select tag so that when the select tags value is change we can update the ui.
    // // This is basically because we need to clear/reset the input values on sign change.
    // this.initialisePercentageSignInput();

  };

  saveGridState() {

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

      // gridStateObject.horizontalScroll = document.getElementById('grid' + this.gridName + '_hscroller').scrollLeft || 0;
      gridStateObject.verticalScroll = document.getElementById('grid' + this.gridName + '_scrollContainer') ? document.getElementById('grid' + this.gridName + '_scrollContainer').scrollTop : 0;
      // gridStateObject.searchString = this.searchInput.nativeElement.value;
      // gridStateObject.sortingState = $('#grid' + this.gridName).igGridSorting('option', 'columnSettings');
      if ($('#grid' + this.gridName).data('igGrid') && $('#grid' + this.gridName).data('igGrid').dataSource && $('#grid' + this.gridName).data('igGrid').dataSource.settings && $('#grid' + this.gridName).data('igGrid').dataSource.settings.filtering && $('#grid' + this.gridName).data('igGrid').dataSource.settings.filtering.expressions) {
        gridStateObject.filteringExpressions = $('#grid' + this.gridName).data('igGrid').dataSource.settings.filtering.expressions;
      }
      gridStateObject.iconLegendExpanded = $('#grid' + this.gridName + '__id').width() > 100 ? true : false;
      gridStateObject.gridStateSwapping = $('#grid' + this.gridName).igGrid('option', 'columns');
      gridStateObject.oldIndex = this.oldColumnIndex;
      gridStateObject.newIndex = this.newColumnIndex;
      const verticalScroll = this.appStore.getData("resetScrollOnModify");
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

  // Setup OnBlur Event Listeners for the price Inputs. For DAYP Only.
  public initialisePriceInput(): void {

    $('.dayp-grid-cell-amount-input').on('blur', (evt) => {

      let stone: any = this.resultObject.diamondTable.find(elm => { return elm._id === evt.target.dataset.id; });
      let price = evt.target.value;

      this.offerPriceForStoneUpdated.emit({ stone: stone, price: price });

      stone = null;
      price = null;

    });

    $('.dayp-grid-cell-amount-input').on('keyup', evt => {

      if (evt.target.value && isNaN(evt.target.value)) {

        let tempStr = evt.target.value;

        for (let i = 0; i < evt.target.value.length; i++) {

          if (isNaN(evt.target.value.charAt(i))) {

            if (evt.target.value.charAt(i) !== '.') {

              tempStr = tempStr.substring(0, i) + tempStr.substring(i + 1);

            }

          }

        }

        $(evt.target).val(tempStr);

        tempStr = null;

      }

    });

  }


  // Setup OnBlur Event Listeners for the Percentage Inputs. For DAYP Only.
  public initialisePercentageInput(): void {

    $('#grid' + this.gridName).off('blur', '.dayp-grid-cell-percentage-input');

    $('#grid' + this.gridName).on('blur', '.dayp-grid-cell-percentage-input', (evt) => {

      let stone: any = this.resultObject.diamondTable.find(elm => { return elm._id === evt.target.dataset.id; });
      let price = evt.target.value;
      let offerSign = evt.target.previousElementSibling ? evt.target.previousElementSibling.value : 'minus';

      this.offerPercentageForStoneUpdated.emit({ stone: stone, price: price, offerSign: offerSign });

      stone = null;
      price = null;
      offerSign = null;

    });

    // $('#grid' + this.gridName).off('keyup', '.dayp-grid-cell-percentage-input');

    // $('#grid' + this.gridName).on('keyup', '.dayp-grid-cell-percentage-input', evt => {

    //   if (evt.target.value && isNaN(evt.target.value)) {

    //     let tempStr = evt.target.value;

    //     for (let i = 0; i < evt.target.value.length; i++) {

    //       if (isNaN(evt.target.value.charAt(i))) {

    //         if (evt.target.value.charAt(i) !== '.') {

    //           tempStr = tempStr.substring(0, i) + tempStr.substring(i + 1);

    //         }

    //       }

    //     }

    //     $(evt.target).val(tempStr);

    //     tempStr = null;

    //   }

    // });

    // $('#grid' + this.gridName).off('keydown', '.dayp-grid-cell-percentage-input');

    // $('#grid' + this.gridName).on('keydown', '.dayp-grid-cell-percentage-input', evt => {

    // });


  }

  // Setup listener for change on select tag so that when the select tags value is change we can update the ui.
  // This is basically because we need to clear/reset the input values on sign change.
  // For DAYP Only
  public initialisePercentageSignInput(): void {

    $('.dayp-grid-cell-percentage-input--sign-select').on('change', (evt) => {

      let stone: any = this.resultObject.diamondTable.find(elm => { return elm._id === evt.target.dataset.id; });

      stone.difference = null;
      stone.dayp_rate = '';
      stone.offerSign = evt.target.value === 'plus' ? '+' : '-';

      stone = this.transformDataForGrid([stone]);

      // $('#grid' + this.gridName).igGridUpdating('updateRow', stone[0]._id, stone[0]);

      // Setup OnBlur Event Listeners for the price Inputs.
      this.initialisePriceInput();

      // Setup OnBlur Event Listeners for the Percentage Inputs.
      this.initialisePercentageInput();

      // Setup listener for change on select tag so that when the select tags value is change we can update the ui.
      // This is basically because we need to clear/reset the input values on sign change.
      // this.initialisePercentageSignInput();

      stone = null;

    });

  }

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
