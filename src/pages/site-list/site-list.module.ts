import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SiteListPage } from './site-list';

@NgModule({
  declarations: [
    SiteListPage,
  ],
  imports: [
    IonicPageModule.forChild(SiteListPage),
  ],
})
export class SiteListPageModule {}
