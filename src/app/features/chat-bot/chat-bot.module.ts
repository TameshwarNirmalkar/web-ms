import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatBotComponent } from './chat-bot/chat-bot.component';
import { SharedModule } from '@srk/shared';

@NgModule({
  imports: [
    CommonModule,
    SharedModule
  ],
  declarations: [ChatBotComponent],
  exports: [ChatBotComponent]
})
export class ChatBotModule { }
