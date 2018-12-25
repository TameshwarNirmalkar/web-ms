import {
    Component, OnChanges,
    SimpleChanges, OnInit, AfterViewInit, Input, TemplateRef, Output, EventEmitter
} from '@angular/core';
import { BtbInfraGridComponent } from '@srk/features/bid-to-buy/btb-infra-grid/btb-infra-grid.component';

declare var $: any;
declare var moment: any;

@Component({
    selector: 'app-btb-result-grid',
    templateUrl: './btb-result-infra-grid.component.html',
    styleUrls: ['./btb-result-infra-grid.component.scss']
})

export class BtbResultInfraGridComponent extends BtbInfraGridComponent implements OnInit, OnChanges, AfterViewInit {

    ngOnInit() {
        super.ngOnInit();
        setTimeout(() => {
            $('#gridbtbResultStone').igGridRowSelectors('destroy');
        }, 2000);
    }

    ngOnChanges() {

    }

    ngAfterViewInit() {

    }

    generateTableColumns() {

        //Status Column

        this.tableColumns.push({
            key: 'status',
            headerText: 'Status',
            width: '100px',
            originalWidth: this.columnWidths.dollarCt || '200px',
            dataType: 'string',
            columnIndex: 1,
            template: '{{if ${status} === "You Won"  }}' +
            '<div Class= "text-green"> ${status} </div>' +
            '{{else}}' +
            '<div Class= "text-green"> ${status} </div>' +
            '{{/if}}'
        });

        //Winning Rate Column

        this.tableColumns.push({
            key: 'win_rate',
            headerText: 'Winning Rate ',
            width: '100px',
            originalWidth: this.columnWidths.dollarCt || '200px',
            dataType: 'string',
            columnIndex: 2,

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
            columnIndex: this.userSelectedColumns.Certificate.order,
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
                '<div class="dayp-data-input-container"> ${price_srk} </div> <div Class= "text-green"> ${multimedia.bid_rate} </div>'
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
            let date = new Date(elm.btb_enddatetime);
            let bidPer = elm.offer_per_disc || elm.bid_percentage;
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
                    btobstate: elm.b2b_state === 1 ? 'icon-b2b' : 'null',
                    btobtooltip: elm.isBtbUpdated === 1 ? 'BID_SAVED' : (elm.isBtbUpdated === 2 ? 'FINAL_SUBMITTED' : 'B2B_ACTIVE'),
                    'onlineview': (elm.totalViewed > -1  && !(elm.totalViewed === 0 && elm.totalViewedByUser === 0)) ? {
                        class: 'grid-icon icon-online-view',
                        totalviewed: elm.totalViewed,
                        totalviewedbyuser: '/' + elm.totalViewedByUser,
                        tooltip1: 'Others View: ' + elm.totalViewed,
                        tooltip2: 'My View: ' + elm.totalViewedByUser
                    } : { class: 'null' },
                    isFlag: elm.countryCode ? 'stone-flag-icon' : 'null',
                    countrycode:  elm.countryCode,
                    editedprice: elm.price_srk,
                    final_submit_class: elm.final_submit ? 'btb-offer-final-saved' : 'offer-auto-saved',
                    bid_rate: elm.bid_rate ? $.ig.formatter(elm.bid_rate, 'currency', '#.00') : '',
                    bid_percentage: bidPer ? $.ig.formatter(bidPer, 'currency', '#.00') : '',
                    editingEnabled: this.editingEnabled === true ? 'true' : 'false',
                    btbEndDate: elm.btb_enddatetime ? moment(date).format("DD-MMM-YYYY") : '',
                    btbEndTime: elm.btb_enddatetime ? moment(date).format("hh:mm A") : '',
                },

                'status': elm.win_rate > 0 ? 'You Won' : 'You Lost',
                'win_rate': elm.win_rate > 0 ? elm.win_rate : '-',
                'offAmt': elm.bid_rate * elm.carat,
                'diff': elm.offer_per_disc_diff || elm.difference,
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


}
