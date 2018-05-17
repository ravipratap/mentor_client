import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, MenuController, Slides } from 'ionic-angular';
import { Storage } from '@ionic/storage';


@IonicPage()
@Component({
  selector: 'page-tour',
  templateUrl: 'tour.html',
})
export class TourPage {
  showSkip = true;

	@ViewChild('slides') slides: Slides;

  constructor(
    public navCtrl: NavController, 
    public menu: MenuController,
    public storage: Storage
  ) { }

  startApp() {
    this.navCtrl.push('TabsPage').then(() => {
      // this.storage.set('hasSeenTutorial', 'true');
    })
  }
  signin() {
    this.navCtrl.push('SigninPage');
  }

  signup() {
    this.navCtrl.push('SignupPage');
  }

  onSlideChangeStart(slider: Slides) {
    this.showSkip = !slider.isEnd();
  }

	ionViewWillEnter() {
		this.slides.update();
	}

  ionViewDidEnter() {
    // the root left menu should be disabled on the tutorial page
    this.menu.enable(false);
  }

  ionViewDidLeave() {
    // enable the root left menu when leaving the tutorial page
    this.menu.enable(true);
  }

}
