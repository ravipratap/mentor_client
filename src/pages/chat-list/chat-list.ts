import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AppState } from '../../app/app.global';
import { AuthProvider } from '../../providers/auth/auth';

/**
 * Generated class for the ChatListPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-chat-list',
  templateUrl: 'chat-list.html',
})
export class ChatListPage {

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams, 
    private global: AppState,
    private auth: AuthProvider
  ) {
  }
  
  profile = () => {
    this.navCtrl.push('ProfilePage');
  };

  ionViewDidLoad() {
    console.log('ionViewDidLoad ChatListPage');
  }

}
