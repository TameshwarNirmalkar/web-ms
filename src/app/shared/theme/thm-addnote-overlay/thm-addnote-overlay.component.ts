import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { MessageService } from '@srk/core';
import { MessageCodes, MessageCodesComparator } from '@srk/core';
import { AddNoteService } from '../../services/add-note.service';
import { LoggerService } from '@srk/core';
import { AuthService } from '@srk/core';
import { CustomTranslateService } from '@srk/core';
import { ConfirmationService } from 'primeng/components/common/api';
import { ApiService } from '../../services/api.service';
import { NotifyService } from '@srk/core';

@Component({
  selector: 'thm-addnote-overlay',
  templateUrl: './thm-addnote-overlay.component.html',
  styleUrls: ['./thm-addnote-overlay.component.scss'],
})
export class ThmAddnoteOverlayComponent implements OnInit, OnChanges {
  @Input() visibleAddnoteOverlay: any;
  @Input() stoneIdList: any;
  @Input() CommentListForStone: any;
  @Output() toggleAddNoteOverlay = new EventEmitter();
  @Input() visibleShownoteOverlay: any;
  @Output() toggleShowNoteOverlay = new EventEmitter();
  @Input() screenName: any;

  public noteText: any;
  public saveNoteBtnIcon = 'none';
  public deleteNoteBtnIcon = 'none';
  public clientName: any;
  public showDeleteNoteWarning: boolean;
  public selectedNoteId: any[] = [];
  public selectAllLabel = 'Select all';
  public header: any;
  public toggleCancelButtonPannelVisibile: any;
  public allSelected = false;
  public disableSelection = false;


  constructor(
    private addNoteService: AddNoteService,
    private messageService: MessageService,
    private logger: LoggerService,
    private authService: AuthService,
    private customTranslateSvc: CustomTranslateService,
    private confirmationService: ConfirmationService,
    private apiService: ApiService,
    private notify: NotifyService
  ) { }

  ngOnInit() {
    if (this.screenName === 'BasketScreen') {
      this.header = 'Add Note';
    } else {
      this.header = 'Add Note & Add to Basket';
    }

    this.noteText = '';
    this.saveNoteBtnIcon = 'none';
    this.deleteNoteBtnIcon = 'none';
    this.clientName = this.authService.getUserDetail().person_name;
    this.toggleCancelButtonPannelVisibile = false;
    this.allSelected = false;
    this.disableSelection = false;
  }

  resetValue() {
    this.showDeleteNoteWarning = false;
    this.selectedNoteId = [];
    this.noteText = '';
    this.toggleCancelButtonPannelVisibile = false;
    this.allSelected = false;
    this.disableSelection = false;
  }

  ngOnChanges(changes: SimpleChanges) {

  }


  addNote() {
    const reg = new RegExp('^(?=.*[\\w\\d]).+');
    const isMatched = reg.test(this.noteText);
    if (this.noteText && isMatched) {
      this.saveNoteBtnIcon = 'fa fa-spinner fa-pulse';
      this.logger.logInfo('BasketDetailsComponent', 'User action to addNoteForStone these stones :- ' + JSON.stringify(this.stoneIdList));
      this.addNoteService.addCommentForStoneId(this.noteText, this.stoneIdList).subscribe((response) => {
        this.saveNoteBtnIcon = 'none';
        if (response !== undefined) {
          if (!response.error_status) {
            if (MessageCodesComparator.AreEqual(response.code, MessageCodes.SMS_VR_AC_SUCCESS_200)) {
              this.resetValue();
              this.addToMyBasket(this.stoneIdList);
              this.messageService.showSuccessGrowlMessage(MessageCodes[response.code]);
              this.emmitToggleEvent(true);
            } else {
              this.messageService.showErrorGrowlMessage(MessageCodes.SMS_VR_AC_STONE_NE_200);
            }
            this.emmitToggleEvent(false);
          }
        }
      }, error => {
        this.saveNoteBtnIcon = 'none';
        this.emmitToggleEvent(false);
      });
    } else {
      this.messageService.showErrorGrowlMessage(MessageCodes.ENTER_MESSAGE);
    }
  }

  cancelAddnote() {
    this.noteText = '';
    this.emmitToggleEvent(false);
  }

  emmitToggleEvent(thisNoteDetil) {
    this.resetValue();
    if (thisNoteDetil) {
      this.notify.notifyAddNewComment();
    }
    if (this.visibleAddnoteOverlay) {
      this.toggleAddNoteOverlay.emit({ visible: false, forAddNote: true, noteDetil: thisNoteDetil });
    } else {
      this.toggleAddNoteOverlay.emit({ visible: false, forAddNote: false, noteDetil: thisNoteDetil });
    }
  }

