import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AnswersPage } from './answers';

@NgModule({
  declarations: [
    AnswersPage,
  ],
  imports: [
    IonicPageModule.forChild(AnswersPage),
  ],
})
export class AnswersPageModule {}
