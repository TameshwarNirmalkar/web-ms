import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-context-menu',
  templateUrl: './context-menu.component.html',
  styleUrls: ['./context-menu.component.scss']
})
export class ContextMenuComponent implements OnInit, AfterViewInit {

  @Input() posX: number;
  @Input() posY: number;
  @Input() optionsList: [{ label: string, value: string, columnName: string }];

  @Output() optionClicked: EventEmitter<{ label: string, value: string, columnName: string }> = new EventEmitter();

  @ViewChild('menuElement') menuElement: ElementRef;

  constructor() { }

  ngOnInit() { }

  ngAfterViewInit() {

    // Manage Width and Height is user click close to corners and the menu does not have enough place to spread out.
    const isWidthGreater: boolean = (this.posX + this.menuElement.nativeElement.offsetWidth) > (window.innerWidth - 50);
    const isHeightGreater: boolean = (this.posY + this.menuElement.nativeElement.offsetHeight) > (window.innerHeight - 50);

    if (isWidthGreater === true) {
      setTimeout(() => {
        this.posX = this.posX - this.menuElement.nativeElement.offsetWidth;
      }, 0);
    }

    if (isHeightGreater) {
      setTimeout(() => {
        this.posY = this.posY - this.menuElement.nativeElement.offsetHeight;
      }, 0);
    }
    // isWidthGreater = null;
    // isHeightGreater = null;
  }

  handleOptionClick(option: { label: string, value: string, columnName: string }): void {
    this.optionClicked.emit(option);
  }

  handleContextMenu(event): void {
    event.preventDefault();
  }

  hideCustomContextMenu() {
    this.optionClicked.emit({
      value: '',
      label: '',
      columnName: ''
    });
  }


}