  deleteSelectedNotes() {
    var messageIdArray = this.createSelectedNoteIdList();
    if (messageIdArray && messageIdArray.length > 0) {
      this.deleteNoteBtnIcon = 'fa fa-spinner fa-pulse';
      this.logger.logInfo('BasketDetailsComponent', 'User action to addNoteForStone these stones :- ' + JSON.stringify(this.stoneIdList));
      this.addNoteService.deleteCommentListforStoneIds(messageIdArray).subscribe((response: any) => {
        this.deleteNoteBtnIcon = 'none';
        if (response !== undefined) {
          if (!response.error_status) {
            if (MessageCodesComparator.AreEqual(response.code, MessageCodes.SMS_VR_DC_SUCCESS_200)) {
              this.resetValue();
              this.messageService.showSuccessGrowlMessage(MessageCodes[response.code]);
              this.emmitToggleEvent(true);
            } else {
              this.messageService.showErrorGrowlMessage(MessageCodes.SMS_VR_AC_STONE_NE_200);
            }
            this.emmitToggleEvent(false);
          }
        }
      }, error => {
        this.deleteNoteBtnIcon = 'none';
        this.emmitToggleEvent(false);
      });
    } else {
      this.messageService.showInfoGrowlMessage(MessageCodes.MESSAGE_NOT_SELECTED);
    }
  }

  addToMyBasket(stoneIdList) {
    //  commenting the code to fix SMS-1999
    if (this.screenName === 'BasketScreen') {
      return;
    }
    const apiLink = this.authService.getApiLinkForKey('add_basket_btn', '');
    const servicedata = '{"stone_ids":' + JSON.stringify(stoneIdList) + '}';
    this.notify.showBlockUI({ 'message': 'PLEASE_WAIT' });
    this.apiService.postCall('ThmAddnoteOverlayComponent:addToMyBasket', apiLink, servicedata).subscribe((response) => {
      this.notify.hideBlockUI();
      if (!response.error_status) {
        this.emmitToggleEvent(false);
        if (MessageCodesComparator.AreEqual(response.code, MessageCodes.SMS_MB_NSF_200)) {
          this.messageService.showErrorGrowlMessage(MessageCodes[response.code]);
        } else if (MessageCodesComparator.AreEqual(response.code, MessageCodes.SMS_MB_SS_200)) {
          this.notify.notifyStoneStateUpdated({ source: 'basketRequested', stoneList: stoneIdList });
          this.messageService.showSuccessGrowlMessage(MessageCodes[response.code]);
        } else if (MessageCodesComparator.AreEqual(response.code, MessageCodes.SMS_MB_SNE_200)) {
          this.messageService.showErrorGrowlMessage(MessageCodes[response.code]);
        }
      } else {
        this.messageService.showErrorGrowlMessage('Error while adding to My Basket ');
      }
    }, error => {
      this.notify.hideBlockUI();
      this.messageService.showErrorGrowlMessage('SERVER_ERROR_OCCURRED');
    });
  }


  stoneSelected() {
    if (this.selectedNoteId) {
      if (this.CommentListForStone.length !== this.selectedNoteId.length) {
        this.allSelected = false;
      } else {
        this.allSelected = true;
      }
    }
  }

  selectAll(event) {
    this.allSelected = event;
    if (event) {
      this.selectedNoteId = this.createNoteIdList();
    } else {
      this.selectedNoteId = [];
    }
  }

  createNoteIdList() {
    var noteIdList: any[] = [];
    if (this.CommentListForStone && this.CommentListForStone.length) {
      this.CommentListForStone.forEach((note) => {
        if (note.comment_id) {
          noteIdList.push((note.comment_id).toString());
        }
      });
    }
    return noteIdList;
  }

  createSelectedNoteIdList() {
    const noteIdList: any[] = [];
    if (this.CommentListForStone && this.CommentListForStone.length) {
      this.selectedNoteId.forEach((messageId) => {
        this.CommentListForStone.forEach((note) => {
          if (note.comment_id == messageId) {
            noteIdList.push(note.comment_id);
          }
        });
      });

    }
    return noteIdList;
  }

  deleteAction() {
    this.toggleCancelButtonPannelVisibile = true;
    this.disableSelection = true;
  }

  cancelDeleteAction() {
    this.toggleCancelButtonPannelVisibile = false;
    this.selectedNoteId = [];
    this.allSelected = false;
    this.disableSelection = false;
  }

}
