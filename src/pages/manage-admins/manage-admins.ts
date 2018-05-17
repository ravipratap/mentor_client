import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, ToastController } from 'ionic-angular';
import { ConfigProvider } from '../../providers/config/config';
import { AuthProvider } from '../../providers/auth/auth';
import { FormGroup, FormBuilder, FormArray, FormControl } from '@angular/forms';

/**
 * Generated class for the ManageAdminsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-manage-admins',
  templateUrl: 'manage-admins.html',
})
export class ManageAdminsPage {
  site: any;
  program: any;
  loading: any;
  admins: any[];
  submitted:boolean = false;
  adminForm: FormGroup;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private formBuilder: FormBuilder,
    private config: ConfigProvider,
    private auth: AuthProvider,
    private loadCtrl: LoadingController,
    private toastCtrl: ToastController
  ) {
      if(this.navParams.data.site)  this.site =  this.navParams.data.site;
      if(this.navParams.data.program)  this.program =  this.navParams.data.program;
      this.loadAdmins();
  }

  loadAdmins( ) {
    this.showLoading();
    console.log(this.site, this.program);
    this.config.loadAdmins(this.site?this.site._id:"", this.program? this.program._id: undefined).subscribe((data: any) => {
      this.dismissLoading();
      if(data.users && data.users.length > 0 ){
        this.admins = data.users;
      }
      this.initForm();
    },
    err => {
      this.dismissLoading();
      console.log(JSON.stringify(err));
      if(err.status && err.status=="401"){
        this.auth.unauthorizedAccess();
      }
    });
  }

  initForm() {
    let adminContacts = new FormArray([]);
    this.adminForm = this.formBuilder.group({
      adminContacts: adminContacts
    }, { validator: this.requiredOneValueValidator()});
    if ( this.admins && this.admins.length > 0  ) {
      this.admins.forEach( ( admin, adminIndex ) => {
        this.addAdminContact(admin.login.email?admin.login.email: admin.login.mobile);
      });
    }
    this.addAdminContact();
    // this.adminForm.valueChanges
    //   .subscribe(data => this.onValueChanged(data));;
    // this.onValueChanged(); // (re)set validation messages now
    // // console.log("errors", this.formErrors);
  }
  addAdminContact(adminContact?: string):void {
    (<FormArray>this.adminForm.controls['adminContacts']).push(
      new FormGroup({
        adminContact: new FormControl(adminContact? adminContact: '')
      })
    );
  }
  removeAdminContact(index: number) {
    (<FormArray>this.adminForm.controls['adminContacts']).removeAt(index);
  }
  // onValueChanged(data? : any) {
  //   // for (const field in this.formErrors) {
  //   //   // clear previous error message (if any)
  //   //   let control = this.siteProfileForm.get(field);
  //   //   if (control) {
  //   //     this.formErrors[field] = '';
  //   //   } else {
  //   //     control = this.siteLicenseForm.get(field);
  //   //     if (control) {
  //   //       this.formErrors[field] = '';
  //   //     }
  //   //   }
  //   //   if (control && !control.valid) {
  //   //     const messages = this.validationMessages[field];
  //   //     for (const key in control.errors) {
  //   //       this.formErrors[field] += messages[key] + ' ';
  //   //     }
  //   //   }
  //   // }
  // }
  requiredOneValueValidator() {
    let thisFormGroup: FormGroup;
    return function (formGroup: FormGroup) {
      // // console.log(FormGroup)
      // if (!formGroup.parent) {
      //   return null;
      // }
      if (!thisFormGroup) {
        thisFormGroup = formGroup;
      }
      let hasOneValue= false;
      if(thisFormGroup.controls.adminContacts) {
        (<FormArray>thisFormGroup.controls.adminContacts).controls.forEach((formGroup: FormGroup) => {
          if(formGroup.controls.adminContact.value) {
            hasOneValue=true;
          }
        });
      }
      // console.log("requiredOneValueValidator", category, hasOneValue, thisFormGroup);
      if (!hasOneValue) {
        return { requiredOneValue: true };
      }    
      return null;
    }
  }
  save() {
    this.submitted = true;
    // console.log("form Errors after submit: ", this.formErrors);
    console.log("this.adminForm.valid:", this.adminForm);
    let emails: string[] =[];
    let mobiles: string[] = [];
      (<FormArray>this.adminForm.controls.adminContacts).controls.forEach((formGroup: FormGroup) => {
        if(formGroup.controls.adminContact.value) {
          if(formGroup.controls.adminContact.value.indexOf("@") > -1 ) {
            emails.push(formGroup.controls.adminContact.value);
          } else {
            mobiles.push(formGroup.controls.adminContact.value);
          }
        }
      });
    if(this.adminForm.valid && this.site){
      this.showLoading();
      let dataToBeSaved = {
        site: this.site._id,
        programId: this.program? this.program._id: undefined,
        emails: emails.length > 0? emails: undefined,
        mobiles: mobiles.length > 0? mobiles: undefined
      };
      this.config.saveAdmins(dataToBeSaved)
      .subscribe((data: any) => { 
        this.dismissLoading();
        if(data.success){
          this.showToastWithCloseButton((this.program? "Program" : "Site") + " Admins have been updated!");
          this.navCtrl.pop().then(() => {
            if(this.navParams.get('callback')){
              this.navParams.get('callback')(data.users);
            }
          });
        } else {
          this.showToastWithCloseButton("Unable to save admins. Please try later", 5000);
        }
      },
      err =>  {
        console.log(err);
        this.dismissLoading();
        if(err.status && err.status=="401"){
          this.auth.unauthorizedAccess();
        } else {
          this.showToastWithCloseButton("Unable to save admins. Please try later", 5000);
        }
      });
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

  dismissLoading(){
      if(this.loading){
          this.loading.dismiss();
          this.loading = null;
      }
  }
  ionViewDidLoad() {
    console.log('ionViewDidLoad ManageAdminsPage');
  }

}
