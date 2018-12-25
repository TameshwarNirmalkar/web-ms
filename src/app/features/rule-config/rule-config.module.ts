import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@srk/shared';
import { AddNewRuleComponent } from './add-new-rule/add-new-rule.component';
import { UpdateRuleComponent } from './update-rule/update-rule.component';
import { ListRulesComponent } from './list-rules/list-rules.component';
import { RuleConfigService } from './rule-config.service';
import { RangeFilterPipe } from './add-new-rule/range-filter.pipe';

@NgModule({
  imports: [
    CommonModule, SharedModule
  ],
  declarations: [AddNewRuleComponent, UpdateRuleComponent, ListRulesComponent, RangeFilterPipe],
  providers: [RuleConfigService],
  exports: [AddNewRuleComponent, UpdateRuleComponent]
})
export class RuleConfigModule { }
