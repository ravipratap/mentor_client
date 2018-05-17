import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SiteEditPage } from './site-edit';

@NgModule({
  declarations: [
    SiteEditPage,
  ],
  imports: [
    IonicPageModule.forChild(SiteEditPage),
  ],
})
export class SiteEditPageModule {}
