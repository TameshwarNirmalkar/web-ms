import { Component, OnChanges, OnInit } from '@angular/core';
import { InfraGridComponent } from '../../../infra-grid/infra-grid.component';

declare var $: any;

@Component({
  selector: 'app-selected-stones-panel-grid',
  templateUrl: './selected-stones-panel-grid.component.html',
  styleUrls: ['./selected-stones-panel-grid.component.scss']
})

export class SelectedStonesPanelGridComponent extends InfraGridComponent implements OnInit, OnChanges {

  ngOnInit() {

    super.ngOnInit();
    this.calculatedGridHeight = ($('#grid' + this.gridName.replace('selectedStoneGrid', '')).igGrid('option', 'height') - 5);

  }

  generateTableColumns() {

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

    // oAmount Column
    this.tableColumns.push({
      key: 'oAmount',
      headerText: 'O. Amount($)',
      width: 90,
      originalWidth: 90,
      dataType: 'number',
      format: '#.00',
      columnIndex: 0
    });

    // Online % Column
    if (this.authService.hasElementPermission('blind_discount')) {
      this.tableColumns.push({
        key: 'onlinePercent',
        headerText: 'Online %',
        width: this.widthInfo.online_per || '200px',
        originalWidth: this.widthInfo.online_per || '200px',
        dataType: 'number',
        format: '#.00',
        columnIndex: 1
      });
    }

    // Term % Column
    if (this.authService.hasElementPermission('terms_discount')) {
      this.tableColumns.push({
        key: 'termPercent',
        headerText: 'Term %',
        width: this.widthInfo.term || '200px',
        originalWidth: this.widthInfo.term || '200px',
        dataType: 'number',
        format: '#.00',
        columnIndex: 2
      });
    }

    // WVD % Column
    if (this.authService.hasElementPermission('weekly_volume_discount')) {
      this.tableColumns.push({
        key: 'wvdPercent',
        headerText: 'WVD %',
        width: this.widthInfo.wvd || '200px',
        originalWidth: this.widthInfo.wvd || '200px',
        dataType: 'number',
        format: '#.00',
        columnIndex: 3
      });
    }

    // Co-Op % Column
    if (this.authService.hasElementPermission('co_op_discount')) {
      this.tableColumns.push({
        key: 'coopPercent',
        headerText: 'Co-Op %',
        width: this.widthInfo.coop || '200px',
        originalWidth: this.widthInfo.coop || '200px',
        dataType: 'number',
        format: '#.00',
        columnIndex: 3
      });
    }

    // Event % Column
    if (this.authService.hasElementPermission('event_discount')) {
      this.tableColumns.push({
        key: 'eventPercent',
        headerText: 'Event %',
        width: this.widthInfo.event || '200px',
        originalWidth: this.widthInfo.event || '200px',
        dataType: 'number',
        format: '#.00',
        columnIndex: 4
      });
    }

    // F. $/ct. Column
    if (this.stoneDetailService.showFinalPayableAndFinalOff()) {
      this.tableColumns.push({
        key: 'fDollarCaratAmount',
        headerText: 'F. $/ct.',
        width: this.widthInfo.final_price || '200px',
        originalWidth: this.widthInfo.final_price || '200px',
        dataType: 'number',
        format: '#.00',
        columnIndex: 5
      });

      // F. Off % Column final_off
      this.tableColumns.push({
        key: 'fOffPercent',
        headerText: 'F. Off %',
        width: this.widthInfo.final_off || '200px',
        originalWidth: this.widthInfo.final_off || '200px',
        dataType: 'string',
        format: '#.00',
        columnIndex: 6
      });

      // F. Amount($) Column final_amount
      this.tableColumns.push({
        key: 'fAmount',
        headerText: 'F. Amount($)',
        width: this.widthInfo.final_amount || '200px',
        originalWidth: this.widthInfo.final_amount || '200px',
        dataType: 'number',
        format: '#.00',
        columnIndex: 7
      });
    }
    // Certificate Column
    this.tableColumns.push({
      key: 'certificate',
      headerText: 'Cert',
      width: this.columnWidths.cert || '200px',
      originalWidth: this.columnWidths.cert || '200px',
      dataType: 'string',
      columnIndex: this.userSelectedColumns.Certificate.order + 7,
      /*template: '{{if ${certificate_no} !== ""  }}' +
        '<a class="grid-cell-links" href="https://pck2.azureedge.net/stone-multimedia/stone-multimedia.htm?stoneIds=${_id}&showMediaType=PDF" target="_blank"> ${certificate} </a>' +
        '{{else}}' +
        '<span class="grid-cell-links"> ${certificate} </span>' +
        '{{/if}}'*/
    });


    // Shape Column
    this.tableColumns.push({
      key: 'shape',
      headerText: 'Shape',
      width: this.columnWidths.shape || '200px',
      originalWidth: this.columnWidths.shape || '200px',
      dataType: 'string',
      columnIndex: this.userSelectedColumns.Shape.order + 7
    });

    // Clarity Column
    this.tableColumns.push({
      key: 'clarity',
      headerText: 'Clarity',
      width: this.columnWidths.clarity || '200px',
      originalWidth: this.columnWidths.clarity || '200px',
      dataType: 'string',
      columnIndex: this.userSelectedColumns.Clarity.order + 7
    });

    // Color Column
    this.tableColumns.push({
      key: 'color',
      headerText: 'Colour',
      width: this.columnWidths.color || '200px',
      originalWidth: this.columnWidths.color || '200px',
      dataType: 'string',
      columnIndex: this.userSelectedColumns.Colour.order + 7
    });


    // Carat Column
    this.tableColumns.push({
      key: 'carat',
      headerText: 'Carat',
      width: this.columnWidths.carat || '200px',
      originalWidth: this.columnWidths.carat || '200px',
      dataType: 'number',
      format: '#.00',
      columnIndex: this.userSelectedColumns.Carat.order + 7
    });

    // Cut Column
    this.tableColumns.push({
      key: 'cut',
      headerText: 'Cut',
      width: this.columnWidths.cut || '200px',
      originalWidth: this.columnWidths.cut || '200px',
      dataType: 'string',
      columnIndex: this.userSelectedColumns.cut.order + 7
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
        columnIndex: this.userSelectedColumns.DollarCT.order + 7
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
        columnIndex: this.userSelectedColumns.Amount.order + 7
      });

    }

