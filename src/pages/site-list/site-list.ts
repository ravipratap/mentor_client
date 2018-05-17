import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { ConfigProvider } from '../../providers/config/config';
import { AuthProvider } from '../../providers/auth/auth';

/**
 * Generated class for the SiteListPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage({
})
@Component({
  selector: 'page-site-list',
  templateUrl: 'site-list.html',
})
export class SiteListPage {
  sites: any[] =[];
  page: number= 0;
  searchTerm: string;
  hiddenSearchLoader:boolean=true;
  toBeLoaded: boolean = true;
  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private config: ConfigProvider,
    private auth: AuthProvider
  ) {
    this.getSites();
  }
  onSearchInput = (ev: any) => {
    this.searchTerm = ev.target.value;
    this.page = 0;
    this.sites =[];
    this.presentLoader();
    this.getSites(() => {
      this.hideLoader();
      console.log('search result returned');
    });
  };
  onSearchCancel = (ev: any) => {
    this.page = 0;
    this.searchTerm = undefined;
    this.sites =[];
    this.presentLoader();
    this.getSites(() => {
      this.hideLoader();
    });
  };
  presentLoader(){
    this.hiddenSearchLoader=false;
    setTimeout(()=>{
      this.hiddenSearchLoader=true;
    }, 10000);
  }
  hideLoader(){
    this.hiddenSearchLoader=true;
  }
  getSites(callback?: Function) {
    
    this.config.loadSites(this.page, this.searchTerm).subscribe((data: any) => {
      if(data.sites && data.sites.length > 0 ){
        this.sites=this.sites.concat(data.sites);
        this.page = this.page + 1;
      } else {
        this.toBeLoaded = false;
      }
      if(callback) { callback(); }
    },
    err => {
      console.log(err.status);
      if(err.status && err.status=="401"){
        this.auth.unauthorizedAccess();
      }
    }
    );
  }
  loadMoreSites() {

    console.log('Begin async operation');

    return new Promise((resolve) => {
      this.getSites(() => {
        console.log('Async operation has ended');
        resolve();
      });
    });
  }
  addSite() {
    this.navCtrl.push("SiteEditPage", {
      callback: this.updateSiteList
    });
  }

  manageAdmins(site: any) {
    this.navCtrl.push("ManageAdminsPage", {
      site: site
    });
  }
  editSite(site: any, siteIndex: number) {
    this.navCtrl.push("SiteEditPage", {
      site: site, 
      siteIndex: siteIndex,
      callback: this.updateSiteList
    });
  }
  updateSiteList= data => {
    if(data.siteIndex!=-1){
      this.sites[data.siteIndex]= data.site;
    } else {
      let newSites: any[]=[];
      newSites.push(data.site);
      this.sites=newSites.concat(this.sites);
    }
  };

  basicSetup(site: any) {
    this.navCtrl.push("ConfigurePage", {site: site});
  }
  managePrograms(site: any) {
    this.navCtrl.push("ProgramListPage", {site: site});
  }
  ionViewDidLoad() {
    console.log('ionViewDidLoad SiteListPage');
  }

}
