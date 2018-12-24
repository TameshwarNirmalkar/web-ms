import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'customDate'
})
export class CustomDatePipe implements PipeTransform {

  private readonly monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  private readonly weekDayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri',
    'Sat'];

  // fullDate pattern must be - 'YYYY-MM-DD hh:mm:ss' || 'MM-DD-YYYY hh:mm:ss'
  transform(fullDate: any, args?: any): any {
    let result = '';
    if (fullDate) {
      if (args === 'hoursMinutes') {
        result = this.getTimeHoursMinutes(fullDate);
      } else if (args === 'AMPM') {
        result = this.getTimeAMPM(fullDate);
      } else if (args === 'timeAMPM') {
        result = this.getTimeWithAMPM(fullDate);
      } else if (args === 'date') {
        result = String(this.getDate(fullDate));
      } else if (args === 'month') {
        result = String(this.getMonthName(fullDate));
      } else if (args === 'dateWithMonth') {
        result = String(this.getDateWithMonthName(fullDate));
      } else if (args === 'year') {
        result = String(this.getYear(fullDate));
      } else if (args === 'weekDay') {
        result = String(this.getWeekDay(fullDate));
      } else if (args === 'monthNumber') {
        result = String(this.getMonthNumber(fullDate));
      }
    }
    return result;
  }

  getTimeAMPM(fullDate: string) {
    let ampm = '';
    const dateParts = fullDate.split(' ');
    const timeString = dateParts.length == 2 ? dateParts[1] : null;
    const timeParts = timeString ? timeString.split(':') : null;
    const hours = timeParts ? timeParts[0] : null;
    const minutes = timeParts ? timeParts[1] : null;
    if (hours) {
      ampm = Number(hours) >= 12 ? 'PM' : 'AM';
    }
    return ampm;
  }

  getTimeHoursMinutes(fullDate: string) {
    let time = '';
    const dateParts = fullDate.split(' ');
    const timeString = dateParts.length == 2 ? dateParts[1] : null;
    const timeParts = timeString ? timeString.split(':') : null;
    let hours = timeParts ? timeParts[0] : null;
    let minutes = timeParts ? timeParts[1] : null;
    let formattedHour = parseInt(hours, 10);
    if (formattedHour > 12) {
      formattedHour = formattedHour - 12;
    }
    if (formattedHour && minutes) {
      time = formattedHour + ':' + minutes;
    }
    return time;
  }

  getTimeWithAMPM(fullDate: string) {
    let time = '';
    const dateParts = fullDate.split(' ');
    const timeString = dateParts.length == 2 ? dateParts[1] : null;
    const timeParts = timeString ? timeString.split(':') : null;
    const hours = timeParts ? timeParts[0] : null;
    const minutes = timeParts ? timeParts[1] : null;
    if (hours && minutes) {
      time = this.formatAMPM(Number(hours), Number(minutes));
    }
    return time;
  }

  getDate(fullDate: string) {
    let date = '';
    const dateParts = fullDate ? fullDate.split(' ') : null;
    const dateString = dateParts ? dateParts[0] : null;
    if (dateString) {
      const _date = new Date(dateString);
      date = _date.getDate().toString();
    }
    return date;
  }

  getMonthName(fullDate: string) {
    let monthName = '';
    const dateParts = fullDate ? fullDate.split(' ') : null;
    const dateString = dateParts ? dateParts[0] : null;
    if (dateString) {
      const date = new Date(dateString);
      monthName = this.monthNames[date.getMonth()];
    }
    return monthName;
  }

  getDateWithMonthName(fullDate: string) {
    let dayWithMonth = '';
    const dateParts = fullDate ? fullDate.split(' ') : null;
    const dateString = dateParts ? dateParts[0] : null;
    if (dateString) {
      const temp = dateString.split('-');
      const date = new Date(dateString);
      dayWithMonth = (temp[2] || date.getDate()) + ' ' + this.monthNames[date.getMonth()];
    }
    return dayWithMonth;
  }

  formatAMPM(hours: number, minutes: number) {
    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minute = minutes < 10 ? '0' + minutes : minutes;
    var strTime = hours + ':' + minute + ' ' + ampm;
    return strTime;
  }

  getYear(fullDate: string) {
    let year = '';
    const dateParts = fullDate ? fullDate.split(' ') : null;
    const dateString = dateParts ? dateParts[0] : null;
    if (dateString) {
      const _date = new Date(dateString);
      year = _date.getFullYear().toString();
    }
    return year;
  }

  getWeekDay(fullDate: string) {
    let dayName = '';
    const dateParts = fullDate ? fullDate.split(' ') : null;
    const dateString = dateParts ? dateParts[0] : null;
    if (dateString) {
      const _date = new Date(dateString);
      dayName = this.weekDayNames[_date.getDay()];
    }
    return dayName;
  }

  getMonthNumber(fullDate: string) {
    let dayWithMonth = '';
    const dateParts = fullDate ? fullDate.split(' ') : null;
    const dateString = dateParts ? dateParts[0] : null;
    if (dateString) {
      const date = new Date(dateString);
      dayWithMonth = (date.getMonth() + 1) + '';
    }
    return dayWithMonth;
  }
}
