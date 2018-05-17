import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Observable, BehaviorSubject } from 'rxjs/Rx';
import { AppState } from '../../app/app.global';
import { SocialUser} from '../../entities/social-user';

import 'rxjs/add/operator/map';
import { Platform } from 'ionic-angular';
import { Facebook } from '@ionic-native/facebook';
import { GooglePlus } from '@ionic-native/google-plus';
import { LinkedIn } from '@ionic-native/linkedin';
import { FB_APPID, GOOGLE_CLIENTID, LINKEDIN_APIKEY } from '../env/env';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { FileUploadOptions, FileTransferObject, FileTransfer } from '@ionic-native/file-transfer';
import { JSONflatten } from '../util/util';

declare let FB: any;
declare let gapi: any;
declare let IN: any;


@Injectable()
export class AuthProvider {
  siteConfig: any;
  authToken: string;
  score: number = 0;
  public user: any;
  public hasloggedIn: boolean = false;
  fbSignedIn: boolean = false;
  googleSignedIn: boolean = false;
  linkedInSignedIn: boolean = false;
  
  protected auth2: any;
  private fbScope = ["email","public_profile"];
  private _socialAuthState: BehaviorSubject<SocialUser> = new BehaviorSubject(null);
  socialAuthState(): Observable<SocialUser> {
    return this._socialAuthState.asObservable();
  } 
  private _authNotifier: BehaviorSubject<any> = new BehaviorSubject<any>("");
  authenticationNotifier(): Observable<any> {
    return this._authNotifier.asObservable();
  }
  setAuthenticationNotifier = ( user: any ) => {
    this._authNotifier.next(user);
  }
  constructor(
    public http: HttpClient,
    public storage: Storage,
    private global: AppState,
    private fbNative: Facebook,
    private googlePlus: GooglePlus,
    private linkedin: LinkedIn,
    private plt: Platform,
    private transfer: FileTransfer
  ) {
    console.log('Hello AuthProvider Provider');
    console.log("Platform: ", JSON.stringify(this.plt.platforms()));
    // this.initializeSocialNetworks();
    
  }

  initializeSocialNetworks = (deepLink: string, ignoreRegisteration?: boolean) => { 
    return new Promise((resolve, reject) => {

      this.initializeFB().then((socialUser:SocialUser) => {
        if(socialUser && !ignoreRegisteration) {
          if(deepLink){
            socialUser.hasDeepLink = true;
            socialUser.deepLink = deepLink;
          }
          this._socialAuthState.next(socialUser); 
          resolve(socialUser);
        } 
      });

      this.initializeGoogle().then((socialUser:SocialUser) => {
        if(socialUser && !ignoreRegisteration) {
          if(deepLink){
            socialUser.hasDeepLink = true;
            socialUser.deepLink = deepLink;
          }
          this._socialAuthState.next(socialUser); 
          resolve(socialUser);
        }
      });
      
      this.initializeLinkedIn().then((socialUser:SocialUser) => {
        if(socialUser && !ignoreRegisteration) {
          if(deepLink){
            socialUser.hasDeepLink = true;
            socialUser.deepLink = deepLink;
          }
          this._socialAuthState.next(socialUser); 
          resolve(socialUser);
        }
      });
       
    });
  };
  
  loadScript(id:string, src: string, callback: any, async = true, inner_text_content = ''): void {
      if (document.getElementById(id)) { return; }
      let signInJS = document.createElement("script");
      signInJS.async = async;
      signInJS.src = src;
      signInJS.onload = callback;
      signInJS.text = inner_text_content; // LinkedIn
      document.head.appendChild(signInJS);
  }

