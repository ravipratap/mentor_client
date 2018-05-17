import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ProgramListPage } from './program-list';

@NgModule({
  declarations: [
    ProgramListPage,
  ],
  imports: [
    IonicPageModule.forChild(ProgramListPage),
  ],
})
export class ProgramListPageModule {}
