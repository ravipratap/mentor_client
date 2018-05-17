import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SurveyQuestionPage } from './survey-question';

@NgModule({
  declarations: [
    SurveyQuestionPage,
  ],
  imports: [
    IonicPageModule.forChild(SurveyQuestionPage),
  ],
})
export class SurveyQuestionPageModule {}