  populateUserForFB = (res, token): any => {
    let socialUser: any= { login: {}, sign: {}, profile: { intro: {}, age_range: {} }, picture: {}};
    console.log("profile from FB: ", JSON.stringify(res)); 
    socialUser.login.facebook = res.id;
    socialUser.login.email = res.email;
    socialUser.login.email_verified = true;// res.verified;
    socialUser.sign.first = res.first_name;
    socialUser.sign.last = res.last_name;
    if(res.gender) {
      socialUser.profile.gender = res.gender.charAt(0).toUpperCase() + res.gender.slice(1);
    }
    socialUser.profile.intro.facebook = res.link;
    if(res.age_range){
      if(res.age_range.min) socialUser.profile.age_range.min = res.age_range.min;
      if(res.age_range.max) socialUser.profile.age_range.max = res.age_range.max;
    }
    if(res.picture && res.picture.data) {
      // socialUser.picture.url = "https://graph.facebook.com/" + res.id + "/picture?type=normal"; 
      socialUser.picture.url = res.picture.data.url;
      socialUser.picture.is_silhouette = res.picture.data.is_silhouette;
      socialUser.picture.width = res.picture.data.width;
      socialUser.picture.height = res.picture.data.height;
    }
    socialUser.picture.profile_url = "https://graph.facebook.com/" + res.id + "/picture?type=normal";
    socialUser.picture.provider = "FACEBOOK";
    socialUser.login.tokens= []
    socialUser.login.tokens.push({
      provider: "FACEBOOK",
      kind: "accessToken",
      token: token
    });
    console.log("user populated for FB ", JSON.stringify(socialUser));
    return socialUser;
  };
  initializeFB(): Promise<{}> {
    // console.log('inside Initialize FB');
    let that=this;
    //  `//connect.facebook.net/${this.locale}/sdk.js`
    return new Promise((resolve, reject) => {
      if(this.plt.is('cordova')){
        this.fbNative.getLoginStatus()
        .then(response => {
          console.log("fbNative.getLoginStatus()", JSON.stringify(response)); 
          if(response.status === "connected") {
            this.fbNative.api('/me?fields=name,email,picture.type(large),first_name,last_name,gender,verified,age_range,link', this.fbScope)
              .then(res => {
                that.fbSignedIn=true;
                let socialUser = that.populateUserForFB(res,response.authResponse.accessToken);
                // console.log("response from FB on Graph API post initializalization: ", JSON.stringify(res));
                // that.populateUserForFB(res,response.authResponse.accessToken);
                // socialUser.id = res.id;
                // socialUser.name = res.name;
                // socialUser.email = res.email;
                // socialUser.photoUrl = "https://graph.facebook.com/" + res.id + "/picture?type=normal";
                // socialUser.firstName = res.first_name;
                // socialUser.lastName = res.last_name;
                // socialUser.provider = "FACEBOOK";
                // socialUser.authToken = response.authResponse.accessToken;
                // console.log("user ", JSON.stringify(socialUser));
                resolve(socialUser);
              })
              .catch(e => {
                console.log('Error getting profile from Facebook',e);
                resolve();
              });
          } else {
            // console.log("not logged in");
            resolve();
          }
        })
        .catch(e => {
          console.log("Error getting Login status from FB",e);
          resolve();
        });
      } else {
        this.loadScript("FACEBOOK",  
          "//connect.facebook.net/en_US/sdk.js", () => {
            // console.log('FB init started'); 
            FB.init({
              appId: FB_APPID,
              autoLogAppEvents: true,
              cookie: true,
              xfbml: true,
              version: 'v2.9'
            });
            // FB.AppEvents.logPageView(); #FIX for #18
            FB.getLoginStatus(function (response: any) {
              if (response && response.status === 'connected') {
                let authResponse = response.authResponse;
                FB.api('/me?fields=name,email,picture.type(large),first_name,last_name,gender,verified,age_range,link', (res: any) => {
                  if (res && !res.error) {
                    that.fbSignedIn=true;
                    let socialUser= that.populateUserForFB(res, authResponse.accessToken);
                    // socialUser.id = res.id;
                    // socialUser.name = res.name;
                    // socialUser.email = res.email;
                    // socialUser.photoUrl = "https://graph.facebook.com/" + res.id + "/picture?type=normal";
                    // socialUser.firstName = res.first_name;
                    // socialUser.lastName = res.last_name;
                    // socialUser.provider = "FACEBOOK";
                    // socialUser.authToken = authResponse.accessToken;
                    resolve(socialUser);
                  } else {
                    console.log("not getting profile from FB");
                    resolve();
                  }
                });
              } else {
                // console.log("not logged in FB");
                resolve();
              }
            });
          }
        );
      }
    });
  }
  fbSignIn(): Promise<SocialUser> {
    console.log('inside signIn FB');
    let that = this;
    return new Promise((resolve, reject) => {
      if(this.plt.is('cordova')){
        this.fbNative.login( this.fbScope)
        .then(response => {
          if(response.status === "connected") {
            console.log("response from FB on login: ", JSON.stringify(response));
            this.fbNative.api('/me?fields=name,email,picture.type(large),first_name,last_name,gender,verified,age_range,link',this.fbScope)
              .then(res => {
                this.fbSignedIn=true;
                let socialUser = that.populateUserForFB(res,response.authResponse.accessToken);
                this._socialAuthState.next(socialUser);
                resolve(socialUser);
              })
              .catch(e => {
                console.log('Error getting profile from Facebook',e);
                resolve();
              });
            
              
          } else {
            console.log("not logged in FB");
            resolve();
          }
        })
        .catch(e => {
          console.log('Error logging into Facebook', e);
          resolve();
        });
      } else {
        FB.login((response: any) => {
          if (response.authResponse) {
            let authResponse = response.authResponse;
            
            FB.api('/me?fields=name,email,picture.type(large),first_name,last_name,gender,verified,age_range,link', (res: any) => {
              // console.log("response from FB on Graph API post login: ", res);
              if (res && !res.error) {
                this.fbSignedIn=true;
                let socialUser = that.populateUserForFB(res,authResponse.accessToken);
                this._socialAuthState.next(socialUser);
                resolve(socialUser);
              } else {
                console.log("not getting profile from FB");
                resolve();
              }
            });
          } else {
            console.log("not logged in FB");
            resolve();
          }
        }, {scope: this.fbScope.toString()});
      }
    });
  }

