import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ManageAdminsPage } from './manage-admins';

@NgModule({
  declarations: [
    ManageAdminsPage,
  ],
  imports: [
    IonicPageModule.forChild(ManageAdminsPage),
  ],
})
export class ManageAdminsPageModule {}
