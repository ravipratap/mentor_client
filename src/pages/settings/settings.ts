import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AuthProvider } from '../../providers/auth/auth';
import { AppState } from '../../app/app.global';

/**
 * Generated class for the SettingsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html',
})
export class SettingsPage {

  constructor(
    private auth: AuthProvider,
    public navCtrl: NavController, 
    public navParams: NavParams, 
    private global: AppState
    ) {
  }
  
  profile = () => {
    this.navCtrl.push('ProfilePage');
  };

  onLogoutClick() {
    console.log("logging out"); 
       //   // Give the menu time to close before changing to logged out
    //   this.userData.logout();
    // this.nav.setRoot('LoginPage');
    this.auth.logOut();
    
    return false;

  }
  ionViewDidLoad() {
    console.log('ionViewDidLoad SettingsPage');
  }

}