  fbSignOut(): Promise<any> {
    let that = this;
    return new Promise((resolve, reject) => {
      if(that.fbSignedIn){
        console.log("logging FB out"); 
        if(that.plt.is('cordova')){
          that.fbNative.logout()
          .then( res => {
            console.log("user is logged out of FB: ", res);
            that.fbSignedIn = false;
            resolve();
          })
          .catch(e => {
            console.log('Error logout from Facebook', e);
            resolve();
          });
        } else {
          FB.logout((response: any) => {
            console.log("user is logged out of FB: ", response);
            that.fbSignedIn = false;
            resolve();
          });
        }
      }
    });
  }

  populateUserForGoogle = (that, res): any => {
    let socialUser: any= { login: {}, sign: {}, profile: {}, picture: {} };
    console.log("profile from Google: ", JSON.stringify(res));
    if(that.plt.is('cordova')){ 
      socialUser.login.google = res.userId;
      socialUser.login.email = res.email;
      socialUser.sign.first = res.givenName;
      socialUser.sign.last = res.familyName;
      socialUser.picture.url = res.imageUrl;
      socialUser.picture.provider = "GOOGLE";
      socialUser.login.tokens= []
      socialUser.login.tokens.push({
        provider: "GOOGLE",
        kind: "accessToken",
        token: res.accessToken
      });
    } else {
      socialUser.login.google = res.getId();
      socialUser.login.email = res.getEmail();
      socialUser.sign.first = res.getGivenName();
      socialUser.sign.last = res.getFamilyName();
      socialUser.picture.url = res.getImageUrl();
      socialUser.picture.provider = "GOOGLE";
      socialUser.login.tokens= []
      socialUser.login.tokens.push({
        provider: "GOOGLE",
        kind: "accessToken",
        token: that.auth2.currentUser.get().getAuthResponse().access_token
      });
      socialUser.login.tokens.push({
        provider: "GOOGLE",
        kind: "idToken",
        token: that.auth2.currentUser.get().getAuthResponse().id_token
      });
    }
    socialUser.login.email_verified = true;
    console.log("user populated for  GOOGLE", JSON.stringify(socialUser));
    return socialUser;
  };

  initializeGoogle(): Promise<SocialUser> {
    // console.log('inside Initialize Google');
    let that = this;
    return new Promise((resolve, reject) => {
        if(that.plt.is('cordova')){ 
        that.googlePlus.trySilentLogin({
          'scopes': 'email'
          })
          .then(res => {
            // console.log("that.googlePlus.trySilentLogin", JSON.stringify(res));
            if(res && res.email){
              that.googleSignedIn=true;
              // let socialUser: SocialUser = new SocialUser();
              // console.log("response from FB on Graph API post initializalization: ", JSON.stringify(res));
              let socialUser = that.populateUserForGoogle(that, res);
              resolve(socialUser);
            } else {
              // console.log("not logged in Google");
              resolve();
            }
          })
          .catch(e => {
            console.log("Error getting Silent Login status from Google",e);
            resolve();
          });
      } else {
        that.loadScript("GOOGLE",
          "//apis.google.com/js/platform.js", () => {
            gapi.load('auth2', () => {
              // project scope: 'email https://www.googleapis.com/auth/contacts.readonly'
              // console.log('Post load scropt google');

              that.auth2 = gapi.auth2.init({
                client_id: GOOGLE_CLIENTID,
                scope: 'email'
              });
              // console.log('Post auth 2google');
        
              that.auth2.then(() => { 
                // console.log('Post google init');
                if (that.auth2.isSignedIn.get()) {
                  that.googleSignedIn = true;
                  // let socialUser: SocialUser = new SocialUser();
                  let profile = that.auth2.currentUser.get().getBasicProfile();

                  let socialUser = that.populateUserForGoogle(that, profile);
                  
                  resolve(socialUser);
                  // setTimeout(() => that.fetchmail(), 1000); 
                  
                } else {
                  // console.log("not logged in Google");
                  resolve();
                }
              })
              .catch(e => {
                console.log("Error getting init status from Google",e);
                resolve();
              });
            });
          });
        }
    });
  }

