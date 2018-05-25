import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { IonicStorageModule } from '@ionic/storage';
import { HttpModule } from '@angular/http';

import { MyApp } from './app.component';
import { AppState } from './app.global';
import { ConfigProvider } from '../providers/config/config';
import { AuthProvider } from '../providers/auth/auth';
import { RouteProvider } from '../providers/route/route';
import { HttpClientModule } from '@angular/common/http';
import { Facebook } from '@ionic-native/facebook';
import { LinkedIn } from '@ionic-native/linkedin';
import { GooglePlus } from '@ionic-native/google-plus';
import { Camera } from '@ionic-native/camera';
import { FileTransfer } from '@ionic-native/file-transfer';
// import { StarRatingComponent } from '../components/star-rating/star-rating';
@NgModule({
  declarations: [
    MyApp,
    // StarRatingComponent
  ],
  imports: [
    BrowserModule,
    HttpModule,
    HttpClientModule,
    IonicModule.forRoot(MyApp, {
      platforms : {
        core: {
          tabsPlacement: "top"
        }
      }
    }),
    IonicStorageModule.forRoot()
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp
  ],
  providers: [
    StatusBar,
    SplashScreen,
    AppState,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    ConfigProvider,
    AuthProvider,
    RouteProvider, 
    Facebook,
    LinkedIn,
    GooglePlus,
    Camera,
    FileTransfer
  ]
})
export class AppModule {}
