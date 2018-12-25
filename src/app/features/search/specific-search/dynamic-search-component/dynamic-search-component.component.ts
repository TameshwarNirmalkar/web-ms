import { Component, Input, OnInit, ViewChild, ComponentFactoryResolver } from '@angular/core';
import { SearchDirective } from '../../search.directive';
import { Search } from '../../search';
import { SearchService } from '@srk/core';
import { ShapeComponent } from '../search-elements/shape/shape.component';
import { TagsComponent } from '../search-elements/tags/tags.component';
import { CaratComponent } from '../search-elements/carat/carat.component';
import { ClarityComponent } from '../search-elements/clarity/clarity.component';
import { ColorComponent } from '../search-elements/colour/colour.component';
import { FinishingComponent } from '../search-elements/finishing/finishing.component';
import { PriceComponent } from '../search-elements/price/price.component';
import { CommentsComponent } from '../search-elements/comments/comments.component';
import { EligibilityComponent } from '../search-elements/eligibility/eligibility.component';
import { ParametersComponent } from '../search-elements/parameters/parameters.component';
import { InclusionsComponent } from '../search-elements/inclusions/inclusions.component';
import { CertificateComponent } from '../search-elements/certificate/certificate.component';
import { FluorescenceComponent } from '../search-elements/fluorescence/fluorescence.component';
import { LusterComponent } from '../search-elements/luster/luster.component';
import { HAComponent } from '../search-elements/ha/ha.component';
import { OpenInclusionComponent } from '../search-elements/open-inclusion/open-inclusion.component';
import { ExtraFacetComponent } from '../search-elements/extra-facet/extra-facet.component';
import { FancyColorComponent } from '../search-elements/fancy-color/fancy-color.component';
import { DateComponent } from '../search-elements/date/date.component';

@Component({
  selector: 'app-dynamic-search-component',
  template: `
  <div id="dynamicComponentContainer" class="ui-g-12 ui-g-nopad search-element fade">
    <ng-template id="dynamicComponent" dirSearch></ng-template>
  </div>
  `,
  styleUrls: ['./dynamic-search-component.component.scss'],
  entryComponents: [ShapeComponent, CaratComponent, TagsComponent, ClarityComponent, ColorComponent,
    FinishingComponent, FluorescenceComponent, LusterComponent,
    HAComponent, PriceComponent, CommentsComponent, OpenInclusionComponent,
    EligibilityComponent, ParametersComponent, InclusionsComponent, CertificateComponent, FancyColorComponent,
    DateComponent, ExtraFacetComponent]
})
export class DynamicSearchComponent implements OnInit {

  @Input() searchComponent: Search;
  @Input() parentRef: any;
  @ViewChild(SearchDirective) dirSearch: SearchDirective;

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private service: SearchService) { }

  ngOnInit() {
    this.loadComponent();
  }

  loadComponent() {
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(this.searchComponent.component);
    const viewContainerRef = this.dirSearch.viewContainerRef;
    viewContainerRef.clear();
    const componentRef = viewContainerRef.createComponent(componentFactory, 0);
    this.searchComponent.data.parentRef = this.parentRef;
    (<Search>componentRef.instance).data = this.searchComponent.data;
  }
}
