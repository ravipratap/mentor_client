import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ProfileQuestionsPage } from './profile-questions';

@NgModule({
  declarations: [
    ProfileQuestionsPage,
  ],
  imports: [
    IonicPageModule.forChild(ProfileQuestionsPage),
  ],
})
export class ProfileQuestionsPageModule {}
