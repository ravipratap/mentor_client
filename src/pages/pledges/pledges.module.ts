import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PledgesPage } from './pledges';

@NgModule({
  declarations: [
    PledgesPage,
  ],
  imports: [
    IonicPageModule.forChild(PledgesPage),
  ],
})
export class PledgesPageModule {}
