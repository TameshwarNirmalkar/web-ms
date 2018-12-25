import { Component, Inject, ViewChild, ComponentFactoryResolver, OnInit, OnDestroy } from '@angular/core';
import { WebDashboardService } from './web-dashboard.service';
import { Dashboard } from './dashboard';
import { PrimaryDashboardLayoutComponent } from './primary-dashboard-layout/primary-dashboard-layout.component';
import { SecondaryDashboardLayoutComponent } from './secondary-dashboard-layout/secondary-dashboard-layout.component';
import { DashboardDirective } from './dashboard.directive';
import { UserProfileService } from '@srk/core';
import { LoggerService } from '@srk/core';
@Component({
  selector: 'app-web-dynamic-dashboard',
  template: `<ng-template dirDashboard></ng-template>`,
  entryComponents: [PrimaryDashboardLayoutComponent, SecondaryDashboardLayoutComponent]
})
export class WebDynamicDashboardComponent implements OnInit {

  private allDashboards: Dashboard[] = [];
  @ViewChild(DashboardDirective) dynamicDashboard: DashboardDirective;

  constructor(private componentFactoryResolver: ComponentFactoryResolver,
    private webDashboardService: WebDashboardService,
    private logger: LoggerService,
    private userProfileService: UserProfileService) {
  }

  ngOnInit() {
    this.renderActiveDynamicDashboard();
  }

  renderActiveDynamicDashboard() {
    const activeDashboard = this.webDashboardService.getActiveDashboard(this.buildDashboards());
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(activeDashboard.component);
    const viewContainerRef = this.dynamicDashboard.viewContainerRef;
    viewContainerRef.clear();
    const componentRef = viewContainerRef.createComponent(componentFactory);
    (<Dashboard>componentRef.instance).data = activeDashboard.data;
  }

  buildDashboards(): Dashboard[] {
    return [
      new Dashboard('PrimaryDashboard', PrimaryDashboardLayoutComponent, {}),
      new Dashboard('SecondaryDashboard', SecondaryDashboardLayoutComponent, {}),
    ];
  }

}
