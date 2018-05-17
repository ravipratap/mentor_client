import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, ToastController } from 'ionic-angular';
import { AppState } from '../../app/app.global';
import { ConfigProvider } from '../../providers/config/config';
import { AuthProvider } from '../../providers/auth/auth';

/**
 * Generated class for the ConfigurePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-configure',
  templateUrl: 'configure.html',
})
export class ConfigurePage {
  theme: string;
  site: any;
  loading:any;

  constructor(
    public navCtrl: NavController,
    private global: AppState, 
    public navParams: NavParams,
    private config: ConfigProvider,
    private loadCtrl: LoadingController,
    private toastCtrl: ToastController,
    private auth: AuthProvider
  ) {
      if(this.navParams.data.site){
        this.setConfigurations( this.navParams.data.site );
      } else {
      //  console.log("auth.loadUser()", auth.loadUser());
        this.auth.loadSiteConfig().then((siteConfig:any) => {  
          if(siteConfig) {
            this.theme = siteConfig.config.theme;
            this.global.set('theme', this.theme);
          }    
        });
      }
  }
  setConfigurations(site: any) {
    this.site = site;
    console.log("site", site);
    this.theme = site.config?site.config.theme : undefined;

  }
  ionViewDidLoad() {
    console.log('ionViewDidLoad ConfigurePage');
  }
  changeTheme(theme) {
    // this.global.set('theme', theme);
    this.showLoading();
    this.config.saveTheme(this.site?this.site._id : undefined, theme)
    .finally(() => {
      this.dismissLoading();
    })
    .subscribe((data: any) => {
      console.log("theme: ", data.config.config)
      this.auth.setSiteConfig(data.config);
      if ( !this.site ) {
        this.auth.resetThemeForSite(theme);
      }
    },
    err => {
      console.log(err.status);
      this.showToastWithCloseButton("Unable to save Theme. Please try later", 5000);
    },
    () => {
      console.log("change theme complete");
    });
  }


  
  showToastWithCloseButton(message: string, time?: number) {
    const toast = this.toastCtrl.create({
      message: message,
      showCloseButton: true,
      duration: time? time: 2000,
      closeButtonText: 'Ok',
      position: 'top'
    });
    toast.present();
  }
  showLoading() {
      if(!this.loading){
          this.loading = this.loadCtrl.create({
            content: "Loading...",
            duration: 10000
          });
          this.loading.present();
      }
  }

  dismissLoading(){
      if(this.loading){
          this.loading.dismiss();
          this.loading = null;
      }
  }

}
