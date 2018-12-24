import { Injectable } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ErrorHandlerService } from '@srk/core';
import { ApplicationDataService } from '@srk/core';
import { ApplicationStorageService } from '@srk/core';
import { UserProfileService } from '@srk/core';
import { CustomDatePipe } from '../pipes/custom-date.pipe';

declare var $: any;

@Injectable()
export class UtilService {

  public scrollBarWidths = 40;
  public dateFormat: any;

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService,
    private applicationDataService: ApplicationDataService,
    private appStore: ApplicationStorageService,
    private userProfileService: UserProfileService,
    private customDatePipe: CustomDatePipe
  ) { }

  tranformDate(date, format): any {
    let dateTime;
    this.dateFormat = format;

    switch (format) {
      case 'yyyy-MM-dd HH:mm':
        dateTime = this.getFormatDate(date) + ' ' + this.getFormatTime(date);
        break;
      case 'dd-MoM-yyyy':
        dateTime = this.getFormatDate(date);
        break;
      case 'dd-MM-yyyy':
        dateTime = this.getFormatDate(date);
        break;
      case 'HH:mm':
        dateTime = this.getFormatTime(date);
        break;
      case 'HH:mm:ss':
        dateTime = this.getFormatTime(date);
        break;
      case 'yyyy-MM-dd':
        dateTime = this.getFormatDate(date);
        break;
      default:
        dateTime = new Date(date);
        const datePipe = new DatePipe('IST');
        dateTime = datePipe.transform(dateTime, format);
        break;
    }
    return dateTime;
  }

  getFormatDate(selectedDate): string {
    const formatDateUTC = new Date(selectedDate);
    const year = formatDateUTC.getFullYear();
    if (!isNaN(year)) {
      const date = formatDateUTC.getDate();
      const month = formatDateUTC.getMonth() + 1;
      const formatDay = date < 10 ? '0' + date : date;
      const formatMonth = month < 10 ? '0' + month : month;
      let dateGenerated;
      if (this.dateFormat.indexOf('dd-MoM-yyyy') > -1) {
        const currentMonthName = selectedDate.toLocaleString('en-us', { month: 'short' });
        dateGenerated = `${formatDay} ${currentMonthName} ${year}`;
      } else if (this.dateFormat.indexOf('dd-MM-yyyy') > -1) {
        dateGenerated = `${formatDay}-${formatMonth}-${year}`;
      } else {
        dateGenerated = `${year}-${formatMonth}-${formatDay}`;
      }
      return dateGenerated;
    } else {
      const formatDate = '';
      const dateParts = selectedDate ? selectedDate.split(' ') : null;
      const dateString = dateParts ? dateParts[0] : null;
      return dateString.toString();
    }
  }

  returnHTMLNeededDateTimeFormat(date, format) {
    return this.customDatePipe.transform(date, format);
  }

  getFormatTime(selectedDate): string {
    const formatTime = new Date(selectedDate);
    const hour = formatTime.getHours();
    if (!isNaN(hour)) {
      const minute = formatTime.getMinutes();
      const second = formatTime.getSeconds();
      const formatHour = hour < 10 ? '0' + hour : hour;
      const formatMinute = minute < 10 ? '0' + minute : minute;
      const formatSecond = second < 10 ? '0' + second : second;
      if (this.dateFormat.indexOf('HH:mm:ss') > -1) {
        return `${formatHour}:${formatMinute}:${formatSecond}`;
      } else {
        return `${formatHour}:${formatMinute}`;
      }
    } else {
      let time = '';
      const dateParts = selectedDate.split(' ');
      const timeString = dateParts.length === 2 ? dateParts[1] : null;
      const timeParts = timeString ? timeString.split(':') : null;
      const hours = timeParts ? timeParts[0] : null;
      const minutes = timeParts ? timeParts[1] : null;
      if (hours && minutes) {
        time = hours + ':' + minutes;
      }
      return time.toString();
    }
  }

  updateStonesForDecimal(stoneList: any[]) {
    if (stoneList && stoneList.length > 0) {
      stoneList.forEach(stone => {
        stone.cut_pol_sym_fluor = stone.cut.short_value + ' - ' + stone.polish.short_value + ' - '
          + stone.symmetry.short_value + ' - ' + stone.fluor.short_value;
        stone.measurement = stone.length + ' - ' + stone.width + ' * ' + stone.height;
        stone.sl = stone.shade.short_value + '/' + stone.luster.short_value;
        stone.ts_sp = stone.table_spot.short_value + '/' + stone.side_spot.short_value;
        stone.to_co_po_go = stone.table_open.short_value + '/' + stone.crown_open.short_value + '/'
          + stone.pav_open.short_value + '/' + stone.girdle_open.short_value;
        stone.tfe_cfe_pfe = stone.table_extra_facet.short_value + '/' + stone.crown_extra_facet.short_value + '/'
          + stone.pav_extra_facet.short_value;
        stone.white_template = stone.table_white.short_value + '/' + stone.side_white.short_value;
        stone.black_template = stone.table_black.short_value + '/' + stone.side_black.short_value;
        stone.price_srk = parseFloat(stone.price_srk).toFixed(2);
        stone.amount = parseFloat(String(stone.price_srk * stone.carat)).toFixed(2);
      });
    }
    return stoneList;
  }

  checkISTtime() {
    const currentTime = new Date();
    const currentOffset = currentTime.getTimezoneOffset();
    const ISTOffset = 330;
    const ISTTime = new Date(currentTime.getTime() + (ISTOffset + currentOffset) * 60000);
    return ISTTime;
  }

  resetPageSearchBoxStyle() {
    const menuWidth = $('.vertical_nav__minify').width();
    $('.page-in-search-box').css('width', '30px');
    const pageSearchBoxWidth = $('.page-in-search-box').width();
    $('.dx-tabpanel-tabs').css('max-width', (window.screen.width - menuWidth - pageSearchBoxWidth) + 'px');
    $('.ui-inplace').css('width', '0px');
  }

  createConfirmationfields(stoneList: any[]) {
    if (stoneList && stoneList.length > 0) {
      stoneList.forEach(stone => {
        stone.cut_pol_sym_fluor = stone.culet_short_value + ' - ' + stone.polish_short_value + ' - '
          + stone.symmetry_short_value + ' - ' + stone.fluor_short_value;
        stone.measurement = stone.length_ + ' - ' + stone.width + ' * ' + stone.height;
        stone.sl = stone.shade_short_value + '/' + stone.luster_short_value;
        stone.ts_sp = stone.table_spot_short_value + '/' + stone.side_spot_short_value;
        stone.to_co_po_go = stone.table_open_short_value + '/' + stone.crown_open_short_value + '/'
          + stone.pav_open_short_value + '/' + stone.girdle_open_short_value;
        stone.tfe_cfe_pfe = stone.table_extra_facet_short_value + '/' + stone.crown_extra_facet_short_value + '/'
          + stone.pav_extra_facet_short_value;
        stone.white_template = stone.table_white_short_value + '/' + stone.side_white_short_value;
        stone.black_template = stone.table_black_short_value + '/' + stone.side_black_short_value;
      });
    }
    return stoneList;
  }

  setSearchTabWidth() {
    this.widthOfList();
    this.getLeftPosi();
    this.widthOfHidden = function () {
      return (($('.wrapper-search-tab').outerWidth()) - this.widthOfList() - this.getLeftPosi()) - this.scrollBarWidths;
    };
    this.reAdjust();
  }

  scrollTabPanelRight() {
    $('.scroller-left').fadeIn('slow');
    $('.scroller-right').fadeOut('slow');

    $('.list').animate({ left: '+=' + this.widthOfHidden() + 'px' }, '1000');
  }

  scrollTabPanelLeft() {
    $('.scroller-right').fadeIn('slow');
    $('.scroller-left').fadeOut('slow');

    $('.list').animate({ left: '-=' + this.getLeftPosi() + 'px' }, '1000');
  }

  getLeftPosi() {
    if ($('.list') && $('.list').position()) {
      return $('.list').position().left;
    } else {
      return 0;
    }
  }

  widthOfHidden() {
    return (($('.wrapper-search-tab').outerWidth()) - this.widthOfList() - this.getLeftPosi()) - this.scrollBarWidths;
  }

  widthOfList() {
    let itemsWidth = 0;
    $('.list li').each(function () {
      const itemWidth = $(this).outerWidth();
      itemsWidth += itemWidth;
    });
    return itemsWidth;
  }

  reAdjust() {
    if (this.widthOfList()) {
      if (($('.wrapper-search-tab').outerWidth()) < this.widthOfList()) {
        $('.scroller-right').show();
      } else {
        $('.scroller-right').hide();
      }
    }

    if (this.getLeftPosi()) {
      if (this.getLeftPosi() < 0) {
        $('.scroller-left').show();
      } else {
        $('.item').animate({ left: '-=' + this.getLeftPosi() + 'px' }, 'slow');
        $('.scroller-left').hide();
      }
    }
  }

  setSearchResultTabs(topValue) {
    const menuWidth = $('.vertical_nav__minify').width();
    const packetBtnWidth = $('.packet-btn-box').width();
    $('.container').css('max-width', (window.screen.width - packetBtnWidth - menuWidth) + 'px');
    if ($('.container') && $('.packet-btn-box') && $('.container').position()) {
      $('.packet-btn-box').css('top', $('.container').position().top + Number(topValue));
    }
  }

  adjustPageSearchWithResultTabs() {
    const menuWidth = $('.vertical_nav__minify').width();
    $('.container').css('max-width', (window.screen.width - menuWidth - 50) + 'px');
    if ($('.container') && $('.page-in-search-box') && $('.container').position()) {
      $('.page-in-search-box').css('top', $('.container').position().top + 10);
    }
  }

  handleSort(event: any, container: any, storeKey: any, storeValue: any) {
    for (let i = 0; i < container.columns.length; i++) {
      if (Number.isInteger(container.instance.columnOption(i, 'sortIndex'))) {
        event['sortedColumn'] = i;
        event['sortedColumnOrder'] = container.instance.columnOption(i, 'sortOrder');
      }
    }
    this.appStore.store(storeKey, storeValue);
  }

  filterOperations(selectedFilterOption, container, daypColumnWidth, allColumnWidth) {
    let filterFlag;
    let colWidth;
    let filterObj;
    if (selectedFilterOption === 'enableFilter') {
      filterFlag = true;
    } else if(selectedFilterOption === 'disableFilter'){
      filterFlag = false;
    }
    else {
      filterFlag = true;
      this.clearFilter(container);
    }
    colWidth = filterFlag ? daypColumnWidth : allColumnWidth;
    filterObj = {
      'selected_filter_option': selectedFilterOption,
      'filter_flag': filterFlag,
      'col_width': colWidth
    };
    return filterObj;
  }

  clearFilter(container) {
    container.instance.clearFilter();
  }

  getExpandedColumnValue() {
    let selectedSaveSearchPreference;
    let isColumnExpanded = false;
    let columnExpanded;
    let isIconVisible = false;
    selectedSaveSearchPreference = this.userProfileService.getSelectedSaveSearchPreference();
    columnExpanded = selectedSaveSearchPreference.is_coloumn_expanded;
    if (columnExpanded.entity_value === true) {
      isColumnExpanded = true;
      isIconVisible = true;
    } else {
      isColumnExpanded = false;
      isIconVisible = false;
    }
    return [isColumnExpanded,isIconVisible];
  }

  fetchISTTime(date) {
    const currentTime = date;
    const currentOffset = currentTime.getTimezoneOffset();
    const ISTOffset = 330;
    const ISTTime = new Date(currentTime.getTime() + (ISTOffset + currentOffset) * 60000);
    return ISTTime;
  }

}
