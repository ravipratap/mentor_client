import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ProgramEditPage } from './program-edit';

@NgModule({
  declarations: [
    ProgramEditPage,
  ],
  imports: [
    IonicPageModule.forChild(ProgramEditPage),
  ],
})
export class ProgramEditPageModule {}
