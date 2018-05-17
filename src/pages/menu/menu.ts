import { Component, ViewChild } from '@angular/core';
import { App, IonicPage, Nav, NavController, NavParams, MenuController} from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { AuthProvider } from '../../providers/auth/auth';
import { SocialUser } from '../../entities/social-user';
import { AppState } from '../../app/app.global';



export interface PageInterface {
  title: string;
  name: string;
  component: any;
  icon: string;
  logsOut?: boolean;
  index?: number;
  tabName?: string;
  tabComponent?: any;
}

@IonicPage()
@Component({
  selector: 'page-menu',
  templateUrl: 'menu.html',
})
export class MenuPage { 

    // the root nav is a child of the root app component
  // @ViewChild(Nav) gets a reference to the app's root nav
  @ViewChild(Nav) nav: Nav;

  // List of pages that can be navigated to from the left menu
  // the left menu only works after login
  // the login page disables the left menu
  appPages: PageInterface[] = [
    { title: 'Match', name: 'TabsPage', component: 'TabsPage', tabComponent: 'MatchesPage', index: 0, icon: 'people' },
    { title: 'Chats', name: 'TabsPage', component: 'TabsPage', tabComponent: 'ChatListPage', index: 1, icon: 'chatbubbles' },
    { title: 'Answers', name: 'TabsPage', component: 'TabsPage', tabComponent: 'AnswersPage', index: 2, icon: 'help' },
    { title: 'Settings', name: 'TabsPage', component: 'TabsPage', tabComponent: 'SettingsPage', index: 3, icon: 'cog' }
  ]; 
  loggedInPages: PageInterface[] = [
    { title: 'Programs', name: 'ProgramListPage', component: 'ProgramListPage', icon: 'book' },
    { title: 'Basic setup', name: 'ConfigurePage', component: 'ConfigurePage', icon: 'settings' }
  ];
  loggedOutPages: PageInterface[] = [
    { title: 'FAQ', name: 'HelpPage', component: 'HelpPage', icon: 'information' }
  ];
  rootPage: string="ProgramListPage";
  constructor(
    private navCtrl: NavController, 
    private navParams: NavParams,
    private global: AppState,
    private menu: MenuController,
    private storage: Storage,
    private auth:AuthProvider,
    private app: App
  ) {
    auth.authenticationNotifier().subscribe((user) => {
      if (user && user.role && (user.role == "SuperAdmin" || user.role == "SiteAdmin" )) {
        this.enableMenu(true);
        this.global.set('sidemenu', true);
        if(user.role == "SuperAdmin"){
          this.loggedInPages.push({ title: 'Manage Sites', name: 'SiteListPage', component: 'SiteListPage', icon: 'build' });
          this.loggedInPages.push({ title: 'Requests', name: 'RequestsPage', component: 'RequestsPage', icon: 'checkmark-circle' });
        }
      } else {
        this.enableMenu(false);
        this.global.set('sidemenu', false);
      }
    });
  }

  

  enableMenu(loggedIn: boolean) {
    this.menu.enable(loggedIn, 'loggedInMenu');
    this.menu.enable(!loggedIn, 'loggedOutMenu');
  }


  openPage(page: PageInterface) {
    let params = {};

    // the nav component was found using @ViewChild(Nav)
    // setRoot on the nav to remove previous pages and only have this page
    // we wouldn't want the back button to show in this scenario
    if (page.index) {
      params = { tabIndex: page.index };
    }

    // If we are already on tabs just change the selected tab
    // don't setRoot again, this maintains the history stack of the
    // tabs even if changing them from the menu
    if (this.nav.getActiveChildNavs()[0] && page.index != undefined) {
      this.nav.getActiveChildNavs()[0].select(page.index);
    // Set the root of the nav with params if it's a tab index
    } else {
      this.nav.setRoot(page.name, params).catch((err: any) => {
        console.log(`Didn't set nav root: ${err}`);
      });
    }

  }
   onLogoutClick() {
    console.log("logging out"); 
       //   // Give the menu time to close before changing to logged out
    //   this.userData.logout();
    // this.nav.setRoot('LoginPage');
    this.auth.logOut();
    
    return false;

  }
  isActive(page: PageInterface) {
    let childNav = this.nav.getActiveChildNavs()[0];

    // Tabs are a special case because they have their own navigation
    if (childNav) {

      if (childNav.getSelected() && childNav.getSelected().root === page.tabComponent) {
        return 'dark';
      }
      return 'light';
    }

    if (this.nav.getActive() && this.nav.getActive().name === page.name) {
      return 'dark';
    }
    return 'light';
  }

}
