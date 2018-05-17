import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { IonicPage, NavController, NavParams, LoadingController, ToastController } from 'ionic-angular';
import { AuthProvider } from '../../providers/auth/auth';
import { ConfigProvider } from '../../providers/config/config';

/**
 * Generated class for the SigninPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-signin',
  templateUrl: 'signin.html',
})
export class SigninPage {
  
  signinForm: FormGroup;
  submitted = false;
  showPassword = false;
  signedIn = false;
  formErrors = {
    'username': '',
    'password': ''
  };
  loading:any;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private fb: FormBuilder,
    public auth: AuthProvider,
    private config: ConfigProvider,
    public loadCtrl: LoadingController,
    private toastCtrl: ToastController
    ) {
      console.log("building form");
    this.buildForm()
  }

  ionViewDidLoad() {
    
  }
  signup() {
    this.navCtrl.setRoot('SignupPage');
  }

  onSubmit() {
    this.submitted = true;
    console.log("this.signinForm.value", this.signinForm.value);
    if(this.signinForm.valid){
      this.showLoading();
      console.log("before signin");
      this.auth.signin({
        username: this.signinForm.controls.username.value,
        password: this.signinForm.controls.password.value
      })
      .subscribe((data: any) => {
        console.log("inside signin");
          if(data.success){
            this.showToastWithCloseButton(data.user.name + ',  you are signed in!');
            if(data.survey){
              data.user.survey = data.survey;
              data.user.surveyResponse = data.surveyResponse;
            }
            this.auth.setSiteConfig(data.config).then(() => {
              this.auth.storeUserData(data.token, data.user);
              this.dismissLoading(true);
            });
          } else {
            this.showToastWithCloseButton(data.msg? data.msg: "Unable to sign in. Please try later.", 5000);
            this.dismissLoading();
            console.log(data);
          }
        },
        err =>  {
          console.log("Error Signing signin", JSON.stringify(err));
          this.dismissLoading();
          this.showToastWithCloseButton("Unable to sign in. Please try later", 5000);
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
    this.signinForm = this.fb.group({
      'username': ['', Validators.required],
      'password':    ['', Validators.required]
    });
   
    this.signinForm.valueChanges
      .subscribe(data => this.onValueChanged(data));
   
    this.onValueChanged(); // (re)set validation messages now
  }
  onValueChanged(data?: any) {
    if (!this.signinForm) { return; }
    const form = this.signinForm;

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
    // console.log("this.formErrors", this.formErrors);
  }
  validationMessages = {
    'username': {
      'required':      'Please enter email / mobile.'
    },
    'password': {
      'required': 'Password is required.'
    }
  };

  toggleShowPassword(){
    this.showPassword=!this.showPassword;
    return false;
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

}
  
