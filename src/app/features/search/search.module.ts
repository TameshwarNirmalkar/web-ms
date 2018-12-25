import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchRoutingModule } from './search-routing.module';
import { PacketsModule } from '../packets/packets.module';
import { SearchComponent } from './search.component';
import { SavedSearchComponent } from './saved-search/saved-search.component';
import { SearchResultComponent } from './search-result/search-result.component';
import {SharedModule, StoneMultimediaDetailDirective} from '@srk/shared';
import { SearchService } from '@srk/core';
import { SpecificSearchComponent } from './specific-search/specific-search.component';
import { SearchMenubarComponent } from './specific-search/search-menubar/search-menubar.component';
import { OrderByPipe } from './specific-search/order-by.pipe';
import { TagsComponent } from './specific-search/search-elements/tags/tags.component';
import { CaratComponent } from './specific-search/search-elements/carat/carat.component';
import { RangeSelectComponent } from './specific-search/search-elements/range-select/range-select.component';
import { FinishingComponent } from './specific-search/search-elements/finishing/finishing.component';
import { CheckboxSelectComponent } from './specific-search/search-elements/checkbox-select/checkbox-select.component';
import { SearchDirective } from './search.directive';
import { DynamicSearchComponent } from './specific-search/dynamic-search-component/dynamic-search-component.component';
import { PriceComponent } from './specific-search/search-elements/price/price.component';
import { CommentsComponent } from './specific-search/search-elements/comments/comments.component';
import { ParametersComponent } from './specific-search/search-elements/parameters/parameters.component';
import { EligibilityComponent } from './specific-search/search-elements/eligibility/eligibility.component';
import { InclusionsComponent } from './specific-search/search-elements/inclusions/inclusions.component';
import { ShapeComponent } from './specific-search/search-elements/shape/shape.component';
import { CertificateComponent } from './specific-search/search-elements/certificate/certificate.component';
import { ClarityComponent } from './specific-search/search-elements/clarity/clarity.component';
import { ColorComponent } from './specific-search/search-elements/colour/colour.component';
import { FluorescenceComponent } from './specific-search/search-elements/fluorescence/fluorescence.component';
import { LusterComponent } from './specific-search/search-elements/luster/luster.component';
import { HAComponent } from './specific-search/search-elements/ha/ha.component';
import { OpenInclusionComponent } from './specific-search/search-elements/open-inclusion/open-inclusion.component';
import { SelectedStonesPanelComponent } from './search-result/selected-stones-panel/selected-stones-panel.component';
import { StoneDetailsComponent } from './search-result/stone-details/stone-details.component';
import { FancyColorComponent } from './specific-search/search-elements/fancy-color/fancy-color.component';
import { DateComponent } from './specific-search/search-elements/date/date.component';
import { ExtraFacetComponent } from './specific-search/search-elements/extra-facet/extra-facet.component';
import { InfraGridComponent } from './infra-grid/infra-grid.component';
import { SelectedStonesPanelGridComponent } from './search-result/selected-stones-panel/selected-stones-panel-grid/selected-stones-panel-grid.component';

@NgModule({
  imports: [
    CommonModule,
    SearchRoutingModule,
    SharedModule,
    PacketsModule
  ],
  declarations: [SearchComponent, SavedSearchComponent,
    SearchResultComponent, SpecificSearchComponent,
    SearchMenubarComponent,
    OrderByPipe,
    TagsComponent,
    CaratComponent,
    RangeSelectComponent,
    FinishingComponent,
    CheckboxSelectComponent,
    SearchDirective,
    DynamicSearchComponent,
    PriceComponent,
    CommentsComponent,
    ParametersComponent,
    EligibilityComponent,
    InclusionsComponent,
    ShapeComponent,
    CertificateComponent,
    ClarityComponent,
    ColorComponent,
    FluorescenceComponent,
    LusterComponent,
    HAComponent,
    OpenInclusionComponent,
    SelectedStonesPanelComponent,
    StoneDetailsComponent,
    FancyColorComponent,
    DateComponent,
    ExtraFacetComponent,
    InfraGridComponent,
    SelectedStonesPanelGridComponent
  ],
  exports: [
    SearchComponent,
    SavedSearchComponent,
    SearchResultComponent,
    SpecificSearchComponent,
    SelectedStonesPanelComponent
  ],
  providers: [SearchService, StoneMultimediaDetailDirective]
})
export class SearchModule { }