  googleSignIn(): Promise<SocialUser> {
    let that = this;
    return new Promise((resolve, reject) => {
      if(that.plt.is('cordova')){ 
        that.googlePlus.login({
          'scopes': 'email'
        })
        .then(res => {
          console.log("that.googlePlus.login", JSON.stringify(res));
          if(res && res.email){
            that.googleSignedIn=true;
            // let socialUser: SocialUser = new SocialUser();
            // console.log("response from Google post initializalization: ", JSON.stringify(res));
            let socialUser= that.populateUserForGoogle(that, res);
            that._socialAuthState.next(socialUser);
            resolve(socialUser);
          } else {
            // console.log("not logged in Google");
            resolve();
          }
        })
        .catch(e => {
          console.log("Error Login into Google",e);
          resolve();
        });
      } else {
        that.auth2.signIn().then(() => {
          that.googleSignedIn = true;
          // let socialUser: SocialUser = new SocialUser();
          let profile = that.auth2.currentUser.get().getBasicProfile();

          // console.log("that.auth2 details fetched on signIn ", JSON.stringify(profile));
          let socialUser = that.populateUserForGoogle(that, profile);

          that._socialAuthState.next(socialUser);
          resolve(socialUser);
        }, (error) =>{ 
          console.log("error in sign in", error);
          resolve();
        });
      }
    });
  }

  googleSignOut(): Promise<any> {
    return new Promise((resolve, reject) => {
      let that = this;
      if(that.googleSignedIn){
        if(that.plt.is('cordova')){
          that.googlePlus.logout()
          .then( res => {
            console.log("user is logged out of Google: ", res);
            that.googleSignedIn = false;
            resolve();
          })
          .catch(e => {
            console.log('Error logout from Google', e);
            resolve();
          });
        } else {
          that.auth2.signOut().then((err: any) => {
            if (err) {
              reject(err);
            } else {
              that.googleSignedIn = false;
              resolve();
            }
          });
        }
      }
    });
  }

  fetchmail() {
    if(gapi){     
      gapi.load('client:auth2', () => {
          gapi.client.init({
            discoveryDocs: ['https://people.googleapis.com/$discovery/rest?version=v1'],
            client_id: '110520399315-cf1kllop5ud1afjbu8827a4jpete6517.apps.googleusercontent.com',
            scope: 'email https://www.googleapis.com/auth/contacts.readonly'
          }).then(() => {
            console.log("Started Fetched mail contacts"); 
              return gapi.client.people.people.connections.list({
                  resourceName:'people/me',
                  // pageToken: "^CAAQza_eh4ksGiEKHQjIARoCCAMiDggCEAEYASIEAQACBSgDKgIIBDADEAI",
                  personFields: 'emailAddresses,names,phoneNumbers'
              });
          }).then(
              (res) => {
                  // console.log("Res: " + JSON.stringify(res)); 
                  console.log(res.result);
                  console.log("Fetched mail contacts"); 

                  // this.userContacts.emit(this.transformToMailListModel(res.result));
              },
              error => console.log("ERROR " + JSON.stringify(error))
          );
      });
    }
  }
  populateUserForLinkedIn = (res, token): any => {
    let socialUser: any= { login: {}, sign: {}, profile: { intro: {}, age_range: {} }, picture: {}};
    console.log("profile from LinkedIn: ", JSON.stringify(res)); 
    socialUser.login.linkedin = res.id;
    socialUser.login.email = res.emailAddress;
    socialUser.login.email_verified = true;
    // if(res.numConnections > 10 ) {
    //   socialUser.login.email_verified = true;
    // }
    socialUser.sign.first = res.firstName;
    socialUser.sign.last = res.lastName;
    socialUser.profile.intro.linkedin = res.publicProfileUrl;
    socialUser.sign.title = res.headline;
    if(res.pictureUrls && res.pictureUrls.values && res.pictureUrls._total && res.pictureUrls._total >0) {
      socialUser.picture.url = res.pictureUrls.values[0];
      socialUser.picture.provider = "LINKEDIN";
    }
    socialUser.login.tokens= []
    socialUser.login.tokens.push({
      provider: "LINKEDIN",
      kind: "accessToken",
      token: token
    });
    socialUser.profile.industry = res.industry;
    if(res.location && res.location.name){
      socialUser.profile.location = {
        name: res.location.name
      }
      if(res.location.country){
        socialUser.profile.location.country = {};
        if(res.location.country.code) socialUser.profile.location.country.code= res.location.country.code;
        if(res.location.country.name) socialUser.profile.location.country.name= res.location.country.name;
      }
    }
    if(res.positions && res.positions.values){
      socialUser.profile.positions = [];
      res.positions.values.forEach(position => {
        let pos: any ={
          title: position.title,
          is_current: position.isCurrent?position.isCurrent: false,
          company: {},
        };
        pos.company.name= position.company.name; 
        if(position.company.industry) pos.company.industry= position.company.industry;
        if(position.company.size) pos.company.size= position.company.size;
        if(position.company.ticker) pos.company.ticker= position.company.ticker;
        if(position.company.category) pos.company.type= position.company.category;
        if(position.location && position.location.name){
          pos.location= {}
          pos.location.name= position.location.name; 
          if(position.location.country){
            pos.location.country = {};
            if(position.location.country.code) pos.location.country.code= position.location.country.code;
            if(position.location.country.name) pos.location.country.name= position.location.country.name;
          }
        }
        if(position.startDate){
          pos.startDate= {};
          pos.startDate.year= position.startDate.year;
          if(position.startDate.month) pos.startDate.month= position.startDate.month;
        }
        if(position.endDate){
          pos.endDate= {};
          pos.endDate.year= position.endDate.year;
          if(position.endDate.month) pos.endDate.month= position.endDate.month;
        }
        socialUser.profile.positions.push(pos);
      });  
    }
    // console.log("user populated ", JSON.stringify(socialUser));
    console.log("user populated ", socialUser);
    return socialUser;
  };
  
