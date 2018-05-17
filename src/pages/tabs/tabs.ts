import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

/**
 * Generated class for the TabsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage({
  segment: "ta"
})
@Component({
  selector: 'page-tabs',
  templateUrl: 'tabs.html',
})
export class TabsPage {
  
  tab1Root: any = 'MatchesPage';
  tab2Root: any = 'ChatListPage';
  tab3Root: any = 'AnswersPage';
  tab4Root: any = 'SettingsPage';
  mySelectedIndex: number;

  constructor(private navParams: NavParams, private navCtrl: NavController) {

    this.mySelectedIndex = navParams.data.tabIndex || 0;
  }

  // addPage() {
  //   this.navCtrl.push('SelectCategoryPage');
  // }

  ionViewDidLoad() {
    console.log('ionViewDidLoad TabsPage ');
  }

}
