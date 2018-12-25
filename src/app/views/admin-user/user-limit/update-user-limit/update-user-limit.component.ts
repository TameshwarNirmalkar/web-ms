import { Component, OnInit } from '@angular/core';
import { Message } from 'primeng/primeng';
import { UserLimitService } from '../user-limit.service';
import { MessageService } from '@srk/core';

@Component({
  selector: 'app-update-user-limit',
  templateUrl: './update-user-limit.component.html',
  styleUrls: ['./update-user-limit.component.scss']
})
export class UpdateUserLimitComponent implements OnInit {

  clientRules: any;
  ruleNames: any[] = [];
  selectedRuleName: string;
  selectedRule: any = {};

  constructor(
    private userLimitService: UserLimitService,
    private messageService: MessageService
  ) { }

  ngOnInit() {
    this.userLimitService.getClientRules()
      .subscribe(response => {
        this.clientRules = response.data[0];
        this.ruleNames = this.getRuleSelectionoptions(this.clientRules);
      });
  }

  getRuleSelectionoptions(array: any) {
    const resultArray: any[] = [];
    resultArray.push({
      label: 'Select',
      value: null
    });
    array.config_values.forEach((entity) => {
      if (entity.entity_name !== '') {
        resultArray.push({
          label: entity.entity_name,
          value: entity.entity_name
        });
      }
    });
    return resultArray;
  }

  selectRuleValue() {
    this.selectedRule = [];
    this.selectedRule['config_values'] = [];
    for (let j = 0; j < this.clientRules['config_values'].length; j++) {
      if (this.selectedRuleName === this.clientRules['config_values'][j].entity_name) {
        this.selectedRule['config_values'].push(this.clientRules['config_values'][j]);
      }
    }
  }

  update(event) {
    for (let k = 0; k < this.clientRules['config_values'].length; k++) {
      if (event.entity_name === this.clientRules['config_values'][k].entity_name) {
        this.clientRules['config_values'][k] = event;
      }
    }
    let result = this.userLimitService.saveUpdatedRule(this.clientRules)
      .subscribe(
      data => {
        result = data;
        this.messageService.showSuccessGrowlMessage(result['message']);
      },
      error => {
        result = error;
        this.messageService.showErrorGrowlMessage(result['message']);
      });
  }
}