  initializeLinkedIn(): Promise<SocialUser> {
    // console.log('inside Initialize LinkedIn');
    let that = this;

    return new Promise((resolve, reject) => {
      if(that.plt.is('cordova')){
        that.linkedin.getActiveSession()
        .then((accessToken) => {
          if(accessToken && accessToken.accessToken){
            that.linkedin.getRequest('people/~:(id,first-name,last-name,email-address,picture-urls::(original),headline,location,industry,positions,num-connections,public-profile-url)')
            .then(res => {  
              console.log("profile from LinkedIn ",JSON.stringify(accessToken), JSON.stringify(res));       
             
              let socialUser =  that.populateUserForLinkedIn(res,accessToken.accessToken);
              that.linkedInSignedIn=true;
              resolve(socialUser);
            })
            .catch(e => {
              console.log("Error getting profile from LinkedIn",e);
              resolve();
            });
          } else {
            // console.log("not logged in LinkedIn");
            resolve();
          }
        })
        .catch(e => {
          console.log("Error getting Login status from LinkedIn",e);
          resolve();
        });
      } else {
        let inner_text = '';
        // API for surendra.sinha78@gmail.com
        inner_text += 'api_key: ' + LINKEDIN_APIKEY + '\r\n';
        inner_text += 'authorize:' +  'true' +  '\r\n';
        inner_text += 'lang: ' + 'en_US' +  '\r\n';
        that.loadScript("LINKEDIN",
            '//platform.linkedin.com/in.js',
            () => {
                // IN.Event.on(IN, "systemReady", () => {
                //   that.linkedInSignIn().then(
                //       user => resolve(user)
                //   )
                // });
                setTimeout(() => {
                    that.linkedInSignIn().then(
                        user => {
                          if(user){
                            that.linkedInSignedIn=true;
                          }
                          resolve(user);
                      }
                    )
                }, 800);
            }, false, inner_text);
      }
    });
}

linkedInSignIn(fromUserSignIn?: boolean): Promise<SocialUser> {
    const that = this;
    return new Promise((resolve, reject) => {
        // console.log("starting Linkedin signin: ");
        if(that.plt.is('cordova')){
          that.linkedin.login(['r_basicprofile', 'r_emailaddress'], true)
          .then((response) => {
            if(response || that.plt.is('ios')) {
              that.linkedin.getActiveSession().then((accessToken) => {
                if(accessToken && accessToken.accessToken){                     
                  that.linkedin.getRequest('people/~:(id,first-name,last-name,email-address,picture-urls::(original),headline,location,industry,positions,num-connections,public-profile-url)')
                  .then(res => {
                    console.log("profile from LinkedIn ",JSON.stringify(response), JSON.stringify(res));
                    
                    let socialUser = that.populateUserForLinkedIn(res,accessToken.accessToken);
                    if(fromUserSignIn){
                      that.linkedInSignedIn=true;
                      that._socialAuthState.next(socialUser);
                    }
                    resolve(socialUser);
                  })
                  .catch(e => {
                    console.log("Error getting profile from LinkedIn",e);
                    resolve();
                  });
                } else {
                  console.log("Not got in LinkedIn acess Token");
                  resolve();
                }  
              });
            } else {
              // console.log("Not Logged in LinkedIn", response  );
              resolve();
            }
          })
          .catch(e => {
            console.log("Error Login LinkedIn",e);
            resolve();
          });
        } else {
          if(fromUserSignIn || (IN.User && IN.User.isAuthorized())){
            IN.User.authorize(function(){
                IN.API.Raw('/people/~:(id,first-name,last-name,email-address,picture-urls::(original),headline,location,industry,positions,num-connections,public-profile-url)').result(function(res: any){
                    console.log("profile from LinkedIn",res);
                    let socialUser = that.populateUserForLinkedIn(res,IN.ENV.auth.oauth_token); 
                    if(fromUserSignIn){
                      that.linkedInSignedIn=true;
                      that._socialAuthState.next(socialUser);
                    }
                    resolve(socialUser);
                });
            });
          } else {
            // console.log("Not authorized Linkedin User");
            resolve();
          }
        }
    });
}

linkedInSignOut(): Promise<any> {
    return new Promise((resolve, reject) => {
      let that = this;
      if(that.linkedInSignedIn){
        if(that.plt.is('cordova')){
          this.linkedin.logout();
          that.linkedInSignedIn = false;
          resolve();
        } else {
          IN.User.logout(function(){
            that.linkedInSignedIn = false;  
            resolve();
          }, {});
        }
      }

    });
}

