import { Component, ViewChild } from '@angular/core';
import { Platform, ToastController, LoadingController, Nav } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { AppState } from './app.global'; 
import { AuthProvider } from '../providers/auth/auth';
import { ConfigProvider } from '../providers/config/config';
import { SERVER_URL, DEFAULT_THEME } from '../providers/env/env';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav;
  rootPage:any;
  rootPageParams:any;
  loading:any;
  signedIn = false;

  constructor(
    private platform: Platform, 
    private statusBar: StatusBar, 
    private splashScreen: SplashScreen,
    private toastCtrl: ToastController, 
    public loadCtrl: LoadingController,
    private global: AppState,
    private auth: AuthProvider,
    private config: ConfigProvider
  ) {
    this.global.set('theme', DEFAULT_THEME);
    this.global.set('ENDPOINT', SERVER_URL);
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();
      
    });
  }

  loadConfig() {
    console.log("config being loaded");
    this.config.getConfigFromServer().subscribe((data: any) => {
      console.log("config from server", data);
      this.auth.setSiteConfig(data.config);
    },
    err => {
      console.log(err.status);
    },
    () => {
      console.log("load Config complete");
    });

  }


  // Master Auth Listener
  // After the app has loaded and almost everything else has loaded
  ngAfterContentInit() {

    this.auth.socialAuthState().subscribe((socialUser) => {
 
      console.log("this.auth.socialAuthState().subscribe: ", JSON.stringify( socialUser));
      
      if (socialUser) {
        this.showLoading();
        this.auth.socialSignUp(socialUser).subscribe((data: any) => {
            if(data.success){
              if(socialUser.hasDeepLink){
                data.user["hasDeepLink"] = socialUser.hasDeepLink;
                data.user["deepLink"] = socialUser.deepLink;
              }
              if(data.survey){
                data.user.survey = data.survey;
                data.user.surveyResponse = data.surveyResponse;
              }
              this.auth.setSiteConfig(data.config).then(() =>{
                this.auth.storeUserData(data.token, data.user);
                this.dismissLoading(true);
                this.showToastWithCloseButton(true, data.user.name);
              });
            } else {
              this.showToastWithCloseButton(false, data.msg? data.msg: "Unable to sign in. Please try later!");
              console.log(data);
            }
            
          },
          err =>  {
            console.log(err);
            this.dismissLoading();
          },
          () => {
            console.log("regitration complete")
          }
        );
      }
      // if(socialUser){
      //   setTimeout(() => {
      //     console.log('Fetching contacts initialized');  
      //     this.auth.fetchmail();
      //     }, 1000);
      //   }
    });
    
    let hash = location.hash;
    let deepLink: string;
      // capitalizes the first letter of the page name
      if(hash) {
        // deepLink = hash.charAt(2).toUpperCase() + hash.slice(3);
        deepLink = hash.slice(2);
      }
    
    this.auth.loadUserData().then((user:any) => {
      if(deepLink){
        if(user){
          user.hasDeepLink = true;
          user.deepLink = deepLink;
        } else {
          user= { hasDeepLink: true, deepLink: deepLink };
        }
      }
      console.log("loadUserData() returns:",user);
      
      this.auth.loadSiteConfig().then((siteConfig: any) => {
        if(siteConfig && !siteConfig.config) {
          console.log("///////////////////////siteConfig", siteConfig);
        }
        if(siteConfig && siteConfig.config) {
          this.auth.setTheme(siteConfig.config.theme);
        } else  {
          this.loadConfig();
        }
      });

      if(!user || !user.role){
        // console.log("initialize social networks with registartion possible");
        this.auth.initializeSocialNetworks(deepLink);
      } else {
        // console.log("NO registartion possible while initializing social networks");
        this.auth.initializeSocialNetworks("", true);
      }
      this.auth.setAuthenticationNotifier(user);
      this.setRouteForUser();
    });

  }
  setRouteForUser = () => {
    
    this.auth.authenticationNotifier()
      .subscribe(user => {
        console.log("setRouteForUser - subscribed authenticationNotifier for: ",user);
        if(user && user.hasDeepLink && user.role && (user.deepLink.indexOf('tour') != -1 || user.deepLink.indexOf('signin') != -1 || user.deepLink.indexOf('signup') != -1)){
          console.log("resetting starting page for authorized user", user);
          user.hasDeepLink = false;
          user.deepLink = undefined;
        }
        
        if(!user){ // when not auth'd
          this.rootPage = 'TourPage';
        } else if( user.noRouting ) { 
          console.log("Not Routing as requested");
        } else if( user.hasDeepLink ) { 
          console.log("ionic handles routing for deep links: "+ user.deepLink);
          // this.rootPage = 'TabsPage';
          // this.nav.push(deepLink);
        } else if( user.role == "User") { 
          if(user.survey){
            this.rootPage = 'SurveyEditPage';
          } else {
          this.rootPage = 'TabsPage';
          }
        } else  { 
          this.rootPage = 'MenuPage';
        }
      });
  }

  ngAfterViewInit() {
    if(!this.rootPage) {
      console.log("handle deep links here");
    }
  }

  
  showToastWithCloseButton = (success: boolean, data: string ) => {
    let message: string;
    if(success) {
      message= data + ",  you are signed in!";
    } else {
      message= data;
    }
    const toast = this.toastCtrl.create({
      message: message,
      showCloseButton: true,
      duration: 2000,
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

  dismissLoading(success?:boolean){
      if(this.loading){
        this.loading.dismiss().then(() => {
          if(success){
            this.signedIn = true;
          }
        });
          this.loading = null;
      }
  }

}

