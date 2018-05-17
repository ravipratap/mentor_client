import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SurveyListPage } from './survey-list';

@NgModule({
  declarations: [
    SurveyListPage,
  ],
  imports: [
    IonicPageModule.forChild(SurveyListPage),
  ],
})
export class SurveyListPageModule {}