  socialSignUp(user:any){
    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    console.log("registering user");
    return this. http.post(this.global.state['ENDPOINT']+'/users/social', user, {headers: headers});
  }
  signUp(user:any){  
    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    console.log("registering user");
    return this. http.post(this.global.state['ENDPOINT']+'/users/signup', user, {headers: headers});
  }

  signin(user:any){
  let headers = new HttpHeaders().set('Content-Type', 'application/json');
  console.log("logging in user");
  // console.log(JSON.stringify(user));
    if(this.plt.is('cordova')){
      user.isApp = true;
    }
  return this. http.post(this.global.state['ENDPOINT']+'/users/signin', user, {headers: headers});
  }
  
  saveProfilePicture(fileToUpload) {
    return Observable.fromPromise(this.loadTokenFromStorage()).mergeMap(token => {
      if(this.plt.is('cordova')){
        const options: FileUploadOptions = {
          fileKey: 'picture',
          chunkedMode: false,
          mimeType: "image/jpeg",
          fileName: fileToUpload.substr(fileToUpload.lastIndexOf('/') + 1),
          headers: {'Authorization': token}
          // params: { 'desc': desc }
        };
    
        const fileTransfer: FileTransferObject = this.transfer.create();
    
        // Use the FileTransfer to upload the image
        return Observable.fromPromise(fileTransfer.upload(fileToUpload, this.global.state['ENDPOINT']+'/users/profilePicture', options));
      } else {
        let headers = new HttpHeaders().set('Authorization', token);
        console.log(this.authToken);
        let input = new FormData();
        input.append("picture", fileToUpload);
        return this.http.post(this.global.state['ENDPOINT']+'/users/profilePicture',input,{headers: headers});
      }
    });
      
  }
  getProfile(id?: string) {
      return Observable.fromPromise(this.loadTokenFromStorage()).mergeMap(token => {
        let headers = new HttpHeaders().set('Content-Type', 'application/json');
        headers = headers.append('Authorization', token);
        let params = new HttpParams()
        if(id) params.set("_id", id);
        // if(search) { params = params.append("search", search); } 
        // if(siteId) { params = params.append("siteId", siteId); } 
        // console.log("headers", headers);
        // console.log("params", JSON.stringify(params));
        return this.http.get(this.global.state['ENDPOINT']+'/users/profile', {headers: headers, params: params});
      });
  }
  resendOTP = (otpData: any) => {
    return Observable.fromPromise(this.loadTokenFromStorage()).mergeMap(token => {
      let headers=new HttpHeaders().set('Content-Type', 'application/json');
      headers = headers.set('Authorization', token?token:"dummy");
      // console.log("saving OTP", otpData);
      // console.log("headers", headers);
      return this.http.post(this.global.state['ENDPOINT']+'/users/resendOTP', otpData, {headers: headers});
    });

  };
  saveOTP = (otpData: any) => {
    return Observable.fromPromise(this.loadTokenFromStorage()).mergeMap(token => {
      let headers=new HttpHeaders().set('Content-Type', 'application/json');
      headers = headers.set('Authorization', token?token:"dummy");
      console.log("saving OTP", otpData);
      // console.log("headers", headers);
      return this.http.post(this.global.state['ENDPOINT']+'/users/saveOTP', otpData, {headers: headers});
    });

  };
  saveSignupForm = ( surveyResponse: any, imgToUpload?:any ) => {
    return Observable.fromPromise(this.loadTokenFromStorage()).mergeMap(token => {
      const flattenedSurveyResponse = JSONflatten(surveyResponse);
      console.log("saving surveyResponse ", surveyResponse, flattenedSurveyResponse);
      if(this.plt.is('cordova') && imgToUpload){
        const options: FileUploadOptions = {
          fileKey: 'picture',
          chunkedMode: false,
          mimeType: "image/jpeg",
          fileName: imgToUpload.substr(imgToUpload.lastIndexOf('/') + 1),
          headers: {'Authorization': token},
          params: flattenedSurveyResponse
        };
        console.log("options", JSON.stringify(options));
        const fileTransfer: FileTransferObject = this.transfer.create();
    
        // Use the FileTransfer to upload the image
        return Observable.fromPromise(fileTransfer.upload(imgToUpload, this.global.state['ENDPOINT']+'/users/signUpForm', options));
      } else {  
        if(imgToUpload){
          let headers = new HttpHeaders().set('Authorization', token);
          let input = new FormData();
          input.append("picture", imgToUpload);
          for(let p in flattenedSurveyResponse) {
            // console.log("p, flattenedSurveyResponse", p, flattenedSurveyResponse[p]);
            input.append(p, flattenedSurveyResponse[p]);
          }
          return this.http.post(this.global.state['ENDPOINT']+'/users/signUpForm',input,{headers: headers});
        } else {
          let headers=new HttpHeaders().set('Content-Type', 'application/json');
          headers = headers.append('Authorization', token);
          console.log("flattenedSurveyResponse", flattenedSurveyResponse);
          return this. http.post(this.global.state['ENDPOINT']+'/users/signUpForm', flattenedSurveyResponse, {headers: headers});
        }
      }
    });
  };
  loadToken = (): string  => {
    console.log("fetching token")
    return this.authToken;
  };
  loadTokenFromStorage():Promise<string>{
    // console.log("loading token from storage");
    return new Promise((resolve, reject) => {
      if(this.authToken){
        resolve(this.authToken);
      } else {
        this.storage.ready().then(() => { 
          this.storage.get('id_token').then((token) => {
            this.authToken = token;
            resolve(token);
          }, ()=>{
            console.log("No token found");
            resolve("");
          });
        });
      }
    });
  }
  getThumbnail = (): string => {
    if(this.loadUser() && this.loadUser().thumbnail){
      return this.getImageUrl(this.loadUser().thumbnail, this.loadUser().img_store);
    } else {
      return "https://upload.wikimedia.org/wikipedia/commons/4/42/Simpleicons_Interface_user-black-close-up-shape.svg"
    }
  };
  loadUser = (): any => {
    return this.user
  };
  storeUserData(token, userToStore){
    let cleanedUser = JSON.parse(JSON.stringify(userToStore));
    // if(cleanedUser.survey) delete cleanedUser.survey;
    if(cleanedUser.hasDeepLink) {
      delete cleanedUser.hasDeepLink;
      delete cleanedUser.deepLink;
    }
    console.log("storing user data into storage");
    // console.log(token);
    console.log("user.role: "+cleanedUser.role);
    this.storage.set('id_token', token);
    this.hasloggedIn = true;
    this.score = cleanedUser.score;
    this.authToken = token;
    this.user = cleanedUser;
    this.storage.set('user', JSON.stringify(cleanedUser)).then(() => {
      this._authNotifier.next(userToStore);
    });
  }
  loadUserData(withSiteConfig?:boolean){
    console.log("loading user data from storage");
    return new Promise((resolve, reject) => {
      if((!withSiteConfig && this.user) || (withSiteConfig && this.siteConfig && this.user)){
        resolve(this.user);
      } else {
        this.storage.ready().then(() => { 
          this.storage.get('id_token').then((token) => {
            this.authToken = token;
            this.storage.get('user').then((user) => {
              if( user ) {
                user = JSON.parse(user);
                this.score = user.score;
                this.user = user;
                this.hasloggedIn = true;
                if(user.expires< new Date()){
                  this.cleanUserData();
                  user = null;
                } 
              }
              if(withSiteConfig && !this.siteConfig){
                this.storage.get('siteConfig').then((siteConfig) => {
                  siteConfig = JSON.parse(siteConfig);
                  this.siteConfig = siteConfig;
                  resolve(user);
                });
              } else {
                resolve(user);
              }
            });
          });
        });
      }
    });
  }
  resetThemeForSite(theme: string){
    this.storage.get('siteConfig').then((siteConfig) => {
      siteConfig = JSON.parse(siteConfig);
      siteConfig.config.theme = theme;
      this.siteConfig = siteConfig;
      this.storage.set('siteConfig', JSON.stringify(siteConfig));
    });
  }

