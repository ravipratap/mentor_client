import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform, ToastController, LoadingController } from 'ionic-angular';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthProvider } from '../../providers/auth/auth';

/**
 * Generated class for the OtpPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage({
  segment: 'otp/:userid/:otp'
})
@Component({
  selector: 'page-otp',
  templateUrl: 'otp.html'
})
export class OtpPage {
  user: any; 
  otpForm: FormGroup;
  mobile: string;
  email: string;
  userid: string;
  loading: any;
  onEdit: boolean = false;
  showEmailOTP: boolean= false;
  showMobileOTP: boolean= false;
  showOTP: boolean = false;
  submitted: boolean = false;
  signedIn = false;
  resendMobileOTP: boolean = true;
  resendEmailOTP: boolean = true;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public plt: Platform,
    public formBuilder: FormBuilder,
    public loadCtrl: LoadingController,
    private toastCtrl: ToastController,
    private auth: AuthProvider,
  ) {
    this.auth.loadUserData().then((user:any) => {
      this.user = user;
      if(this.navParams.data){
        if(this.navParams.data.email) this.email = this.navParams.data.email;
        if(this.navParams.data.mobile) this.mobile = this.navParams.data.mobile;
        if(this.navParams.data.userid) this.userid = this.navParams.data.userid;
        if(this.navParams.data.onEdit) this.onEdit = this.navParams.data.onEdit;
      }
      if(this.navParams.data.otp && this.navParams.data.otp!=":otp"){
        this.submitForm();
      } else {
        this.initialize();
      }
    });
  }
  initialize(){

    this.otpForm = this.formBuilder.group({
      OTP: ["", (!this.mobile && !this.email) ? Validators.required: []],
      mobileOTP: ["", this.mobile?Validators.required: [] ],
      emailOTP: ["", this.email?Validators.required: [] ]
    });
  }
  
  toggleShowEmailOTP = () => { this.showEmailOTP = !this.showEmailOTP; };
  toggleShowMobileOTP = () => { this.showMobileOTP = !this.showMobileOTP; };
  toggleShowOTP = () => { this.showOTP = !this.showOTP;  };

  save = () => {
    this.submitted = true;
    if(this.otpForm.valid){
      this.submitForm()
    }
  };

  resendOTP = (email: string, mobile: string) => {
    this.showLoading();
    let otpData: any = {
      email: this.email,
      mobile: this.mobile,
      userid: this.userid
    }
    console.log("otpData", otpData);
    this.auth.resendOTP(otpData)
    .subscribe((data: any) => { 
      this.dismissLoading();
      console.log("response from server", data)
      if(data.success){
        if(email) this.resendEmailOTP = false;
        if(mobile) this.resendMobileOTP = false;
        this.showToastWithCloseButton('Verification code has been sent!');
      } else {
        this.showToastWithCloseButton("Unable to send code. Please try later", 5000);
      }
      
    },
    err =>  {
      console.log(err);
      this.dismissLoading();
      if(err.status && err.status=="401"){
        this.auth.unauthorizedAccess();
      }
      this.showToastWithCloseButton("Unable to send code. Please try later", 5000);
    });
  }
  submitForm(){
    this.showLoading();
    let otpData: any = {
      email: this.email,
      mobile: this.mobile,
      userid: this.userid
    }
    if(this.user){
      otpData.loggedIn = true;
    }
    if(this.navParams.data.otp  && this.navParams.data.otp!=":otp"){
      otpData.OTP = this.navParams.data.otp;
    } else {
      otpData.OTP = this.otpForm.controls.OTP.value;
      otpData.emailOTP = this.otpForm.controls.emailOTP.value;
      otpData.mobileOTP = this.otpForm.controls.mobileOTP.value;
    }
    console.log("otpData", otpData);
    this.auth.saveOTP(otpData)
    .subscribe((data: any) => { 
      console.log("response from server", data)
      if(data.success){
        if(this.navParams.data.popup){
          this.dismissLoading();
          this.showToastWithCloseButton('Verification complete!');
          this.navCtrl.pop().then(() => {
            this.navParams.get('callback')({
              email_verified: data.email_verified,
              mobile_verified: data.mobile_verified
            });
          });
        } else {
          this.showToastWithCloseButton(data.user.name + ',  you are signed in!');
          if(data.survey){
            data.user.survey = data.survey;
            data.user.surveyResponse = data.surveyResponse;
          }
          this.auth.setSiteConfig(data.config).then(() => {
            this.auth.storeUserData(data.token, data.user);
            this.dismissLoading(true);
          });
        }
      } else {
        this.showToastWithCloseButton("Unable to verify. Please try later", this.navParams.data.popup?5000:25000);
        this.dismissLoading();
      }
      
    },
    err =>  {
      console.log(err);
      this.dismissLoading();
      if(err.status && err.status=="401"){
        this.auth.unauthorizedAccess();
      }
      this.showToastWithCloseButton("Unable to verify. Please try later", 5000);
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

}
