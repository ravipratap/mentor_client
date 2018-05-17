import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { IonicPage, NavController, NavParams, ToastController, LoadingController, ActionSheetController, ModalController } from 'ionic-angular';
import { AuthProvider } from '../../providers/auth/auth';
import { UniqueUserValidator } from './unique-user';
import { ConfigProvider } from '../../providers/config/config';

/**
 * Generated class for the SignupPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-signup',
  templateUrl: 'signup.html',
})
export class SignupPage {

  signupForm: FormGroup;
  showPassword= false;
  submitted = false;
  signedIn = false;
  formErrors = {
    'firstName': '',
    'lastName': '',
    'username': '',
    'password': ''
    // 'isExperienced': ''
    // 'passwordRepeat': ''
  };
  loading:any;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private fb: FormBuilder,
    public auth: AuthProvider,
    private config:ConfigProvider,
    public loadCtrl: LoadingController,
    public actionSheetCtrl: ActionSheetController,
    public modalCtrl: ModalController,
    private toastCtrl: ToastController
    ) {
      console.log("building form");
    this.buildForm()
  }

 
  signInWithFB(): void {
    this.auth.fbSignIn();
  }
  signInWithGoogle(): void {
    this.auth.googleSignIn();
  }
 
  signInWithLinkedIn(): void {
    this.auth.linkedInSignIn(true);
  }
  
  ionViewDidLoad() {
    
  }

  onSubmit() {
    this.submitted = true;
    if(this.signupForm.valid){
      this.showLoading();
      let user: any = {
        sign: {
          first: this.signupForm.controls.firstName.value,
          last: this.signupForm.controls.lastName.value
        },
        pass: {
          password: this.signupForm.controls.password.value
        },
        login: {}
      }
      if(this.signupForm.controls.username.value.indexOf('@') != -1){
        user.login.email = this.signupForm.controls.username.value;
      } else {
        user.login.mobile = this.signupForm.controls.username.value;
      }
      this.auth.signUp(user)
      .subscribe( (data: any) => {
          if(data.success){
            this.showToastWithCloseButton(data.user.name + ',  you are signed up!');
            if(data.survey){
              data.user.survey = data.survey;
              data.user.surveyResponse = data.surveyResponse;
            }
            this.auth.setSiteConfig( data.config ).then(() => {
              this.auth.storeUserData(data.token, data.user);
              this.dismissLoading(true);
              console.log("registration is complete");
            });
          } else {
            this.showToastWithCloseButton(data.msg? data.msg: "Unable to sign up. Please try later.", 5000);
            this.dismissLoading();
          }
        },
        err =>  {
          console.log(err);
          this.dismissLoading();
          this.showToastWithCloseButton("Unable to sign up. Please try later.", 5000);
        } 
      );
    }
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

  dismissLoading(success?: boolean){
      if(this.loading){
          this.loading.dismiss().then(() => {
            if(success){
              this.signedIn = true;
            }
          });
          this.loading = null;
      }
  }

  buildForm(): void {
  this.signupForm = this.fb.group({
    'firstName': ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(24)
      ]
    ],
    'lastName': ['', [
        Validators.maxLength(24)
      ]
    ],
    'username':    ['', [
        Validators.required,
        // Validators.username
        Validators.pattern(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)
        ], UniqueUserValidator.checkUser
      ],
    'password':    ['', [
        Validators.required,
        Validators.minLength(4),
        Validators.maxLength(24)]
    ]
    // 'isExperienced': [true, Validators.required]
    // 'passwordRepeat':    ['', //Validators.required
    //     [
    //     Validators.required,
    //      this.matchingPassword('password')
    //     ]
    // ]
  });
 
  this.signupForm.valueChanges
    .subscribe(data => this.onValueChanged(data));
 
  this.onValueChanged(); // (re)set validation messages now
}
onValueChanged(data?: any) {
    if (!this.signupForm) { return; }
    const form = this.signupForm;

    for (const field in this.formErrors) {
      // clear previous error message (if any)
      this.formErrors[field] = '';
      const control = form.get(field);

      if (control  && !control.valid) {
        // console.log(control.errors);
        const messages = this.validationMessages[field];
        for (const key in control.errors) {
          this.formErrors[field] += messages[key] + ' ';
        }
      }
    }
  }

  

  validationMessages = {
    'firstName': {
      'required':      'First name is required.',
      'minlength':     'First name must be at least 2 characters long.',
      'maxlength':     'First name cannot be more than 24 characters long.'
    },
    'lastName': {
      'maxlength':     'Last name cannot be more than 24 characters long.'
    },
    'username': {
      'required':     'Email is required.',
      'pattern':        'Email entered is not valid',
      // 'username':        'Email entered is not valid',
      'usernameTaken': 'Account exists with given mail id'
    },
    'password': {
      'required': 'Password is required.',
      'minlength':     'Password must be at least 4 characters long.',
      'maxlength':     'Password cannot be more than 24 characters long.'
    },
    'isExperienced': {
      'required': 'Please indicate whether you are experienced.'
    }
    // 'passwordRepeat': {
    //   'required': 'Confirm Password is required.',
    //   'mismatchedPasswords':     'Both passwords are not matching.'
    // }
  };

  presentActionSheet() {
    let actionSheet = this.actionSheetCtrl.create({
      title: 'View Terms of Use',
      buttons: [
        {
          text: 'User Agreement',
          // role: 'destructive',
          handler: () => {
            this.modalCtrl.create('UserAgreementPage', { policy: 'UserAgreement' }).present();
          }
        },{
          text: 'Privacy Policy',
          handler: () => {
            this.modalCtrl.create('UserAgreementPage', { policy: 'PrivacyPolicy' }).present();
          }
        },{
          text: 'Cookie Policy',
          handler: () => {
            this.modalCtrl.create('UserAgreementPage', { policy: 'CookiePolicy' }).present();
          }
        },{
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            // console.log('Cancel clicked');
          }
        }
      ]
    });
    actionSheet.present();
  }
  
  toggleShowPassword(){
    this.showPassword=!this.showPassword; 
    return false;
  }

  // matchingPassword(otherControlName: string) {
  //   let thisControl: FormControl;
  //   let otherControl: FormControl;

  //   return function matchOtherValidate (control: FormControl) {

  //     if (!control.parent) {
  //       return null;
  //     }

  //     // Initializing the validator.
  //     if (!thisControl) {
  //       thisControl = control;
  //       otherControl = control.parent.get(otherControlName) as FormControl;
  //       if (!otherControl) {
  //         throw new Error('matchOtherValidator(): other control is not found in parent group');
  //       }
  //       otherControl.valueChanges.subscribe(() => {
  //         thisControl.updateValueAndValidity();
  //       });
  //     }

  //     if (!otherControl) {
  //       return null;
  //     }

  //     if (otherControl.value !== thisControl.value) {
  //       return {
  //         mismatchedPasswords: true
  //       };
  //     }

  //     return null;

  //   }
  // }

}