  resetUserThumbnail(thumbnail: string){
    this.storage.get('user').then((user) => {
      user = JSON.parse(user);
      user.thumbnail = thumbnail;
      this.user = user;
      this.storage.set('user', JSON.stringify(user));
    });
  }
  resetUserSurvey(survey?: any, surveyResponse?: any){
    this.storage.get('user').then((user) => {
      user = JSON.parse(user);
      if(survey){
        user.survey = survey;
      } else {
        delete user.survey
      }
      if(surveyResponse){
        user.surveyResponse = surveyResponse;
      } else {
        delete user.surveyResponse
      }
      this.user = user;
      this.storage.set('user', JSON.stringify(user));
    });
  }
   loggedIn() {
    // return tokenNotExpired();
  }
  unauthorizedAccess(){
    console.log("Unauthorized access reported");
    // this.cleanUserData().then(() => {
    //   this._authNotifier.next(null);
    // });
  }

  cleanUserData = () => {
    return new Promise ((resolve, reject) => {
      this.authToken=null;
      this.user=null;
      this.score=0;
      this.hasloggedIn = false;
      this.storage.remove('id_token').then(() => {
        this.storage.remove('user').then(() => {
          resolve();
        });
      });
    });
  };

  setSiteConfig = (config: any) => {
    return new Promise((resolve, reject) => {
      this.storeSiteConfig(config);
      if(config.config.theme) {
        this.setTheme(config.config.theme);
      }
      resolve();
    });
  };
  setTheme = (theme: any) => {
    this.global.set('theme', theme);
  };
  storeSiteConfig = (config: any) => {
    this.siteConfig= config;
    return this.storage.set('siteConfig', JSON.stringify(this.siteConfig));
  };
  getSiteConfig = (): any => {
    return this.siteConfig;
  }
  loadSiteConfig(){
    return new Promise((resolve, reject) => {
      if(this.siteConfig){
        resolve(this.siteConfig);
      } else {
        this.storage.ready().then(() => { 
          this.storage.get('siteConfig').then((siteConfig) => {
            siteConfig = JSON.parse(siteConfig);
            this.siteConfig = siteConfig;
            resolve(siteConfig);
          });
        });
      }
    });
  }