    // Off Column
    if (this.userSelectedColumns.Off.entity_value === true) {

      this.tableColumns.push({
        key: 'rap_off',
        headerText: 'OFF%',
        width: this.columnWidths.off + 10 || '200px',
        originalWidth: this.columnWidths.off + 10 || '200px',
        dataType: 'string',
        format: '#.00',
        columnIndex: this.userSelectedColumns.Off.order + 7
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
        columnIndex: this.userSelectedColumns.polish.order + 7
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
        columnIndex: this.userSelectedColumns.symmetry.order + 7
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
        columnIndex: this.userSelectedColumns.fluorescence.order + 7
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
        columnIndex: this.userSelectedColumns.Measurement.order + 7
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
        columnIndex: this.userSelectedColumns.DR.order + 7
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
        columnIndex: this.userSelectedColumns.Tab.order + 7
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
        columnIndex: this.userSelectedColumns.Td.order + 7
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
        columnIndex: this.userSelectedColumns.shade.order + 7
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
        columnIndex: this.userSelectedColumns.luster.order + 7
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
        columnIndex: this.userSelectedColumns.table_white.order + 7
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
        columnIndex: this.userSelectedColumns.side_white.order + 7
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
        columnIndex: this.userSelectedColumns.table_black.order + 7
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
        columnIndex: this.userSelectedColumns.side_black.order + 7
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
        columnIndex: this.userSelectedColumns.SGS.order + 7,
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
        columnIndex: this.userSelectedColumns.table_spot.order + 7
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
        columnIndex: this.userSelectedColumns.side_spot.order + 7
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
        columnIndex: this.userSelectedColumns.table_open.order + 7
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
        columnIndex: this.userSelectedColumns.crown_open.order + 7
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
        columnIndex: this.userSelectedColumns.pav_open.order + 7
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
        columnIndex: this.userSelectedColumns.girdle_open.order + 7
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
        columnIndex: this.userSelectedColumns.table_EF.order + 7
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
        columnIndex: this.userSelectedColumns.crown_EF.order + 7
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
        columnIndex: this.userSelectedColumns.crown_EF.order + 7
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
        columnIndex: this.userSelectedColumns.pav_EF.order + 7
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
        columnIndex: this.userSelectedColumns.Key_To_Symbol.order + 7
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
        columnIndex: this.userSelectedColumns.Lab_Comments.order + 7
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
        columnIndex: this.userSelectedColumns.GirdlePer.order + 7
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
        columnIndex: this.userSelectedColumns.HandA.order + 7
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
        columnIndex: this.userSelectedColumns.Certificate_No.order + 7
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
        columnIndex: this.userSelectedColumns.Rap_Dollar_CT.order + 7
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
        columnIndex: this.userSelectedColumns.Eligible.order + 7
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
          'recommended': elm.isRecommended === 1 ? 'srk-recommend' : 'null',
          'onhold': elm.isOnHold === 1 ? 'icon-hold-list-option-2' : 'null',
          'basket': elm.isBasket === 1 ? 'icon-cart' : 'null',
          'viewrequest': elm.totalViewRequest ? 'grid-icon icon-my-view' : 'null',
          'totalviewrequest': elm.totalViewRequest && elm.totalViewRequest > 1 ? elm.totalViewRequest : '',
          'havenote': elm.haveNote === true ? 'icon-note' : 'null',
          'notecount': elm.notes ? elm.notes.length : '',
          'addtopacket': elm.packet_count > 0 ? 'icon-packet-added text-green' : 'icon-packet-add',
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
          editedprice: elm.price_srk
        },
        '_id': elm._id,

        oAmount: elm.oAmount,
        onlinePercent: elm.onlinePercent,
        termPercent: elm.termPercent,
        wvdPercent: elm.wvdPercent,
        coopPercent: elm.coopPercent,
        eventPercent: elm.eventPercent,
        fDollarCaratAmount: elm.fDollarCaratAmount,
        fOffPercent: elm.fOffPercent,
        fAmount: elm.fAmount,

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

  public handleCheckboxStateChange(evt: any, ui: any) {

    if (ui.isHeader) {

      if (ui.state === 'off') {

        this.displayGridLoadingOverlay = true;

        const currentData = $('#grid' + this.gridName).data('igGrid').dataSource.dataView();
        const allData = $('#grid' + this.gridName).data('igGrid').dataSource.data();
        const tempArray: any[] = [];

        if (allData.length === currentData.length) {

          this.currentSelectedRows = [];
          this.singleRowSelected.emit(allData);

        } else {

          currentData.forEach((elm, index) => {

            this.currentSelectedRows = this.currentSelectedRows.filter(elem => { return !(elm.id === elem.rowKey); });
            tempArray.push({ '_id': elm._id });


            if (index === (currentData.length - 1)) {

              tempArray.forEach((elem, idx) => {

                $('#grid' + this.gridName).igGridUpdating('deleteRow', elem._id);

                if (idx === tempArray.length - 1) {

                  $('#grid' + this.gridName).igGrid('commit');
                  $('.ui-iggrid-virtualrow').css('height', '32px');
                  $('#grid' + this.gridName).igGridColumnFixing('checkAndSyncHeights');

                  // Re-Select all the remaining rows.
                  for (let i = 0; i < this.currentSelectedRows.length; i++) {

                    $('#grid' + this.gridName).igGridSelection('selectRowById', this.currentSelectedRows[i].rowKey);

                  }

                  this.displayGridLoadingOverlay = false;
                  this.singleRowSelected.emit(tempArray);

                }

              });

            }

          });

        }

      } else {

        /*
        const currentData = $('#grid' + this.gridName).data('igGrid').dataSource.dataView();
        const allData = $('#grid' + this.gridName).data('igGrid').dataSource.data();
        const  tempArray = [];

        this.currentSelectedRows.forEach((elm, index) => {

          let temp = allData.find( elem => { return elm.rowKey === elem._id; });

          if (temp) {

            tempArray.push(temp);

          }

          temp = null;

          if ( index === this.currentSelectedRows.length - 1) {

            for ( let i = 0; i < currentData.length; i++ ) {

              let tempIndex = tempArray.findIndex( e => { return e._id === currentData[i]._id; });

              if (tempIndex > -1) {

                tempArray.splice(tempIndex, 1);

              }

              tempIndex = null;

            }

            this.displayGridLoadingOverlay = false;
            this.singleRowSelected.emit(tempArray);

            this.currentSelectedRows = tempArray.map( (el, idx) => {

              // $('#grid' + this.gridName).igGridSelection('selectRowById', el._id);
              return {rowKey: el._id, rowIndex: idx};


            });

          }

        });

        */

      }

    } else {

      if (ui.state === 'on') {

        this.currentSelectedRows.push({ rowKey: ui.rowKey, rowIndex: ui.rowIndex });
        // this.singleRowSelected.emit({stoneId: ui.rowKey, added: true});

      } else {

        // Filtered Stones check needed since selected stones cn be removed from the selection panels
        // which leave the grid out of sync and produce weird selection results.
        // Basically shows calculation for stone that are selected even if they are not.
        if (this.resultObject.filteredStone.length === 0) {

        } else {

          this.currentSelectedRows = this.currentSelectedRows.filter(elm => {
            return elm.rowKey !== ui.rowKey;
          });

          $('#grid' + this.gridName).igGridUpdating('deleteRow', ui.rowKey);

          $('#grid' + this.gridName).igGridSelection('clearSelection');

          $('#grid' + this.gridName).igGrid('commit');
          $('.ui-iggrid-virtualrow').css('height', '32px');
          $('#grid' + this.gridName).igGridColumnFixing('checkAndSyncHeights');

          this.currentSelectedRows.forEach(elm => {

            $('#grid' + this.gridName).igGridSelection('selectRowById', elm.rowKey);

          });

          this.singleRowSelected.emit({ stoneId: ui.rowKey, added: false });

        }

      }

    }

  }

}
