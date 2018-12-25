import { Component, OnInit, OnDestroy, ElementRef, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService, ApplicationDataService, MessageService, LoggerService, NotifyService } from '@srk/core';

import { map, catchError } from 'rxjs/operators';
import { Observable } from 'rxjs/Observable';
// import * as io from 'socket.io-client';

declare var io: any;
@Component({
  selector: 'app-chat-bot',
  templateUrl: './chat-bot.component.html',
  styleUrls: ['./chat-bot.component.scss']
})
export class ChatBotComponent implements OnInit, OnDestroy {

  @Input() multiple: boolean = false;
  @ViewChild('fileInput') inputEl: ElementRef;
  @Output() toggleChatBot = new EventEmitter();

  message = '';
  sentText = '';
  messageList = [];
  loginName = '';
  token = '';
  clientName = '';
  socket;
  reConnectMsg = '';
  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private applicationDataService: ApplicationDataService,
    public messageService: MessageService,
    private logger: LoggerService,
    private notify: NotifyService,

  ) { }

  ngOnInit() {
    this.loginName = this.authService.getLoginName();
    this.token = this.authService.getToken();
    this.clientName = this.authService.getUserDetail().person_name;
    this.connectSocket()
  }

  connectSocket() {

    const sessionData = {};
    // let self = this;
    sessionData['user_details'] = { 'login_name': this.loginName, 'person_name': this.clientName }
    this.socket = io(this.applicationDataService.getEnvironment().WebSocketApi, { transports: ['polling', 'websocket'] });
    this.socket.emit('join', { 'token': this.token, 'calling_entity': 'ui', 'sessionData': sessionData }, (res: any) => {
      if (res) {
        this.subscribeToAllEvents('hello');
      }
    });
    this.socket.on('disconnect', () => {
      this.reConnectMsg = 'Bot seems offline. Trying to reconnect';
      this.scroll();
      this.reConnectSocket();
    });

  }

  reConnectSocket() {
    const sessionData = {};
    sessionData['user_details'] = { 'login_name': this.loginName, 'person_name': this.clientName }
    this.socket = io(this.applicationDataService.getEnvironment().WebSocketApi, { transports: ['polling', 'websocket'] });
    this.socket.emit('join', { 'token': this.token, 'calling_entity': 'ui', 'sessionData': sessionData }, (res: any) => {
      if (res) {
        this.subscribeToAllEvents('reconnect');
      }
    });
  }

  subscribeToAllEvents(msg) {
    const sessionData = {};
    sessionData['user_details'] = { 'login_name': this.loginName, 'person_name': this.clientName }
    this.socket.emit('usermessage', { 'token': this.token, 'calling_entity': 'ui', 'sessionData': sessionData, 'message': msg })
    this.socket.on('botmessage', (data) => {
      const msg = {
        type: 'RECEIVER',
        text: data.message
      };
      this.messageList.push(msg);
      this.scroll();
    });

  }

  sendMessage(text) {
    var data = {};
    var sessionData = {};
    sessionData['user_details'] = { 'login_name': this.loginName, 'person_name': this.clientName }
    data = { 'token': this.token, 'calling_entity': 'ui', 'sessionData': sessionData, 'message': text }
    var msg = {};
    msg['type'] = 'SENDER';
    msg['text'] = text;
    this.messageList.push(msg);
    this.scroll();
    this.socket.emit('usermessage', data);
    this.message = '';

  }



  upload() {
    const uploadExcelUrl = this.applicationDataService.getEnvironment().ExcelManagementApi
    + '/excelmgnt/upload/search/' + this.applicationDataService.getEnvironment().ExcelManagementApiVersion;
    const inputEl: HTMLInputElement = this.inputEl.nativeElement;
    const fileCount: number = inputEl.files.length;
    const headerData = new HttpHeaders();
    headerData.append('calling_entity', 'UI');
    headerData.append('token', this.token);

    let fd: FormData = new FormData();
    if (fileCount > 0) { // a file was selected
      for (let i = 0; i < fileCount; i++) {
        fd.append('excel', inputEl.files.item(i));
      }
      this.http.post(uploadExcelUrl, fd, { headers: headerData }).toPromise()
        .then( (res: any) => {
          let data = {};

          if (res.stone_ids.length > 0) {
            const resData = res.stone_ids.toString();
            const sessionData = {};
            sessionData['user_details'] = { 'login_name': this.loginName, 'person_name': this.clientName };
            data = { 'token': this.token, 'calling_entity': 'ui', 'message': resData, 'sessionData': sessionData };
            this.socket.emit('usermessage', data);
          }

        })
        .catch(this.handleError);
    }
  }

  private handleError(error: any): Promise<any> {
    return Promise.reject(error.message || error);
  }

  addToMessageList(socketMessage) {
    this.messageService.showInfoGrowlMessage(socketMessage.message);
    this.notify.notifyUpdateNotifictionCount({ source: socketMessage.message, count: 1 });
    // this.updateNotificationCount(1);
  }
  closeChatBot() {
    this.toggleChatBot.emit({ visible: false });
  }

  scroll() {
    $('#chatContainer').animate({ scrollTop: $('#chatContainer').prop('scrollHeight') }, 50);
  }


  ngOnDestroy() {
    this.socket.disconnect();
  }

}