  cleanSiteConfig = () => {
    return new Promise ((resolve, reject) => {
      this.siteConfig=null;
      this.storage.remove('siteConfig').then(() => {
        resolve();
      });
    });
  };

  logOut(){
    this.fbSignOut();
    this.googleSignOut();
    this.linkedInSignOut();
    this.cleanUserData().then(() => {
      this._authNotifier.next(null);
    });
  } 

  getImageUrl = (img_path: string, store: string ) => {
    if(store == "local") {
      return this.global.state['ENDPOINT']+'/images/get/'+img_path;
    } else {
      return img_path;
    }
  }

  getYearArray() {
    const yearArray: number[] = [ 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 
      2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032, 
      2033, 2034, 2035, 2036, 2037, 2038, 2039, 2040, 2041, 2042, 
      2043, 2044, 2045, 2046, 2047, 2048, 2049, 2050, 2051, 2052, 
      2053, 2054, 2055, 2056, 2057, 2058, 2059, 2060, 2061, 2062, 
      2063, 2064, 2065, 2066, 2067, 2068, 2069, 2070, 2071, 2072, 
      2073, 2074, 2075, 2076, 2077, 2078, 2079, 2080, 2081, 2082, 
      2083, 2084, 2085, 2086, 2087, 2088, 2089, 2090, 2091, 2092, 
      2093, 2094, 2095, 2096, 2097, 2098, 2099 ]; 
      return yearArray;
  }

  
}
