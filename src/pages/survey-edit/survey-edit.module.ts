import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SurveyEditPage } from './survey-edit';
import { AutoCompleteComponent } from '../../components/auto-complete/auto-complete';
import { BoldPrefix } from '../../components/auto-complete/boldprefix.pipe';
import { LocationProvider } from '../../providers/location/location';
import { SkillsProvider } from '../../providers/skills/skills';
import { CompanyProvider } from '../../providers/company/company';
import { SchoolProvider } from '../../providers/school/school';
import { DesignationProvider } from '../../providers/designation/designation';
import { DegreeProvider } from '../../providers/degree/degree';
import { FieldsOfStudyProvider } from '../../providers/fields-of-study/fields-of-study';
import { IndustryProvider } from '../../providers/industry/industry';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  declarations: [
    SurveyEditPage,
    AutoCompleteComponent,
    BoldPrefix
  ],
  imports: [
    IonicPageModule.forChild(SurveyEditPage),
    ComponentsModule
  ],
  providers: [
    LocationProvider,
    SkillsProvider,
    CompanyProvider,
    SchoolProvider,
    DesignationProvider,
    DegreeProvider,
    FieldsOfStudyProvider,
    IndustryProvider
  ]
})
export class SurveyEditPageModule {}
